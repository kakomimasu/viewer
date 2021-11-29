import { useEffect, useState } from "react";
import Head from "next/head";
import type { AppProps } from "next/app";

import CssBaseline from "@mui/material/CssBaseline";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import { ThemeProvider, styled } from "@mui/material/styles";
import { CacheProvider, EmotionCache } from "@emotion/react";

import Footer from "../components/footer";
import Heater from "../components/header";

import theme from "../src/theme";
import createEmotionCache from "../src/createEmotionCache";
import { host } from "../src/apiClient";

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
  const [apiFailBar, setApiFailBar] = useState(false);

  useEffect(() => {
    apiCheck();
    async function apiCheck() {
      try {
        const res = await fetch(`${host}v1/tournament/get`);
        //console.log("apiCheck", res);
        setApiFailBar(false);
      } catch (e) {
        //console.log(e);
        setApiFailBar(true);
      }
    }
  }, []);

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
        <Snackbar open={apiFailBar} autoHideDuration={6000}>
          <Alert
            variant="filled"
            severity="error"
            sx={{ width: "100%" }}
            onClose={() => {
              setApiFailBar(false);
            }}
          >
            <AlertTitle>APIサーバに接続できません</AlertTitle>
            しばらくしてからリロードし、それでも直らない場合は管理者までご連絡ください。
          </Alert>
        </Snackbar>
      </ThemeProvider>
    </CacheProvider>
  );
}
export default MyApp;
