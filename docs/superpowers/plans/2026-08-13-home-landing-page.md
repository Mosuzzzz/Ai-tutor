# Home Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved bilingual, theme-aware `/home` landing page from the supplied mockup and assets for guest and authenticated sessions.

**Architecture:** `/home` remains a server route that resolves the optional HttpOnly-cookie session once and hands only the mapped session to a focused client-side Home feature. Pure preference helpers own language/theme validation and persistence; small Home components own the Navbar, account dropdown, mobile navigation, Hero, and feature grid. Existing protected routes and BFF authentication boundaries remain intact.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, Lucide React, Vitest, Testing Library

## Global Constraints

- Default language is English; valid persisted `en` or `th` wins on later visits.
- First-visit Theme follows `prefers-color-scheme`; valid persisted `light` or `dark` wins later.
- Use `localStorage` keys `ai-tutor.home.language.v1` and `ai-tutor.home.theme.v1`.
- Do not loosen Content Security Policy or add inline scripts.
- Use the supplied new logo only on `/home`; do not change Login, Register, Dashboard, or App Shell branding.
- Use the supplied Hero photograph and preserve responsive subject visibility.
- Center navigation shows `/dashboard`, `/documents`, `/chat`, `/quiz`, and `/analytics` to guests and authenticated users.
- Login success and authenticated visits to `/login` or `/register` go to `/home`; `getDefaultRouteForRole()` remains `/dashboard`.
- Account dropdown contains only Logout in this iteration.
- Do not change backend code or contracts.
- Meet WCAG AA contrast and support keyboard focus, Escape, focus restoration, and reduced motion.

---

### Task 1: Add typed Home content and preference helpers

**Files:**
- Create: `frontend/src/features/home/types.ts`
- Create: `frontend/src/features/home/homeContent.ts`
- Create: `frontend/src/features/home/homeContent.test.ts`
- Create: `frontend/src/features/home/homePreferences.ts`
- Create: `frontend/src/features/home/homePreferences.test.ts`

**Interfaces:**
- Produces: `HomeLanguage = "en" | "th"`, `HomeTheme = "light" | "dark"`, typed `HOME_CONTENT`, typed `HOME_NAVIGATION`, storage constants, `readStoredLanguage`, `readStoredTheme`, `resolveInitialLanguage`, `resolveInitialTheme`, `persistHomeLanguage`, `persistHomeTheme`, and `applyHomeTheme`.
- Consumers: Tasks 2 and 3.

- [ ] **Step 1: Write failing content-contract tests**

Create tests that directly assert both locales expose complete Navbar controls, account strings, Hero content/CTA strings, supporting copy, and exactly three feature cards. Assert navigation uses these literal route/icon keys:

```ts
[
  { href: "/dashboard", icon: "dashboard" },
  { href: "/documents", icon: "documents" },
  { href: "/chat", icon: "chat" },
  { href: "/quiz", icon: "quiz" },
  { href: "/analytics", icon: "analytics" }
]
```

- [ ] **Step 2: Write failing preference tests**

Cover these observable cases with in-memory `Storage` doubles:

```ts
expect(resolveInitialLanguage(emptyStorage)).toBe("en");
expect(resolveInitialLanguage(storageWith("ai-tutor.home.language.v1", "th"))).toBe("th");
expect(resolveInitialLanguage(storageWith("ai-tutor.home.language.v1", "xx"))).toBe("en");
expect(resolveInitialTheme(emptyStorage, true)).toBe("dark");
expect(resolveInitialTheme(emptyStorage, false)).toBe("light");
expect(resolveInitialTheme(storageWith("ai-tutor.home.theme.v1", "light"), true)).toBe("light");
```

Also verify persistence catches storage exceptions and `applyHomeTheme(element, "dark")` sets `data-home-theme="dark"`.

- [ ] **Step 3: Run tests and verify RED**

Run: `npm test -- src/features/home/homeContent.test.ts src/features/home/homePreferences.test.ts`

Expected: FAIL because the Home modules do not exist.

- [ ] **Step 4: Implement types, bilingual content, and pure helpers**

Use the exact English/Thai content and route table from `docs/superpowers/specs/2026-08-13-home-landing-page-design.md`. Helpers accept explicit storage/media inputs so they remain deterministic and do not access browser globals at module load.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run: `npm test -- src/features/home/homeContent.test.ts src/features/home/homePreferences.test.ts`

Expected: Both files pass.

- [ ] **Step 6: Commit Task 1**

```bash
git add frontend/src/features/home/types.ts frontend/src/features/home/homeContent.ts frontend/src/features/home/homeContent.test.ts frontend/src/features/home/homePreferences.ts frontend/src/features/home/homePreferences.test.ts
git commit -m "feat(frontend): add home preferences and content"
```

### Task 2: Build the responsive Home visual composition

**Files:**
- Create: `frontend/src/features/home/HomeBrand.tsx`
- Create: `frontend/src/features/home/HomeHero.tsx`
- Create: `frontend/src/features/home/HomeHero.test.tsx`
- Create: `frontend/src/features/home/HomeFeatureGrid.tsx`
- Create: `frontend/src/features/home/HomeFeatureGrid.test.tsx`
- Create: `frontend/src/features/home/HomeNavbar.tsx`
- Create: `frontend/src/features/home/HomeNavbar.test.tsx`
- Modify: `frontend/src/app/globals.css`
- Add existing user assets: `frontend/public/brand/ChatGPT Image 13 ส.ค. 2569 22_46_03.png`
- Add existing user assets: `frontend/public/home/ChatGPT Image 13 ส.ค. 2569 22_15_52.png`
- Add existing user reference: `frontend/public/home/ChatGPT Image 13 ส.ค. 2569 22_16_11.png`

**Interfaces:**
- Consumes: `HomeLanguage`, `HomeTheme`, `HOME_CONTENT`, `HOME_NAVIGATION`, and optional `AuthSession`.
- Produces: accessible presentational `HomeBrand`, `HomeNavbar`, `HomeHero`, and `HomeFeatureGrid` components. Navbar callbacks are `onLanguageToggle(): void`, `onThemeToggle(): void`, and `onMobileMenuOpen(): void`.

- [ ] **Step 1: Write failing visual-contract tests**

Test real components with literal expectations:

- New logo has accessible name `AI Tutor`, points to the exact new `/brand/...22_46_03.png` asset, and links to `/home`.
- English Navbar renders all five destinations, `EN`, Sun for Light, and `Log in` linked to `/login`.
- Thai Navbar renders localized labels, `TH`, and `เข้าสู่ระบบ`.
- Guest Hero CTA is `/register`; authenticated Hero CTA is `/documents`.
- English and Thai Hero headings match the approved spec.
- Hero image uses the exact `/home/...22_15_52.png` source and non-empty responsive `sizes`.
- Feature grid renders exactly three localized cards with headings at level 2 or 3 below the single page `h1`.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm test -- src/features/home/HomeNavbar.test.tsx src/features/home/HomeHero.test.tsx src/features/home/HomeFeatureGrid.test.tsx`

Expected: FAIL because the components do not exist.

- [ ] **Step 3: Implement presentational components**

Use `next/image`, `next/link`, and Lucide icons. Keep all interactive state outside these components. Desktop Navbar follows the reference alignment; mobile hides center navigation and exposes an accessible menu trigger. Hero is a two-column split above `lg`, stacks below `lg`, and uses a surface-to-transparent overlay at the content/image boundary.

- [ ] **Step 4: Add Home-scoped Light/Dark styles**

Add semantic variables under `.home-page` and `.home-page[data-home-theme="dark"]` for page, navigation, elevated surface, text, muted text, border, primary action, primary hover, icon surface, focus ring, and overlay. Use these variables only through `home-*` class selectors so authenticated pages keep existing tokens. Add reduced-motion handling for Home transitions.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run: `npm test -- src/features/home/HomeNavbar.test.tsx src/features/home/HomeHero.test.tsx src/features/home/HomeFeatureGrid.test.tsx`

Expected: All presentational tests pass.

- [ ] **Step 6: Commit Task 2**

Commit only the files listed in Task 2, including all three supplied assets:

```bash
git commit -m "feat(frontend): build home landing presentation"
```

### Task 3: Add language, theme, account, and mobile interactions

**Files:**
- Create: `frontend/src/features/home/HomeAccountMenu.tsx`
- Create: `frontend/src/features/home/HomeAccountMenu.test.tsx`
- Create: `frontend/src/features/home/HomeMobileMenu.tsx`
- Create: `frontend/src/features/home/HomeMobileMenu.test.tsx`
- Create: `frontend/src/features/home/HomeLandingPage.tsx`
- Create: `frontend/src/features/home/HomeLandingPage.test.tsx`
- Modify: `frontend/src/features/home/HomeNavbar.tsx`
- Modify: `frontend/src/features/home/HomeNavbar.test.tsx`

**Interfaces:**
- Consumes: Task 1 helpers/content, Task 2 presentation, `AuthSession | null`, and existing `logout()`.
- Produces: `HomeLandingPage({ initialSession }: { initialSession: AuthSession | null })`, persistent EN/TH and Light/Dark controls, authenticated account dropdown, and accessible mobile navigation.

- [ ] **Step 1: Write failing preference-integration tests**

Render `HomeLandingPage` with controlled `localStorage` and `matchMedia`:

- Empty storage renders English.
- Stored `th` restores Thai.
- Language toggle changes visible copy and saves `th`/`en`.
- System Dark applies `data-home-theme="dark"` on first visit.
- Stored Light wins over a Dark system preference.
- Theme toggle changes Sun/Moon behavior, `aria-pressed`, the data attribute, and storage.

- [ ] **Step 2: Write failing account and mobile tests**

Cover:

- Authenticated trigger uses the full literal email in its accessible name and localized `Hello!`/`สวัสดี!` copy.
- Trigger toggles a menu containing only Logout.
- Escape and outside click close the menu; Escape restores trigger focus.
- Logout pending disables repeat action.
- Logout success calls `/api/auth/logout` through the real auth client boundary, navigates to `/home`, and refreshes.
- Logout failure leaves the menu open and shows localized status.
- Mobile menu opens from its trigger, contains all five protected links plus auth/account control, traps focus, closes on backdrop/Escape, and restores focus.

- [ ] **Step 3: Run interaction tests and verify RED**

Run: `npm test -- src/features/home/HomeLandingPage.test.tsx src/features/home/HomeAccountMenu.test.tsx src/features/home/HomeMobileMenu.test.tsx src/features/home/HomeNavbar.test.tsx`

Expected: FAIL because interaction components/state do not exist.

- [ ] **Step 4: Implement Home interaction state and accessible menus**

Initialize state in an effect using Task 1 helpers. Guard `window`, `localStorage`, and `matchMedia`. Apply the selected Theme to the Home root element through a ref/effect. Implement account and mobile interactions with refs and document listeners that are added only while open and removed during cleanup.

- [ ] **Step 5: Run interaction tests and verify GREEN**

Run the same command from Step 3.

Expected: All interaction tests pass with no unhandled React warnings.

- [ ] **Step 6: Commit Task 3**

```bash
git add frontend/src/features/home
git commit -m "feat(frontend): add home preferences and account controls"
```

### Task 4: Connect optional server session and post-login routing

**Files:**
- Modify: `frontend/src/app/home/page.tsx`
- Modify: `frontend/src/app/home/page.test.tsx`
- Modify: `frontend/src/features/auth/authRoutePolicy.ts`
- Modify: `frontend/src/features/auth/authRoutePolicy.test.ts`
- Modify: `frontend/src/features/auth/LoginPage.tsx`
- Modify: `frontend/src/features/auth/LoginPage.test.tsx`
- Modify: `frontend/src/app/auth-routes.test.tsx`

**Interfaces:**
- Consumes: `getServerAuthSession`, `HomeLandingPage`, `AuthSession`, existing `getDefaultRouteForRole() === "/dashboard"`.
- Produces: `AUTHENTICATED_HOME_ROUTE = "/home"`; Home passes the optional server session; Login success and authenticated public-auth routes use `/home`.

- [ ] **Step 1: Write failing server-route and auth-routing tests**

Update Home route tests to mock `getServerAuthSession` with complete `AuthSession | null` values and assert observable Guest/Login versus authenticated greeting output. Update policy tests so:

```ts
expect(getDefaultRouteForRole("user")).toBe("/dashboard");
expect(resolvePublicAuthRouteDecision(authenticatedSession)).toEqual({
  href: "/home",
  type: "redirect"
});
```

Update Login success to expect `router.replace("/home")`. Keep protected-route tests expecting `/dashboard`.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm test -- src/app/home/page.test.tsx src/features/auth/authRoutePolicy.test.ts src/features/auth/LoginPage.test.tsx src/app/auth-routes.test.tsx`

Expected: FAIL because Home is not session-aware and auth routes still default to `/dashboard`.

- [ ] **Step 3: Implement optional session and explicit Home destination**

Export `AUTHENTICATED_HOME_ROUTE = "/home"` from `authRoutePolicy.ts`. Use it in `resolvePublicAuthRouteDecision` and `LoginPage` while leaving `getDefaultRouteForRole` untouched. Make Home `force-dynamic`, await `getServerAuthSession()`, and render `HomeLandingPage initialSession={session}`.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run the same command from Step 2.

Expected: All Home/auth routing tests pass.

- [ ] **Step 5: Commit Task 4**

```bash
git add frontend/src/app/home frontend/src/features/auth/authRoutePolicy.ts frontend/src/features/auth/authRoutePolicy.test.ts frontend/src/features/auth/LoginPage.tsx frontend/src/features/auth/LoginPage.test.tsx frontend/src/app/auth-routes.test.tsx
git commit -m "feat(frontend): connect home session and login flow"
```

### Task 5: Complete automated and browser visual verification

**Files:**
- Modify only when verification identifies a scoped defect in Tasks 1-4.

**Interfaces:**
- Consumes: Complete Home implementation.
- Produces: verified desktop/mobile, EN/TH, Light/Dark, Guest/auth behavior.

- [ ] **Step 1: Run the complete frontend quality gate**

Run:

```bash
npm test
npm run lint
npm run build
```

Expected: All commands exit `0`; the route manifest contains `/home` and `/dashboard`.

- [ ] **Step 2: Start local services for browser verification**

Run the standalone database, backend with `uv run main.py`, and frontend with `npm run dev`. Wait for health endpoints rather than fixed sleeps.

- [ ] **Step 3: Verify Guest desktop behavior**

At a desktop viewport, compare `/home` to the supplied layout reference. Verify new logo, five center links, EN, Theme toggle, Login, split Hero, correct photograph crop, CTA, supporting line, and three aligned cards.

- [ ] **Step 4: Verify EN/TH and Light/Dark combinations**

Toggle Language and Theme, reload, and confirm both persist. Inspect contrast, focus indicators, overflow, and localized wrapping in all four combinations.

- [ ] **Step 5: Verify mobile behavior**

At a narrow mobile viewport, verify compact Navbar, mobile menu focus/close behavior, stacked Hero, visible learner/laptop crop, full-width CTA, and single-column cards without horizontal overflow.

- [ ] **Step 6: Verify authenticated behavior**

Use the existing local Login flow when an account is available. Confirm post-login `/home`, email greeting, Logout dropdown, successful Logout returning to Guest Home, and Dashboard link navigation. If no usable account exists, rely on component/integration test evidence and explicitly report that browser-auth verification was unavailable.

- [ ] **Step 7: Commit verification fixes if needed**

If browser or automated verification required scoped fixes, commit them with tests:

```bash
git commit -m "fix(frontend): polish home landing behavior"
```
