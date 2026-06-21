import type { Database } from "@/shared/api/supabase";

type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];
type LabelRow = Database["public"]["Tables"]["labels"]["Row"];

export type TaskPriority = Database["public"]["Enums"]["task_priority"];

export type Task = Pick<
  TaskRow,
  | "id"
  | "workspace_id"
  | "project_id"
  | "column_id"
  | "title"
  | "description"
  | "assignee_id"
  | "priority"
  | "due_date"
  | "position"
  | "archived_at"
  | "created_at"
  | "updated_at"
> & {
  labelIds: string[];
};

export type ProjectLabel = Pick<
  LabelRow,
  "id" | "workspace_id" | "project_id" | "name" | "color"
>;

export type WorkspaceTaskStats = {
  open: number;
  completed: number;
  urgent: number;
  dueSoon: number;
};
