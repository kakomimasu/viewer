import { test, expect } from "next/experimental/testmode/playwright";
import { tournamentDummyData } from "../utils";

test("/tournament", async ({ page, next }) => {
  next.onFetch((req) => {
    if (
      req.method === "GET" &&
      req.url === `http://localhost:8880/v1/tournaments`
    ) {
      const tournaments = [1, 2, 3, 4].map((i) => tournamentDummyData(i));
      return Response.json(tournaments);
    }
    return "continue";
  });

  await page.goto(`/tournament`);
  await expect(page).toHaveScreenshot({ fullPage: true });
});

test("/tournament/detail/:id", async ({ page, next }) => {
  next.onFetch((req) => {
    if (
      req.method === "GET" &&
      req.url === `http://localhost:8880/v1/tournaments/1`
    ) {
      return Response.json(tournamentDummyData(1));
    }
    return "continue";
  });

  await page.goto(`/tournament/detail/1`);
  await expect(page).toHaveScreenshot({ fullPage: true });
});

test("/tournament/create", async ({ page }) => {
  await page.goto(`/tournament/create`);
  await expect(page).toHaveScreenshot({ fullPage: true });
});
