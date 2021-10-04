import ApiClient from "client-js";
export * from "client-js";

export const host = process.env.NEXT_PUBLIC_HOST;

export const apiClient = new ApiClient(window.location.protocol + "//" + host);

