import React from "react";
import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";

import Link from "../../../src/link";
import Content from "../../../components/content";

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
        minWidth: "400px",
        minHeight: "200px",
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
    <Content title="チュートリアル">
      <StyledDiv>
        <DocCard
          href="tutorial/docker-compose"
          title="docker-composeを用いたローカルサーバ構築"
          explain="docker-composeを用いてローカルで対戦可能なサーバを構築します。"
        />
      </StyledDiv>
    </Content>
  );
}
