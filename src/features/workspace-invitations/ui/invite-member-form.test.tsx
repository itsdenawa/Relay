import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { InviteMemberForm } from "./invite-member-form";

vi.mock("../api/actions", () => ({ inviteMemberAction: vi.fn() }));

describe("InviteMemberForm", () => {
  it("explains the access granted by each role", async () => {
    const user = userEvent.setup();
    render(
      <InviteMemberForm
        workspaceId="00000000-0000-4000-8000-000000000001"
        workspaceSlug="northstar"
      />,
    );

    expect(screen.getByLabelText("Email address")).toHaveAttribute(
      "autocomplete",
      "email",
    );
    expect(screen.getByLabelText("Role")).toHaveValue("member");
    expect(
      screen.getByText(
        "Can create and update project work, comments, and attachments.",
      ),
    ).toBeVisible();

    await user.selectOptions(screen.getByLabelText("Role"), "admin");

    expect(
      screen.getByText(
        "Can also manage projects, workspace members, and invitations.",
      ),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Send invite" })).toBeEnabled();
  });
});
