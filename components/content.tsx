import React from "react";
import Head from "next/head";
import { Box } from "@mui/material";

type Props = {
  title: string;
};

const Content: React.FC<Props> = (props) => {
  return (
    <Box
      sx={{
        width: "90%",
        maxWidth: "1000px",
        padding: "3em 0",
        margin: "0 auto",
      }}
    >
      <Head>
        <title>{props.title} - 囲みマス</title>
      </Head>
      <h1>{props.title}</h1>
      {props.children}
    </Box>
  );
};

export default Content;
