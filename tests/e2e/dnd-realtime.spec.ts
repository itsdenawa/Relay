import { expect, test, type Browser, type Page } from "@playwright/test";

import { seededUser } from "./fixtures";
import { signInSeededUser } from "./support/auth";

async function createTask(page: Page, columnName: string, title: string) {
  const column = page.getByRole("article", { name: columnName });
  await column.getByRole("button", { name: "Add task" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Title").fill(title);
  await dialog.getByRole("button", { name: "Create task" }).click();
  await expect(page).toHaveURL(/created=/);
  await expect(
    page
      .getByRole("article", { name: columnName })
      .getByRole("article", { name: title }),
  ).toBeVisible();
}

async function keyboardMoveTaskToColumn(
  page: Page,
  taskTitle: string,
  targetAnnouncement: string | RegExp,
  keys: string[],
) {
  const handle = page.getByRole("button", { name: `Drag ${taskTitle}` });
  await handle.focus();
  await page.keyboard.press("Space");
  await expect(handle).toHaveAttribute("aria-pressed", "true");
  for (const key of keys) {
    await page.keyboard.press(key);
  }
  const status = page.getByRole("status").filter({
    hasText: targetAnnouncement,
  });
  await expect(status).toBeVisible();
  const announcement = (await status.textContent()) ?? "";
  await page.keyboard.press("Space");
  const column = announcement.match(/is over (?<column>.+?) column/)?.groups
    ?.column;
  if (!column) {
    throw new Error(`Could not parse target column from "${announcement}".`);
  }
  return column;
}

async function openObserver(browser: Browser, boardPath: string) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await signInSeededUser(page);
  await page.goto(boardPath);
  await expect(
    page
      .getByRole("region", { name: "Kanban board" })
      .getByLabel("Realtime status"),
  ).toContainText("Live updates");
  return { context, page };
}

test("supports accessible DnD, rollback, and cross-client realtime", async ({
  page,
  browser,
}, testInfo) => {
  test.slow();

  await signInSeededUser(page);
  await page.goto(`/w/${seededUser.workspaceSlug}/projects`);
  await page.getByRole("button", { name: "New project" }).first().click();
  await page
    .getByLabel("Project name")
    .fill(`Live Workflow ${testInfo.retry + 1}`);
  await page.getByLabel("Key").fill(`LIVE${testInfo.retry}`);
  await page.getByRole("button", { name: "Create project" }).click();
  await expect(page).toHaveURL(/\/board$/);
  const boardPath = new URL(page.url()).pathname;

  await createTask(page, "Backlog", "First realtime task");
  await createTask(page, "Backlog", "Second realtime task");
  await createTask(page, "Backlog", "Third realtime task");
  await expect(page.getByLabel("Realtime status")).toContainText(
    "Live updates",
  );

  await keyboardMoveTaskToColumn(
    page,
    "First realtime task",
    "is over In progress column",
    ["ArrowRight", "ArrowRight", "ArrowRight"],
  );

  await expect(
    page
      .getByRole("article", { name: "In progress" })
      .getByRole("article", { name: "First realtime task" }),
  ).toBeVisible();

  await page.route("**/rest/v1/rpc/move_task", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 350));
    await route.abort();
  });
  const rollbackColumn = await keyboardMoveTaskToColumn(
    page,
    "First realtime task",
    /is over (Review|Done) column/,
    ["ArrowRight", "ArrowRight", "ArrowRight"],
  );
  await expect(
    page
      .getByRole("article", { name: rollbackColumn })
      .getByRole("article", { name: "First realtime task" }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("article", { name: "In progress" })
      .getByRole("article", { name: "First realtime task" }),
  ).toBeVisible();
  await expect(page.getByText("Task move failed")).toBeVisible();
  await page.unroute("**/rest/v1/rpc/move_task");

  const movedColumn = await keyboardMoveTaskToColumn(
    page,
    "First realtime task",
    /is over (Review|Done) column/,
    ["ArrowRight", "ArrowRight", "ArrowRight"],
  );
  await expect(
    page
      .getByRole("article", { name: movedColumn })
      .getByRole("article", { name: "First realtime task" }),
  ).toBeVisible();

  const observer = await openObserver(browser, boardPath);
  try {
    await expect(
      observer.page
        .getByRole("article", { name: movedColumn })
        .getByRole("article", { name: "First realtime task" }),
    ).toBeVisible();

    const movedTask = page.getByRole("article", {
      name: "First realtime task",
    });
    await movedTask
      .getByLabel("Move First realtime task to")
      .selectOption({ label: "To do" });
    const moveResponse = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        Boolean(response.request().headers()["next-action"]),
    );
    await movedTask
      .getByRole("button", { name: "Move First realtime task" })
      .click();
    await moveResponse;
    await expect(
      page
        .getByRole("article", { name: "To do" })
        .getByRole("article", { name: "First realtime task" }),
    ).toBeVisible();

    await expect(
      observer.page
        .getByRole("article", { name: "To do" })
        .getByRole("article", { name: "First realtime task" }),
    ).toBeVisible({ timeout: 20_000 });
  } finally {
    await observer.context.close();
  }

  await page.context().setOffline(true);
  await expect(page.getByLabel("Realtime status")).toContainText(
    "Reconnecting",
  );
  await page.context().setOffline(false);
  await expect(page.getByLabel("Realtime status")).toContainText(
    "Live updates",
    { timeout: 20_000 },
  );
});
