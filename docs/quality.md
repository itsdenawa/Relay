# Motion, accessibility, and performance

Relay treats motion, keyboard access, and loading speed as product behavior rather than optional polish.

## Motion

- Product motion uses a shared 180 ms transition with a restrained ease-out curve.
- Entry and layout motion is limited to `transform` and `opacity`; color and shadow transitions remain CSS-only.
- Dialogs, sheets, dashboard cards, and the desktop sidebar use the same timing language.
- `MotionConfig` follows the operating-system `prefers-reduced-motion` setting. The global CSS fallback reduces all remaining animation and transition durations, including third-party components.
- Kanban drag-and-drop keeps its dedicated DnD transform pipeline. It does not add a second layout animation after a drop, which avoids a misleading return-to-origin preview.

## Accessibility

- A visible-on-focus skip link moves keyboard users directly to the main content.
- Main content regions are programmatically focusable, dialogs and sheets use Radix focus management, and icon-only controls have accessible names.
- Mouse, touch, keyboard drag-and-drop, and an explicit move selector are supported on the board.
- Playwright runs `@axe-core/playwright` against sign-in, dashboard, projects, project/task dialogs, and the board using WCAG 2.0/2.1 A and AA rules.
- Automated scans cannot prove complete accessibility. Release review still includes keyboard-only operation, visible focus, zoom/reflow at 320 px, light/dark contrast, and reduced-motion checks.

## Loading and failures

- Server Components remain the default data and composition boundary.
- The workspace route has a skeleton-backed Suspense loading state and a retryable route error boundary.
- The task details panel is a lazy client chunk and loads only when a task is opened.
- A dedicated not-found page gives invalid or inaccessible workspace URLs a useful recovery path.

## Performance budgets

Run a production build before the bundle checks:

```bash
pnpm build
pnpm bundle:check
pnpm performance:check
```

`bundle:check` enforces gzip budgets for the initial client runtime (220 kB), the largest individual chunk (180 kB), and all emitted client chunks (900 kB). Lighthouse CI audits `/login` and `/signup` and requires both Performance and Accessibility scores of at least 90. Authenticated routes are covered by Playwright WCAG and browser performance regression checks.

The browser suite also keeps first contentful paint below 2.5 seconds and time to first byte below 800 ms in the local test environment. Production monitoring receives metrics through Next.js `useReportWebVitals` as `relay:web-vital` browser events, ready for the stage 12 analytics sink.
