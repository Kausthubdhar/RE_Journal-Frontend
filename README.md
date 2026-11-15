# RE Journal — frontend redesign

Next.js 16 (App Router) + Tailwind CSS 4, animated with GSAP (ScrollTrigger, SplitText), Three.js and Lenis.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```

## Structure

- `app/` — layout, global styles and the single page
- `components/hero/` — hero section, prompt box, category data and the Three.js `CityScene`
- `components/` — the other page sections plus shared `SectionHeading`, `Logo`, `Nav`, `SmoothScroll`
- `lib/gsap.ts` — GSAP plugin registration and shared helpers (`reveal`, `scrollToId`, `prefersReducedMotion`)
