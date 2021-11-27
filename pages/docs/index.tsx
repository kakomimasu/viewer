import React, { useEffect, useState } from "react";
import Link from "next/link";
import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import ReactMarkdown from "react-markdown";

import Content from "../../components/content";
import Section, { SubSection } from "../../components/section";

const StyledDiv = styled("div")({
  display: "flex",
  flexDirection: "row",
  fiex: "1 1 auto",
  width: "100%",
});

const StyledMarkdown = styled(ReactMarkdown)({
  "& img": {
    maxWidth: "90%",
    maxHeight: "400px",
    display: "block",
    margin: "0 auto",
  },
});

function DocCard({
  title,
  explain,
  href,
}: {
  href: string;
  title: string;
  explain: string;
}) {
  return (
    <Card
      elevation={4}
      sx={{
        width: "370px",
        height: "200px",
        margin: "1em",
      }}
    >
      <Link href={href} passHref>
        <CardActionArea sx={{ height: "100%" }}>
          <CardContent>
            <h2>{title}</h2>
            <p style={{ color: "gray" }}>{explain}</p>
          </CardContent>
        </CardActionArea>
      </Link>
    </Card>
  );
}

export default function Index() {
  return (
    <Content title="ドキュメント">
      <StyledDiv>
        <DocCard
          href="/rule"
          title="公式ルール"
          explain="囲みマス公式のルールです。"
        />
        <DocCard
          href="/docs/apiv1"
          title="囲みマス API v1"
          explain="囲みマス API v1を利用すると、任意のクライアントからゲーム作成・参加、大会作成、ユーザ取得などを行うことが出来ます。"
        />
      </StyledDiv>
      {/*<StyledMarkdown>{markdown}</StyledMarkdown>*/}
    </Content>
  );
}
