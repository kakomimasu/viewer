import React from "react";
import { styled } from "@mui/material/styles";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

import Link from "../src/link";

const components: React.ComponentProps<typeof ReactMarkdown>["components"] = {
  a: ({ href, children }) => {
    let h = href?.split("/").at(-1)?.replace(".md", "") || "";
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
};

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
    "table tr:nth-of-type(2n)": {
      backgroundColor: "#eee",
    },
    code: {
      fontFamily: `Consolas, Menlo, Monaco`,
    },
    pre: {
      fontSize: "0.8em",
    },
  };
});

export default function Page({ text }: { text: string }) {
  return (
    <StyledDiv>
      <ReactMarkdown components={components} remarkPlugins={[remarkGfm]}>
        {text}
      </ReactMarkdown>
    </StyledDiv>
  );
}
