import { expect, test } from "@playwright/test";

test("keeps public-route Core Web Vitals within regression budgets", async ({
  page,
}) => {
  await page.goto("/login");
  await expect(
    page.getByRole("heading", { name: "Sign in to Relay" }),
  ).toBeVisible();

  await page.waitForTimeout(1_000);

  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming;
    const paints = performance.getEntriesByType("paint");
    const firstContentfulPaint = paints.find(
      (entry) => entry.name === "first-contentful-paint",
    );

    return {
      firstContentfulPaint: firstContentfulPaint?.startTime ?? 0,
      timeToFirstByte: navigation.responseStart,
    };
  });

  expect(metrics.firstContentfulPaint).toBeGreaterThan(0);
  expect(metrics.firstContentfulPaint).toBeLessThan(2_500);
  expect(metrics.timeToFirstByte).toBeLessThan(800);
});
