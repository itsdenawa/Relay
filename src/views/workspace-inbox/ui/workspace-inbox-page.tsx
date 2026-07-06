import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CalendarClock,
  CircleUserRound,
  Inbox,
  Sparkles,
} from "lucide-react";

import type { Project, ProjectBoardColumn } from "@/entities/project";
import type { Task } from "@/entities/task";
import type { CurrentWorkspace, WorkspaceMember } from "@/entities/workspace";
import { cn } from "@/shared/lib";
import { Badge, Button } from "@/shared/ui";

type InboxProject = {
  project: Project;
  columns: ProjectBoardColumn[];
  tasks: Task[];
};

type WorkspaceInboxPageProps = {
  workspace: CurrentWorkspace;
  currentUserId: string;
  projects: InboxProject[];
  members: WorkspaceMember[];
};

type InboxItem = {
  task: Task;
  project: Project;
  column: ProjectBoardColumn | undefined;
  assignee: WorkspaceMember | undefined;
  reasons: string[];
  dueState: "overdue" | "soon" | "normal" | "none";
  score: number;
};

function formatDueDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function getDueState(date: string | null): InboxItem["dueState"] {
  if (!date) return "none";

  const dueAt = new Date(`${date}T23:59:59`);
  const now = new Date();
  const soon = new Date(now);
  soon.setDate(soon.getDate() + 7);

  if (dueAt < now) return "overdue";
  if (dueAt <= soon) return "soon";
  return "normal";
}

function isRecentlyUpdated(value: string) {
  const updatedAt = new Date(value);
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - 3);

  return updatedAt >= threshold;
}

function buildInboxItems({
  currentUserId,
  projects,
  members,
}: Pick<WorkspaceInboxPageProps, "currentUserId" | "projects" | "members">) {
  const memberById = new Map(members.map((member) => [member.id, member]));
  const items: InboxItem[] = [];

  for (const { project, columns, tasks } of projects) {
    const columnById = new Map(columns.map((column) => [column.id, column]));
    const doneColumnIds = new Set(
      columns
        .filter((column) => column.name.toLowerCase() === "done")
        .map((column) => column.id),
    );

    for (const task of tasks) {
      if (task.archived_at || doneColumnIds.has(task.column_id)) continue;

      const dueState = getDueState(task.due_date);
      const reasons: string[] = [];
      let score = 0;

      if (task.assignee_id === currentUserId) {
        reasons.push("Assigned to you");
        score += 30;
      }
      if (dueState === "overdue") {
        reasons.push("Overdue");
        score += 50;
      } else if (dueState === "soon") {
        reasons.push("Due soon");
        score += 35;
      }
      if (task.priority === "urgent") {
        reasons.push("Urgent");
        score += 40;
      } else if (task.priority === "high") {
        reasons.push("High priority");
        score += 20;
      }
      if (isRecentlyUpdated(task.updated_at)) {
        reasons.push("Recently updated");
        score += 10;
      }

      if (!reasons.length) continue;

      items.push({
        task,
        project,
        column: columnById.get(task.column_id),
        assignee: task.assignee_id
          ? memberById.get(task.assignee_id)
          : undefined,
        reasons,
        dueState,
        score,
      });
    }
  }

  return items.sort((first, second) => {
    if (second.score !== first.score) return second.score - first.score;
    if (first.task.due_date && second.task.due_date) {
      return first.task.due_date.localeCompare(second.task.due_date);
    }
    if (first.task.due_date) return -1;
    if (second.task.due_date) return 1;
    return second.task.updated_at.localeCompare(first.task.updated_at);
  });
}

export function WorkspaceInboxPage({
  workspace,
  currentUserId,
  projects,
  members,
}: WorkspaceInboxPageProps) {
  const items = buildInboxItems({ currentUserId, projects, members });
  const assignedCount = items.filter(
    (item) => item.task.assignee_id === currentUserId,
  ).length;
  const overdueCount = items.filter(
    (item) => item.dueState === "overdue",
  ).length;
  const dueSoonCount = items.filter((item) => item.dueState === "soon").length;
  const urgentCount = items.filter(
    (item) => item.task.priority === "urgent",
  ).length;

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <header className="overflow-hidden rounded-3xl border bg-card shadow-xs">
        <div className="relative p-5 sm:p-6 lg:p-8">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-sky-500 to-emerald-500" />
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <p className="text-sm font-medium text-primary">
                {workspace.name}
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                Inbox
              </h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
                A compact view of tasks that may need attention: assignments,
                urgent work, due dates, and recent updates.
              </p>
            </div>
            <Button asChild>
              <Link href={`/w/${workspace.slug}/projects`}>
                Open projects
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section
        aria-label="Inbox metrics"
        className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {[
          {
            label: "Assigned to me",
            value: assignedCount,
            icon: CircleUserRound,
          },
          { label: "Overdue", value: overdueCount, icon: AlertCircle },
          { label: "Due soon", value: dueSoonCount, icon: CalendarClock },
          { label: "Urgent", value: urgentCount, icon: Sparkles },
        ].map((metric) => {
          const Icon = metric.icon;

          return (
            <article
              key={metric.label}
              className="rounded-2xl border bg-card p-4 shadow-xs"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </span>
              </div>
              <p className="mt-3 text-2xl font-semibold">{metric.value}</p>
            </article>
          );
        })}
      </section>

      {items.length ? (
        <section aria-labelledby="attention-heading" className="mt-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 id="attention-heading" className="text-lg font-semibold">
                Needs attention
              </h2>
              <p className="text-sm text-muted-foreground">
                {items.length === 1
                  ? "1 task surfaced from active projects."
                  : `${items.length} tasks surfaced from active projects.`}
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            {items.slice(0, 20).map((item) => (
              <article
                key={item.task.id}
                aria-label={item.task.title}
                className="rounded-2xl border bg-card p-4 shadow-xs transition-[border-color,box-shadow] hover:border-primary/25 hover:shadow-md"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{item.project.key}</Badge>
                      {item.column ? (
                        <Badge variant="secondary">{item.column.name}</Badge>
                      ) : null}
                      {item.reasons.map((reason) => (
                        <span
                          key={reason}
                          className={cn(
                            "inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground",
                            reason === "Overdue" &&
                              "bg-destructive/10 text-destructive",
                            reason === "Urgent" &&
                              "bg-rose-500/10 text-rose-700 dark:text-rose-400",
                          )}
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                    <h3 className="mt-3 truncate font-semibold">
                      {item.task.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                      {item.task.description || "No description provided."}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>{item.project.name}</span>
                      <span>
                        Assignee: {item.assignee?.displayName ?? "Unassigned"}
                      </span>
                      <span>
                        {item.task.due_date
                          ? `Due ${formatDueDate(item.task.due_date)}`
                          : "No due date"}
                      </span>
                      <span>
                        Updated {formatUpdatedAt(item.task.updated_at)}
                      </span>
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link
                      href={`/w/${workspace.slug}/p/${item.project.id}/board?task=${item.task.id}`}
                    >
                      Open task
                      <ArrowRight />
                    </Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="mt-5 flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed bg-card px-6 py-12 text-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Inbox className="size-5" />
          </span>
          <h2 className="mt-4 text-lg font-semibold">Inbox is calm</h2>
          <p className="mt-1.5 max-w-md text-sm leading-6 text-muted-foreground">
            No assigned, urgent, due-soon, or recently updated tasks need
            attention right now.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-5">
            <Link href={`/w/${workspace.slug}/projects`}>Review projects</Link>
          </Button>
        </section>
      )}
    </div>
  );
}
