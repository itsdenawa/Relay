"use client";

import { useActionState } from "react";
import { LoaderCircle, Plus } from "lucide-react";

import type { ProjectBoardColumn } from "@/entities/project";
import { Button, Input, Label, NativeSelect } from "@/shared/ui";

import { createTaskAction } from "../api/actions";
import { initialTaskActionState } from "../model/action-state";

type TaskQuickAddProps = {
  context: { workspaceId: string; workspaceSlug: string; projectId: string };
  columns: ProjectBoardColumn[];
  view?: "board" | "list";
};

const priorities = [
  { value: "no_priority", label: "No priority" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
] as const;

export function TaskQuickAdd({
  context,
  columns,
  view = "board",
}: TaskQuickAddProps) {
  const [state, action, pending] = useActionState(
    createTaskAction,
    initialTaskActionState,
  );
  const idPrefix = `quick-task-${context.projectId}`;

  if (!columns.length) return null;

  return (
    <section
      aria-label="Quick add task"
      className="rounded-2xl border bg-card p-3 shadow-xs"
    >
      <form
        action={action}
        className="grid gap-2 sm:grid-cols-[minmax(14rem,1fr)_12rem_10rem_auto]"
        noValidate
      >
        <input type="hidden" name="workspaceId" value={context.workspaceId} />
        <input
          type="hidden"
          name="workspaceSlug"
          value={context.workspaceSlug}
        />
        <input type="hidden" name="projectId" value={context.projectId} />
        <input type="hidden" name="description" value="" />
        {view === "list" ? (
          <input type="hidden" name="view" value="list" />
        ) : null}

        <div className="min-w-0">
          <Label htmlFor={`${idPrefix}-title`} className="sr-only">
            Task title
          </Label>
          <Input
            id={`${idPrefix}-title`}
            name="title"
            maxLength={240}
            defaultValue={state.values?.title}
            placeholder="Quick add a task…"
            aria-invalid={Boolean(state.fieldErrors?.title)}
          />
        </div>

        <div className="min-w-0">
          <Label htmlFor={`${idPrefix}-column`} className="sr-only">
            Status
          </Label>
          <NativeSelect
            id={`${idPrefix}-column`}
            name="columnId"
            defaultValue={state.values?.columnId ?? columns[0]?.id}
            aria-label="Quick add status"
          >
            {columns.map((column) => (
              <option key={column.id} value={column.id}>
                {column.name}
              </option>
            ))}
          </NativeSelect>
        </div>

        <div className="min-w-0">
          <Label htmlFor={`${idPrefix}-priority`} className="sr-only">
            Priority
          </Label>
          <NativeSelect
            id={`${idPrefix}-priority`}
            name="priority"
            defaultValue={state.values?.priority ?? "no_priority"}
            aria-label="Quick add priority"
          >
            {priorities.map((priority) => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </NativeSelect>
        </div>

        <Button type="submit" disabled={pending} className="sm:w-auto">
          {pending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}
          {pending ? "Adding…" : "Add task"}
        </Button>
      </form>

      {state.message ? (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {state.message}
        </p>
      ) : null}
    </section>
  );
}
