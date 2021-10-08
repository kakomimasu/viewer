import ApiClient from "client-js";
export * from "client-js";

export const host = "api.kakomimasu.com";

export const apiClient = new ApiClient("https://" + host);
