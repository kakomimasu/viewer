import ApiClient from "client-js";
export * from "client-js";

export const host = "localhost:8880";

export const apiClient = new ApiClient("http://" + host);
