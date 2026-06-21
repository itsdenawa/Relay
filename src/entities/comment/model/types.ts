import type { Database } from "@/shared/api/supabase";

type CommentRow = Database["public"]["Tables"]["comments"]["Row"];

export type TaskComment = Pick<
  CommentRow,
  | "id"
  | "workspace_id"
  | "project_id"
  | "task_id"
  | "author_id"
  | "body"
  | "edited_at"
  | "created_at"
  | "updated_at"
> & {
  author: {
    displayName: string;
    avatarPath: string | null;
  };
};
