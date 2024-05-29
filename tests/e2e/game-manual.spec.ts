import { test, expect } from "@playwright/test";

test("手動対戦が正しく実行できるかの確認", async ({ page, browserName }) => {
  test.skip(
    browserName === "webkit",
    "PlaywrightのWebkitはnavigator.getGamepadsが未実装？のため。理想的には未実装の場合でも動作してほしい"
  );

  const startButton = page.getByRole("button", { name: "参加する" });
  const stopButton = page.getByRole("button", { name: "参加をやめる" });
  const gameDetailButton = page.getByRole("link", { name: "ゲーム詳細へ" });

  // 手動対戦ページに遷移
  await page.goto("/game/manual");

  // AI戦にして実行をクリック
  await page.getByRole("tab", { name: "対AI戦" }).click();

  await startButton.click();

  await expect(startButton, "実行ボタンは無効になっている").toBeDisabled();
  await expect(stopButton, "停止ボタンは有効になっている").toBeEnabled();
  await expect(
    gameDetailButton,
    "ゲーム詳細に行くボタンは有効になっている"
  ).toBeEnabled();

  // スクリプトの停止
  stopButton.click();
  await expect(startButton, "実行ボタンは有効になっている").toBeEnabled();
  await expect(
    gameDetailButton,
    "ゲーム詳細に行くボタンは無効になっている"
  ).toBeDisabled();
});
