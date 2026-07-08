import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Project } from "@/entities/project";

import { DashboardOverview } from "./dashboard-overview";

vi.mock("@/features/project-management", () => ({
  ProjectFormDialog: () => <button type="button">New project</button>,
}));

const workspace = {
  id: "workspace-1",
  name: "Northstar Studio",
  slug: "northstar-studio",
  role: "owner",
};

const project: Project = {
  id: "project-1",
  workspace_id: "workspace-1",
  name: "Launch plan",
  key: "LAUNCH",
  color: "#6366F1",
  description: "Coordinate the next public launch.",
  archived_at: null,
  created_at: "2026-07-08T09:00:00Z",
  updated_at: "2026-07-08T09:00:00Z",
};

describe("DashboardOverview", () => {
  it("guides a new workspace through the first useful actions", () => {
    render(
      <DashboardOverview
        displayName="Ank"
        workspace={workspace}
        projects={[]}
        taskStats={{ open: 0, completed: 0, urgent: 0, dueSoon: 0 }}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Turn this space into a working board",
      }),
    ).toBeVisible();
    expect(screen.getAllByText("Create the first project")).not.toHaveLength(0);
    expect(
      screen.getAllByRole("button", { name: "New project" }),
    ).not.toHaveLength(0);
    expect(screen.getByRole("link", { name: /Invite team/i })).toHaveAttribute(
      "href",
      "/w/northstar-studio/members",
    );
  });

  it("points an active workspace toward its first board", () => {
    render(
      <DashboardOverview
        displayName="Ank"
        workspace={workspace}
        projects={[project]}
        taskStats={{ open: 0, completed: 0, urgent: 0, dueSoon: 0 }}
      />,
    );

    expect(screen.getByRole("link", { name: /Open board/i })).toHaveAttribute(
      "href",
      "/w/northstar-studio/p/project-1/board",
    );
  });
});
