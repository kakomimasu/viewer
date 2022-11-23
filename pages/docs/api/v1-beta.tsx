import { RedocStandalone } from "redoc";

export default function Index() {
  return (
    <RedocStandalone specUrl="https://api.kakomimasu.com/v1/openapi.json" />
  );
}
