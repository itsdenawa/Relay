import { describe, expect, it } from "vitest";

import type { Task } from "../model/types";
import { prepareTaskMove } from "./prepare-task-move";

const task = (id: string, columnId: string, position: number): Task => ({
  id,
  workspace_id: "workspace",
  project_id: "project",
  column_id: columnId,
  title: id,
  description: null,
  assignee_id: null,
  priority: "no_priority",
  due_date: null,
  position,
  archived_at: null,
  created_at: "2026-06-21T00:00:00Z",
  updated_at: "2026-06-21T00:00:00Z",
  labelIds: [],
});

describe("prepareTaskMove", () => {
  it("reorders tasks inside a column and derives adjacent neighbors", () => {
    const result = prepareTaskMove(
      [task("one", "backlog", 1024), task("two", "backlog", 2048)],
      "one",
      "backlog",
      1,
    );

    expect(result).toMatchObject({
      previousTaskId: "two",
      nextTaskId: null,
      targetIndex: 1,
    });
    expect(
      result?.tasks
        .filter((item) => item.column_id === "backlog")
        .sort((first, second) => first.position - second.position)
        .map((item) => item.id),
    ).toEqual(["two", "one"]);
  });

  it("inserts a task between tasks in another column", () => {
    const result = prepareTaskMove(
      [
        task("moving", "backlog", 1024),
        task("first", "progress", 1024),
        task("last", "progress", 2048),
      ],
      "moving",
      "progress",
      1,
    );

    expect(result).toMatchObject({
      previousTaskId: "first",
      nextTaskId: "last",
      targetColumnId: "progress",
    });
    expect(
      result?.tasks
        .filter((item) => item.column_id === "progress")
        .sort((first, second) => first.position - second.position)
        .map((item) => item.id),
    ).toEqual(["first", "moving", "last"]);
  });

  it("bounds an out-of-range destination index", () => {
    const result = prepareTaskMove(
      [task("moving", "backlog", 1024), task("target", "done", 1024)],
      "moving",
      "done",
      99,
    );

    expect(result).toMatchObject({
      targetIndex: 1,
      previousTaskId: "target",
      nextTaskId: null,
    });
  });

  it("returns null for an unknown task", () => {
    expect(prepareTaskMove([], "missing", "done", 0)).toBeNull();
  });
});
