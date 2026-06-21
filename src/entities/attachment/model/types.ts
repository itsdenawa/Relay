import type { Database } from "@/shared/api/supabase";

type AttachmentRow = Database["public"]["Tables"]["attachments"]["Row"];

export type TaskAttachment = Pick<
  AttachmentRow,
  | "id"
  | "workspace_id"
  | "project_id"
  | "task_id"
  | "uploader_id"
  | "storage_path"
  | "file_name"
  | "content_type"
  | "size_bytes"
  | "created_at"
> & {
  uploader: {
    displayName: string;
    avatarPath: string | null;
  };
};
