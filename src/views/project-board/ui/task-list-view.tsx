import Link from "next/link";
import {
  AlertCircle,
  Archive,
  CalendarDays,
  CheckCircle2,
  Circle,
  Inbox,
} from "lucide-react";

import type { ProjectBoardColumn } from "@/entities/project";
import type { ProjectLabel, Task, TaskPriority } from "@/entities/task";
import type { WorkspaceMember } from "@/entities/workspace";
import {
  MoveTaskSelect,
  setTaskArchivedAction,
  TaskFormDialog,
} from "@/features/task-management";
import { cn } from "@/shared/lib";
import { Avatar, AvatarFallback, Badge, Button } from "@/shared/ui";

type TaskContext = {
  workspaceId: string;
  workspaceSlug: string;
  projectId: string;
};

type TaskListViewProps = {
  context: TaskContext;
  columns: ProjectBoardColumn[];
  tasks: Task[];
  labels: ProjectLabel[];
  members: WorkspaceMember[];
  readOnly?: boolean;
  highlightedTaskId?: string | undefined;
  detailsHrefFor: (taskId: string) => string;
};

const priorityLabels: Record<TaskPriority, string> = {
  no_priority: "No priority",
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

const priorityTones: Record<TaskPriority, string> = {
  no_priority: "text-muted-foreground",
  low: "text-sky-700 dark:text-sky-400",
  medium: "text-amber-700 dark:text-amber-400",
  high: "text-orange-700 dark:text-orange-400",
  urgent: "text-rose-700 dark:text-rose-400",
};

function memberInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatDueDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

function getDueDateState(date: string | null) {
  if (!date) return "none";
  const dueAt = new Date(`${date}T23:59:59`);
  const now = new Date();
  const soon = new Date(now);
  soon.setDate(soon.getDate() + 3);

  if (dueAt < now) return "overdue";
  if (dueAt <= soon) return "soon";
  return "normal";
}

function TaskMetaBadges({
  task,
  labels,
}: {
  task: Task;
  labels: ProjectLabel[];
}) {
  const taskLabels = labels.filter((label) => task.labelIds.includes(label.id));
  const dueDateState = getDueDateState(task.due_date);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {task.priority !== "no_priority" ? (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full bg-muted/70 px-1.5 py-0.5 text-[11px] font-medium",
            priorityTones[task.priority],
          )}
        >
          <AlertCircle className="size-3" />
          {priorityLabels[task.priority]}
        </span>
      ) : null}
      {task.due_date ? (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full bg-muted/70 px-1.5 py-0.5 text-[11px] text-muted-foreground",
            dueDateState === "overdue" && "font-medium text-destructive",
            dueDateState === "soon" &&
              "font-medium text-amber-700 dark:text-amber-400",
          )}
        >
          <CalendarDays className="size-3" />
          {formatDueDate(task.due_date)}
        </span>
      ) : null}
      {taskLabels.map((label) => (
        <span
          key={label.id}
          className="inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium"
        >
          <span
            className="size-1.5 rounded-full"
            style={{ backgroundColor: label.color }}
          />
          {label.name}
        </span>
      ))}
    </div>
  );
}

function TaskActions({
  context,
  columns,
  labels,
  members,
  task,
  readOnly,
}: {
  context: TaskContext;
  columns: ProjectBoardColumn[];
  labels: ProjectLabel[];
  members: WorkspaceMember[];
  task: Task;
  readOnly: boolean;
}) {
  if (readOnly) return null;

  return (
    <div className="flex items-center justify-end gap-1">
      <TaskFormDialog
        context={context}
        columns={columns}
        labels={labels}
        members={members}
        task={task}
      />
      <MoveTaskSelect
        context={context}
        task={{
          id: task.id,
          title: task.title,
          columnId: task.column_id,
        }}
        columns={columns}
      />
      <form action={setTaskArchivedAction}>
        <input type="hidden" name="workspaceId" value={context.workspaceId} />
        <input
          type="hidden"
          name="workspaceSlug"
          value={context.workspaceSlug}
        />
        <input type="hidden" name="projectId" value={context.projectId} />
        <input type="hidden" name="taskId" value={task.id} />
        <input type="hidden" name="archived" value="true" />
        <Button
          type="submit"
          variant="ghost"
          size="icon-sm"
          aria-label={`Archive ${task.title}`}
        >
          <Archive />
        </Button>
      </form>
    </div>
  );
}

export function TaskListView({
  context,
  columns,
  tasks,
  labels,
  members,
  readOnly = false,
  highlightedTaskId,
  detailsHrefFor,
}: TaskListViewProps) {
  const columnById = new Map(columns.map((column) => [column.id, column]));
  const memberById = new Map(members.map((member) => [member.id, member]));
  const orderedTasks = [...tasks].sort((first, second) => {
    const firstColumn = columnById.get(first.column_id)?.position ?? 0;
    const secondColumn = columnById.get(second.column_id)?.position ?? 0;
    return firstColumn - secondColumn || first.position - second.position;
  });

  if (!orderedTasks.length) {
    return (
      <section
        aria-label="Task list"
        className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed bg-card px-6 py-12 text-center"
      >
        <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Inbox className="size-5" />
        </span>
        <h2 className="mt-4 text-lg font-semibold">No tasks match this view</h2>
        <p className="mt-1.5 max-w-sm text-sm leading-6 text-muted-foreground">
          Adjust filters or create a task to start using the list view.
        </p>
      </section>
    );
  }

  return (
    <section aria-label="Task list" className="min-w-0">
      <div className="hidden overflow-hidden rounded-2xl border bg-card shadow-xs md:block">
        <table className="w-full table-fixed text-sm">
          <thead className="border-b bg-muted/45 text-left text-xs text-muted-foreground">
            <tr>
              <th scope="col" className="w-[34%] px-4 py-3 font-medium">
                Task
              </th>
              <th scope="col" className="w-[12%] px-4 py-3 font-medium">
                Status
              </th>
              <th scope="col" className="w-[16%] px-4 py-3 font-medium">
                Assignee
              </th>
              <th scope="col" className="w-[24%] px-4 py-3 font-medium">
                Metadata
              </th>
              <th
                scope="col"
                className="w-[14%] px-4 py-3 text-right font-medium"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orderedTasks.map((task) => {
              const column = columnById.get(task.column_id);
              const assignee = task.assignee_id
                ? memberById.get(task.assignee_id)
                : undefined;

              return (
                <tr
                  key={task.id}
                  className={cn(
                    "group transition-colors hover:bg-muted/35",
                    task.id === highlightedTaskId && "bg-primary/5",
                  )}
                >
                  <td className="px-4 py-3 align-top">
                    <div className="flex min-w-0 items-start gap-2">
                      {column?.name.toLowerCase() === "done" ? (
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground/70" />
                      )}
                      <div className="min-w-0">
                        <Link
                          href={detailsHrefFor(task.id)}
                          scroll={false}
                          className="block truncate font-medium hover:underline focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
                        >
                          {task.title}
                        </Link>
                        {task.description ? (
                          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                            {task.description}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Badge variant="secondary">
                      {column?.name ?? "Unknown"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 align-top">
                    {assignee ? (
                      <span className="flex min-w-0 items-center gap-2">
                        <Avatar className="size-6">
                          <AvatarFallback className="text-[9px]">
                            {memberInitials(assignee.displayName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate text-xs font-medium">
                          {assignee.displayName}
                        </span>
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <TaskMetaBadges task={task} labels={labels} />
                  </td>
                  <td className="px-4 py-3 align-top">
                    <TaskActions
                      context={context}
                      columns={columns}
                      labels={labels}
                      members={members}
                      task={task}
                      readOnly={readOnly}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 md:hidden">
        {orderedTasks.map((task) => {
          const column = columnById.get(task.column_id);
          const assignee = task.assignee_id
            ? memberById.get(task.assignee_id)
            : undefined;

          return (
            <article
              key={task.id}
              aria-label={task.title}
              className={cn(
                "rounded-2xl border bg-card p-4 shadow-xs",
                task.id === highlightedTaskId &&
                  "border-primary/40 ring-2 ring-primary/10",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={detailsHrefFor(task.id)}
                    scroll={false}
                    className="block truncate font-medium hover:underline focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
                  >
                    {task.title}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {column?.name ?? "Unknown"}
                    {assignee ? ` · ${assignee.displayName}` : " · Unassigned"}
                  </p>
                </div>
                <Badge variant="secondary">{column?.name ?? "Unknown"}</Badge>
              </div>
              {task.description ? (
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
                  {task.description}
                </p>
              ) : null}
              <div className="mt-3">
                <TaskMetaBadges task={task} labels={labels} />
              </div>
              <div className="mt-3 border-t pt-3">
                <TaskActions
                  context={context}
                  columns={columns}
                  labels={labels}
                  members={members}
                  task={task}
                  readOnly={readOnly}
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
