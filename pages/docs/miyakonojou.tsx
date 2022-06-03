import { RedocStandalone } from 'redoc';

export default function Index() {
  return (
    <RedocStandalone specUrl="/swagger/miyakonojou.json"/>
  );
}