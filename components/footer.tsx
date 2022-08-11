import React from "react";
import Image from "next/image";
import { Box, IconButton } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";

export default function StyledFooter() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px 0",
        backgroundColor: (t) => t.palette.primary.main,
        width: "100%",
        gap: "10px",
      }}
    >
      <div id="f_link">
        <IconButton color="inherit" href="https://github.com/kakomimasu">
          <GitHubIcon />
        </IconButton>
      </div>
      <div>
        <a href="https://deno.land/">
          {
            <Image
              src="https://img.shields.io/badge/-deno-161E2E.svg?logo=deno&style=flat"
              alt="badge"
              width={60}
              height={24}
            />
          }
        </a>
      </div>
      <Box
        sx={{
          "& a": {
            textDecoration: "none",
            color: "black",
            display: "inline-block",
          },
          "& a:active": {
            color: "black",
          },
        }}
      >
        <a href="https://codeforkosen.github.io/">CC BY Code for KOSEN</a>
      </Box>
    </Box>
  );
}
