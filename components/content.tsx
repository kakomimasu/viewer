import React from "react";
import Head from "next/head";

type Props = {
  children?: React.ReactNode;
  title: string;
};

const Content: React.FC<Props> = (props) => {
  return (
    <>
      <Head>
        <title>{props.title} - 囲みマス</title>
      </Head>
      <h1>{props.title}</h1>
      {props.children}
    </>
  );
};

export default Content;
