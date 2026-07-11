import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TaskFormDialog } from "./task-form-dialog";
import { TaskQuickAdd } from "./task-quick-add";

vi.mock("../api/actions", () => ({
  createTaskAction: vi.fn(),
  updateTaskAction: vi.fn(),
}));

const context = {
  workspaceId: "00000000-0000-4000-8000-000000000001",
  workspaceSlug: "northstar",
  projectId: "00000000-0000-4000-8000-000000000002",
};

const columns = [
  {
    id: "00000000-0000-4000-8000-000000000003",
    name: "Backlog",
    position: 1000,
  },
  {
    id: "00000000-0000-4000-8000-000000000004",
    name: "In progress",
    position: 2000,
  },
];

describe("task creation", () => {
  it("keeps quick capture focused on the essentials", () => {
    render(<TaskQuickAdd context={context} columns={columns} />);

    expect(
      screen.getByRole("heading", { name: "Quick capture" }),
    ).toBeVisible();
    expect(
      screen.getByText(
        "Add the essentials now. Open the task later for details.",
      ),
    ).toBeVisible();
    expect(screen.getByLabelText("Task title")).toHaveAttribute(
      "placeholder",
      "Quick add a task…",
    );
    expect(screen.getByLabelText("Quick add status")).toHaveValue(
      columns[0]!.id,
    );
    expect(screen.getByRole("button", { name: "Add task" })).toBeEnabled();
  });

  it("explains required and optional information in the full form", async () => {
    const user = userEvent.setup();
    render(
      <TaskFormDialog
        context={context}
        columns={columns}
        labels={[]}
        members={[]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "New task" }));

    const dialog = screen.getByRole("dialog", { name: "Create task" });
    expect(dialog).toBeVisible();
    expect(screen.getByText("Required")).toBeVisible();
    expect(
      screen.getByText(
        "Optional. Add the outcome, constraints, or definition of done.",
      ),
    ).toBeVisible();
    expect(dialog.querySelector("select[name='columnId']")).toHaveValue(
      columns[0]!.id,
    );
    expect(screen.getByRole("button", { name: "Create task" })).toBeEnabled();
  });
});
