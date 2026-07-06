import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  FileLock2,
  FolderKanban,
  Inbox,
  ListChecks,
  MessageSquareText,
  RadioTower,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Zap,
} from "lucide-react";

import { ThemeSwitcher } from "@/features/theme-switcher";
import { Badge, Button, RelayLogo } from "@/shared/ui";

const featureCards = [
  {
    title: "Projects stay readable",
    description:
      "Every workspace gets clean project boards, role-aware controls, and archived history that does not clutter today’s work.",
    icon: FolderKanban,
  },
  {
    title: "Realtime handoffs",
    description:
      "Tasks, comments, and board movement reconcile live, so teammates see the same truth without refreshing.",
    icon: RadioTower,
  },
  {
    title: "Private collaboration",
    description:
      "Attachments use private storage, signed downloads, and workspace-level isolation enforced by Supabase RLS.",
    icon: FileLock2,
  },
  {
    title: "Small-team permissions",
    description:
      "Owner, Admin, and Member roles cover the practical controls teams need without turning setup into a ceremony.",
    icon: ShieldCheck,
  },
] as const;

const boardColumns = [
  {
    name: "Backlog",
    tasks: ["Interview notes", "Billing copy later"],
  },
  {
    name: "In progress",
    tasks: ["Invite flow", "Private upload QA"],
  },
  {
    name: "Review",
    tasks: ["Launch checklist", "Keyboard DnD"],
  },
  {
    name: "Done",
    tasks: ["Workspace roles", "Realtime comments"],
  },
] as const;

const previewTabs = [
  { label: "Board", icon: FolderKanban },
  { label: "List", icon: ListChecks },
  { label: "Inbox", icon: Inbox },
] as const;

const workflowSteps = [
  {
    title: "Start from a workspace",
    description:
      "Create a shared home, invite teammates, and keep roles simple enough to trust.",
    icon: UsersRound,
  },
  {
    title: "Move work across boards",
    description:
      "Use Kanban, compact list view, filters, and quick add without losing task context.",
    icon: ListChecks,
  },
  {
    title: "Catch what needs attention",
    description:
      "Inbox surfaces assignments, urgent tasks, due dates, and recent changes from active projects.",
    icon: Inbox,
  },
] as const;

function ProductPreview() {
  return (
    <div
      aria-label="Relay product preview"
      className="relative rounded-[2rem] border bg-card/95 p-3 shadow-2xl shadow-primary/10 backdrop-blur"
    >
      <div className="rounded-[1.35rem] border bg-background">
        <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
              N
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Northstar Studio</p>
              <p className="text-xs text-muted-foreground">
                Product launch board
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {previewTabs.map(({ label, icon: Icon }) => (
              <span
                key={label}
                className="inline-flex h-7 items-center gap-1.5 rounded-full border bg-background px-2.5 text-[11px] font-medium text-muted-foreground"
              >
                <Icon className="size-3" />
                {label}
              </span>
            ))}
            <Badge variant="success">Live</Badge>
          </div>
        </div>

        <div className="grid gap-3 p-3 sm:grid-cols-2 xl:grid-cols-4">
          {boardColumns.map((column) => (
            <section
              key={column.name}
              aria-label={column.name}
              className="rounded-2xl border bg-muted/35 p-3"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {column.name}
                </h2>
                <span className="rounded-full bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {column.tasks.length}
                </span>
              </div>
              <div className="space-y-2">
                {column.tasks.map((task, index) => (
                  <article
                    key={task}
                    className="rounded-xl border bg-card p-3 shadow-xs"
                  >
                    <p className="text-sm font-medium">{task}</p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                        {index % 2 === 0 ? "Product" : "Design"}
                      </span>
                      <span className="flex -space-x-1">
                        <span className="size-5 rounded-full border-2 border-card bg-indigo-400" />
                        <span className="size-5 rounded-full border-2 border-card bg-sky-400" />
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="grid gap-3 border-t p-3 sm:grid-cols-[1fr_0.8fr]">
          <div className="rounded-2xl border bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <MessageSquareText className="size-4 text-primary" />
              Latest handoff
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              “QA notes are attached. Review the upload limit copy before the
              launch build.”
            </p>
          </div>
          <div className="rounded-2xl border bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <CalendarClock className="size-4 text-primary" />
              Inbox signal
            </div>
            <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[
                ["2", "due"],
                ["3", "urgent"],
                ["6", "updates"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-xl bg-muted/60 p-2">
                  <dt className="text-base font-semibold">{value}</dt>
                  <dd className="text-[10px] text-muted-foreground">{label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="relative isolate min-h-dvh overflow-hidden bg-background outline-none"
    >
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <RelayLogo />
        <nav aria-label="Public navigation" className="flex items-center gap-2">
          <ThemeSwitcher />
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/signup">
              Create account
              <ArrowRight />
            </Link>
          </Button>
        </nav>
      </header>

      <section className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 pt-10 pb-16 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:pt-18 lg:pb-24">
        <div className="max-w-2xl">
          <Badge className="gap-1.5">
            <Sparkles className="size-3.5" />
            Production-ready project clarity
          </Badge>
          <h1 className="mt-6 text-3xl leading-[1.08] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            A calmer command center for focused teams.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            Relay brings projects, task movement, comments, private files, and
            workspace roles into one clean product surface—built for teams that
            prefer momentum over ceremony.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/signup">
                Create your workspace
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>

          <ul className="mt-8 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            {[
              "Realtime boards",
              "Private attachments",
              "Role-aware workspaces",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <ProductPreview />
      </section>

      <section className="border-y bg-card/45">
        <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            ["320 px", "responsive from small mobile screens"],
            ["WCAG AA", "keyboard, motion, and contrast checks"],
            ["RLS", "workspace isolation enforced in Postgres"],
          ].map(([value, label]) => (
            <div key={value} className="rounded-2xl border bg-background p-5">
              <p className="text-2xl font-semibold tracking-tight">{value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-primary">
              From signup to daily flow
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Relay keeps the path from plan to handoff short.
            </h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
              The product surface stays intentionally compact: workspace,
              projects, board/list task views, Inbox, comments, and private
              attachments.
            </p>
          </div>

          <div className="grid gap-3">
            {workflowSteps.map(({ title, description, icon: Icon }, index) => (
              <article
                key={title}
                className="flex gap-4 rounded-3xl border bg-card p-4 shadow-xs sm:p-5"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    Step {index + 1}
                  </p>
                  <h3 className="mt-1 font-semibold">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">
            Designed around real launch work
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Everything the MVP needs, without the clutter it does not.
          </h2>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {featureCards.map(({ title, description, icon: Icon }) => (
            <article
              key={title}
              className="rounded-3xl border bg-card p-6 shadow-xs"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-5 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <div className="overflow-hidden rounded-[2rem] border bg-card">
          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center lg:p-10">
            <div>
              <p className="flex items-center gap-2 text-sm font-medium text-primary">
                <Zap className="size-4" />
                Ready when your team is
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                Start with one workspace, invite the team, and keep the plan
                visible from day one.
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <Button asChild size="lg">
                <Link href="/signup">
                  Create account
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
