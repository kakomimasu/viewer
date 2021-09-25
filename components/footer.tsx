import React from "react";
import { styled } from "@mui/material/styles";

const Footer = styled("footer")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "20px 0",
  backgroundColor: theme.palette.primary.main,
  width: "100%",
  "& a": {
    textDecoration: "none",
    color: "black",
    display: "inline-block",
  },
  "& a:active": {
    color: "black",
  },
}));

const Div = styled("div")({
  margin: "5px 0",
});

const Img = styled("img")({ height: "1.5em" });

export default function StyledFooter() {
  return (
    <Footer>
      <Div id="f_link">
        <a href="https://github.com/codeforkosen/Kakomimasu">
          <Img src="/img/GitHub-Mark-64px.png" />
        </a>
      </Div>
      <Div>
        <a href="https://deno.land/">
          <img src="https://img.shields.io/badge/-deno-161E2E.svg?logo=deno&style=flat" />
        </a>
      </Div>
      <Div>
        <a href="https://codeforkosen.github.io/">CC BY Code for KOSEN</a>
      </Div>
    </Footer>
  );
}
