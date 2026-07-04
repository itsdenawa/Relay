import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  FolderKanban,
  Layers3,
  ListTodo,
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
  const newestProject = activeProjects[0];
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
      tone: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
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
  const focusItems = [
    {
      label: "Workspace momentum",
      value: activeProjects.length
        ? `${activeProjects.length} active project${activeProjects.length === 1 ? "" : "s"}`
        : "No active projects",
    },
    {
      label: "Immediate attention",
      value: taskStats.urgent
        ? `${taskStats.urgent} urgent task${taskStats.urgent === 1 ? "" : "s"}`
        : "No urgent tasks",
    },
    {
      label: "Next board to open",
      value: newestProject?.name ?? "Create the first project",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] border bg-card p-5 shadow-sm sm:p-7 lg:p-8">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_20%_0%,color-mix(in_oklch,var(--primary)_16%,transparent),transparent_62%)]"
        />
        <div className="relative grid gap-7 lg:grid-cols-[1fr_23rem] lg:items-end">
          <div>
            <Badge className="gap-1.5">
              <Sparkles className="size-3.5" />
              {dateLabel}
            </Badge>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Good morning, {firstName}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Here’s the calm snapshot of what’s moving across {workspace.name}—
              priorities, boards, and handoffs in one place.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
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
            className="rounded-2xl border bg-background/80 p-4 shadow-xs backdrop-blur"
          >
            <div className="mb-4 flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                <Activity className="size-4" />
              </span>
              <div>
                <h2 className="text-sm font-semibold">Today at a glance</h2>
                <p className="text-xs text-muted-foreground">
                  Workspace signal, no noise.
                </p>
              </div>
            </div>
            <dl className="space-y-3">
              {focusItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-4 rounded-xl bg-muted/55 px-3 py-2.5"
                >
                  <dt className="text-xs text-muted-foreground">
                    {item.label}
                  </dt>
                  <dd className="max-w-[11rem] truncate text-right text-xs font-medium">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </section>

      <section
        aria-label="Workspace metrics"
        className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4"
      >
        {metrics.map(({ label, value, note, icon: Icon, tone }, index) => (
          <MotionItem key={label} delay={index * 0.035} className="h-full">
            <article className="group h-full rounded-2xl border bg-card p-4 shadow-xs transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="mt-2 truncate text-3xl font-semibold tracking-tight capitalize">
                    {value}
                  </p>
                </div>
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-xl transition-transform group-hover:scale-105 ${tone}`}
                >
                  <Icon className="size-[1.1rem]" />
                </span>
              </div>
              <p className="mt-3 truncate text-xs text-muted-foreground">
                {note}
              </p>
            </article>
          </MotionItem>
        ))}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                <Layers3 className="size-4" />
              </span>
              <h2 className="text-lg font-semibold">Priority projects</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Recently created boards in this workspace, ready for the next
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
          <div className="grid gap-4 lg:grid-cols-3">
            {activeProjects.slice(0, 3).map((project, index) => (
              <MotionItem key={project.id} delay={index * 0.035}>
                <Link
                  href={`/w/${workspace.slug}/p/${project.id}/board`}
                  className="group relative block overflow-hidden rounded-2xl border bg-card p-5 shadow-xs transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
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
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Badge variant="outline">{project.key}</Badge>
                      <h3 className="mt-3 truncate font-semibold">
                        {project.name}
                      </h3>
                      <p className="mt-1.5 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">
                        {project.description || "No project description yet."}
                      </p>
                    </div>
                    <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
                    <span>Updated board</span>
                    <span className="font-medium text-foreground">
                      Open tasks tracked
                    </span>
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
      </section>
    </div>
  );
}
