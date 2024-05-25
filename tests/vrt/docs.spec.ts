import { resolve } from "path";
import { readFileSync } from "fs";
import {
  test,
  expect,
  NextFixture,
} from "next/experimental/testmode/playwright";
import ApiClient from "@kakomimasu/client-js";

// import openApi from "./dummy-data/openapi.json" with {type: "json"};

export const apiClient = new ApiClient("http://localhost:8880");

const openapi = JSON.parse(
  readFileSync(resolve(__dirname, "./dummy-data/openapi.json"), {
    encoding: "utf-8",
  })
);

const mockGetOpenapi = (next: NextFixture, path: string) => {
  next.onFetch((req) => {
    if (req.method === "GET" && req.url === `http://localhost:8880${path}`) {
      return Response.json(openapi);
    }
    return "continue";
  });
};

test.beforeEach(async ({ page }) => {
  await page.waitForFunction(() => document.fonts.ready);
});

test("/docs", async ({ page }) => {
  await page.goto("/docs");

  await expect(page).toHaveScreenshot({ fullPage: true });
});

test("/docs/api/v1", async ({ page, next }) => {
  mockGetOpenapi(next, "/v1/openapi.json");

  await page.goto("/docs/api/v1");

  // Redoclyのレンダリング中になることがあるためタイムアウト
  await page.waitForTimeout(1000);

  await expect(page).toHaveScreenshot({ fullPage: true });
});

test("/docs/api/tomakomai", async ({ page, next }) => {
  mockGetOpenapi(next, "/tomakomai/openapi.json");

  await page.goto("/docs/api/tomakomai");

  // Redoclyのレンダリング中になることがあるためタイムアウト
  await page.waitForTimeout(1000);

  await expect(page).toHaveScreenshot({ fullPage: true });
});

test("/docs/api/miyakonojo", async ({ page, next }) => {
  mockGetOpenapi(next, "/miyakonojo/openapi.json");

  await page.goto("/docs/api/miyakonojo");

  // Redoclyのレンダリング中になることがあるためタイムアウト
  await page.waitForTimeout(1000);

  await expect(page).toHaveScreenshot({ fullPage: true });
});

test("/docs/tutorial", async ({ page }) => {
  await page.goto("/docs/tutorial");
  await expect(page).toHaveScreenshot({ fullPage: true });
});

test("/docs/tutorial/docker-compose", async ({ page }) => {
  await page.goto("/docs/tutorial/docker-compose");
  await expect(page).toHaveScreenshot({ fullPage: true });
});
