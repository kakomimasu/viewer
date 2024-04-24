import { test, expect } from "@playwright/test";

test("Playgroundが正常に動作するかの確認", async ({ page }) => {
  const startButton = page.getByRole("button", { name: "実行" });
  const stopButton = page.getByRole("button", { name: "停止" });

  // トップページに遷移
  await page.goto("/game/playground");

  // AI戦にして実行をクリック
  await page.getByRole("tab", { name: "対AI戦" }).click();
  await startButton.click();

  await expect(startButton, "実行ボタンは無効になっている").toBeDisabled();
  await expect(stopButton, "停止ボタンは有効になっている").toBeEnabled();
  await expect(
    page.getByRole("link", { name: "ゲーム詳細へ" }),
    "ゲーム詳細に行くボタンは有効になっている"
  ).toBeEnabled();

  // スクリプトの停止
  stopButton.click();
  await expect(startButton, "実行ボタンは有効になっている").toBeEnabled();
  await expect(
    page.getByRole("button", { name: "ゲーム詳細へ" }),
    "ゲーム詳細に行くボタンは無効になっている"
  ).toBeDisabled();
});
