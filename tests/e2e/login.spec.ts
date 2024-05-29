import { test, expect } from "@playwright/test";

test("ログイン時にGitHubのページに遷移するかの確認", async ({ page }) => {
  // トップページに遷移
  await page.goto("/");

  // リンクをクリック
  await page.getByRole("link", { name: /LOGIN/i }).click();

  // 遷移を確認
  await expect(page, "GitHubログインページへ遷移する").toHaveURL(
    /^https:\/\/github.com\/login/
  );
});
