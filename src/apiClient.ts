import ApiClient from "@kakomimasu/client-js";
export * from "@kakomimasu/client-js";

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

export const host: URL = new URL(envApiHost);

export const apiClient = new ApiClient(host);
