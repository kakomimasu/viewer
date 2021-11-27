import React from "react";
import { NextPage } from "next";

import Content from "../../../components/content";
import V1Docs from "../../../components/apiv1Docs";

const Index: NextPage<{ text: string }> = ({ text }) => {
  return (
    <Content title="Data Dictionary">
      <V1Docs text={text} />
    </Content>
  );
};
Index.getInitialProps = async () => {
  const res = await fetch(
    "https://raw.githubusercontent.com/kakomimasu/server/v1.0.0-beta.4/v1/docs/data.md"
  );
  const text = await res.text();
  //console.log(text);
  return { text: text.split("\n").slice(2).join("\n") };
};

export default Index;
