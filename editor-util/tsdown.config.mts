import path from "node:path";
import { defineConfig } from "tsdown";

export default defineConfig({
  entry: [path.join(process.cwd(), "editor-util/client.ts")],
  dts: { resolver: "tsc" },
  platform: "browser",
  minify: true,
  inlineOnly: ["@kakomimasu/client-js"],
  noExternal: ["@kakomimasu/client-js"],
});
