import React from "react";
import { NextPage, GetStaticProps, GetStaticPaths } from "next";
import { Box } from "@mui/material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

import Content from "../../../components/content";
import Link from "../../../src/link";

const components: React.ComponentProps<typeof ReactMarkdown>["components"] = {
  a: ({ href, children }) => {
    let h = href?.split("/").slice(-1)[0]?.replace(".md", "") || "";
    const hSplit = h.split("#");
    if (hSplit[1]) hSplit[1] = hSplit[1].toLowerCase();
    h = hSplit.join("#");
    let linkHref;
    if (h.startsWith("#")) linkHref = h;
    else linkHref = `/docs/apiv1/${h}`;
    return (
      <Link href={linkHref} noLinkStyle>
        {children[0]}
      </Link>
    );
  },
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    const language = match ? match[1].toLowerCase() : "";
    return !inline ? (
      <SyntaxHighlighter style={a11yDark} language={language} PreTag="div">
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    ) : (
      <code>{children}</code>
    );
  },
  td: ({ children }) => (
    <td>{children.map((child) => (child === "<br>" ? <br /> : child))}</td>
  ),
  h2: (props) => {
    const text = props.children[0]?.toString().toLowerCase();
    return <h2 id={text} {...props} />;
  },
};

type Props = {
  text: string;
  title: string;
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [
      { params: { id: [] } },
      { params: { id: ["data"] } },
      { params: { id: ["error"] } },
      { params: { id: ["game_api"] } },
      { params: { id: ["match_api"] } },
      { params: { id: ["tournaments_api"] } },
      { params: { id: ["users_api"] } },
    ],
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<Props> = async (ctx) => {
  const id = ctx.params?.id as string[] | undefined;
  const fileName = id ? id[0] : "index";
  const res = await fetch(
    `https://api.github.com/repos/kakomimasu/server/contents/v1/docs/${fileName}.md`
  );
  const data = await res.json();
  const text = Buffer.from(data.content, "base64").toString();
  const match = text.match(/# (.*)\n/);
  const title = match ? match[1] : "";

  return {
    props: { text, title },
    revalidate: 60,
  };
};

const Index: NextPage<Props> = ({ text, title }) => {
  return (
    <Content title={title}>
      <Box
        component={ReactMarkdown}
        components={components}
        remarkPlugins={[remarkGfm]}
        disallowedElements={["h1"]}
        sx={{
          "& table": {
            borderCollapse: "collapse",
          },
          "& table th,& table td": {
            padding: "3px 10px",
            border: "1px solid gray",
          },
          "& table th": {
            backgroundColor: (t) => t.palette.secondary.light,
          },
          "& table tr:nth-of-type(2n)": {
            backgroundColor: "#eee",
          },
          "& code": {
            fontFamily: `Consolas, Menlo, Monaco`,
          },
          "& pre": {
            fontSize: "0.8em",
          },
        }}
      >
        {text}
      </Box>
    </Content>
  );
};

export default Index;
