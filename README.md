<h1 align="center">System Design Lab</h1>

<p align="center">
  <a href="https://github.com/arndvs/system-design-lab/actions/workflows/ci.yml"><img src="https://github.com/arndvs/system-design-lab/actions/workflows/ci.yml/badge.svg" alt="CI status"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT licensed"></a>
  <br>
  Set your requirements and see the architecture they call for, with the reason behind every component, what it will cost you, and when you'd be better off without it.
</p>

<p align="center">
  <a href="https://arndvs.github.io/system-design-lab/"><strong>Open the live site →</strong></a>
</p>

![System Design Lab: requirements on the left, recommended components with their reasons on the right](docs/screenshot.png)

---

## Why this exists

A table that maps problems to components is good for review. It's less good at teaching what interviews and real projects test: why a piece belongs in this design, what new problem it creates, and when it's overkill.

System Design Lab makes those links visible. Change one requirement and you see exactly what gets added or dropped, and the reason.

## What's in it

| Section | Status | What you do there |
|---|---|---|
| **Build** | Live | Set scale, data shape and needs. Every recommended component lists each requirement that pulled it in, its trade-offs paired with fixes, and when to skip it. Your settings live in the URL, so you can share a design. |
| **Evolve** | Engine done | Replay a design from a single server, one bottleneck at a time. |
| **Estimate** | Engine done | Throughput and storage calculators that show every step of the math with your numbers. |
| **Learn** | Planned | Browse every component by layer, with glossary and sourced latency figures. |
| **Practice** | Planned | Work through scenarios such as a URL shortener or a checkout flow, then compare your design with the reference answer. |

## Rules it gets right

Plenty of cheat sheets repeat a few shortcuts that don't hold up. The rules here are written and tested to avoid them:

- **The database follows the data's shape and access pattern.** Needing strong consistency doesn't force you onto SQL; DynamoDB, for example, offers strongly consistent reads. There's a test for this.
- **High availability brings a load balancer**, because redundant servers are useless without something to route between them.
- **Metrics and logging are always included.** Every production system needs them.
- **Thresholds are stated, not hidden.** For example, a cache is suggested from 10 reads per write, and the reason names your ratio.

Disagree with a rule? [Open an issue](https://github.com/arndvs/system-design-lab/issues) and include a source.

## Run it locally

```bash
git clone https://github.com/arndvs/system-design-lab
cd system-design-lab
npm install
npm run dev
```

```bash
npm test          # rules, estimator math and content checks
npm run build     # typecheck and build the static site into dist/
```

## How it's built

Vite, TypeScript with no framework, Tailwind CSS v4, and Vitest. All teaching content is data:

```
src/
  content/
    components/   one file per component, each with sources
    rules.ts      requirement → components, each with a reason and the bottleneck it solves
    scenarios.ts  practice problems with reference answers (tested against the engine)
    glossary.ts
  engine/
    recommend.ts  pure function: requirements → { component: reasons[] }
    evolve.ts     the design as a series of stages
    estimate.ts   back-of-the-envelope math that returns its working
  main.ts         the Build view
  state.ts        URL hash ↔ requirements
tests/
```

To change what the app teaches, edit `src/content/`. The UI picks it up.

## Contributing

Corrections and new components are welcome. Every entry is original writing with primary sources, and every rule change comes with a test. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Tips for system design interviews

- Lead with numbers. Turn daily users into requests per second and bytes into terabytes before you draw anything, because those figures decide which components you need. The Estimate engine shows each step.
- Sketch the whole path from client to storage first, then go deep on the two or three components that carry the most risk.
- For each component, have one sentence ready on why it's there and one on what it costs you.

## License

[MIT](LICENSE)
