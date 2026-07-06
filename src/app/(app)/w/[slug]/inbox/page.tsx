import { notFound, redirect } from "next/navigation";

import {
  getProjectBoard,
  getWorkspaceProjects,
  type ProjectBoardColumn,
} from "@/entities/project";
import { getProjectTasks, type Task } from "@/entities/task";
import { getCurrentUser } from "@/entities/user";
import { getWorkspaceBySlug, getWorkspaceMembers } from "@/entities/workspace";
import { WorkspaceInboxPage } from "@/views/workspace-inbox";

type InboxRouteProps = {
  params: Promise<{ slug: string }>;
};

type InboxProject = {
  project: Awaited<ReturnType<typeof getWorkspaceProjects>>[number];
  columns: ProjectBoardColumn[];
  tasks: Task[];
};

export default async function InboxRoute({ params }: InboxRouteProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { slug } = await params;
  const workspace = await getWorkspaceBySlug(user.id, slug);
  if (!workspace) notFound();

  const [projects, members] = await Promise.all([
    getWorkspaceProjects(workspace.id),
    getWorkspaceMembers(workspace.id),
  ]);
  const activeProjects = projects.filter((project) => !project.archived_at);
  const inboxProjects = await Promise.all(
    activeProjects.map<Promise<InboxProject>>(async (project) => {
      const [board, tasks] = await Promise.all([
        getProjectBoard(workspace.id, project.id),
        getProjectTasks(workspace.id, project.id),
      ]);

      return {
        project: board?.project ?? project,
        columns: board?.columns ?? [],
        tasks,
      };
    }),
  );

  return (
    <WorkspaceInboxPage
      workspace={workspace}
      currentUserId={user.id}
      projects={inboxProjects}
      members={members}
    />
  );
}
