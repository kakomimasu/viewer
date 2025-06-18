export * from "@kakomimasu/client-js";
import { ApiClient } from "@kakomimasu/client-js";

export type StreamMatchesReq = {
  q: string;
  startIndex?: number;
  endIndex?: number;
  allowNewGame?: boolean;
};

let envApiHost;
if (typeof window === "undefined") {
  envApiHost = process.env.SSR_APISERVER_HOST;
} else {
  envApiHost = process.env.NEXT_PUBLIC_APISERVER_HOST;
}
if (!envApiHost) throw Error("envApiHost is not defined");

export const host: URL = new URL(envApiHost);
export const apiClient = new ApiClient({ baseUrl: new URL("v1", host).href });
