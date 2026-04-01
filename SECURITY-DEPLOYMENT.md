# Security And Deployment

## Deployment Model

The lab must be deployable as plain static files.

Valid deployment targets include:

- `Nginx`
- `Caddy`
- GitHub Pages
- static object storage hosting

## Security Goals

- no server-side code execution
- no server-side input processing
- no database exposure
- no upload endpoints
- no authentication surface
- no dependency on third-party CDNs for core runtime

## Client-Side Security Rules

- Do not use `eval`.
- Do not use `new Function`.
- Do not inject raw HTML from query parameters or storage.
- Keep all scenario templates local and controlled.
- Treat all query-string values as untrusted.
- Validate and normalize `seed`, `lang`, `module`, and `scenario` before use.

## Server Load Policy

- Server only serves static files.
- Randomization and scenario generation run in the browser.
- No background polling should be required for core functionality.
- No analytics or logging calls in the MVP baseline.

## Hardening Recommendations

- Add a strict `Content-Security-Policy` where hosting allows it.
- Disable directory listing on static servers.
- Serve only required asset types.
- Prefer immutable caching for versioned assets.
- Keep library files pinned and reviewed before update.

## Cross-Platform Development

- Development commands must run on Windows and Linux.
- Avoid `.bat`-only or `.sh`-only core workflows.
- Prefer npm scripts and Node-based tooling.
- Do not make path assumptions based on one operating system.
