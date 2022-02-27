import React from "react";
import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";

import Link from "../../src/link";
import Content from "../../components/content";

const StyledDiv = styled("div")({
  display: "flex",
  flexDirection: "row",
  fiex: "1 1 auto",
  width: "100%",
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
      <CardActionArea
        component={Link}
        href={href}
        noLinkStyle
        sx={{ height: "100%" }}
      >
        <CardContent>
          <h2>{title}</h2>
          <p style={{ color: "gray" }}>{explain}</p>
        </CardContent>
      </CardActionArea>
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
        <DocCard
          href="/docs/tutorial"
          title="チュートリアル"
          explain="ローカルサーバの立て方などを紹介します。"
        />
      </StyledDiv>
    </Content>
  );
}
