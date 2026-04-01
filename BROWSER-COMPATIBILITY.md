# Browser Compatibility

## Target Browsers

The lab must run in current mainstream desktop browsers:

- Chrome
- Edge
- Firefox
- Safari
- other modern Chromium-based browsers

## Compatibility Policy

- Prefer standard Web APIs over vendor-specific APIs.
- Avoid Chrome extension APIs because the lab is not itself an extension.
- Use feature detection when behavior may differ across engines.
- Keep progressive enhancement acceptable where Safari or Firefox lack noncritical features.

## Minimum Expectations

- Main navigation works
- RU and EN switching works
- Scenario loading works
- Seeded reroll works
- Timed dynamic updates work
- Local library pages render correctly
- Deep links by query string work

## Technical Rules

- Use `ES modules` with a browser support baseline that can be transpiled only if required by the final support matrix.
- Avoid reliance on bleeding-edge APIs unless guarded.
- Test `MutationObserver`, `URL`, `URLSearchParams`, `Intl`, `requestAnimationFrame`, and `history` behavior.
- Validate CSS behavior for visibility tricks, overlays, filters, opacity, clipping, transforms, and pseudo-elements.

## Engine-Specific Validation Areas

- Chromium: baseline behavior and primary authoring target
- Gecko: CSS visibility and text rendering differences
- WebKit: Safari layout and event timing differences

## Browser Test Matrix

Each release candidate should be checked against:

- landing page
- one static scenario per module
- one dynamic scenario per module
- one library-backed scenario
- one seeded reroll scenario
- one localization switch

## Known Strategy

- Design for standards first
- Document exceptions explicitly
- Keep unsafe fallbacks out of scope
- Never require server support for browser-specific logic
