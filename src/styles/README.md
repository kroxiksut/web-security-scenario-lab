# Styles Layout

- `main.css` imports all style layers.
- `tokens.css` contains spacing, radius, typography, and shadow tokens.
- `themes.css` defines light/dark/auto color tokens through `data-theme`.
- `base.css` has reset/base element rules.
- `layout.css` defines shell layout (header, nav, main, side panel).
- `components.css` includes reusable UI primitives.
- `modules/*.css` keeps scenario-specific and tricky CSS per module.

Keep module-specific risky visual techniques inside `modules/` files, not in base layers.
