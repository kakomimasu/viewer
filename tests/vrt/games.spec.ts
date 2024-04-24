import { test, expect } from "next/experimental/testmode/playwright";
import { gameDummySSEData } from "../utils";

test("/game", async ({ page, next }) => {
  next.onFetch((req) => {
    if (
      req.method === "GET" &&
      req.url.match(new RegExp("^http://localhost:8880/v1/matches"))
    ) {
      const initialData = `event: message\ndata: ${JSON.stringify(
        gameDummySSEData
      )}\n\n`;
      const encoder = new TextEncoder();

      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(initialData));
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
        },
      });
    }
    return "continue";
  });

  await page.goto(`/game`);

  // gameBoardがリサイズ中になることがあるためタイムアウト
  await page.waitForTimeout(500);

  await expect(page).toHaveScreenshot({ fullPage: true });
});

test("/game/create", async ({ page }) => {
  await page.goto(`/game/create`);
  await expect(page).toHaveScreenshot({ fullPage: true });
});

test("/game/manual", async ({ page, browserName }) => {
  test.skip(
    browserName === "webkit",
    "PlaywrightのWebkitはnavigator.getGamepadsが未実装？のため。理想的には未実装の場合でも動作してほしい"
  );

  await page.goto(`/game/manual`);

  // 対AI戦にする（フリーマッチだと参加待ちのゲームがあると表示されてしまうため）
  await page.getByRole("tab", { name: "対AI戦" }).click();

  await expect(page).toHaveScreenshot({ fullPage: true });
});

test("/game/playground", async ({ page }) => {
  await page.goto(`/game/playground`);

  // monacoエディタがloadingになることがあるためタイムアウト
  await page.waitForTimeout(500);

  // 対AI戦にする（フリーマッチだと参加待ちのゲームがあると表示されてしまうため）
  await page.getByRole("tab", { name: "対AI戦" }).click();

  await expect(page).toHaveScreenshot({ fullPage: true });
});
