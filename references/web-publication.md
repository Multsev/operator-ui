# Authenticated web publication

Web publication is a host and transport concern. Operator UI supplies the settings vocabulary; each application connects it to its own allowlisted service facade.

## Required architecture

```text
Operator UI application
├── one domain/application service facade
├── native transport (QWebChannel, IPC, embedded host)
└── web transport (authenticated HTTP/WebSocket)
```

Both transports call the same named operations, validation, authorization, locks and serialization. Do not duplicate business logic in HTTP handlers.

## Safe defaults

- Bind `127.0.0.1` by default.
- Generate at least 256 random bits for the access token and store it in the OS credential vault.
- Bootstrap the browser with `#access_token=...`; remove the fragment immediately and keep it in `sessionStorage`, never `localStorage`.
- Require `Authorization: Bearer ...`, `application/json`, bounded bodies, bounded concurrency and an operation allowlist.
- Omit permissive CORS headers and reject cross-origin preflights.
- Serve only resolved files below the production bundle root. Reject traversal, symlinks outside the root and directory listings.
- Add `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `Cache-Control: no-store` for HTML and API responses.
- Never expose native file pickers, arbitrary filesystem access, credential reveal/copy, shell execution or generic method names through the web transport.
- LAN/public binding requires explicit scope, TLS or a trusted reverse proxy, firewall guidance and a visible warning. Do not silently convert loopback publication into remote access.

## Settings composition

Use Settings → Panel/GroupBox with:

- `Checkbox`: publish in browser;
- `Select`: loopback or explicitly supported secured scope;
- validated port input;
- read-only address;
- `InlineStatus`: stopped, starting, running or error;
- Commands: copy address, restart, revoke sessions.

Persist only `enabled`, `scope` and `port`. Treat changing scope or port as a restart. Rotating the token revokes existing browser sessions.

## Browser limitations

Replace native-only actions deliberately:

- browser download/upload instead of native file dialogs;
- Clipboard API only after a user gesture;
- ordinary safe links instead of a native URL launcher;
- unavailable credential reveal/copy controls;
- explicit error copy when a feature remains desktop-only.

## Verification

Test unauthorized, wrong-token, oversized, unknown-operation, traversal and concurrent-request rejection. Run an authenticated RPC through the production bundle. Verify that secrets never appear in HTML, logs, settings JSON or browser persistent storage. Visually test the settings panel and the published application at supported widths.
