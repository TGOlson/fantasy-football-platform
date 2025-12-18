# Claude Code API Cost Estimate for Fantasy Football MVP

## Current Pricing (Sonnet 4.5)

- **Input:** $3 per million tokens
- **Output:** $15 per million tokens

---

## Project Scope Recap

**What we're building:**

- Frontend: Vite + React (~13,000 lines)
- Backend: Express API (~7,000 lines)
- Shared: Types, config (~1,500 lines)
- **Total: ~21,500 lines of production code**

**Timeline:** 4-6 months of development

---

## Token Estimation Methodology

### Understanding Claude Code Usage Patterns

**Claude Code is different from chat:**

- Maintains extended context (entire files, related code)
- Iterative development (multiple passes per feature)
- Debugging sessions (error traces, stack traces)
- Refactoring (reading lots of existing code)

**Typical coding session:**

```
Input context includes:
- Current file being edited (1,000-3,000 tokens)
- Related files (imports, types) (3,000-10,000 tokens)
- Task description & conversation (500-1,000 tokens)
- Error messages when debugging (500-2,000 tokens)
Average: ~10,000 tokens input per session

Output per session:
- Code generation: 100-300 lines
- Average: 1,500 tokens per session
```

---

## Cost Breakdown by Development Phase

### Phase 1: Project Setup & Architecture (Week 1)

**Activities:**

- Initial project setup (Vite, Express, Prisma)
- Folder structure and boilerplate
- Database schema design
- Architecture planning discussions

**Token usage:**

- Planning & architecture: 50,000 input, 10,000 output
- Boilerplate generation: 100,000 input, 20,000 output
- **Subtotal:** 150,000 input, 30,000 output

**Cost:** $0.45 input + $0.45 output = **$0.90**

---

### Phase 2: Core Feature Development (Weeks 2-10)

**Features to build:**

- Scoring engine (10 sessions)
- League management (8 sessions)
- Player/roster components (12 sessions)
- Live scoring integration (10 sessions)
- Draft tools (12 sessions)
- Waivers/trading (8 sessions)
- UI components (shadcn/ui integration) (20 sessions)
- API routes and services (25 sessions)
- Forms and validation (10 sessions)

**Total sessions:** ~115 sessions

**Per session average:**

- Input: 10,000 tokens (reading existing code, understanding context)
- Output: 1,500 tokens (generating new code)

**Token usage:**

- Input: 115 × 10,000 = 1,150,000 tokens
- Output: 115 × 1,500 = 172,500 tokens

**Cost:** $3.45 input + $2.59 output = **$6.04**

---

### Phase 3: Integration & Debugging (Weeks 11-14)

**Activities:**

- Connecting frontend to backend
- Fixing integration bugs
- Performance optimization
- Error handling

**Debugging sessions:** ~60 sessions

**Per debugging session:**

- Input: 15,000 tokens (larger context - multiple files, error traces)
- Output: 2,000 tokens (fixes and adjustments)

**Token usage:**

- Input: 60 × 15,000 = 900,000 tokens
- Output: 60 × 2,000 = 120,000 tokens

**Cost:** $2.70 input + $1.80 output = **$4.50**

---

### Phase 4: Testing & Polish (Weeks 15-16)

**Activities:**

- Writing tests
- UI polish and animations
- Mobile responsiveness fixes
- Documentation

**Sessions:** ~40 sessions

**Per session:**

- Input: 8,000 tokens
- Output: 1,800 tokens

**Token usage:**

- Input: 40 × 8,000 = 320,000 tokens
- Output: 40 × 1,800 = 72,000 tokens

**Cost:** $0.96 input + $1.08 output = **$2.04**

---

### Phase 5: Iteration & Refinement (Ongoing)

**Activities:**

- Bug fixes from testing
- Feature refinements
- Edge case handling
- Small improvements

**Sessions:** ~80 small fixes/improvements

**Per session:**

- Input: 6,000 tokens
- Output: 1,000 tokens

**Token usage:**

- Input: 80 × 6,000 = 480,000 tokens
- Output: 80 × 1,000 = 80,000 tokens

**Cost:** $1.44 input + $1.20 output = **$2.64**

---

## Base Estimate (Efficient Usage)

| Phase               | Input Tokens  | Output Tokens | Cost       |
| ------------------- | ------------- | ------------- | ---------- |
| Setup               | 150,000       | 30,000        | $0.90      |
| Core Development    | 1,150,000     | 172,500       | $6.04      |
| Integration & Debug | 900,000       | 120,000       | $4.50      |
| Testing & Polish    | 320,000       | 72,000        | $2.04      |
| Iteration           | 480,000       | 80,000        | $2.64      |
| **Base Total**      | **3,000,000** | **474,500**   | **$16.12** |

---

## Reality Adjustments

### Multiplier 1: Iteration & Mistakes (2x)

**Reality:** You don't get it right the first time

- Wrong approach, needs rewrite
- Misunderstood requirements
- Better solution discovered
- Bug fixes that require multiple attempts

**Adjusted tokens:**

- Input: 3,000,000 × 2 = 6,000,000
- Output: 474,500 × 2 = 949,000

---

### Multiplier 2: Extended Context (1.5x)

**Reality:** Claude Code maintains large context windows

- Full file contents
- Multiple related files
- Longer conversation history
- Accumulated debugging context

**Final adjusted:**

- Input: 6,000,000 × 1.5 = 9,000,000 tokens
- Output: 949,000 tokens (output doesn't compound as much)

---

## Final Cost Estimates

### Conservative Estimate (Efficient Usage)

**Assumptions:**

- Experienced developer using Claude Code selectively
- Good at writing clear prompts
- Minimal false starts

**Tokens:**

- Input: 5,000,000
- Output: 700,000

**Cost:**

- Input: $15.00
- Output: $10.50
- **Total: $25-30**

---

### Moderate Estimate (Typical Usage)

**Assumptions:**

- Using Claude Code for 60-70% of code generation
- Some iteration and debugging
- Learning curve with the tool

**Tokens:**

- Input: 9,000,000
- Output: 1,000,000

**Cost:**

- Input: $27.00
- Output: $15.00
- **Total: $40-50**

---

### Heavy Usage Estimate (Maximum AI Assistance)

**Assumptions:**

- Using Claude Code for 80-90% of development
- Lots of exploration and experimentation
- Heavy debugging with AI
- Multiple refactoring passes

**Tokens:**

- Input: 15,000,000
- Output: 2,000,000

**Cost:**

- Input: $45.00
- Output: $30.00
- **Total: $70-80**

---

## Cost Breakdown by Line of Code

**For perspective:**

21,500 lines of production code at moderate estimate ($50):

- **$0.0023 per line of code**
- **~$50 for entire MVP**

Compare to developer cost:

- 4 months × $100/hour × 160 hours = $64,000
- **API cost is 0.08% of developer cost**

---

## What Drives the Cost

### High Token Consumers

**1. Debugging sessions** (30-40% of tokens)

- Large context (multiple files, error traces)
- Multiple iterations to fix
- Each debug session: 15,000-20,000 input tokens

**2. Refactoring** (20-30% of tokens)

- Reading entire files or modules
- Understanding relationships
- Each refactor: 10,000-15,000 input tokens

**3. Complex features** (20-30% of tokens)

- Scoring engine (lots of business logic)
- Draft room (real-time, complex state)
- Each complex feature: 30,000-50,000 total tokens

**4. Iteration** (10-20% of tokens)

- Wrong approaches
- Requirement changes
- Better solutions discovered

---

## Ways to Reduce Costs

### 1. Write Better Prompts

**Impact:** -30% tokens

- Clear, specific requirements upfront
- Include examples and edge cases
- Specify file structure preferences

**Saves:** ~$15 on moderate estimate

---

### 2. Use for Complex Features Only

**Impact:** -40% tokens

- Write simple CRUD yourself
- Use Claude for scoring engine, draft room, complex UI
- Handle basic components manually

**Saves:** ~$20 on moderate estimate

---

### 3. Batch Related Changes

**Impact:** -20% tokens

- Group related features in one session
- Reduces context switching
- Fewer session startups

**Saves:** ~$10 on moderate estimate

---

### 4. Use Caching (Prompt Caching)

**Impact:** -50% on repeated context

Anthropic offers prompt caching:

- Cache frequently accessed files
- 90% discount on cached tokens ($0.30 vs $3.00 per M tokens)
- Especially valuable for large files that are referenced often

**Example:**

- Without caching: 2M tokens of repeated context × $3 = $6
- With caching: 2M tokens × $0.30 = $0.60
- **Saves:** ~$5.40

**With aggressive caching, could reduce total cost by 20-30%**

---

## Real-World Comparison

### GitHub Copilot Cost

- $10-20/month per developer
- 4 months = $40-80 total
- **Similar cost to Claude Code estimate**

### Cursor (AI IDE)

- $20/month pro plan
- 4 months = $80
- **Slightly more expensive**

### Claude Code (Anthropic API)

- Pay-as-you-go
- **$40-50 for entire MVP**
- **More cost-effective if used strategically**

---

## The Real Answer

**For building this fantasy football MVP with Claude Code:**

| Usage Pattern                     | Estimated Cost |
| --------------------------------- | -------------- |
| **Light** (key features only)     | $20-30         |
| **Moderate** (60-70% AI-assisted) | $40-50         |
| **Heavy** (80-90% AI-assisted)    | $70-80         |

**Most likely:** **$40-60**

---

## Surprising Insight

**That's absurdly cheap.**

For context:

- 4 months of development time
- 21,500 lines of production code
- Full-stack application
- **Cost:** About the same as lunch for two at a nice restaurant

**The API cost is NOT the constraint.** Your time and attention is the constraint.

Even at "heavy usage" ($80), you're spending:

- $0.004 per line of code
- $20/month over 4 months
- Less than a single hour of developer salary

**Go wild. Don't optimize for API costs. Optimize for your time.**

---

## Practical Advice

### Should You Worry About Costs?

**No.**

Even if you 10x this estimate ($500), it's still:

- 0.8% of what you'd pay a developer
- Less than one month of Cursor subscription
- Cheaper than most SaaS tools you'll use

### What Should You Optimize For?

**Optimize for:**

1. ✅ Speed of development
2. ✅ Quality of prompts (saves YOUR time)
3. ✅ Learning the codebase yourself (don't become dependent)
4. ✅ Testing and validation (AI makes mistakes)

**Don't optimize for:**

1. ❌ API token usage
2. ❌ Number of requests
3. ❌ Context size

### Budget Recommendation

**Set aside $100-150 for API costs** and don't think about it again. You'll probably spend $40-60, but having headroom means you won't worry about using Claude Code when you need it.

---

## The Bottom Line

**Expected API cost to build entire MVP: $40-60**

That's:

- **~$10-15 per month** over 4 months
- **~$0.0023 per line of code**
- **~0.08% of developer cost**
- **~3 months of Spotify Premium**

**The API cost is a rounding error.** Build freely. Iterate quickly. Don't optimize for costs until you're spending >$500/month (which would require ~50 people building full-time).

Focus on building a great product. Claude Code's API costs won't be what makes or breaks your project.
