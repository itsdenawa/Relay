# Task collaboration

## Task panel and URLs

Selecting a task title opens a right-side details panel on desktop and a full-width panel on small screens. The selected task is stored in the board URL as `task=<task-id>`, alongside any existing `q`, assignee, priority, label, or archived filters. Direct URLs are resolved against the current workspace/project task list before the panel renders.

Archived tasks and archived projects expose their existing discussion and files in read-only mode.

## Comments

Workspace members can create comments on active tasks and edit or delete only their own comments. Comment bodies are trimmed, required, and limited to 10,000 characters in both Zod and PostgreSQL.

The client subscribes to project-scoped Postgres Changes filtered by task ID. Inserts, edits, and user-facing soft deletion invalidate the TanStack Query cache, so every connected task panel reconciles with the RLS-protected database. Re-subscription also refetches the server state after a connection interruption.

## Private attachments

Files live in the private `task-attachments` Supabase Storage bucket. The application never exposes a public object URL. Downloads use signed URLs valid for 60 seconds and include the original file name.

Object paths contain no user-supplied file name:

```text
workspace-uuid/project-uuid/task-uuid/object-uuid
```

Storage RLS verifies every path against an accessible task. A separate `attachments` row stores the original name, canonical content type, size, uploader, and task relationship. `create_attachment` creates that row only after the uploader-owned Storage object exists. The uploader or a workspace Owner/Admin can delete a file.

Uploads use Supabase's TUS endpoint to expose progress and retry transient transfer failures. Files must be non-empty and at most 10 MB. Allowed extensions and canonical MIME types cover JPEG, PNG, GIF, WebP, AVIF, PDF, TXT, CSV, Word, Excel, and PowerPoint files. Validation is repeated by the browser, private bucket configuration, and metadata RPC.

## Verification

```bash
pnpm db:verify
pnpm check
pnpm test:e2e
pnpm build
```

The database suite covers comment authorship, Realtime configuration, private bucket constraints, object-path isolation, attachment registration, uploader/manager deletion, and outsider denial. The browser suite covers cross-client create/edit/delete synchronization, real Storage upload, signed download, allowlist and size failures, URL preservation, and the 320 px task panel.
