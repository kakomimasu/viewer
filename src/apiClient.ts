import ApiClient from "client-js";
export * from "client-js";

export const host = process.env.NEXT_PUBLIC_HOST;

let protocol: string
if (host === "localhost" || host?.startsWith("localhost:")) {
  protocol = "http:";
} else {
  protocol = "https:";
}
export const apiClient = new ApiClient(protocol + "//" + host);
