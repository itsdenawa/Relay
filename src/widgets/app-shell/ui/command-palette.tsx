"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Check,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  Search,
  Settings,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";

import { getPrimaryNavigation } from "@/shared/config/navigation";
import { cn } from "@/shared/lib";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Input,
} from "@/shared/ui";

type CommandPaletteProps = {
  workspace: { name: string; slug: string; role: string };
  workspaces: Array<{ name: string; slug: string; role: string }>;
};

type Command = {
  id: string;
  title: string;
  description: string;
  group: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords?: string;
};

function normalize(value: string) {
  return value.toLowerCase().trim();
}

export function CommandPalette({ workspace, workspaces }: CommandPaletteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const isBoard = new RegExp(`^/w/${workspace.slug}/p/[^/]+/board$`).test(
    pathname,
  );
  const boardActionUrl = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("task");
    params.delete("created");
    params.delete("saved");
    params.delete("changed");
    params.set("new", "task");
    return `${pathname}?${params.toString()}`;
  }, [pathname, searchParams]);

  const commands = useMemo<Command[]>(() => {
    const canManageProjects =
      workspace.role === "owner" || workspace.role === "admin";
    const navigation = getPrimaryNavigation(workspace.slug).map((item) => ({
      id: `nav-${item.label}`,
      title: item.label,
      description: `Open ${item.label.toLowerCase()} in ${workspace.name}`,
      group: "Navigation",
      href: item.href,
      icon: item.icon,
      keywords: item.label,
    }));

    const projectCommands: Command[] = [
      ...(canManageProjects
        ? [
            {
              id: "create-project",
              title: "Create project",
              description: "Open the new project dialog",
              group: "Create",
              href: `/w/${workspace.slug}/projects?new=project`,
              icon: Sparkles,
              keywords: "new project board create",
            },
          ]
        : []),
      {
        id: "settings",
        title: "Workspace settings",
        description: "Manage workspace name, ownership, and danger zone",
        group: "Navigation",
        href: `/w/${workspace.slug}/settings`,
        icon: Settings,
        keywords: "settings workspace",
      },
      {
        id: "profile-settings",
        title: "Profile settings",
        description: "Update account profile and theme",
        group: "Navigation",
        href: `/w/${workspace.slug}/settings/profile`,
        icon: UserRound,
        keywords: "profile account settings",
      },
    ];

    const boardCommands: Command[] = isBoard
      ? [
          {
            id: "create-task",
            title: "Create task",
            description: "Open the full task dialog for this board",
            group: "Create",
            href: boardActionUrl,
            icon: ListChecks,
            keywords: "new task create",
          },
          {
            id: "board-view",
            title: "Board view",
            description: "Show tasks as Kanban columns",
            group: "Board",
            href: pathname,
            icon: LayoutDashboard,
            keywords: "kanban columns board",
          },
          {
            id: "list-view",
            title: "List view",
            description: "Show tasks in the compact list",
            group: "Board",
            href: `${pathname}?view=list`,
            icon: ListChecks,
            keywords: "table list tasks",
          },
          {
            id: "archived-tasks",
            title: "Archived tasks",
            description: "Review archived tasks for this project",
            group: "Board",
            href: `${pathname}?archived=1`,
            icon: FolderKanban,
            keywords: "archive archived tasks",
          },
        ]
      : [];

    const workspaceCommands = workspaces.map((candidate) => ({
      id: `workspace-${candidate.slug}`,
      title: candidate.name,
      description:
        candidate.slug === workspace.slug
          ? "Current workspace"
          : `Switch to ${candidate.name}`,
      group: "Workspaces",
      href: `/w/${candidate.slug}`,
      icon: candidate.slug === workspace.slug ? Check : UsersRound,
      keywords: `${candidate.name} ${candidate.slug}`,
    }));

    return [
      ...boardCommands,
      ...projectCommands,
      ...navigation,
      ...workspaceCommands,
    ];
  }, [
    boardActionUrl,
    isBoard,
    pathname,
    workspace.name,
    workspace.role,
    workspace.slug,
    workspaces,
  ]);

  const filteredCommands = useMemo(() => {
    const needle = normalize(query);
    if (!needle) return commands;

    return commands.filter((command) =>
      normalize(
        `${command.title} ${command.description} ${command.group} ${
          command.keywords ?? ""
        }`,
      ).includes(needle),
    );
  }, [commands, query]);
  const groupedCommands = useMemo(() => {
    const groups: Array<{ group: string; commands: Command[] }> = [];

    for (const command of filteredCommands) {
      const existing = groups.find((group) => group.group === command.group);
      if (existing) {
        existing.commands.push(command);
      } else {
        groups.push({ group: command.group, commands: [command] });
      }
    }

    return groups;
  }, [filteredCommands]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function runCommand(command: Command) {
    setOpen(false);
    setQuery("");
    router.push(command.href);
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) setQuery("");
  }

  const currentUrl = `${pathname}${
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  }`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative hidden h-9 w-full max-w-md items-center rounded-lg border border-input bg-muted/60 px-3 text-left text-sm text-muted-foreground shadow-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:outline-none sm:flex"
        aria-label="Open command palette"
      >
        <Search className="mr-2 size-4 shrink-0" />
        <span className="min-w-0 truncate">Search or jump to…</span>
        <kbd className="ml-auto hidden rounded border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground lg:block">
          ⌘K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="top-[8rem] max-h-[min(36rem,calc(100dvh-2rem))] max-w-2xl translate-y-0 gap-0 overflow-hidden p-0"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">Command palette</DialogTitle>
          <DialogDescription className="sr-only">
            Search actions, navigation, and workspace switching.
          </DialogDescription>

          <div className="border-b p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search commands…"
                aria-label="Search commands"
                className="h-11 border-0 bg-muted/60 pl-9 shadow-none focus-visible:ring-0"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-[27rem] overflow-y-auto p-2">
            {filteredCommands.length ? (
              <div className="space-y-2">
                {groupedCommands.map(({ group, commands: groupCommands }) => (
                  <section key={group} aria-label={group}>
                    <p className="px-2 py-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                      {group}
                    </p>
                    <div className="space-y-1">
                      {groupCommands.map((command) => {
                        const Icon = command.icon;
                        const active = command.href === currentUrl;

                        return (
                          <button
                            key={command.id}
                            type="button"
                            onClick={() => runCommand(command)}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none",
                              active && "bg-accent/70",
                            )}
                          >
                            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                              <Icon className="size-4" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium">
                                {command.title}
                              </span>
                              <span className="block truncate text-xs text-muted-foreground">
                                {command.description}
                              </span>
                            </span>
                            <ArrowRight className="size-4 text-muted-foreground" />
                          </button>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className="flex min-h-40 flex-col items-center justify-center px-6 py-8 text-center">
                <Search className="size-8 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium">No commands found</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Try “project”, “task”, “settings”, or a workspace name.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
