# TASK.md — Development Process

## AI Tools & Resources

### Perplexity Pro
- Used for research and analysis phase
- No private access to AI agent available
- Optimized prompts for Github Copilot Chat to reduce token usage

### GitHub Copilot Chat (Free Tier)
- Limited free tokens — optimized prompt strategy
- Focused high-impact queries on complex logic:
  - BFS algorithm implementation
  - SearchBox component extraction
  - Set-based search performance optimization
  - Translations and i18n integration
  - Vue 3 lifecycle best practices
- Iterative refinement approach to maximize token efficiency

---

## Problems Encountered & How to Prevent Them

### Problem: Lack of Optimization from the Start
**What Happened:**
- Initial implementations were functionally correct but inefficient
- Task 3 (search) had per-frame string operations (960 ops/frame)
- Required explicit follow-up questions to identify optimization opportunities

**Solution:**
- Asked Copilot: "Can this be optimized for 1000+ nodes?"
- Received computed property + Set-based solution
- Result: 60-100× performance improvement

**How to Prevent Next Time:**
- Establish coding rules/skills **before starting development**
- Document performance guidelines upfront
- Include "performance checklist" in Definition of Done
- Ask optimization questions immediately, not as afterthought

---

## Final Verification & Future Improvements

### Verification Process
- Re-checked all three tasks for correctness against README requirements
- Analyzed code for optimization opportunities
- Identified performance bottlenecks and applied improvements
- Documented trade-offs and architectural decisions
---

## Summary

✅ **Process:**
- Maximized free Copilot tokens through optimized prompting
- Used Perplexity Pro for research to reduce online documentation burden
- Identified optimization gaps through explicit questioning

✅ **Prevention for Future:**
- Prepare skills/project guidelines **before development starts**
- Include optimization checks in every phase, not just final phase
- Establish clear performance targets upfront

✅ **Verification:**
- All three tasks verified for correctness and performance
- Future enhancement roadmap identified
- Technical debt minimized through strategic TypeScript adoption







