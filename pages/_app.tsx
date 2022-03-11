import { useEffect, useState } from "react";
import Head from "next/head";
import type { AppProps } from "next/app";

import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import { ThemeProvider, styled } from "@mui/material/styles";
import { CacheProvider, EmotionCache } from "@emotion/react";

import Footer from "../components/footer";
import Header from "../components/header";

import theme from "../src/theme";
import createEmotionCache from "../src/createEmotionCache";
import { host } from "../src/apiClient";

const clientSideEmotionCache = createEmotionCache();

const Main = styled("main")({
  flexGrow: 1,
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
        const res = await fetch(`${host}version`);
        // console.log("apiCheck", res, await res.text());
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
        <Header />
        <Main>
          <Component {...pageProps} />
        </Main>
        <Footer />
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
