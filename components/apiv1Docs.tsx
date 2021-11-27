import React from "react";
import Head from "next/head";
import { styled } from "@mui/material/styles";
import { marked } from "marked";
import highlightjs from "highlight.js";

const renderer = new marked.Renderer();
renderer.link = (href, title, text) => {
  console.log(href, title, text);
  let h = href?.split("/").at(-1)?.replace(".md", "") || "";
  const hSplit = h.split("#");
  hSplit[1] = hSplit[1]?.toLowerCase();
  h = hSplit.join("#");
  if (h.startsWith("#")) return `<a href=${h}>${text}</a>`;
  //console.log(h);
  return `<a href=/docs/apiv1/${h}>${text}</a>`;
};

marked.setOptions({
  langPrefix: "",
  highlight: function (code, lang) {
    return highlightjs.highlightAuto(code, [lang]).value;
  },
  renderer,
  gfm: true,
});

const StyledDiv = styled("div")(({ theme }) => {
  return {
    table: {
      borderCollapse: "collapse",
    },
    "table th,& table td": {
      padding: "3px 10px",
      border: "1px solid gray",
    },
    "table th": {
      backgroundColor: theme.palette.secondary.light,
    },
    "table tr:nth-child(odd)": {
      backgroundColor: "#eee",
    },
    code: {
      fontFamily: `Consolas, Menlo, Monaco`,
    },
    pre: {
      backgroundColor: "#353535",
      padding: "10px",
      color: "white",
      fontSize: "0.8em",
    },
  };
});

export default function Page({ text }: { text: string }) {
  return (
    <>
      <Head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.3.1/styles/monokai-sublime.min.css"
        />
      </Head>
      <StyledDiv dangerouslySetInnerHTML={{ __html: marked(text) }} />
    </>
  );
}
