import { RedocStandalone } from "redoc";

export default function Index() {
  return (
    <RedocStandalone specUrl="https://api.kakomimasu.com/miyakonojo/openapi.json" />
  );
}
