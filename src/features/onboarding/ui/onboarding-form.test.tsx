import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { OnboardingForm } from "./onboarding-form";

vi.mock("../api/actions", () => ({
  completeOnboardingAction: vi.fn(),
}));

describe("OnboardingForm", () => {
  it("keeps setup focused with useful hints and next steps", () => {
    render(<OnboardingForm defaultDisplayName="Ank" />);

    expect(screen.getByLabelText("Your name")).toHaveValue("Ank");
    expect(
      screen.getByText("This is how teammates will see you."),
    ).toBeVisible();
    expect(screen.getByLabelText("Workspace name")).toHaveAttribute(
      "placeholder",
      "Northstar Studio",
    );
    expect(
      screen.getByText("Use a team, company, or initiative name.", {
        exact: false,
      }),
    ).toBeVisible();

    expect(
      screen.getByRole("heading", { name: "What happens next" }),
    ).toBeVisible();
    expect(
      screen.getByText(
        "Relay opens your dashboard with a short launch checklist.",
      ),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Create workspace" }),
    ).toBeEnabled();
  });

  it("offers workspace name examples without forcing a choice", () => {
    const { container } = render(<OnboardingForm defaultDisplayName="" />);

    expect(screen.getByLabelText("Workspace name")).toHaveAttribute(
      "list",
      "workspace-name-examples",
    );
    expect(
      Array.from(
        container.querySelectorAll<HTMLOptionElement>(
          "#workspace-name-examples option",
        ),
      ).map((option) => option.value),
    ).toEqual(["Northstar Studio", "Acme Product", "Launch Team"]);
  });
});
