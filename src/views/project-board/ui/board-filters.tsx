"use client";

import Link from "next/link";
import type { ChangeEvent, FormEvent } from "react";
import { useSyncExternalStore } from "react";
import { Search, X } from "lucide-react";

import type { ProjectLabel, TaskFilters } from "@/entities/task";
import type { WorkspaceMember } from "@/entities/workspace";
import { Badge, Button, Input, NativeSelect } from "@/shared/ui";

type BoardFiltersProps = {
  boardUrl: string;
  view?: "board" | "list";
  filters: TaskFilters;
  labels: ProjectLabel[];
  members: WorkspaceMember[];
  activeTaskCount: number;
  visibleTaskCount: number;
};

type FilterChip = {
  key: "q" | "assignee" | "priority" | "label";
  label: string;
};

const priorities = [
  { value: "", label: "All priorities" },
  { value: "no_priority", label: "No priority" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const subscribeToHydration = () => () => undefined;
const getHydratedSnapshot = () => true;
const getServerSnapshot = () => false;

function buildFilterHref(
  boardUrl: string,
  view: "board" | "list",
  filters: TaskFilters,
  removeKey: "q" | "assignee" | "priority" | "label",
) {
  const params = new URLSearchParams();
  if (view === "list") params.set("view", "list");
  if (filters.query && removeKey !== "q") params.set("q", filters.query);
  if (filters.assigneeId && removeKey !== "assignee") {
    params.set("assignee", filters.assigneeId);
  }
  if (filters.priority && removeKey !== "priority") {
    params.set("priority", filters.priority);
  }
  if (filters.labelId && removeKey !== "label") {
    params.set("label", filters.labelId);
  }
  return `${boardUrl}${params.toString() ? `?${params.toString()}` : ""}`;
}

function submitOnSelectChange(event: ChangeEvent<HTMLSelectElement>) {
  event.currentTarget.form?.requestSubmit();
}

function submitOnSelectInput(event: FormEvent<HTMLSelectElement>) {
  event.currentTarget.form?.requestSubmit();
}

export function BoardFilters({
  boardUrl,
  view = "board",
  filters,
  labels,
  members,
  activeTaskCount,
  visibleTaskCount,
}: BoardFiltersProps) {
  const ready = useSyncExternalStore(
    subscribeToHydration,
    getHydratedSnapshot,
    getServerSnapshot,
  );

  const assigneeLabel =
    filters.assigneeId === "unassigned"
      ? "Unassigned"
      : members.find((member) => member.id === filters.assigneeId)?.displayName;
  const priorityLabel = priorities.find(
    (priority) => priority.value === filters.priority,
  )?.label;
  const labelName = labels.find((label) => label.id === filters.labelId)?.name;
  const chips = [
    filters.query
      ? { key: "q" as const, label: `Search: ${filters.query}` }
      : null,
    assigneeLabel
      ? { key: "assignee" as const, label: `Assignee: ${assigneeLabel}` }
      : null,
    filters.priority && priorityLabel
      ? { key: "priority" as const, label: `Priority: ${priorityLabel}` }
      : null,
    labelName ? { key: "label" as const, label: `Label: ${labelName}` } : null,
  ].filter((chip): chip is FilterChip => Boolean(chip));
  const hasFilters = chips.length > 0;
  const clearHref = view === "list" ? `${boardUrl}?view=list` : boardUrl;

  return (
    <section
      aria-label="Task filters"
      className="mt-4 rounded-2xl border bg-card p-3 shadow-xs"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold">Filters</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Showing {visibleTaskCount} of {activeTaskCount} active tasks
          </p>
        </div>
        {hasFilters ? (
          <Button asChild variant="ghost" size="sm" className="h-7 px-2">
            <Link href={clearHref}>Clear all</Link>
          </Button>
        ) : null}
      </div>

      <form
        key={`${filters.query ?? ""}|${filters.assigneeId ?? ""}|${filters.priority ?? ""}|${filters.labelId ?? ""}`}
        method="get"
        className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(14rem,1fr)_12rem_10rem_11rem]"
      >
        {view === "list" ? (
          <input type="hidden" name="view" value="list" />
        ) : null}
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={filters.query}
            placeholder="Search tasks"
            aria-label="Search tasks"
            className="bg-muted/35 pl-9 shadow-none"
          />
          <button type="submit" className="sr-only">
            Search
          </button>
        </div>
        <NativeSelect
          name="assignee"
          defaultValue={filters.assigneeId ?? ""}
          aria-label="Filter by assignee"
          onChange={submitOnSelectChange}
          onInput={submitOnSelectInput}
          disabled={!ready}
          className="bg-muted/35 shadow-none"
        >
          <option value="">All assignees</option>
          <option value="unassigned">Unassigned</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.displayName}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect
          name="priority"
          defaultValue={filters.priority ?? ""}
          aria-label="Filter by priority"
          onChange={submitOnSelectChange}
          onInput={submitOnSelectInput}
          disabled={!ready}
          className="bg-muted/35 shadow-none"
        >
          {priorities.map((priority) => (
            <option key={priority.value} value={priority.value}>
              {priority.label}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect
          name="label"
          defaultValue={filters.labelId ?? ""}
          aria-label="Filter by label"
          onChange={submitOnSelectChange}
          onInput={submitOnSelectInput}
          disabled={!ready}
          className="bg-muted/35 shadow-none"
        >
          <option value="">All labels</option>
          {labels.map((label) => (
            <option key={label.id} value={label.id}>
              {label.name}
            </option>
          ))}
        </NativeSelect>
      </form>

      {hasFilters ? (
        <div className="mt-3 flex flex-wrap items-center gap-2" role="status">
          {chips.map((chip) => (
            <Badge
              key={chip.key}
              variant="secondary"
              className="animate-in fade-in zoom-in-95 gap-1.5 rounded-full pr-1"
            >
              {chip.label}
              <Link
                href={buildFilterHref(boardUrl, view, filters, chip.key)}
                aria-label={`Remove ${chip.label} filter`}
                className="grid size-5 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <X className="size-3" />
              </Link>
            </Badge>
          ))}
        </div>
      ) : null}
    </section>
  );
}
