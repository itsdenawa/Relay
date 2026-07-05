import Link from "next/link";
import { ArrowLeft, FolderKanban } from "lucide-react";

import type { TaskAttachment } from "@/entities/attachment";
import type { TaskComment } from "@/entities/comment";
import type { ProjectBoard } from "@/entities/project";
import {
  filterTasks,
  type ProjectLabel,
  type Task,
  type TaskFilters,
} from "@/entities/task";
import type { CurrentWorkspace, WorkspaceMember } from "@/entities/workspace";
import { ProjectFormDialog } from "@/features/project-management";
import {
  ProjectLabelsDialog,
  TaskFormDialog,
  TaskQuickAdd,
} from "@/features/task-management";
import { cn } from "@/shared/lib";
import { Badge, Button } from "@/shared/ui";
import { ArchivedTaskList, KanbanBoard } from "@/widgets/kanban-board";
import { TaskDetailsPanel } from "@/widgets/task-details-panel";

import { BoardFilters } from "./board-filters";
import { TaskListView } from "./task-list-view";

type ProjectBoardPageProps = {
  workspace: CurrentWorkspace;
  board: ProjectBoard;
  tasks: Task[];
  labels: ProjectLabel[];
  members: WorkspaceMember[];
  filters: TaskFilters;
  view?: "board" | "list";
  showArchived?: boolean;
  createdTaskId?: string | undefined;
  savedTaskId?: string | undefined;
  change?: "archived" | "restored" | undefined;
  currentUserId: string;
  selectedTaskId?: string | undefined;
  initialComments: TaskComment[];
  initialAttachments: TaskAttachment[];
};

export function ProjectBoardPage({
  workspace,
  board,
  tasks,
  labels,
  members,
  filters,
  view = "board",
  showArchived = false,
  createdTaskId,
  savedTaskId,
  change,
  currentUserId,
  selectedTaskId,
  initialComments,
  initialAttachments,
}: ProjectBoardPageProps) {
  const { project, columns } = board;
  const canManageProject =
    workspace.role === "owner" || workspace.role === "admin";
  const readOnly = Boolean(project.archived_at);
  const activeTasks = tasks.filter((task) => !task.archived_at);
  const archivedTasks = tasks.filter((task) => task.archived_at);
  const visibleTasks = filterTasks(activeTasks, filters);
  const selectedTask = tasks.find((task) => task.id === selectedTaskId);
  const context = {
    workspaceId: workspace.id,
    workspaceSlug: workspace.slug,
    projectId: project.id,
  };
  const boardUrl = `/w/${workspace.slug}/p/${project.id}/board`;
  const filtersQuery = new URLSearchParams();
  if (filters.query) filtersQuery.set("q", filters.query);
  if (filters.assigneeId) filtersQuery.set("assignee", filters.assigneeId);
  if (filters.priority) filtersQuery.set("priority", filters.priority);
  if (filters.labelId) filtersQuery.set("label", filters.labelId);
  const boardViewHref = `${boardUrl}${
    filtersQuery.toString() ? `?${filtersQuery.toString()}` : ""
  }`;
  const listViewQuery = new URLSearchParams(filtersQuery);
  listViewQuery.set("view", "list");
  const listViewHref = `${boardUrl}?${listViewQuery.toString()}`;
  const detailsHrefFor = (taskId: string) => {
    const nextParams = new URLSearchParams(filtersQuery);
    if (view === "list") nextParams.set("view", "list");
    nextParams.set("task", taskId);
    return `${boardUrl}?${nextParams.toString()}`;
  };

  return (
    <div className="mx-auto w-full max-w-[1800px]">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href={`/w/${workspace.slug}/projects`}>
          <ArrowLeft />
          All projects
        </Link>
      </Button>

      <header className="mt-4 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl text-white shadow-sm"
            style={{ backgroundColor: project.color }}
          >
            <FolderKanban className="size-5" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">
                {project.name}
              </h1>
              <Badge variant="outline">{project.key}</Badge>
              {project.archived_at ? (
                <Badge variant="secondary">Archived</Badge>
              ) : null}
            </div>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              {project.description || "No project description yet."}
            </p>
          </div>
        </div>

        {!readOnly ? (
          <div className="flex flex-wrap gap-2">
            {canManageProject ? (
              <ProjectLabelsDialog context={context} labels={labels} />
            ) : null}
            {canManageProject ? (
              <ProjectFormDialog
                workspace={{ id: workspace.id, slug: workspace.slug }}
                project={project}
                buttonVariant="outline"
                buttonSize="default"
              />
            ) : null}
            <TaskFormDialog
              context={context}
              columns={columns}
              labels={labels}
              members={members}
              defaultColumnId={columns[0]?.id}
              view={view}
            />
          </div>
        ) : null}
      </header>

      {readOnly ? (
        <p
          role="status"
          className="mt-6 rounded-xl border bg-muted px-4 py-3 text-sm text-muted-foreground"
        >
          This project is archived. Restore it from the Projects page before
          changing tasks.
        </p>
      ) : null}

      {createdTaskId || savedTaskId || change ? (
        <p
          role="status"
          className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400"
        >
          {createdTaskId
            ? "Task created."
            : savedTaskId
              ? "Task details saved."
              : change === "archived"
                ? "Task archived."
                : "Task restored to the board."}
        </p>
      ) : null}

      <nav
        aria-label="Board views"
        className="mt-6 flex w-fit rounded-lg border bg-muted/40 p-1"
      >
        <Link
          href={boardViewHref}
          aria-current={!showArchived && view === "board" ? "page" : undefined}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            !showArchived && view === "board"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Board <span className="ml-1 text-xs">{activeTasks.length}</span>
        </Link>
        <Link
          href={listViewHref}
          aria-current={!showArchived && view === "list" ? "page" : undefined}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            !showArchived && view === "list"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          List <span className="ml-1 text-xs">{visibleTasks.length}</span>
        </Link>
        <Link
          href={`${boardUrl}?archived=1`}
          aria-current={showArchived ? "page" : undefined}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            showArchived
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Archived <span className="ml-1 text-xs">{archivedTasks.length}</span>
        </Link>
      </nav>

      {!showArchived ? (
        <>
          <BoardFilters
            boardUrl={boardUrl}
            view={view}
            filters={filters}
            labels={labels}
            members={members}
            activeTaskCount={activeTasks.length}
            visibleTaskCount={visibleTasks.length}
          />

          {!readOnly ? (
            <div className="mt-4">
              <TaskQuickAdd context={context} columns={columns} view={view} />
            </div>
          ) : null}

          <div className="mt-4">
            {view === "list" ? (
              <TaskListView
                context={context}
                columns={columns}
                tasks={visibleTasks}
                labels={labels}
                members={members}
                readOnly={readOnly}
                highlightedTaskId={createdTaskId ?? savedTaskId}
                detailsHrefFor={detailsHrefFor}
                view={view}
              />
            ) : (
              <KanbanBoard
                context={context}
                columns={columns}
                tasks={tasks}
                labels={labels}
                members={members}
                filters={filters}
                readOnly={readOnly}
                highlightedTaskId={createdTaskId ?? savedTaskId}
              />
            )}
          </div>
        </>
      ) : (
        <div className="mt-4">
          <ArchivedTaskList
            context={context}
            tasks={archivedTasks}
            labels={labels}
            members={members}
            readOnly={readOnly}
          />
        </div>
      )}

      {selectedTask ? (
        <TaskDetailsPanel
          context={context}
          task={selectedTask}
          columns={columns}
          labels={labels}
          members={members}
          currentUserId={currentUserId}
          currentUserRole={workspace.role}
          initialComments={initialComments}
          initialAttachments={initialAttachments}
          readOnly={Boolean(project.archived_at || selectedTask.archived_at)}
        />
      ) : null}
    </div>
  );
}
