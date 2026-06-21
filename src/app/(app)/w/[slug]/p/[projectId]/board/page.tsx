import { notFound, redirect } from "next/navigation";

import { getTaskAttachments } from "@/entities/attachment";
import { getTaskComments } from "@/entities/comment";
import { getProjectBoard } from "@/entities/project";
import { getProjectLabels, getProjectTasks } from "@/entities/task";
import { getCurrentUser } from "@/entities/user";
import { getWorkspaceBySlug, getWorkspaceMembers } from "@/entities/workspace";
import { taskPrioritySchema } from "@/features/task-management";
import { ProjectBoardPage } from "@/views/project-board";

type ProjectBoardRouteProps = {
  params: Promise<{ slug: string; projectId: string }>;
  searchParams: Promise<{
    q?: string;
    assignee?: string;
    priority?: string;
    label?: string;
    archived?: string;
    created?: string;
    saved?: string;
    changed?: string;
    task?: string;
  }>;
};

export default async function ProjectBoardRoute({
  params,
  searchParams,
}: ProjectBoardRouteProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [{ slug, projectId }, query] = await Promise.all([
    params,
    searchParams,
  ]);
  const workspace = await getWorkspaceBySlug(user.id, slug);
  if (!workspace) notFound();

  const [board, tasks, labels, members] = await Promise.all([
    getProjectBoard(workspace.id, projectId),
    getProjectTasks(workspace.id, projectId),
    getProjectLabels(workspace.id, projectId),
    getWorkspaceMembers(workspace.id),
  ]);
  if (!board) notFound();

  const selectedTask = tasks.find((task) => task.id === query.task);
  const [initialComments, initialAttachments] = selectedTask
    ? await Promise.all([
        getTaskComments(workspace.id, projectId, selectedTask.id),
        getTaskAttachments(workspace.id, projectId, selectedTask.id),
      ])
    : [[], []];

  const priorityResult = taskPrioritySchema.safeParse(query.priority);
  const change =
    query.changed === "archived" || query.changed === "restored"
      ? query.changed
      : undefined;

  return (
    <ProjectBoardPage
      workspace={workspace}
      board={board}
      tasks={tasks}
      labels={labels}
      members={members}
      filters={{
        query: query.q,
        assigneeId: query.assignee,
        priority: priorityResult.success ? priorityResult.data : undefined,
        labelId: query.label,
      }}
      showArchived={query.archived === "1"}
      createdTaskId={query.created}
      savedTaskId={query.saved}
      change={change}
      currentUserId={user.id}
      selectedTaskId={selectedTask?.id}
      initialComments={initialComments}
      initialAttachments={initialAttachments}
    />
  );
}
