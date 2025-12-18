# MVP Feature Cutline: Path to 500 Paying Leagues

## The Critical Insight

**Your early adopters are MFL refugees who tolerate its terrible UX solely for customization.** They don't need feature parity—they need your scoring engine to be better than MFL's, and everything else to be "good enough."

---

## Tier 1: ABSOLUTE DEALBREAKERS

### _Without these, you have nothing. Build these first._

### 🎯 **Custom Scoring Engine** (Your Moat)

**Why it's critical:** This is literally the only reason someone pays for your platform over free alternatives.

**Must support:**

- ✅ Position-specific PPR (TE: 1.5, RB: 0.5, WR: 1.0)
- ✅ Yardage milestone bonuses (100 rush yds = +3 pts)
- ✅ Conditional scoring (QB completion % bonus if 20+ attempts)
- ✅ Decimal scoring (to 2 decimal places minimum)
- ✅ All standard stats (passing, rushing, receiving, defense)
- ✅ Template library (Standard, Half PPR, Full PPR, TE Premium)
- ✅ Import/export scoring configs

**Can skip initially:**

- ❌ IDP (individual defensive players) scoring
- ❌ Kicker/Punter customization beyond basics
- ❌ Team offense positions
- ❌ Return yards scoring

**Time investment:** 6-8 weeks (this is your make-or-break feature)

---

### 📋 **Basic League Management**

**Why it's critical:** Without this, it's not a league platform.

**Must have:**

- ✅ League creation and settings
- ✅ Roster management (8-20 teams)
- ✅ Standard roster positions (QB, RB, WR, TE, FLEX, K, DEF)
- ✅ Weekly lineup submission
- ✅ Schedule generation (head-to-head)
- ✅ Standings page (W-L record, points for/against)
- ✅ Matchup view (your team vs opponent)
- ✅ Basic league rules page

**Can skip initially:**

- ❌ Divisions/conferences
- ❌ Custom roster positions beyond standard
- ❌ "Play the median" double matchups
- ❌ Victory points system
- ❌ Tournament/DFS style formats

**Time investment:** 3-4 weeks

---

### 🏈 **Live Stats & Scoring**

**Why it's critical:** Users need to see points accumulate during games.

**Controversial take:** You can launch with **next-day scoring** for first 50 beta leagues, but you NEED live scoring before asking people to pay.

**Must have:**

- ✅ Live scoring during NFL games (15-30 second delay acceptable)
- ✅ Player stats display
- ✅ Score breakdowns (show how points were earned)
- ✅ Week-by-week historical scores

**Can skip initially:**

- ❌ Real-time play-by-play updates
- ❌ Audio announcements
- ❌ Projected scores during games
- ❌ "Optimal lineup" calculator

**Time investment:** 2-3 weeks (after stats API is integrated)

---

### 📱 **Mobile-Responsive Interface**

**Why it's critical:** MFL's mobile experience is terrible. This is a key differentiator.

**Must have:**

- ✅ Works perfectly on mobile browsers
- ✅ Set lineups on mobile
- ✅ View scores on mobile
- ✅ Accept/reject trades on mobile

**Can skip initially:**

- ❌ Native iOS/Android apps
- ❌ Push notifications
- ❌ Offline mode

**Time investment:** Ongoing (if built with mobile-first approach from day 1)

---

## Tier 2: MUST-HAVE BEFORE CHARGING

### _Not dealbreakers for beta, but required before asking $50/league_

### 🎲 **Draft Tools**

**Why it matters:** Leagues can't start without a draft. This must work flawlessly.

**Must have:**

- ✅ Snake draft (live, online)
- ✅ Draft board showing all picks
- ✅ Player search/filter during draft
- ✅ Draft timer (with commissioner override)
- ✅ Pre-draft player rankings
- ✅ Draft recap/results page

**Can skip initially:**

- ❌ Auction drafts (only 20-30% of leagues use these)
- ❌ Email/offline drafts
- ❌ Integration with third-party draft tools
- ❌ Mock drafts
- ❌ Audio pick announcements

**Time investment:** 4-5 weeks

---

### 🔄 **Waivers & Free Agency**

**Why it matters:** League management requires roster moves throughout season.

**Must have:**

- ✅ FAAB (blind bidding) waivers
- ✅ Waiver priority system (rolling or reset)
- ✅ Free agent pickups (first-come-first-served)
- ✅ Drop players
- ✅ Waiver processing schedule

**Can skip initially:**

- ❌ Hybrid waiver systems (FAAB + FCFS)
- ❌ Custom lockout periods for dropped players
- ❌ "No waiver" time windows
- ❌ Conditional waiver claims

**Time investment:** 3-4 weeks

---

### 🤝 **Trading System**

**Why it matters:** Trading is core to fantasy football. But it doesn't need to be fancy.

**Must have:**

- ✅ Propose trades (players for players)
- ✅ View/accept/reject trade offers
- ✅ Commissioner can push through trades
- ✅ League vote on trades (optional setting)
- ✅ Trade deadline setting
- ✅ Trade history/log

**Can skip initially:**

- ❌ Future draft pick trades (dynasty feature)
- ❌ Multi-team trades (3+ teams)
- ❌ FAAB dollar trades
- ❌ Trade analyzer tools
- ❌ Trade deadline extensions

**Time investment:** 2-3 weeks

---

### 🏆 **Playoff System**

**Why it matters:** Need to crown a champion. But this is end-of-season, so you have time.

**Must have:**

- ✅ Playoff bracket (4 or 6 teams)
- ✅ Configurable playoff weeks
- ✅ Playoff seeding based on standings
- ✅ Playoff matchup scoring

**Can skip initially:**

- ❌ Toilet bowl bracket
- ❌ Custom playoff formats
- ❌ Reseeding between rounds
- ❌ NFL playoff leagues (post-regular season)

**Time investment:** 1-2 weeks (can build during season)

---

## Tier 3: IMPORTANT BUT NOT FOR 500 LEAGUES

### _Build these in Year 2-3 as you scale_

### 👑 **Dynasty/Keeper Features**

**Why it's not critical initially:** Focus on redraft leagues first, add dynasty later.

**What you're skipping:**

- ❌ Multi-year rosters
- ❌ Keeper selection interface
- ❌ Rookie drafts
- ❌ Taxi squads
- ❌ Future draft pick trading
- ❌ Contract/salary systems

**When to build:** After you have 300-500 redraft leagues and proven product-market fit

**Rationale:** Dynasty leagues are 30-40% of MFL's business, but they're complex. Win with redraft first, then expand. Many early users will be patient if you have a roadmap.

---

### 💰 **Salary Cap & Contracts**

**Why it's not critical initially:** Only used by ~10% of leagues.

**What you're skipping:**

- ❌ Player salaries
- ❌ Salary cap management
- ❌ Contract length/escalation
- ❌ Soft vs hard caps

**When to build:** Year 2, once you have resources

---

### 📊 **Advanced Analytics**

**Why it's not critical initially:** Nice-to-have, not need-to-have.

**What you're skipping:**

- ❌ Strength of schedule
- ❌ Points against analysis
- ❌ Power rankings
- ❌ Optimal lineup calculator
- ❌ Playoff odds calculator
- ❌ Detailed historical trends

**When to build:** Year 2-3, or partner with FantasyPros/4for4

---

### 💬 **Communication Features**

**Why it's not critical initially:** Leagues use GroupMe, Slack, Discord already.

**What you're skipping:**

- ❌ League message boards
- ❌ Chat functionality
- ❌ League polls
- ❌ Commissioner announcements
- ❌ Social features

**When to build:** Year 2, if user research shows it's needed

**Workaround:** Basic email notifications are enough initially

---

### 🛠️ **Commissioner Power Tools**

**Why it's not critical initially:** Basic commissioner controls are enough for MVP.

**What you're skipping:**

- ❌ Manual score adjustments
- ❌ Accounting/dues tracking
- ❌ Franchise ownership transfer tools
- ❌ Bulk roster moves
- ❌ Clone league from previous year
- ❌ Advanced customization (home field advantage, etc.)

**When to build:** Year 2, based on commissioner feedback

---

## Tier 4: NEVER BUILD (Unless Proven Demand)

### _Let other platforms handle these_

- ❌ **IDP "True Position" scoring** - Too niche, very complex
- ❌ **Team offense positions** - Almost nobody uses this
- ❌ **Chop/Guillotine leagues** - Trendy but tiny market
- ❌ **Tournament-style formats** - Better served by DFS platforms
- ❌ **NFL Playoff leagues** - Off-season feature, low priority
- ❌ **Pool/Survivor leagues** - Different product entirely
- ❌ **Text message alerts** - Email + browser notifications are enough
- ❌ **Custom appearance/skins** - Waste of time, nobody cares

---

## The MVP Feature Matrix

| Feature                   | Build for Beta (50 leagues) | Build for Launch (500 leagues) | Build Year 2+       |
| ------------------------- | --------------------------- | ------------------------------ | ------------------- |
| **Custom Scoring Engine** | ✅ CRITICAL                 | ✅ Enhanced                    | ✅ Refine           |
| **League Management**     | ✅ CRITICAL                 | ✅ Polish                      | ✅ Add divisions    |
| **Next-Day Scoring**      | ✅ OK for beta              | ❌                             | ❌                  |
| **Live Scoring**          | ❌ Can wait                 | ✅ REQUIRED                    | ✅ Optimize         |
| **Mobile Responsive**     | ✅ CRITICAL                 | ✅ CRITICAL                    | ✅ CRITICAL         |
| **Snake Draft**           | ✅ CRITICAL                 | ✅ CRITICAL                    | ✅ CRITICAL         |
| **Auction Draft**         | ❌                          | ❌                             | ✅ Add Year 2       |
| **FAAB Waivers**          | ✅ REQUIRED                 | ✅ REQUIRED                    | ✅ REQUIRED         |
| **Trading**               | ✅ Basic only               | ✅ Full featured               | ✅ Add pick trading |
| **Playoffs**              | ⚠️ Can build during season  | ✅ REQUIRED                    | ✅ Add options      |
| **Dynasty Features**      | ❌                          | ❌                             | ✅ Build Year 2     |
| **Salary Cap**            | ❌                          | ❌                             | ✅ Build Year 3     |
| **Analytics**             | ❌                          | ❌                             | ✅ Partner or build |
| **Message Boards**        | ❌                          | ❌                             | ⚠️ Maybe Year 2     |
| **IDP Support**           | ❌                          | ❌                             | ⚠️ If demanded      |

---

## Minimum Viable Product: The Cutline

### ✅ **Build These for 500 Paying Leagues:**

1. **World-class custom scoring engine** (6-8 weeks)
   - Position-specific PPR
   - Milestone bonuses
   - Conditional scoring
   - Template library

2. **Solid league management basics** (3-4 weeks)
   - Rosters, lineups, schedules, standings
   - Standard positions
   - Simple settings

3. **Live scoring during games** (2-3 weeks)
   - Real-time stats
   - Score breakdowns
   - Historical view

4. **Snake draft that just works** (4-5 weeks)
   - Live online draft
   - Search, timer, board
   - Draft results

5. **Complete waiver/FA system** (3-4 weeks)
   - FAAB and priority waivers
   - Free agent pickups
   - Drop players

6. **Basic trading** (2-3 weeks)
   - Propose/accept/reject
   - Commissioner tools
   - Trade history

7. **Playoff bracket** (1-2 weeks)
   - 4 or 6 teams
   - Standard seeding
   - Playoff scoring

8. **Mobile-first responsive design** (ongoing)
   - Works flawlessly on phones
   - Fast and intuitive

**Total time estimate: 4-6 months** for a team of 2 developers working full-time, or 8-12 months for one person.

---

## What You're Explicitly NOT Building

- Dynasty/keeper features
- Auction drafts
- Salary caps
- IDP support
- Message boards
- Analytics dashboards
- Custom themes/appearance
- Native mobile apps
- Advanced commissioner tools
- Multi-team trades
- Draft pick trading

**The mindset:** You're building 20% of MFL's features to capture 80% of the value. Early adopters will accept missing features if your core offering (scoring + UX) is dramatically better.

---

## Validation Strategy: Getting to 500 Leagues

### Phase 1: Beta (Leagues 1-50)

**Target:** MFL power users who will tolerate rough edges

**What you need:**

- Custom scoring engine ✅
- Basic league management ✅
- Next-day scoring (live scoring can wait)
- Snake draft ✅
- Simple waivers ✅
- Basic trades ✅

**How to recruit:**

- r/DynastyFF posts
- Tweet at fantasy football podcasts
- Direct outreach to MFL frustrated users
- Offer: **FREE for Season 1 + migration help**

**Timeline:** August-December Year 1

---

### Phase 2: Early Adopters (Leagues 51-200)

**Target:** Commissioners looking for better UX, willing to switch

**What you need:**

- Everything from Phase 1 ✅
- Live scoring ✅ (REQUIRED)
- Polish on all features
- Playoff brackets ✅

**How to recruit:**

- Word-of-mouth from beta users
- Content marketing ("How to build perfect TE Premium league")
- Reddit sponsorship posts
- Offer: **$29 Early Adopter pricing** (normally $49)

**Timeline:** January-July Year 2

---

### Phase 3: Growth (Leagues 201-500)

**Target:** Broader "engaged enthusiast" segment

**What you need:**

- Everything from Phase 2 ✅
- Rock-solid reliability
- Fast customer support
- Clear documentation
- Maybe dynasty features if demanded

**How to recruit:**

- SEO ("best fantasy football platform with custom scoring")
- Podcast sponsorships
- Comparison pages (vs MFL, vs Sleeper)
- Offer: **$49 Standard pricing**

**Timeline:** August-December Year 2

---

## The 80/20 Rule Applied

**MFL has 100+ features built over 25+ years.**

You're building ~15 features in 6 months.

That's 15% of their feature count, but it will deliver 80%+ of the value because:

1. Your scoring engine is better (modern, visual, intuitive)
2. Your UX is 10x better (mobile-first, fast, beautiful)
3. Your core features actually work well (vs MFL's clunky everything)

**The key insight:** MFL users don't love MFL. They tolerate it because nothing else offers the customization. You just need to be "good enough" at everything else and "way better" at scoring + UX.

---

## Decision Framework: Feature Requests

When users ask "Can you add [feature X]?", use this framework:

### ✅ Build it if:

- It's blocking a paid conversion
- 30%+ of users request it
- It's table stakes (everyone expects it)
- It differentiates you from competitors

### ⏸️ Defer it if:

- <10% of users need it
- Workarounds exist
- It's complex and niche
- Other platforms do it well

### ❌ Never build if:

- <3% of users need it
- It pulls you away from core value prop
- Maintenance burden is high

**Example applications:**

- "Add auction drafts" → ⏸️ Defer (20% need it, but big effort)
- "Add TE Premium template" → ✅ Build it (quick win, high demand)
- "Add IDP True Position scoring" → ❌ Never (tiny niche, huge complexity)

---

## Final Recommendation

**Your MVP is 4-6 months of full-time development work.**

Build these 8 things really well:

1. Custom scoring engine
2. League management basics
3. Live scoring
4. Snake draft
5. Waivers/free agents
6. Basic trading
7. Playoffs
8. Mobile-responsive UI

**Everything else is Year 2+.**

With this feature set, you can credibly tell MFL users: "We have the customization you need, with UX that doesn't make you want to throw your laptop." That's enough to get 500 paying leagues.

The beauty? You can launch with even less for your first 50 beta leagues, then iterate based on real feedback rather than guessing what people want.
