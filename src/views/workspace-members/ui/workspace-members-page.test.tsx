import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { WorkspaceMembersPage } from "./workspace-members-page";

vi.mock("@/features/workspace-invitations", () => ({
  InviteMemberForm: () => <div>Invite form</div>,
  resendInvitationAction: vi.fn(),
  revokeInvitationAction: vi.fn(),
}));

vi.mock("@/features/workspace-management", () => ({
  removeMemberAction: vi.fn(),
  TransferOwnershipForm: () => <div>Transfer form</div>,
  updateMemberRoleAction: vi.fn(),
}));

const workspace = {
  id: "00000000-0000-4000-8000-000000000001",
  name: "Northstar",
  slug: "northstar",
  role: "owner" as const,
};

const members = [
  {
    id: "00000000-0000-4000-8000-000000000002",
    displayName: "Ank Owner",
    email: "ank@example.com",
    role: "owner" as const,
    joinedAt: "2026-01-02T12:00:00.000Z",
  },
];

describe("WorkspaceMembersPage", () => {
  it("surfaces pending and expired invitations with explicit actions", () => {
    render(
      <WorkspaceMembersPage
        workspace={workspace}
        currentUserId={members[0]!.id}
        members={members}
        invitations={[
          {
            id: "00000000-0000-4000-8000-000000000003",
            email: "teammate@example.com",
            role: "member",
            createdAt: "2026-01-02T12:00:00.000Z",
            expiresAt: "2026-01-03T12:00:00.000Z",
          },
        ]}
      />,
    );

    expect(screen.getByText("1 member")).toBeVisible();
    expect(screen.getByText("1 pending")).toBeVisible();
    expect(screen.getByText("Expired")).toBeVisible();
    expect(
      screen.getByRole("button", {
        name: "Resend invitation to teammate@example.com",
      }),
    ).toBeEnabled();
    expect(
      screen.getByRole("button", {
        name: "Revoke invitation to teammate@example.com",
      }),
    ).toBeEnabled();
  });
});
