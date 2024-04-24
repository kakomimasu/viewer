import { test, expect } from "next/experimental/testmode/playwright";

test("/", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveScreenshot({ fullPage: true });
});

test("status:404", async ({ page }) => {
  await page.goto("/dummy");
  await expect(page).toHaveScreenshot({ fullPage: true });
});

test("/rule", async ({ page }) => {
  await page.goto("/rule");
  await expect(page).toHaveScreenshot({ fullPage: true });
});
