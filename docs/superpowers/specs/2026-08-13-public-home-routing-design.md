# Public Home Routing Design

## Goal

Make `/home` the first public page visitors see when opening the web application, while preserving the existing authenticated study dashboard at `/dashboard` for future navigation work.

## Scope

- Redirect `/` to `/home` for guests and authenticated users.
- Add a public `/home` route that does not require a session.
- Render a temporary, responsive placeholder containing the AI Tutor brand, a short message that the Home experience is being redesigned, and links to `/login` and `/register`.
- Move the existing authenticated dashboard page from `/` to `/dashboard` without changing its data loading or visual design.
- Keep `/dashboard` protected with the existing server-side auth guard.
- Change the default authenticated destination from `/` to `/dashboard` so successful login and visits to public authentication routes continue to land in the personal workspace.
- Do not add the future Home navbar, account menu, or Dashboard button in this change.

## Routing Behavior

| Request | Guest result | Authenticated result |
| --- | --- | --- |
| `/` | Redirect to `/home` | Redirect to `/home` |
| `/home` | Render public Home placeholder | Render the same public Home placeholder |
| `/dashboard` | Redirect to `/login` | Render the existing study dashboard |
| `/login` or `/register` | Render authentication page | Redirect to `/dashboard` |

## Components and Data Flow

- `src/app/page.tsx` becomes a redirect-only server route.
- `src/app/home/page.tsx` owns the temporary public Home page and performs no backend request.
- `src/app/dashboard/page.tsx` receives the current root dashboard implementation and requests the authenticated session using `/dashboard` as the return path.
- `src/features/auth/authRoutePolicy.ts` uses `/dashboard` as the default destination for every supported authenticated role.

The public Home page intentionally does not fetch session data. Account-aware navigation will be added as part of the later Home redesign.

## Error Handling

- `/home` has no remote dependency and therefore renders even when the backend is unavailable.
- `/dashboard` retains the existing authentication and dashboard API error behavior.
- Unsupported or expired sessions continue through the existing auth guard and redirect to Login.

## Testing

- Verify the root route redirects to `/home`.
- Verify `/home` renders its temporary public content and Login/Register links without calling an auth guard.
- Move existing root dashboard tests to `/dashboard` and assert that the guard receives `/dashboard`.
- Update auth policy and route tests to expect `/dashboard` as the authenticated default.
- Run ESLint, the complete Vitest suite, and the Next.js production build.

## Out of Scope

- Final Home/Landing UX/UI.
- Navbar, account information, or Dashboard navigation button.
- Changes to Login/Register presentation.
- Backend changes.
