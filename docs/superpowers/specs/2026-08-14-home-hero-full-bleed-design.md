# Home Hero Full-Bleed Image Design

## Goal

Refine only the `/home` Hero photograph so it matches the second supplied visual reference: the image is larger, begins directly below the Navbar, reaches the right viewport edge, and blends into the content surface without a visible left frame.

## Desktop Composition

- Keep the existing two-column Hero content and photograph.
- The Hero photograph begins directly below the Navbar with no empty top gap.
- The image extends from its content boundary to the right viewport edge instead of stopping at the centered 1280px container.
- Remove the photograph border and rounded corners so no rectangular frame is visible.
- Preserve the left copy inside the existing centered content alignment.
- Increase the photograph height so the person and laptop have comparable visual weight to the second reference while keeping the feature cards below the Hero.
- Keep the current source image and `next/image`; do not generate or replace the asset.

## Fade Treatment

- Replace the short edge overlay with a broad horizontal surface-to-transparent gradient.
- The gradient starts fully opaque using the active Home page surface, remains strong across the copy/image boundary, and fades progressively into the photograph.
- The blend must hide the photograph's left edge in both Light and Dark themes.
- The learner, laptop, and working posture must remain clearly visible outside the fade zone.

## Responsive Behavior

- Apply the full-bleed right edge and Navbar-touching image at the desktop split-layout breakpoint.
- Tablet and mobile retain a stacked layout with copy first and image second.
- On stacked layouts, the image remains width-safe without horizontal overflow; it may use a subtle top fade instead of the desktop horizontal fade.
- Preserve a useful aspect ratio and `object-position` so the learner and laptop remain visible.

## Accessibility and Scope

- Preserve the current descriptive image alternative text and explicit responsive `sizes`.
- Preserve EN/TH content, Light/Dark controls, authentication state, Navbar behavior, CTA destinations, and feature cards.
- Do not change backend code or contracts.
- Respect the existing reduced-motion behavior; this refinement adds no animation.

## Verification

- Add a style-contract regression test for the desktop full-bleed geometry, borderless image, and expanded fade.
- Run focused Home Hero/style tests, full frontend tests, ESLint, and production build.
- Verify there is no horizontal overflow at desktop and narrow widths when browser tooling is available.
