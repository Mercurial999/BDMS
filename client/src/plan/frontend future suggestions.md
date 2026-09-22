# Future Frontend Suggestions

## Reports and tables

- Keep report tables as valid `thead`, `tbody`, and `tr` structures so column headers remain aligned above the data.
- Keep pagination client-side for the current API responses, showing 10 rows per page with clear Previous and Next controls.
- Done: add CSV export for the complete active report dataset, including the applied date range in the filename.
- Add sortable columns and server-side pagination if report datasets become large.
- Add a compact mobile presentation for wide reports if horizontal scrolling becomes difficult on small screens.
- Done: add PDF export through the browser print flow so users can save the active report as a PDF.

## Visual polish

- Add small summary trend indicators only when the backend provides comparable periods.
- Use consistent date, currency, quantity, and status formatting across Dashboard, Sales, and Reports.
- Done: add print styling that removes navigation and report controls from the PDF output.
- Add browser-level smoke tests for report loading, filtering, pagination, empty data, and API errors.

## Integration boundaries

- Keep the backend read-only for frontend presentation improvements.
- Treat completed deliveries and the existing report endpoints as the source of truth.
- Do not invent report fields or calculate replacement sales totals in the client.