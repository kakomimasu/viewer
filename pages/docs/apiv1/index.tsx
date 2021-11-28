import React from "react";
import { NextPage } from "next";

import Content from "../../../components/content";
import V1Docs from "../../../components/apiv1Docs";

const Index: NextPage<{ text: string }> = ({ text }) => {
  return (
    <Content title="囲みマス API v1">
      <V1Docs text={text} />
    </Content>
  );
};
Index.getInitialProps = async () => {
  const res = await fetch(
    "https://raw.githubusercontent.com/kakomimasu/server/main/v1/docs/index.md"
  );
  const text = await res.text();
  //console.log(text.slice(5));
  return { text: text.split("\n").slice(2).join("\n") };
};

export default Index;
