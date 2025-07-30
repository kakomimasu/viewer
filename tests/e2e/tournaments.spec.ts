import { test, expect } from "@playwright/test";
import { ApiClient } from "@kakomimasu/client-js";
import { tournamentDummyData } from "../utils";

export const apiClient = new ApiClient({ baseUrl: "http://localhost:8880/v1" });

test("トーナメントページの遷移を確認", async ({ page }) => {
  const tournament = await apiClient.createTournament(tournamentDummyData(1));

  // 大会一覧ページに遷移
  await page.goto("/tournament");

  const createdCard = page
    .locator(".MuiCardContent-root", {
      hasText: tournament.name,
    })
    .first();
  createdCard.click();

  // 大会詳細ページに遷移したかの確認
  await expect(page.getByRole("heading", { name: "大会詳細" })).toBeVisible();

  await apiClient.deleteTournament(tournament.id, {});
});

test("大会が正常に作成出来ているかの確認", async ({ page }) => {
  // 大会一覧ページに遷移
  await page.goto("/tournament");

  const createButton = page.getByRole("button", { name: "ゲーム作成！" });

  // 大会作成ページに遷移
  await page.getByRole("link", { name: "大会作成はこちらから" }).click();

  await expect(createButton, "大会作成ボタンが無効になっている").toBeDisabled();

  // 大会名を入力
  await page.getByRole("textbox", { name: "大会名" }).fill("ここは大会名");

  await expect(createButton, "大会作成ボタンが有効になっている").toBeEnabled();

  // 主催を入力
  await page.getByRole("textbox", { name: "主催" }).fill("ここは主催");

  // 備考を入力
  await page.getByRole("textbox", { name: "備考" }).fill("ここは備考");

  // ゲーム作成
  await page.getByRole("button", { name: "ゲーム作成！" }).click();

  // 作成されたカードのチェックとクリック
  const createdCard = page.locator(".MuiCardContent-root", {
    hasText: "ここは大会名",
  });
  await expect(createdCard).toBeVisible();

  createdCard.click();

  // 大会詳細ページに遷移したかの確認
  await expect(page.getByRole("heading", { name: "大会詳細" })).toBeVisible();

  // データ削除のためIDを取得
  const tournamentId = await page
    .locator("div>div", {
      hasText:
        /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
    })
    .last()
    .innerText();

  await apiClient.deleteTournament(tournamentId, {});
});
