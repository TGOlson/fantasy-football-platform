# Score Calculation Architecture & Performance

## The Question

Should we calculate scores on-the-fly every time someone views a matchup, or pre-calculate and cache them?

---

## TL;DR Recommendation

**Use a hybrid approach:**

1. **Cache raw NFL stats** (shared across all leagues)
2. **Calculate scores on-the-fly** (it's fast enough)
3. **Cache calculated scores with short TTL** during live games (30-60s)
4. **Cache completed games forever** (stats don't change)

**Why:** Stats caching gives you 95% of the benefit. Score calculation is fast enough (sub-10ms for a full matchup). Unique per-league rules mean score caching has limited value.

---

## The Math: How Fast is Score Calculation?

### Typical Matchup Calculation

**Players to calculate:**

- 2 teams × 9 starting players = 18 players per matchup
- Each player has ~20 stats to process

**Per-player calculation:**

```javascript
// Pseudocode
function calculatePlayerScore(stats, rules) {
  let score = 0;

  // Base stats (10-15 multiplications)
  score += stats.passing_yards * rules.passing.yards.value;
  score += stats.passing_tds * rules.passing.touchdowns.value;
  score += stats.rushing_yards * rules.rushing.yards.value;
  // ... etc

  // Position-specific (2-3 conditionals)
  if (player.position === 'TE') {
    score += stats.receptions * rules.receiving.receptions.byPosition.TE;
  }

  // Bonuses (3-5 conditionals)
  if (stats.rushing_yards >= 100) {
    score += rules.rushing.bonuses.find(
      (b) => b.condition === 'yards >= 100'
    ).value;
  }

  return score;
}
```

**Operations per player:** ~20-30 simple math operations + 5-10 conditionals

**Time per player:** ~0.1-0.5ms (JavaScript is fast at arithmetic)

**Time per matchup:** 18 players × 0.5ms = **9ms**

**Time per league standings page:** 12 teams × 9 players × 0.5ms = **54ms**

### Conclusion

**Score calculation is FAST.** You can calculate an entire league's scores in 50ms. On-the-fly calculation is totally viable.

---

## Caching Strategy: What to Cache

### Level 1: Raw Stats (CRITICAL)

**What:** NFL player stats from API
**Key:** `stats:player:{playerId}:week:{week}:year:{year}`
**TTL:**

- Live games: 30 seconds
- Completed games: Forever (stats don't change)

**Why this matters:**

```
Without caching:
- Every matchup view = API call to NFL stats provider
- 100 concurrent users viewing matchups = 100 API calls
- At $5K/year for API, you'll hit rate limits fast

With caching:
- First user triggers API call, cached for 30s
- Next 99 users get cached data
- 1 API call instead of 100
```

**Cache hit rate:** ~99% (all leagues use same stats)

**Implementation:**

```javascript
// Redis cache
async function getPlayerStats(playerId, week, year) {
  const cacheKey = `stats:player:${playerId}:week:${week}:year:${year}`;

  // Check cache first
  let stats = await redis.get(cacheKey);
  if (stats) return JSON.parse(stats);

  // Cache miss - fetch from NFL API
  stats = await nflStatsAPI.getPlayerStats(playerId, week, year);

  // Cache based on game status
  const game = await getGame(week, year);
  const ttl = game.isComplete ? null : 30; // 30s for live, forever for complete

  await redis.set(cacheKey, JSON.stringify(stats), ttl);
  return stats;
}
```

### Level 2: Calculated Scores (OPTIONAL)

**What:** Pre-calculated player scores for specific league rules
**Key:** `scores:player:{playerId}:league:{leagueId}:week:{week}`
**TTL:** 30-60 seconds during live games

**Value proposition:**

- Saves 9ms of calculation time per matchup view
- BUT: Each league has unique rules = low cache hit rate across leagues
- ONLY helps if same user refreshes multiple times

**When it helps:**

- User frantically refreshing during Sunday games
- Multiple users in same league viewing at once

**When it doesn't help:**

- First view by any user (cache miss)
- Different leagues (different rules = different cache keys)

**Cache hit rate:** ~30-50% (only hits within same league)

**Should you build this initially?** **NO.** The complexity isn't worth 9ms savings. Add later if you see performance issues.

---

## Recommended Architecture

### Phase 1: MVP (Simple & Fast)

```javascript
// API endpoint: GET /api/matchups/:matchupId

async function getMatchupScores(matchupId) {
  // 1. Get matchup data (who's playing who)
  const matchup = await db.matchup.findUnique({
    where: { id: matchupId },
    include: {
      team1: { include: { players: true } },
      team2: { include: { players: true } },
      league: { include: { scoringRules: true } },
    },
  });

  // 2. Get ALL player stats (cached at this level)
  const week = matchup.week;
  const playerIds = [...matchup.team1.players, ...matchup.team2.players].map(
    (p) => p.id
  );

  const statsPromises = playerIds.map(
    (playerId) => getPlayerStats(playerId, week, year) // <-- This is cached
  );
  const allStats = await Promise.all(statsPromises);

  // 3. Calculate scores on-the-fly (fast!)
  const team1Score = calculateTeamScore(
    matchup.team1.players,
    allStats,
    matchup.league.scoringRules
  );

  const team2Score = calculateTeamScore(
    matchup.team2.players,
    allStats,
    matchup.league.scoringRules
  );

  return {
    matchupId,
    team1: { ...matchup.team1, score: team1Score },
    team2: { ...matchup.team2, score: team2Score },
  };
}

function calculateTeamScore(players, stats, rules) {
  return players.reduce((teamScore, player) => {
    const playerStats = stats.find((s) => s.playerId === player.id);
    const playerScore = calculatePlayerScore(
      playerStats,
      player.position,
      rules
    );
    return teamScore + playerScore;
  }, 0);
}

function calculatePlayerScore(stats, position, rules) {
  let score = 0;

  // Passing
  score += (stats.passing_yards || 0) * rules.passing.yards.value;
  score += (stats.passing_tds || 0) * rules.passing.touchdowns.value;
  score += (stats.interceptions || 0) * rules.passing.interceptions.value;

  // Rushing
  score += (stats.rushing_yards || 0) * rules.rushing.yards.value;
  score += (stats.rushing_tds || 0) * rules.rushing.touchdowns.value;

  // Receiving (position-specific PPR)
  const pprValue =
    rules.receiving.receptions.byPosition?.[position] ||
    rules.receiving.receptions.default;
  score += (stats.receptions || 0) * pprValue;
  score += (stats.receiving_yards || 0) * rules.receiving.yards.value;
  score += (stats.receiving_tds || 0) * rules.receiving.touchdowns.value;

  // Bonuses
  rules.rushing.bonuses?.forEach((bonus) => {
    if (evaluateCondition(bonus.condition, stats)) {
      score += bonus.value;
    }
  });

  return Math.round(score * 100) / 100; // Round to 2 decimals
}

function evaluateCondition(condition, stats) {
  // Simple eval for conditions like "yards >= 100"
  // In production, use a safe expression evaluator
  const [stat, operator, value] = parseCondition(condition);
  const statValue = stats[stat] || 0;

  switch (operator) {
    case '>=':
      return statValue >= value;
    case '>':
      return statValue > value;
    case '==':
      return statValue == value;
    // etc
  }
}
```

**What this gives you:**

- ✅ Fast (sub-50ms response times)
- ✅ Simple to understand and debug
- ✅ Stats cached (saves API costs)
- ✅ Always accurate (no stale score cache issues)
- ✅ Works for any custom rules

**Performance:**

- Stats fetch: ~5ms (from Redis cache)
- Score calculation: ~9ms (18 players)
- Database queries: ~10ms
- **Total:** ~25-50ms per matchup view

---

## When Unique Rules Per League Actually Helps You

### The Counterintuitive Benefit

**You're worried:** "Every league has unique rules, so caching won't help"

**Actually:** This is a FEATURE, not a bug.

**Why:**

**1. Simple architecture**

- No complex cache invalidation logic
- No "did this league's rules change?" checks
- Just calculate on-the-fly, always correct

**2. Stats caching is 95% of the win**

- NFL stats are 99% of the data volume
- Scoring rules are tiny (few KB per league)
- Calculation is negligible compared to I/O

**3. Database is fast for rules**

- Scoring rules stored as JSONB in Postgres
- ~1ms to fetch per league
- Can even cache rules in-memory per request

### The Real Bottleneck (It's Not Calculation)

**Not the problem:**

- ❌ Calculation time (9ms is nothing)
- ❌ Unique rules per league

**Actually the problem:**

- ⚠️ NFL stats API rate limits
- ⚠️ Database N+1 queries
- ⚠️ Not using indexes
- ⚠️ Not parallelizing stats fetches

---

## Optimization Strategy

### Optimization 1: Stats Caching (CRITICAL)

**Impact:** 10x reduction in API costs, 5x faster response times

```javascript
// Use Redis for stats caching
const redis = new Redis(process.env.REDIS_URL);

async function getPlayerStats(playerId, week, year) {
  const key = `stats:${playerId}:${week}:${year}`;

  // Try cache first
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  // Cache miss - fetch from API
  const stats = await nflAPI.getPlayerStats(playerId, week, year);

  // Cache based on game status
  const ttl = isGameComplete(week, year) ? null : 30;
  await redis.set(key, JSON.stringify(stats), ttl);

  return stats;
}
```

### Optimization 2: Parallel Fetching (EASY)

**Impact:** 3x faster when fetching multiple players

```javascript
// BAD: Sequential
for (const player of players) {
  const stats = await getPlayerStats(player.id, week, year);
}

// GOOD: Parallel
const statsPromises = players.map((p) => getPlayerStats(p.id, week, year));
const allStats = await Promise.all(statsPromises);
```

### Optimization 3: Database Query Optimization (IMPORTANT)

**Impact:** 10x faster database queries

```javascript
// BAD: N+1 queries
const matchup = await db.matchup.findUnique({ where: { id } });
const team1 = await db.team.findUnique({ where: { id: matchup.team1Id } });
const players1 = await db.player.findMany({ where: { teamId: team1.id } });
// ... etc

// GOOD: Single query with includes
const matchup = await db.matchup.findUnique({
  where: { id },
  include: {
    team1: { include: { players: true } },
    team2: { include: { players: true } },
    league: { include: { scoringRules: true } },
  },
});
```

### Optimization 4: Consider Score Caching (LATER)

**Only add if you see evidence it's needed:**

- Users complaining about slow score loading
- High server CPU usage from calculations
- Lots of same-league concurrent users

**Implementation:**

```javascript
async function getMatchupScores(matchupId) {
  const cacheKey = `matchup:${matchupId}:scores`;

  // Try cache
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // Calculate
  const scores = await calculateMatchupScores(matchupId);

  // Cache for 30s
  await redis.set(cacheKey, JSON.stringify(scores), 30);

  return scores;
}
```

---

## Scale Analysis: How This Performs

### At 500 Leagues

**Assumptions:**

- 500 leagues × 12 teams = 6,000 teams
- 6,000 teams × 9 starters = 54,000 active player slots
- ~1,500 unique NFL players across all leagues
- Peak traffic: 1,000 concurrent users (Sunday 1pm ET)

**Stats API calls (with caching):**

- First request each game day: 1,500 players × 1 call = 1,500 calls
- Every 30s after: 1,500 calls (refresh cache)
- **Total per game day:** ~180K calls (well within API limits)

**Calculation load:**

- 1,000 users viewing matchups simultaneously
- Each matchup: 18 players × 0.5ms = 9ms calculation
- **Total CPU:** 1,000 × 9ms = 9 seconds of CPU per second
- **On single core:** 9 cores fully utilized
- **On typical server:** 4-8 cores available = totally fine

**Database load:**

- 1,000 concurrent matchup queries
- Each query: ~10ms (with proper indexes)
- **Connections needed:** ~50-100 (with connection pooling)
- **Database:** Can handle this easily

### At 5,000 Leagues (10x scale)

**Stats API calls:**

- More leagues, but only ~3,000 unique players now
- 2x the API calls, still well within limits

**Calculation load:**

- 10,000 concurrent users (10x)
- 90 seconds of CPU per second
- Need ~20-30 cores
- **Solution:** Horizontal scaling (add more API servers)

**Database load:**

- 500-1000 connections needed
- **Solution:** Read replicas, connection pooling

**Score caching becomes more valuable here:**

- High same-league traffic (multiple users in one league)
- Cache hit rate improves to ~60-70%
- Reduces CPU load by 60-70%

---

## Implementation Checklist

### Phase 1: MVP (Do This First)

- [ ] **Stats caching with Redis**
  - 30s TTL for live games
  - Forever for completed games
- [ ] **On-the-fly score calculation**
  - Calculate on every matchup view
  - No score caching yet
- [ ] **Parallel stats fetching**
  - Use Promise.all for multiple players
- [ ] **Database query optimization**
  - Use includes to avoid N+1
  - Add indexes on foreign keys
- [ ] **Calculation logic**
  - Base scoring (yards, TDs)
  - Position-specific PPR
  - Milestone bonuses
  - Conditional scoring

### Phase 2: Optimization (Add Later)

- [ ] **Score caching (optional)**
  - 30-60s TTL during games
  - Only if seeing performance issues
- [ ] **Calculation optimization**
  - Memoize rule evaluation
  - Pre-compile conditions
- [ ] **Monitoring**
  - Track calculation time
  - Monitor cache hit rates
  - Alert on slow queries

---

## Redis Cache Structure

```javascript
// Stats cache
stats:player:{playerId}:week:{week}:year:{year}
→ { passing_yards: 312, passing_tds: 3, ... }
TTL: 30s (live) or null (complete)

// Game status cache
game:week:{week}:year:{year}
→ { isComplete: false, lastUpdate: timestamp }
TTL: 60s

// Optional: Score cache (Phase 2)
matchup:{matchupId}:scores
→ { team1Score: 125.4, team2Score: 98.2, ... }
TTL: 30s
```

---

## When to Rethink This Architecture

**Add score caching if:**

- 🔴 Calculation time exceeds 100ms per matchup
- 🔴 CPU usage consistently >80%
- 🔴 Users complaining about slow score loading
- 🔴 High same-league concurrent traffic (>10 users per league)

**Move to pre-calculated scores if:**

- 🔴 You're serving 10,000+ leagues
- 🔴 Real-time calculation can't keep up
- 🔴 You need sub-10ms response times

**But honestly:** You probably won't need either for years.

---

## Key Insights

1. **Stats caching is 95% of the benefit** - Focus here first
2. **Calculation is fast** - 9ms for full matchup is negligible
3. **Unique rules per league is fine** - Not a performance problem
4. **Simplicity > Premature optimization** - On-the-fly works great
5. **Scale problems are good problems** - Solve them when you have them

---

## Final Recommendation

**For your first 500 leagues:**

```javascript
// This is all you need
async function getMatchupScores(matchupId) {
  // 1. Fetch data with includes (no N+1)
  const matchup = await fetchMatchupWithIncludes(matchupId);

  // 2. Get stats (cached in Redis)
  const stats = await getPlayerStatsParallel(matchup.allPlayers, week, year);

  // 3. Calculate scores on-the-fly
  const scores = calculateScores(matchup, stats);

  return scores;
}
```

**Total response time:** 25-50ms
**API costs:** Minimal (stats cached)
**Complexity:** Low (easy to maintain)
**Accuracy:** 100% (always fresh)

**This will easily handle 5,000+ leagues.** Don't optimize until you have evidence you need to.
