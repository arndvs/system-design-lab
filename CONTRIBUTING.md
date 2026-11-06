# Contributing

Thanks for helping. Most contributions here are content, not code, and every piece of content lives in `src/content/`.

## Ground rules

1. **Write it yourself.** Don't paste text from other cheat sheets, courses, books or blogs, even with edits. Read the primary source, close it, and explain the idea in your own words.
2. **Cite primary sources.** Official docs, published papers or standards, linked over `https://`. Every component needs at least one.
3. **Sign off your commits** under the [Developer Certificate of Origin](https://developercertificate.org/), which certifies you have the right to submit the work:

   ```bash
   git commit -s -m "Add graph database component"
   ```

## Adding a component

1. Create `src/content/components/<id>.ts` exporting a `Component` (see `src/content/types.ts`). Fill in every field, including `skipWhen` and `interviewAngle`.
2. Register it in `src/content/components/index.ts`.
3. Add any new glossary terms to `src/content/glossary.ts`.
4. If a requirement should recommend it, add a rule in `src/content/rules.ts` with a plain-language `reason` and a `bottleneck`, plus a test in `tests/rules.test.ts`.

## Changing a rule

Rules decide what the app teaches, so each change needs a test that would have failed before it. If you think a rule is wrong, an issue explaining why, with a source, is just as welcome as a PR.

## Before you open a PR

```bash
pnpm test         # rules, estimator math, and content completeness
pnpm build        # typecheck and production build
```
