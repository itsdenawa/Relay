import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AccountSettingsForms } from "./account-settings-forms";

vi.mock("../api/actions", () => ({
  changePasswordAction: vi.fn(),
  deleteAccountAction: vi.fn(),
  removeAvatarAction: vi.fn(),
  updateAvatarAction: vi.fn(),
  updateProfileAction: vi.fn(),
}));

afterEach(cleanup);

describe("AccountSettingsForms", () => {
  it("explains password requirements before submission", () => {
    render(
      <AccountSettingsForms
        user={{
          displayName: "Ank Owner",
          email: "ank@example.com",
          avatarUrl: null,
        }}
        blockers={[]}
      >
        <div>Preferences</div>
      </AccountSettingsForms>,
    );

    expect(
      screen.getByText(
        "Use 8–72 characters and choose a password different from your current one.",
      ),
    ).toBeVisible();
    expect(screen.getByLabelText("New password")).toHaveAttribute(
      "aria-describedby",
      "new-password-hint",
    );
    expect(screen.getByLabelText("Display name")).toHaveValue("Ank Owner");
  });

  it("shows the selected avatar before enabling upload", async () => {
    const user = userEvent.setup();
    render(
      <AccountSettingsForms
        user={{
          displayName: "Ank Owner",
          email: "ank@example.com",
          avatarUrl: null,
        }}
        blockers={[]}
      >
        <div>Preferences</div>
      </AccountSettingsForms>,
    );

    const uploadButton = screen.getByRole("button", { name: "Upload avatar" });
    expect(screen.getByText("No image selected.")).toBeVisible();
    expect(uploadButton).toBeDisabled();

    await user.upload(
      screen.getByLabelText("Choose image"),
      new File(["avatar"], "relay-avatar.png", { type: "image/png" }),
    );

    expect(screen.getByText("relay-avatar.png")).toBeVisible();
    expect(uploadButton).toBeEnabled();
  });
});
