"use client";

import dynamic from "next/dynamic";

import { Skeleton } from "@/shared/ui";

import type { TaskDetailsPanelProps } from "./task-details-panel";

const DynamicTaskDetailsPanel = dynamic(
  () =>
    import("./task-details-panel").then((module) => module.TaskDetailsPanel),
  {
    loading: () => (
      <div
        role="status"
        aria-label="Loading task details"
        className="fixed inset-y-0 right-0 z-50 w-full max-w-[42rem] border-l bg-background p-7 shadow-2xl sm:w-[min(42rem,92vw)]"
      >
        <Skeleton className="h-6 w-24" />
        <Skeleton className="mt-4 h-8 w-3/4" />
        <Skeleton className="mt-8 h-36 w-full" />
        <Skeleton className="mt-7 h-28 w-full" />
      </div>
    ),
  },
);

export function LazyTaskDetailsPanel(props: TaskDetailsPanelProps) {
  return <DynamicTaskDetailsPanel {...props} />;
}
