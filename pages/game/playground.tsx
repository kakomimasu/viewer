import React, { useContext, useEffect, useRef, useState } from "react";
import { readFileSync } from "fs";
import { GetStaticProps, NextPage } from "next";
import { Box, Button, Paper } from "@mui/material";
import PlayCircleIcon from "@mui/icons-material/PlayCircleFilled";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import NotInterestedIcon from "@mui/icons-material/NotInterested";
import CancelIcon from "@mui/icons-material/Cancel";
import Editor, { OnMount } from "@monaco-editor/react";
import { ObjectInspector } from "react-inspector";
import glob from "glob";

import MatchTypeTab, { MatchType } from "../../components/matchTypeTab";
import { UserContext } from "../../src/userStore";

import { host, JoinMatchRes } from "../../src/apiClient";
import Link, { getGameHref } from "../../src/link";
import Head from "next/head";

type Props = {
  sampleCode: string;
  clientCode: string;
  definitionCode: string;
  clientJs: string[];
};
type Log =
  | { type: "log" | "error" | "info"; data: any[] }
  | { type: "match"; data: JoinMatchRes };

export const getStaticProps: GetStaticProps<Props> = async () => {
  const clientCode = readFileSync("editor-util/client.js", "utf-8");
  const sampleCode = readFileSync("editor-util/sample.js", "utf-8");
  const definitionCode = readFileSync("editor-util/client.d.ts", "utf-8");

  const paths = await glob(
    "node_modules/@kakomimasu/client-js/types/**/*.d.ts"
  );
  const clientJs = paths.map((path) => readFileSync(path, "utf-8"));
  return {
    props: { sampleCode, clientCode, definitionCode, clientJs },
  };
};

const Page: NextPage<Props> = ({
  sampleCode,
  clientCode,
  definitionCode,
  clientJs,
}) => {
  const { kkmmUser } = useContext(UserContext);

  const logRef = useRef<HTMLDivElement>(null);
  const [code, setCode] = useState<string>(sampleCode);
  const [log, setLog] = useState<Log[]>([]);
  const [worker, setWorker] = useState<Worker>();

  const [matchType, setMatchType] = useState<MatchType>();

  useEffect(() => {
    const func = () => {
      const codeArea = document.getElementById("code-area");
      if (!codeArea) return;
      const topY = codeArea.getBoundingClientRect().top;
      const bottomY = window.innerHeight;
      const boxHeight = bottomY - topY;

      codeArea.style.height = `${boxHeight}px`;
    };

    func();
    addEventListener("resize", func);

    return () => {
      removeEventListener("resize", func);
    };
  }, []);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTo(0, logRef.current.scrollHeight);
    }
  }, [log]);

  const stop = () => {
    if (worker) {
      setLog((prev) => [...prev, { type: "info", data: ["実行停止"] }]);
      worker.terminate();
      setWorker(undefined);
    }
  };

  const logDelete = () => {
    setLog([]);
  };

  const excute = () => {
    stop();

    const init = {
      bearerToken: kkmmUser?.bearerToken,
      apiHost: host.href,
      matchType,
    };

    const blob = new Blob(
      [
        // 必要なデータを挿入
        `const option=${JSON.stringify(init)};`,
        clientCode,
        code,
      ],
      {
        type: "text/javascript",
      }
    );

    const fr = new FileReader();
    fr.readAsDataURL(blob);
    fr.onload = () => {
      const url = fr.result;
      if (typeof url !== "string") return;

      const worker = new Worker(url, { type: "module" });
      worker.addEventListener("message", (event) => {
        setLog((prev) => [...prev, event.data]);
      });
      worker.addEventListener("error", (event) => {
        // setLog((prev) => [...prev, event.data]);
        console.error(event.error);
      });

      setWorker(worker);
    };

    setLog((prev) => [...prev, { type: "info", data: ["実行開始"] }]);
  };

  const monacoOnMount: OnMount = (_, monaco) => {
    // 型定義を追加
    const libs: { content: string }[] = [];
    clientJs.map((content) => {
      libs.push({
        content: `declare module "@kakomimasu/client-js" { ${content} }`,
      });
    });
    libs.push({ content: definitionCode });
    monaco.languages.typescript.javascriptDefaults.setExtraLibs(libs);
  };

  useEffect(() => {
    const transitionDialog = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", transitionDialog);
    return () => window.removeEventListener("beforeunload", transitionDialog);
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Head>
        <title>エディタ - 囲みマス</title>
      </Head>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          width: "100%",
          p: 1,
        }}
      >
        <Paper elevation={4} sx={{ p: 1, flexGrow: 1 }}>
          <MatchTypeTab disabled={false} onChange={setMatchType} />
        </Paper>
        <Paper
          elevation={4}
          sx={{
            p: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-around",
          }}
        >
          <Button
            startIcon={<PlayCircleIcon />}
            color="secondary"
            onClick={excute}
            disabled={worker !== undefined}
          >
            実行
          </Button>
          <Button
            startIcon={<StopCircleIcon />}
            color="error"
            onClick={stop}
            disabled={worker === undefined}
          >
            停止
          </Button>
          <Button
            startIcon={<NotInterestedIcon />}
            color="primary"
            onClick={logDelete}
          >
            ログ消去
          </Button>
        </Paper>
      </Box>
      <Box
        id="code-area"
        sx={{
          p: 1,
          width: "100%",
          display: "flex",
          gap: 1,
          "&>*": {
            border: "2px solid",
            borderColor: (t) => t.palette.divider,
            height: "100%",
            width: "50%",
          },
        }}
      >
        <Box>
          <Editor
            value={code}
            onChange={(text) => {
              setCode(text ?? "");
            }}
            onMount={monacoOnMount}
            language="javascript"
            options={{
              ariaLabel: "code",
            }}
          />
        </Box>
        <Box
          ref={logRef}
          sx={{
            overflowY: "auto",
            fontSize: "0.8rem",
            "&>*": {
              borderBottom: "solid 1px",
              borderColor: (t) => t.palette.divider,
              py: 0.2,
              px: 1,
            },
          }}
        >
          {log.map((line, i) => {
            if (line.type === "match") {
              const href = getGameHref(line.data.gameId);
              return (
                <Box key={i}>
                  ゲーム閲覧用URL：
                  <Link href={href} color="inherit" target="_blank">
                    {new URL(getGameHref(line.data.gameId), location.href).href}
                  </Link>
                </Box>
              );
            } else {
              return (
                <Box key={i} sx={{ display: "flex", gap: 1 }}>
                  <Box
                    sx={{
                      flexShrink: 0,
                      backgroundColor: (t) => {
                        if (line.type === "error") return t.palette.error.main;
                        if (line.type === "info") return t.palette.info.main;
                        else return t.palette.primary.main;
                      },
                      width: "5px",
                    }}
                  />
                  {line.type === "error" && (
                    <>
                      <CancelIcon sx={{ fontSize: "1em" }} color="error" />
                    </>
                  )}
                  {line.data.map((data, j) => {
                    return <ObjectInspector data={data} key={j} />;
                  })}
                </Box>
              );
            }
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default Page;
