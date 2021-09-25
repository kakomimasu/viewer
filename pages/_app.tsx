import Head from "next/head";
import type { AppProps } from "next/app";

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, styled } from "@mui/material/styles";
import { CacheProvider, EmotionCache } from "@emotion/react";

import Footer from "../components/footer";
import Heater from "../components/header";

import theme from "../src/theme";
import createEmotionCache from "../src/createEmotionCache";

const clientSideEmotionCache = createEmotionCache();

const Body = styled("div")({
  display: "flex",
  flexDirection: "column",
  height: "100%",
});

const Main = styled("div")({
  flexGrow: 1,
  width: "90%",
  maxWidth: "1000px",
  padding: "3em 0",
  margin: "0 auto",
});

function MyApp({
  Component,
  pageProps,
  emotionCache = clientSideEmotionCache,
}: AppProps & {
  emotionCache?: EmotionCache;
}) {
  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>囲みマス</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Body>
          {<Heater />}
          <Main>
            <Component {...pageProps} />
          </Main>
          <Footer />
        </Body>
      </ThemeProvider>
    </CacheProvider>
  );
}
export default MyApp;
