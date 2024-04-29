import { test, expect } from "@playwright/test";

test("フィールド説明用エディタが正しく動作するかの確認", async ({
  page,
  isMobile,
}) => {
  test.fixme(
    isMobile,
    "フィールド説明用エディタはモバイルでは見切れてしまうため現在はスキップ"
  );

  await page.goto("/dev/field-editor");

  // 使用ボードを入力
  await page.getByLabel("使用ボード").click();
  await page.getByRole("option", { name: "A-1" }).click();

  const cell = page.locator("div[data-cell='0-0-0']");
  const box = await cell.boundingBox();
  // console.log(box);
  expect(box, "セルのBBoxを取得").toBeTruthy();
  if (box === null) return;

  await cell.click();
  await expect(cell, "青陣地の色になっている").toHaveCSS(
    "background-color",
    "rgb(128, 201, 255)"
  );

  await page.mouse.click(box.x + 25, box.y + 25);
  await expect(cell, "赤陣地の色になっている").toHaveCSS(
    "background-color",
    "rgb(254, 153, 152)"
  );

  await page.mouse.click(box.x + 25, box.y + 25);
  await expect(cell, "青壁の色になっている").toHaveCSS(
    "background-color",
    "rgb(0, 150, 255)"
  );

  await page.mouse.click(box.x + 25, box.y + 25, { button: "right" });
  await expect(
    page.locator("img[alt='agent player:0 n:0']"),
    "青忍者が出てきている"
  ).toBeVisible();

  await page.mouse.click(box.x + 25, box.y + 25);
  await expect(cell, "赤壁の色になっている").toHaveCSS(
    "background-color",
    "rgb(255, 2, 0)"
  );

  await page.mouse.click(box.x + 25, box.y + 25, { button: "right" });
  await expect(
    page.locator("img[alt='agent player:1 n:0']"),
    "赤忍者が出てきている"
  ).toBeVisible();
});
