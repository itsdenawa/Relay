"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  CircleUserRound,
  Columns3,
} from "lucide-react";

import type { TaskAttachment } from "@/entities/attachment/client";
import type { TaskComment } from "@/entities/comment/client";
import type { ProjectBoardColumn } from "@/entities/project";
import {
  type ProjectLabel,
  type Task,
  type TaskPriority,
} from "@/entities/task/client";
import type { WorkspaceMember } from "@/entities/workspace";
import { TaskAttachmentList } from "@/features/task-attachments";
import { CommentThread } from "@/features/task-comments";
import { TaskFormDialog } from "@/features/task-management";
import { cn } from "@/shared/lib";
import {
  Badge,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/shared/ui";

export type TaskDetailsPanelProps = {
  context: {
    workspaceId: string;
    workspaceSlug: string;
    projectId: string;
  };
  task: Task;
  columns: ProjectBoardColumn[];
  labels: ProjectLabel[];
  members: WorkspaceMember[];
  currentUserId: string;
  currentUserRole: WorkspaceMember["role"];
  initialComments: TaskComment[];
  initialAttachments: TaskAttachment[];
  readOnly?: boolean;
};

const priorityLabels: Record<TaskPriority, string> = {
  no_priority: "No priority",
  low: "Low priority",
  medium: "Medium priority",
  high: "High priority",
  urgent: "Urgent priority",
};

const priorityTones: Record<TaskPriority, string> = {
  no_priority: "text-muted-foreground",
  low: "text-sky-700 dark:text-sky-400",
  medium: "text-amber-700 dark:text-amber-400",
  high: "text-orange-700 dark:text-orange-400",
  urgent: "text-rose-700 dark:text-rose-400",
};

function formatDueDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(`${value}T12:00:00`));
}

export function TaskDetailsPanel({
  context,
  task,
  columns,
  labels,
  members,
  currentUserId,
  currentUserRole,
  initialComments,
  initialAttachments,
  readOnly = false,
}: TaskDetailsPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const column = columns.find((candidate) => candidate.id === task.column_id);
  const assignee = members.find((member) => member.id === task.assignee_id);
  const taskLabels = labels.filter((label) => task.labelIds.includes(label.id));

  function closePanel() {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("task");
    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  return (
    <Sheet open onOpenChange={(open) => !open && closePanel()}>
      <SheetContent
        closeLabel="Close task details"
        className="right-0 left-auto w-full max-w-[42rem] border-r-0 border-l data-[state=closed]:translate-x-full data-[state=open]:translate-x-0 sm:w-[min(42rem,92vw)]"
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <header className="border-b px-5 py-5 pr-14 sm:px-7 sm:py-6 sm:pr-16">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {column ? (
                    <Badge variant="secondary">{column.name}</Badge>
                  ) : null}
                  {task.archived_at ? (
                    <Badge variant="outline">Archived</Badge>
                  ) : null}
                </div>
                <SheetTitle className="text-xl leading-7 sm:text-2xl sm:leading-8">
                  {task.title}
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Task details, comments, and private attachments for{" "}
                  {task.title}
                </SheetDescription>
              </div>
              {!readOnly ? (
                <TaskFormDialog
                  context={context}
                  columns={columns}
                  labels={labels}
                  members={members}
                  task={task}
                />
              ) : null}
            </div>
          </header>

          <div className="space-y-7 px-5 py-6 sm:px-7">
            <section
              aria-labelledby="task-overview-heading"
              className="space-y-4"
            >
              <h3 id="task-overview-heading" className="font-semibold">
                Overview
              </h3>
              <dl className="grid gap-3 rounded-xl border bg-muted/25 p-4 sm:grid-cols-2">
                <div className="flex items-center gap-2.5">
                  <Columns3 className="size-4 text-muted-foreground" />
                  <div>
                    <dt className="text-[11px] text-muted-foreground">
                      Status
                    </dt>
                    <dd className="text-sm font-medium">
                      {column?.name ?? "Unknown"}
                    </dd>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <AlertCircle
                    className={cn("size-4", priorityTones[task.priority])}
                  />
                  <div>
                    <dt className="text-[11px] text-muted-foreground">
                      Priority
                    </dt>
                    <dd className="text-sm font-medium">
                      {priorityLabels[task.priority]}
                    </dd>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <CircleUserRound className="size-4 text-muted-foreground" />
                  <div>
                    <dt className="text-[11px] text-muted-foreground">
                      Assignee
                    </dt>
                    <dd className="text-sm font-medium">
                      {assignee?.displayName ?? "Unassigned"}
                    </dd>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  {task.due_date ? (
                    <CalendarDays className="size-4 text-muted-foreground" />
                  ) : (
                    <CheckCircle2 className="size-4 text-muted-foreground" />
                  )}
                  <div>
                    <dt className="text-[11px] text-muted-foreground">
                      Due date
                    </dt>
                    <dd className="text-sm font-medium">
                      {task.due_date
                        ? formatDueDate(task.due_date)
                        : "No due date"}
                    </dd>
                  </div>
                </div>
              </dl>

              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Description
                </p>
                <p className="mt-1.5 text-sm leading-6 whitespace-pre-wrap">
                  {task.description || "No description provided."}
                </p>
              </div>

              {taskLabels.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {taskLabels.map((label) => (
                    <span
                      key={label.id}
                      className="inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs"
                    >
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: label.color }}
                      />
                      {label.name}
                    </span>
                  ))}
                </div>
              ) : null}
            </section>

            <TaskAttachmentList
              context={{
                workspaceId: context.workspaceId,
                projectId: context.projectId,
                taskId: task.id,
              }}
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
              initialAttachments={initialAttachments}
              readOnly={readOnly}
            />

            <CommentThread
              context={{
                workspaceId: context.workspaceId,
                projectId: context.projectId,
                taskId: task.id,
              }}
              currentUserId={currentUserId}
              initialComments={initialComments}
              readOnly={readOnly}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
