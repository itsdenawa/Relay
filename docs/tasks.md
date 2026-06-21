# Tasks and Kanban

## Board workflow

`/w/[slug]/p/[projectId]/board` renders the five project columns as a horizontally scrollable Kanban board on smaller screens and a five-column grid on wide screens. Tasks can move within or between columns with a mouse, touch input, or keyboard. The move selector remains available as an explicit fallback.

Keyboard drag and drop starts and ends with Space or Enter. Arrow keys move the active task through available drop targets, and Escape cancels the operation. Motion is disabled when the operating system requests reduced motion.

Each task supports:

- title and description;
- column and stable numeric position;
- no, low, medium, high, or urgent priority;
- an optional workspace-member assignee;
- an optional due date;
- zero or more project labels;
- archive and restore without hard deletion.

Selecting a task title adds `task=<task-id>` to the existing board URL and opens its responsive details panel. Closing the panel removes only that parameter, preserving search and filter state. The panel shows the task overview, private files, and live discussion; archived tasks and projects remain readable but cannot receive new comments or files.

The workspace dashboard derives its project and task metrics from live Supabase data.

## Filters and URLs

Board filters remain in the URL and can be shared or refreshed:

- `q` searches task title and description;
- `assignee` accepts a membership ID or `unassigned`;
- `priority` accepts a task priority;
- `label` accepts a project-label ID;
- `archived=1` opens the archived-task view.

## Permissions

- Owner, Admin, and Member can create, edit, move, archive, and restore tasks in active projects.
- Owner and Admin can create and delete project labels.
- Archived projects are read-only until an Owner or Admin restores the project.
- RLS and RPC authorization enforce workspace isolation independently of rendered controls.

## Transactional operations

The application uses PostgreSQL RPCs rather than multi-request client mutations:

- `create_task` validates related records, appends a stable position, and assigns labels atomically;
- `update_task` validates and replaces task fields and labels atomically;
- `move_task` locks the task and target column, validates the requested adjacent tasks, and assigns a position between them;
- `set_task_archived` archives a task or restores it at a collision-free position.

Positions use gaps of 1,024. When no integer gap remains between two adjacent tasks, `move_task` normalizes the target column inside the same transaction and then applies the requested order. The client sends neighbor IDs rather than trusting a client-computed database position.

## Optimistic updates and Realtime

The board stores its client-side task list in TanStack Query. A drag immediately updates that cache; a rejected RPC restores the previous snapshot and shows an error toast. Every settled mutation invalidates the query so the database remains the final source of truth.

Supabase Realtime listens for task changes scoped to the active project. Events and successful channel subscriptions invalidate the task query, covering both cross-client changes and reconciliation after reconnects. Row Level Security continues to determine which task changes each connected user can receive. A compact board indicator reports whether live updates are connected or reconnecting.

## Verification

```bash
pnpm db:verify
pnpm check
pnpm test:e2e
pnpm build
```

The database suite covers field validation, relationship integrity, archive behavior, exact ordering and normalization, active-project requirements, Realtime configuration, and Owner/Admin/Member/outsider/anonymous permissions. The browser suite covers full task creation and editing, filters, mouse/touch/keyboard movement, optimistic rollback, cross-client Realtime updates, archive/restore, Member behavior, and the 320 px layout.
