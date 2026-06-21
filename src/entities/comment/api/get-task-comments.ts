import { cache } from "react";

import { createServerSupabaseClient } from "@/shared/api/supabase/server";

import type { TaskComment } from "../model/types";

export const getTaskComments = cache(
  async (
    workspaceId: string,
    projectId: string,
    taskId: string,
  ): Promise<TaskComment[]> => {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("comments")
      .select(
        "id, workspace_id, project_id, task_id, author_id, body, edited_at, created_at, updated_at, author:profiles!comments_author_id_fkey(display_name, avatar_path)",
      )
      .eq("workspace_id", workspaceId)
      .eq("project_id", projectId)
      .eq("task_id", taskId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true });

    if (error) return [];

    return data.map(({ author, ...comment }) => ({
      ...comment,
      author: {
        displayName: author.display_name,
        avatarPath: author.avatar_path,
      },
    }));
  },
);
