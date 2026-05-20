import {
  Html,
  Head,
  Main,
  NextScript,
  DocumentProps,
  DocumentContext,
} from "next/document";
import { Box, CssBaseline } from "@mui/material";
import {
  DocumentHeadTags,
  DocumentHeadTagsProps,
  documentGetInitialProps,
} from "@mui/material-nextjs/v16-pagesRouter";

import theme from "../src/theme";

export default function MyDocument(
  props: DocumentProps & DocumentHeadTagsProps,
) {
  return (
    <Html lang="ja" style={{ height: "100%" }}>
      <Head>
        {/* PWA primary color */}
        <meta name="theme-color" content={theme.palette.primary.main} />

        <DocumentHeadTags {...props} />

        <link rel="icon" type="image/png" href="/img/kakomimasu-icon.png" />
        <link rel="apple-touch-icon" href="/img/kakomimasu-icon.png" />

        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
        />
      </Head>
      <Box
        component="body"
        sx={{
          height: "100%",
          "& #__next": {
            height: "100%",
            display: "flex",
            flexDirection: "column",
          },
          fontFamily:
            "Roboto,Helvetica,Noto Sans,Droid Sans,Hiragino Kaku Gothic ProN,Hiragino Sans,Meiryo,Arial Unicode MS,sans-serif",
        }}
      >
        <CssBaseline />
        <Main />
        <NextScript />
      </Box>
    </Html>
  );
}

MyDocument.getInitialProps = async (ctx: DocumentContext) => {
  const finalProps = await documentGetInitialProps(ctx);
  return finalProps;
};
