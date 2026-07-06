import { expect, test, type Page } from "@playwright/test";

import { seededUser } from "./fixtures";
import { signInSeededUser } from "./support/auth";

async function expectNoHorizontalOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    )
    .toBe(true);
}

test("renders the responsive dashboard shell", async ({ page }) => {
  await signInSeededUser(page);

  await expect(page).toHaveTitle("Relay");
  await expect(
    page.getByRole("heading", { name: "Good morning, Alex" }),
  ).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Mobile quick navigation" }),
  ).toBeHidden();
  await expect(page.getByText("Priority projects")).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("renders the public landing page for anonymous visitors", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page).toHaveURL("/");
  await expect(
    page.getByRole("heading", {
      name: "A calmer command center for focused teams.",
    }),
  ).toBeVisible();
  await expect(page.getByLabel("Relay product preview")).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Create your workspace/ }),
  ).toHaveAttribute("href", "/signup");
  await expect(
    page.getByRole("link", { name: "Sign in" }).first(),
  ).toHaveAttribute("href", "/login");
  await expectNoHorizontalOverflow(page);
});

for (const destination of [
  { label: "Projects", path: "projects", heading: "Projects" },
  { label: "Inbox", path: "inbox", heading: "Inbox" },
  { label: "Members", path: "members", heading: "Members" },
  { label: "Settings", path: "settings", heading: "Settings" },
] as const) {
  test(`keeps the current workspace screen visible while ${destination.label} loads`, async ({
    page,
  }) => {
    let releaseNavigation!: () => void;
    const navigationReleased = new Promise<void>((resolve) => {
      releaseNavigation = resolve;
    });
    let resolveRouteRequest!: () => void;
    const routeRequestStarted = new Promise<void>((resolve) => {
      resolveRouteRequest = resolve;
    });

    await page.route(
      `**/w/${seededUser.workspaceSlug}/${destination.path}**`,
      async (route) => {
        resolveRouteRequest();
        await navigationReleased;
        await route.continue();
      },
    );

    await signInSeededUser(page);
    await expect(
      page.getByRole("heading", { name: "Good morning, Alex" }),
    ).toBeVisible();

    await page
      .locator("aside")
      .getByRole("link", { name: destination.label, exact: true })
      .click();
    await routeRequestStarted;

    await expect(
      page.getByRole("status", { name: "Loading workspace" }),
    ).toHaveCount(0, { timeout: 500 });
    await expect(
      page.getByRole("heading", { name: "Good morning, Alex" }),
    ).toBeVisible();

    releaseNavigation();
    await expect(page).toHaveURL(
      `/w/${seededUser.workspaceSlug}/${destination.path}`,
    );
    await expect(
      page.getByRole("heading", { name: destination.heading, exact: true }),
    ).toBeVisible();
  });
}

test("changes and persists the selected theme", async ({ page }) => {
  await signInSeededUser(page);

  await page.getByRole("button", { name: "Choose theme" }).click();
  await page.getByRole("menuitem", { name: "Dark" }).click();

  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("opens commands from the command palette", async ({ page }) => {
  await signInSeededUser(page);

  await page.keyboard.press("ControlOrMeta+K");
  const palette = page.getByRole("dialog", { name: "Command palette" });
  await expect(palette).toBeVisible();
  await palette.getByLabel("Search commands").fill("settings");
  await palette.getByRole("button", { name: /Workspace settings/ }).click();
  await expect(page).toHaveURL(`/w/${seededUser.workspaceSlug}/settings`);
  await expect(
    page.getByRole("heading", { name: "Settings", exact: true }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Open command palette" }).click();
  const createPalette = page.getByRole("dialog", {
    name: "Command palette",
  });
  await createPalette.getByLabel("Search commands").fill("create project");
  await createPalette.getByRole("button", { name: /Create project/ }).click();
  await expect(page).toHaveURL(
    `/w/${seededUser.workspaceSlug}/projects?new=project`,
  );
  await expect(
    page.getByRole("dialog", { name: "Create project" }),
  ).toBeVisible();
});

test("uses compact desktop navigation at tablet width", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 900 });
  await signInSeededUser(page);

  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Open navigation" }),
  ).toBeHidden();
  await expect(
    page.getByRole("navigation", { name: "Mobile quick navigation" }),
  ).toBeHidden();
  await expectNoHorizontalOverflow(page);
});

test("opens the navigation drawer on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 780 });
  await signInSeededUser(page);

  await expect(page.getByRole("navigation", { name: "Primary" })).toBeHidden();
  await expect(
    page.getByRole("navigation", { name: "Mobile quick navigation" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Mobile primary" }),
  ).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("redirects authenticated root visits to the current workspace", async ({
  page,
}) => {
  await signInSeededUser(page);
  await page.goto("/");

  await expect(page).toHaveURL(`/w/${seededUser.workspaceSlug}`);
});
