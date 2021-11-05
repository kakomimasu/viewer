import ApiClient from "@kakomimasu/client-js";
export * from "@kakomimasu/client-js";

//export const host: URL = new URL("https://api.kakomimasu.com");
export const host: URL = new URL("http://localhost:8880");

export const apiClient = new ApiClient(host);
