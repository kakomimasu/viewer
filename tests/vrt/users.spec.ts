import { test, expect } from "next/experimental/testmode/playwright";
import { User } from "@kakomimasu/client-js";

test.beforeEach(async ({ page }) => {
  await page.waitForFunction(() => document.fonts.ready);
});

test("/user/detail/:id", async ({ page, next }) => {
  const id = "1";

  next.onFetch((req) => {
    if (req.url === `http://localhost:8880/v1/users/${id}`) {
      const user: User = {
        id,
        name: "ここはname",
        screenName: "ここはscreen name",
        avaterUrl: "https://placehold.jp/3d4070/ffffff/150x150.png?text=icon",
        gameIds: [],
      };
      return Response.json(user);
    }
    return "continue";
  });

  await page.goto(`/user/detail/${id}`);
  await expect(page).toHaveScreenshot({ fullPage: true });
});
