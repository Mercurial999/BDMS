# Frontend Design Guidelines

These guidelines preserve the approved visual and interaction direction for the BDMS frontend. Inspect the current components and styles before making changes; this document is not a reason to rewrite working pages.

## Visual identity

The existing interface uses a forest-green and gold identity associated with the supplied Falcore branding.

- Use forest green for the primary brand and navigation identity.
- Use gold for emphasis and primary actions.
- Reserve red and green status colors for operational meaning; do not use them only as decoration.
- Keep the existing shadcn/ui setup with Base UI, Tailwind CSS v4, and Lucide-compatible conventions.
- Keep internal BDMS storage keys and API contracts unchanged when changing visible branding.

## Page and component conventions

- Use one clear page header, one primary action area, and readable data surfaces.
- Keep operational tables calm, scannable, and usable at narrow widths.
- Provide loading, empty, error, and success feedback for API-backed pages.
- Use consistent date, currency, quantity, and status formatting.
- Use whole-number quantity controls for operational stock/order/delivery quantities.
- Use shared shadcn-based components when repeated page patterns justify them; do not create abstractions for one-off UI.
- Maintain visible keyboard focus and review color contrast for brand and status combinations.

## Responsive behavior and motion

- Provide a compact mobile navigation/sidebar control where needed.
- Keep page transitions and loading motion subtle; operational data should remain stable and readable.
- Review print styling for report headers and the current visible brand identity.

## Guardrails

- Frontend presentation changes must not alter backend routes, authentication, database models, or API response contracts unless separately approved.
- The backend remains the source of truth for business rules, inventory, sales, and state transitions.
- Use the existing component library and CSS tokens rather than introducing a second UI framework.
- Run `npm run lint` and `npm run build` from `client/` after meaningful frontend changes.
