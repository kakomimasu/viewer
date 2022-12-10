import { RedocStandalone } from "redoc";

import { host } from "../../../src/apiClient";

export default function Index() {
  return (
    <RedocStandalone specUrl={new URL("/miyakonojo/openapi.json", host).href} />
  );
}
