import { cache } from "react";

import { createServerSupabaseClient } from "@/shared/api/supabase/server";

import type { TaskAttachment } from "../model/types";

export const getTaskAttachments = cache(
  async (
    workspaceId: string,
    projectId: string,
    taskId: string,
  ): Promise<TaskAttachment[]> => {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("attachments")
      .select(
        "id, workspace_id, project_id, task_id, uploader_id, storage_path, file_name, content_type, size_bytes, created_at, uploader:profiles!attachments_uploader_id_fkey(display_name, avatar_path)",
      )
      .eq("workspace_id", workspaceId)
      .eq("project_id", projectId)
      .eq("task_id", taskId)
      .order("created_at", { ascending: true });

    if (error) return [];

    return data.map(({ uploader, ...attachment }) => ({
      ...attachment,
      uploader: {
        displayName: uploader.display_name,
        avatarPath: uploader.avatar_path,
      },
    }));
  },
);
