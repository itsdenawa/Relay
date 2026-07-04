import Link from "next/link";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FolderKanban,
  Layers3,
  ListTodo,
  MessageSquareText,
  Sparkles,
} from "lucide-react";

import type { Project } from "@/entities/project";
import type { WorkspaceTaskStats } from "@/entities/task";
import { ProjectFormDialog } from "@/features/project-management";
import { Badge, Button, MotionItem } from "@/shared/ui";

type DashboardOverviewProps = {
  displayName: string;
  workspace: { id: string; name: string; slug: string; role: string };
  projects: Project[];
  taskStats: WorkspaceTaskStats;
};

function pluralize(value: number, singular: string, plural = `${singular}s`) {
  return `${value} ${value === 1 ? singular : plural}`;
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function formatRelativeTime(value: string) {
  const timestamp = new Date(value).getTime();
  const diff = Date.now() - timestamp;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "Just now";
  if (diff < hour) return `${Math.max(1, Math.floor(diff / minute))}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;
  return formatShortDate(value);
}

export function DashboardOverview({
  displayName,
  workspace,
  projects,
  taskStats,
}: DashboardOverviewProps) {
  const firstName = displayName.split(/\s+/)[0] || displayName;
  const activeProjects = projects.filter((project) => !project.archived_at);
  const canManage = workspace.role === "owner" || workspace.role === "admin";
  const totalTrackedTasks = taskStats.open + taskStats.completed;
  const completionRate = totalTrackedTasks
    ? Math.round((taskStats.completed / totalTrackedTasks) * 100)
    : 0;
  const recentProjects = [...activeProjects]
    .sort(
      (first, second) =>
        new Date(second.updated_at).getTime() -
        new Date(first.updated_at).getTime(),
    )
    .slice(0, 4);
  const newestProject = recentProjects[0];
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());
  const metrics = [
    {
      label: "Active projects",
      value: String(activeProjects.length),
      note:
        activeProjects.length === 1 ? "1 live board" : "Live project boards",
      icon: FolderKanban,
      tone: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    },
    {
      label: "Open tasks",
      value: String(taskStats.open),
      note: `${taskStats.urgent} urgent`,
      icon: ListTodo,
      tone: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    },
    {
      label: "Completed tasks",
      value: String(taskStats.completed),
      note: `${completionRate}% completion rate`,
      icon: CheckCircle2,
      tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Due in 7 days",
      value: String(taskStats.dueSoon),
      note: "Includes overdue work",
      icon: CalendarClock,
      tone: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
  ];
  const todayItems = [
    taskStats.dueSoon
      ? {
          label: "Due in 7 days",
          value: pluralize(taskStats.dueSoon, "task"),
          href: `/w/${workspace.slug}/projects`,
          tone: "text-amber-700 dark:text-amber-400",
        }
      : {
          label: "Upcoming work",
          value: "Nothing due soon",
          href: `/w/${workspace.slug}/projects`,
          tone: "text-muted-foreground",
        },
    taskStats.urgent
      ? {
          label: "Urgent triage",
          value: pluralize(taskStats.urgent, "task"),
          href: `/w/${workspace.slug}/projects`,
          tone: "text-destructive",
        }
      : {
          label: "Urgent triage",
          value: "Clear",
          href: `/w/${workspace.slug}/projects`,
          tone: "text-emerald-700 dark:text-emerald-400",
        },
    {
      label: "Latest board",
      value: newestProject?.name ?? "Create the first project",
      href: newestProject
        ? `/w/${workspace.slug}/p/${newestProject.id}/board`
        : `/w/${workspace.slug}/projects`,
      tone: "text-foreground",
    },
  ];
  const needsAttention = [
    ...(taskStats.urgent
      ? [
          {
            title: "Review urgent tasks",
            meta: "High priority",
            value: pluralize(taskStats.urgent, "task"),
            href: `/w/${workspace.slug}/projects`,
            tone: "text-destructive",
            icon: AlertCircle,
          },
        ]
      : []),
    ...(taskStats.dueSoon
      ? [
          {
            title: "Plan due-soon work",
            meta: "Next 7 days",
            value: pluralize(taskStats.dueSoon, "task"),
            href: `/w/${workspace.slug}/projects`,
            tone: "text-amber-700 dark:text-amber-400",
            icon: CalendarClock,
          },
        ]
      : []),
    ...(newestProject
      ? [
          {
            title: `Open ${newestProject.name}`,
            meta: "Recently updated",
            value: formatRelativeTime(newestProject.updated_at),
            href: `/w/${workspace.slug}/p/${newestProject.id}/board`,
            tone: "text-muted-foreground",
            icon: FolderKanban,
          },
        ]
      : []),
  ].slice(0, 3);
  const myWorkItems = [
    {
      label: "Open",
      value: String(taskStats.open),
      helper: taskStats.open ? "tasks still moving" : "no open tasks",
      tone: "text-foreground",
    },
    {
      label: "Due soon",
      value: String(taskStats.dueSoon),
      helper: "next 7 days",
      tone: taskStats.dueSoon
        ? "text-amber-700 dark:text-amber-400"
        : "text-muted-foreground",
    },
    {
      label: "Done",
      value: `${completionRate}%`,
      helper: "workspace completion",
      tone: "text-emerald-700 dark:text-emerald-400",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1480px] space-y-6">
      <section className="relative overflow-hidden rounded-[1.75rem] border bg-card p-5 shadow-sm sm:p-6 lg:p-7">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_20%_0%,color-mix(in_oklch,var(--primary)_16%,transparent),transparent_62%)]"
        />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-end">
          <div>
            <Badge className="gap-1.5">
              <Sparkles className="size-3.5" />
              {dateLabel}
            </Badge>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Good morning, {firstName}
            </h1>
            <p className="mt-2.5 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Here’s what needs your attention across {workspace.name}: due
              work, urgent tasks, and the next board worth opening.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              {canManage ? (
                <ProjectFormDialog
                  workspace={{ id: workspace.id, slug: workspace.slug }}
                />
              ) : null}
              <Button asChild variant="outline">
                <Link href={`/w/${workspace.slug}/projects`}>
                  Open projects
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>

          <aside
            aria-label="Today at a glance"
            className="rounded-2xl border bg-background/80 p-3.5 shadow-xs backdrop-blur"
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary">
                <Activity className="size-4" />
              </span>
              <div>
                <h2 className="text-sm font-semibold">Today</h2>
                <p className="text-xs text-muted-foreground">
                  Clear signals, no dashboards-for-dashboard’s-sake.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {todayItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group flex items-center justify-between gap-4 rounded-xl bg-muted/55 px-3 py-2.5 transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  <span className="text-xs text-muted-foreground">
                    {item.label}
                  </span>
                  <span
                    className={`max-w-[11rem] truncate text-right text-xs font-medium ${item.tone}`}
                  >
                    {item.value}
                  </span>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </section>

      {needsAttention.length ? (
        <section aria-labelledby="needs-attention-title">
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <h2
                id="needs-attention-title"
                className="text-base font-semibold"
              >
                Needs attention
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                The shortest route to what deserves a decision next.
              </p>
            </div>
          </div>
          <div className="grid gap-3 lg:grid-cols-3">
            {needsAttention.map(
              ({ title, meta, value, href, tone, icon: Icon }) => (
                <Link
                  key={title}
                  href={href}
                  className="group rounded-2xl border bg-card p-4 shadow-xs transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {meta}
                      </p>
                    </div>
                    <span className={`text-xs font-medium ${tone}`}>
                      {value}
                    </span>
                  </div>
                </Link>
              ),
            )}
          </div>
        </section>
      ) : null}

      <section
        aria-label="Workspace metrics"
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        {metrics.map(({ label, value, note, icon: Icon, tone }, index) => (
          <MotionItem key={label} delay={index * 0.035} className="h-full">
            <article className="group h-full rounded-2xl border bg-card p-3.5 shadow-xs transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    {label}
                  </p>
                  <p className="mt-1.5 truncate text-2xl font-semibold tracking-tight capitalize sm:text-3xl">
                    {value}
                  </p>
                </div>
                <span
                  className={`grid size-9 shrink-0 place-items-center rounded-xl ${tone}`}
                >
                  <Icon className="size-[1.1rem]" />
                </span>
              </div>
              <p className="mt-2 truncate text-xs text-muted-foreground">
                {note}
              </p>
            </article>
          </MotionItem>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(20rem,0.85fr)]">
        <div>
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Layers3 className="size-4" />
                </span>
                <h2 className="text-lg font-semibold">Priority projects</h2>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Recently updated boards with enough context to choose the next
                handoff.
              </p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href={`/w/${workspace.slug}/projects`}>
                View all
                <ArrowRight />
              </Link>
            </Button>
          </div>

          {activeProjects.length ? (
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {recentProjects.slice(0, 3).map((project, index) => (
                <MotionItem key={project.id} delay={index * 0.035}>
                  <Link
                    href={`/w/${workspace.slug}/p/${project.id}/board`}
                    className="group relative block h-full overflow-hidden rounded-2xl border bg-card p-4 shadow-xs transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                  >
                    <div
                      className="absolute inset-x-0 top-0 h-1"
                      style={{ backgroundColor: project.color }}
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-x-0 top-0 h-24 opacity-0 transition-opacity group-hover:opacity-100"
                      style={{
                        background: `linear-gradient(180deg, ${project.color}22, transparent)`,
                      }}
                    />
                    <div className="relative flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <Badge variant="outline">{project.key}</Badge>
                        <h3 className="mt-3 truncate font-semibold">
                          {project.name}
                        </h3>
                        <p className="mt-1.5 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">
                          {project.description || "No project description yet."}
                        </p>
                      </div>
                      <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
                    </div>
                    <div className="relative mt-5 grid grid-cols-2 gap-3 border-t pt-4 text-xs">
                      <div>
                        <p className="text-muted-foreground">Updated</p>
                        <p className="mt-1 font-medium">
                          {formatRelativeTime(project.updated_at)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Created</p>
                        <p className="mt-1 font-medium">
                          {formatShortDate(project.created_at)}
                        </p>
                      </div>
                    </div>
                  </Link>
                </MotionItem>
              ))}
            </div>
          ) : (
            <div className="relative flex min-h-72 flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-dashed bg-card px-6 py-12 text-center">
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_50%_0%,color-mix(in_oklch,var(--primary)_14%,transparent),transparent_66%)]"
              />
              <span className="relative grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                <FolderKanban className="size-5" />
              </span>
              <h3 className="relative mt-4 text-lg font-semibold">
                No active projects yet
              </h3>
              <p className="relative mt-1.5 max-w-sm text-sm leading-6 text-muted-foreground">
                {canManage
                  ? "Create the first project to give your team a shared board."
                  : "An Owner or Admin can create the first project for your team."}
              </p>
              {canManage ? (
                <ProjectFormDialog
                  workspace={{ id: workspace.id, slug: workspace.slug }}
                  buttonSize="sm"
                  className="relative mt-5"
                />
              ) : null}
            </div>
          )}
        </div>

        <aside className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <section className="rounded-2xl border bg-card p-4 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                <ListTodo className="size-4" />
              </span>
              <div>
                <h2 className="text-sm font-semibold">My work</h2>
                <p className="text-xs text-muted-foreground">
                  Workspace-level signal for now.
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-2">
              {myWorkItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-4 rounded-xl bg-muted/45 px-3 py-2.5"
                >
                  <div>
                    <p className="text-xs font-medium">{item.label}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {item.helper}
                    </p>
                  </div>
                  <span className={`text-sm font-semibold ${item.tone}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-4 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                <Clock3 className="size-4" />
              </span>
              <div>
                <h2 className="text-sm font-semibold">Recent activity</h2>
                <p className="text-xs text-muted-foreground">
                  Derived from recent board updates.
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {recentProjects.length ? (
                recentProjects.slice(0, 4).map((project) => (
                  <Link
                    key={project.id}
                    href={`/w/${workspace.slug}/p/${project.id}/board`}
                    className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
                  >
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-medium">
                        {project.name} updated
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {formatRelativeTime(project.updated_at)}
                      </span>
                    </span>
                    <ArrowRight className="size-3.5 text-muted-foreground opacity-0 transition-[opacity,transform] group-hover:translate-x-0.5 group-hover:opacity-100 motion-reduce:transition-none" />
                  </Link>
                ))
              ) : (
                <div className="rounded-xl bg-muted/45 px-3 py-4 text-sm text-muted-foreground">
                  Activity will appear after your first project update.
                </div>
              )}
            </div>
          </section>

          <section className="hidden rounded-2xl border bg-card p-4 shadow-xs 2xl:block">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <MessageSquareText className="size-4 text-primary" />
              Team rhythm
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Keep Overview quiet: urgent work is highlighted, everything else
              stays one click away.
            </p>
          </section>
        </aside>
      </section>
    </div>
  );
}
