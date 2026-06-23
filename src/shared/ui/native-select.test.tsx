import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NativeSelect } from "./native-select";

describe("NativeSelect", () => {
  it("keeps room for the decorative chevron", () => {
    render(
      <NativeSelect aria-label="Role" defaultValue="member">
        <option value="member">Member</option>
        <option value="admin">Admin</option>
      </NativeSelect>,
    );

    expect(screen.getByRole("combobox", { name: "Role" })).toHaveClass("pr-10");
  });
});
