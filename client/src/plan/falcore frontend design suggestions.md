# Falcore Frontend Design Suggestions

The current interface is branded around the supplied Falcore identity: forest green for trust and operations, gold for emphasis, and lime accents for the eagle-inspired energy in the logo.

## Applied foundation

- Use Falcore as the visible client name across the login and authenticated workspace.
- Keep `BDMS` storage keys and API contracts unchanged because they are internal integration details.
- Use green and gold as the primary visual system, reserving red and green status colors for operational meaning.
- Keep the existing shadcn/ui setup with Base UI, Tailwind CSS v4, and Lucide-compatible component conventions.
- Keep page structure restrained: one clear page header, one primary action area, and readable data surfaces.

## Future design improvements

- Add the supplied Falcore logo as an optimized asset when the original high-resolution file is available in the repository.
- Add a compact mobile sidebar trigger with a familiar menu icon instead of relying only on horizontal navigation.
- Add a small brand mark to the browser favicon and document title so the identity continues outside the application shell.
- Create shared shadcn-based `Table`, `Badge`, `Alert`, and `EmptyState` components when the current pages need consistent variants.
- Add keyboard-visible focus states and a contrast review for every green, gold, and status combination.
- Add light motion only for page entrance, navigation changes, and loading transitions; keep operational tables calm and stable.
- Add a print stylesheet review for the Falcore wordmark and report headers so exported PDFs carry the correct identity.
- Add browser-level visual checks at desktop and mobile widths before introducing larger layout changes.

## Guardrails

- Frontend branding changes must not alter backend routes, authentication, database models, or API response contracts.
- Do not replace the backend source of truth with client-side calculations.
- Prefer the existing shadcn components and local CSS tokens over adding a second component library.