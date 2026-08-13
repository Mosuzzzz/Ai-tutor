# Home Landing Page Design

## Goal

Replace the temporary `/home` placeholder with a polished, bilingual AI Tutor landing page based on the supplied reference design. The page must work for guests and authenticated users, support persistent language and theme preferences, and expose the existing personal-study routes without changing backend contracts.

## Reference Assets

- Layout reference: `frontend/public/home/ChatGPT Image 13 ส.ค. 2569 22_16_11.png`
- Hero photograph: `frontend/public/home/ChatGPT Image 13 ส.ค. 2569 22_15_52.png`
- New Home logo: `frontend/public/brand/ChatGPT Image 13 ส.ค. 2569 22_46_03.png`

The layout reference guides composition, spacing, and hierarchy. It is not rendered in the product. The Hero photograph and new black-and-blue logo are rendered on `/home`. The existing brand assets remain unchanged on Login, Register, and authenticated App Shell pages.

## Visual Direction

The desktop page follows the supplied mockup:

1. A clean white navigation bar with the new logo at the left.
2. Existing product destinations centered in the bar.
3. Language, theme, and authentication controls at the right.
4. A split Hero with content on the left and the supplied learner photograph on the right.
5. A restrained blue primary action and a compact trust/supporting line.
6. Three feature cards directly below the Hero.

The tone remains trustworthy, premium, intelligent, and warm. Effects are restrained: solid blue actions, subtle borders and shadows, controlled gradients for image readability, and no decorative generic AI gradient.

## Page Architecture

### Server Route

`src/app/home/page.tsx` remains a server component and calls `getServerAuthSession()` once. It passes `AuthSession | null` to the interactive Home experience. This provides an auth-aware first render without exposing tokens or calling the same-origin session endpoint from the browser.

If the visitor has no access-token cookie or the backend session request fails, the page renders safely as a guest. The rest of Home has no backend dependency.

### Client Experience

Interactive behavior lives under a focused `src/features/home/` feature boundary:

- `HomeLandingPage.tsx`: composition and preference state.
- `HomeNavbar.tsx`: desktop navigation and controls.
- `HomeMobileMenu.tsx`: accessible mobile navigation panel.
- `HomeAccountMenu.tsx`: authenticated account trigger and Logout dropdown.
- `HomeHero.tsx`: localized Hero and CTA selection.
- `HomeFeatureGrid.tsx`: localized three-card feature summary.
- `homeContent.ts`: typed English/Thai copy and navigation definitions.
- `homePreferences.ts`: storage keys, validation, system-theme resolution, and DOM theme application.
- `types.ts`: `HomeLanguage`, `HomeTheme`, and localized-content types.

Components stay small enough to test independently. Home-specific styling uses semantic class names and Home-scoped CSS variables in `globals.css`; it does not alter the authenticated App Shell theme.

## Navbar

### Left Brand

- Render the supplied black-and-blue logo with accessible name `AI Tutor`.
- Link the logo to `/home`.
- Preserve the source image aspect ratio and avoid cropping the icon or wordmark.

### Center Navigation

Reuse the existing personal-study destinations and Lucide icon set:

| English | Thai | Route | Icon |
| --- | --- | --- | --- |
| Dashboard | แดชบอร์ด | `/dashboard` | `LayoutDashboard` |
| Documents | เอกสาร | `/documents` | `FileText` |
| AI Chat | AI แชท | `/chat` | `MessageSquareText` |
| Quiz | ควิซ | `/quiz` | `Bot` |
| Analytics | สถิติ | `/analytics` | `BarChart3` |

These links are visible to guests and authenticated users. Existing server-side route guards handle guest clicks by redirecting to `/login`.

### Right Controls

Order is fixed:

1. Language toggle showing `EN` or `TH` beside a language icon.
2. Theme toggle showing `Sun` in Light mode and `Moon` in Dark mode.
3. Authentication/account control.

Guest account control:

- Blue `Log in` in English.
- Blue `เข้าสู่ระบบ` in Thai.
- Links to `/login`.

Authenticated account control:

- Blue `Hello! {email}` in English.
- Blue `สวัสดี! {email}` in Thai.
- Long emails are truncated visually while preserving the full email in an accessible label/title.
- Activating the control opens an anchored dropdown.
- This iteration contains only `Log out` / `ออกจากระบบ`.
- Successful Logout calls the existing same-origin BFF, closes the menu, returns to `/home`, and refreshes the server route so the Navbar becomes the guest state.
- Failed Logout retains the session and renders the localized error within the dropdown.

The dropdown closes on Escape, outside click, and successful Logout. Focus returns to the account trigger after Escape. All controls expose localized accessible names and `aria-expanded`/`aria-controls` where applicable.

## Mobile Navigation

Below the desktop breakpoint:

- Keep the logo visible.
- Keep compact language and theme controls visible.
- Replace center navigation with a menu button.
- Open a side panel or dropdown panel containing all five product routes and the auth/account control.
- Support Escape close, focus containment, focus restoration, and backdrop close using the established App Shell mobile-dialog pattern.

The Hero stacks with content first and photograph second. Feature cards become a single column before expanding to three columns on large screens.

## Language Behavior

Supported values are `en` and `th`.

- First visit defaults to English.
- Pressing `EN` switches all Home copy to Thai and changes the visible abbreviation to `TH`.
- Pressing `TH` switches all Home copy to English and changes the visible abbreviation to `EN`.
- The selected value is stored under a versioned Home-specific `localStorage` key.
- On later visits, a valid stored value wins.
- Missing or invalid stored values fall back to English.
- Only `/home` copy is localized in this change. Login/Register and protected App Shell localization remain out of scope.

The localized surface includes Navbar labels, accessible labels, account greeting, dropdown action/status, Hero copy and CTA, and all feature-card copy.

## Theme Behavior

Supported values are `light` and `dark`.

- On the first visit, use `prefers-color-scheme`.
- After the user toggles Theme, persist the explicit selection in a versioned Home-specific `localStorage` key.
- A valid stored selection wins over the system preference on later visits.
- Apply the theme through a Home-scoped `data-home-theme` attribute and CSS variables.
- Light and Dark modes must meet WCAG AA contrast for text and controls.
- The toggle exposes `aria-pressed` and a localized accessible label.

Because the production Content Security Policy disallows inline scripts, any pre-hydration theme initializer must be a same-origin external script. It may set only the Home theme attribute and must not inject HTML or loosen CSP. If no initializer is used, the initial server-rendered state remains Light until hydration; tests must explicitly cover the chosen behavior.

## Hero

### English Copy

- Eyebrow: `Your personal AI study partner`
- Heading: `Learn smarter. Understand more.`
- Body: `Turn your documents into clear summaries, grounded AI answers, review quizzes, and progress you can act on.`
- Guest CTA: `Get started for free` → `/register`
- Authenticated CTA: `Start with a document` → `/documents`

### Thai Copy

- Eyebrow: `ผู้ช่วยเรียน AI ส่วนตัวของคุณ`
- Heading: `เรียนได้ฉลาดขึ้น เข้าใจได้มากกว่า`
- Body: `เปลี่ยนเอกสารของคุณเป็นสรุปที่เข้าใจง่าย คำตอบ AI ที่อ้างอิงเนื้อหา ควิซทบทวน และสถิติที่นำไปใช้ต่อได้`
- Guest CTA: `เริ่มต้นใช้งานฟรี` → `/register`
- Authenticated CTA: `เริ่มจากเอกสาร` → `/documents`

Use the supplied learner photograph as the Hero visual. Desktop uses a split composition with a soft surface-to-transparent overlay at the content boundary. Mobile uses a bounded image with an explicit aspect ratio and safe `object-position` so the learner and laptop remain visible.

The supporting line uses honest product copy rather than an unverifiable learner count:

- English: `Built for focused, document-based learning.`
- Thai: `ออกแบบเพื่อการเรียนรู้จากเอกสารอย่างมีสมาธิ`

## Feature Cards

Three cards use existing Lucide icons and localized content:

1. `Personalized learning` / `การเรียนรู้ที่เหมาะกับคุณ`
   - `Move from your own documents to the next useful study action.`
   - `ต่อยอดจากเอกสารของคุณไปยังขั้นตอนการเรียนที่เหมาะสม`
2. `Grounded AI help` / `AI ตอบจากเอกสาร`
   - `Ask questions and keep answers connected to your learning material.`
   - `ถามคำถามและรับคำตอบที่เชื่อมโยงกับเนื้อหาที่คุณเรียน`
3. `Track your progress` / `ติดตามความก้าวหน้า`
   - `Review quiz results and see what deserves your attention next.`
   - `ดูผลควิซและรู้ว่าควรกลับไปทบทวนเรื่องใดต่อ`

Cards use subtle borders, low elevation, and a compact blue icon container. Dark mode changes surfaces and borders without changing hierarchy.

## Authentication Routing Changes

- Successful email/password Login navigates to `/home`.
- An authenticated visitor opening `/login` or `/register` redirects to `/home`.
- `/dashboard` stays protected and is reached only when the user chooses Dashboard.
- Other protected navigation items preserve their existing route guards.
- `getDefaultRouteForRole()` remains `/dashboard` for protected-route policy compatibility.
- Add a separate explicit authenticated Home destination for post-login and public-auth-route redirect behavior; do not overload the protected-route default.

## State and Error Handling

- Invalid language/theme storage values are ignored.
- Storage access is guarded for unavailable or restricted browser storage.
- Theme media-query access is guarded for test and older-browser environments.
- Logout uses the existing validated `logout()` client.
- Logout pending state disables repeat submissions.
- Logout errors stay visible inside the account menu.
- Missing session/backend outage renders Home as guest rather than failing the page.
- Image dimensions and responsive `sizes` are explicit to prevent layout shift.

## Accessibility

- Semantic `header`, `nav`, `main`, `section`, and heading hierarchy.
- One visible `h1` in the Hero.
- Keyboard-operable language/theme/account/menu controls.
- Visible focus states in both themes.
- Localized accessible names.
- `aria-current="page"` for Home only; protected links are not marked active on `/home`.
- Mobile dialog and account dropdown support Escape and focus restoration.
- Motion respects `prefers-reduced-motion`.
- Decorative icons use `aria-hidden="true"`.

## Testing

### Unit and Component Tests

- Copy dictionaries contain the complete English and Thai surface.
- Language defaults to English, toggles, persists, restores, and rejects invalid storage.
- Theme follows system preference initially, toggles, persists, restores, rejects invalid storage, and applies the Home data attribute.
- Guest Navbar renders Language, Theme, and Login controls.
- Authenticated Navbar renders the localized email greeting and Logout dropdown.
- Account dropdown keyboard/outside-click behavior and Logout success/error states.
- Mobile navigation open/close, focus containment, and protected links.
- Guest and authenticated Hero CTAs use the intended destinations.
- Login success and authenticated public-auth visits go to `/home`.
- Home server route maps valid session to authenticated UI and backend failure to guest UI.

### Integration and Visual Verification

- Complete Vitest suite.
- ESLint.
- Next.js production build.
- Browser verification at desktop and mobile viewport widths.
- Verify Light/Dark and EN/TH combinations.
- Verify Guest, authenticated account dropdown, Logout, `/dashboard`, and protected guest navigation.
- Compare desktop layout against the supplied reference for hierarchy, alignment, image crop, and card spacing.

## Out of Scope

- Localization outside `/home`.
- Additional account-dropdown entries beyond Logout.
- New backend endpoints or auth contracts.
- Redesigning Dashboard, Login, Register, or App Shell.
- Pricing, public course marketplace, testimonials, or unverifiable learner-count claims.
- Adding more landing sections below the three feature cards.
