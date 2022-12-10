export * from "@kakomimasu/client-js";
import ApiClient from "@kakomimasu/client-js";

export type StreamMatchesReq = {
  q: string;
  startIndex?: number;
  endIndex?: number;
  allowNewGame?: boolean;
};

let envApiHost;

if (typeof window !== "undefined") {
  envApiHost =
    process.env.SSR_APISERVER_HOST ||
    process.env.NEXT_PUBLIC_APISERVER_HOST ||
    "https://api.kakomimasu.com";
} else {
  envApiHost =
    process.env.NEXT_PUBLIC_APISERVER_HOST || "https://api.kakomimasu.com";
}

console.log("envApiHost", envApiHost);

export const host: URL = new URL(envApiHost);

export const apiClient = new ApiClient(host);
