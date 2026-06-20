import { expect, test } from "@playwright/test";

test("renders the Relay foundation", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Relay");
  await expect(
    page.getByRole("heading", {
      name: "Work moves forward when the handoff is clear.",
    }),
  ).toBeVisible();
});
