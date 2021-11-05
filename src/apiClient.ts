import ApiClient from "@kakomimasu/client-js";
export * from "@kakomimasu/client-js";

const envApiHost =
  process.env.NEXT_PUBLIC_APISERVER_HOST || "https://api.kakomimasu.com";

export const host: URL = new URL(envApiHost);

export const apiClient = new ApiClient(host);
