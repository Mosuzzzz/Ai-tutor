# Home Hero Full-Bleed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing `/home` Hero photograph larger, flush beneath the Navbar and against the right viewport edge, with a broad borderless fade into the content surface.

**Architecture:** Keep the existing `HomeHero` markup, `next/image` asset, content, and responsive split/stack structure. Express the visual refinement through Home-scoped CSS and a deterministic style-contract test so no application state or backend boundary changes.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS, Vitest

## Global Constraints

- Use the existing `frontend/public/home/ChatGPT Image 13 ส.ค. 2569 22_15_52.png` asset.
- Desktop image begins directly below the Navbar and reaches the right viewport edge.
- Desktop image has no border or rounded frame and fades broadly into the Home surface on its left.
- Tablet/mobile retain copy-first stacking, safe image width, and visible learner/laptop crop.
- Preserve Home copy, navigation, preferences, auth behavior, CTAs, accessibility text, and feature cards.
- Do not change backend code or contracts.

---

### Task 1: Refine the Hero image geometry and fade

**Files:**
- Modify: `frontend/src/features/home/HomeStyles.test.ts`
- Modify: `frontend/src/app/globals.css`

**Interfaces:**
- Consumes: existing `.home-hero`, `.home-hero-image-wrap`, `.home-hero-image-wrap::before`, and `.home-hero-image` hooks.
- Produces: desktop full-bleed Hero geometry and responsive stacked-image behavior without changing component props or markup.

- [ ] **Step 1: Write failing full-bleed style-contract tests**

Extend `HomeStyles.test.ts` with literal assertions proving:

```ts
expect(css).toMatch(/@media \(min-width: 1024px\)[\s\S]*?\.home-hero\s*\{[^}]*padding-top:\s*0;/);
expect(css).toMatch(/@media \(min-width: 1024px\)[\s\S]*?\.home-hero-image-wrap\s*\{[^}]*border:\s*0;[^}]*border-radius:\s*0;/);
expect(css).toMatch(/@media \(min-width: 1024px\)[\s\S]*?\.home-hero-image-wrap\s*\{[^}]*margin-right:\s*calc\(/);
expect(css).toMatch(/\.home-hero-image-wrap::before\s*\{[^}]*linear-gradient\(90deg,[^}]*transparent/);
```

Also assert the base stacked image still has a bounded aspect ratio and the page/hero prevent horizontal overflow.

- [ ] **Step 2: Run the focused style test and verify RED**

Run: `npm test -- src/features/home/HomeStyles.test.ts`

Expected: FAIL because the current image retains a border/radius, the desktop Hero has top padding, and the image does not extend to the viewport edge.

- [ ] **Step 3: Implement mobile-safe base styling**

Keep the base Hero stacked. Remove the visible frame, use a subtle top-to-transparent overlay for the stacked photograph, preserve `aspect-ratio: 4 / 3`, and ensure `.home-page`/`.home-hero` cannot create horizontal scrolling.

- [ ] **Step 4: Implement desktop full-bleed styling**

Within `@media (min-width: 1024px)`:

- set the Hero's top padding to `0` so the photograph begins below the Navbar;
- give the Hero a taller minimum visual height;
- vertically center/pad only `.home-hero-copy`;
- extend `.home-hero-image-wrap` to the right viewport edge with a calculated negative/right margin based on the centered 1280px container;
- remove border and radius;
- use a broad left-to-right overlay covering roughly the left 45–55% before becoming transparent;
- keep the image at full height with an object position that preserves the learner and laptop.

- [ ] **Step 5: Run focused Home tests and verify GREEN**

Run:

```bash
npm test -- src/features/home/HomeStyles.test.ts src/features/home/HomeHero.test.tsx
```

Expected: Both files pass.

- [ ] **Step 6: Run quality gates**

Run:

```bash
npm test
npm run lint
npm run build
```

Expected: all exit `0`, with `/home` in the production route table.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/features/home/HomeStyles.test.ts frontend/src/app/globals.css
git commit -m "fix(frontend): expand home hero image"
```
