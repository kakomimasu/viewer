import { test, expect } from "@playwright/test";

test("ゲーム作成が正しくできるかの確認", async ({ page }) => {
  await page.goto("/game/create");

  const createButton = page.getByRole("button", { name: /^ゲーム作成！$/ });
  const myCreateButton = page.getByRole("button", {
    name: /^マイゲーム作成！$/,
  });

  await expect(
    createButton,
    "ゲーム作成ボタンは無効になっている",
  ).toBeDisabled();
  await expect(
    myCreateButton,
    "マイゲーム作成ボタンは無効になっている",
  ).toBeDisabled();

  // ゲーム名を入力
  await page.getByRole("textbox", { name: "ゲーム名" }).fill("test");

  // 使用ボードを入力
  await page.getByLabel("使用ボード").click();
  await page.getByRole("option", { name: "A-1" }).click();

  await expect(
    createButton,
    "ゲーム作成ボタンは有効になっている",
  ).toBeEnabled();
  await expect(
    page.getByText("ボードプレビュー"),
    "ボードプレビューが表示されている",
  ).toBeEnabled();

  // プレイヤー数を入力
  await page.getByLabel("プレイヤー数").click();
  await page.getByRole("option", { name: "2" }).click();

  await expect(
    myCreateButton,
    "マイゲーム作成ボタンは無効になっている",
  ).toBeDisabled();

  await createButton.click();

  await expect(page.getByRole("cell", { name: "test" })).toBeVisible();
});
