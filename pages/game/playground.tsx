import React, { useContext, useEffect, useRef, useState } from "react";
import { readFileSync } from "fs";
import path from "node:path";
import { GetStaticProps, NextPage } from "next";
import {
  Box,
  Button,
  FormControlLabel,
  Paper,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import PlayCircleIcon from "@mui/icons-material/PlayCircleFilled";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import NotInterestedIcon from "@mui/icons-material/NotInterested";
import CodeIcon from "@mui/icons-material/Code";
import ArticleIcon from "@mui/icons-material/Article";
import VerticalSplitIcon from "@mui/icons-material/VerticalSplit";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import RepeatIcon from "@mui/icons-material/Repeat";
import Editor, { OnMount } from "@monaco-editor/react";
import { glob } from "glob";
import { Console } from "console-feed";

import MatchTypeTab, { MatchType } from "../../components/matchTypeTab";
import { UserContext } from "../../src/userStore";

import { host } from "../../src/apiClient";
import { getGameHref } from "../../src/link";
import Head from "next/head";
import { useStateWithStorage } from "../../src/useStateWithStorage";

type Props = {
  sampleCode: string;
  clientCode: string;
  definitionCode: string;
  clientJs: string[];
};
type Log = { method: "log" | "error" | "info"; data: any[]; id: string };

export const getStaticProps: GetStaticProps<Props> = async () => {
  const clientCode = readFileSync(
    path.join(process.cwd(), "editor-util/client.js"),
    "utf-8"
  );
  const sampleCode = readFileSync(
    path.join(process.cwd(), "editor-util/sample.js"),
    "utf-8"
  );
  const definitionCode = readFileSync(
    path.join(process.cwd(), "editor-util/client.d.ts"),
    "utf-8"
  );

  const paths = await glob(
    path
      .join(process.cwd(), "node_modules/@kakomimasu/client-js/**/*.d.ts")
      .replace(/\\/g, "/")
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
  const kkmmUser = useContext(UserContext).user;

  const logRef = useRef<HTMLDivElement>(null);
  const [code, setCode] = useState<string>(sampleCode);
  const [log, setLog] = useState<Log[]>([]);
  const [worker, setWorker] = useState<Worker>();
  const [codeAreaHeight, setCodeAreaHeight] = useState<string>("'auto'");
  const [gameUrl, setGameUrl] = useState<string>();

  const [autoScroll, setAutoScroll] = useStateWithStorage<boolean>(
    "playground:autoScroll",
    true
  );
  const [switchEditor, setSwitchEditor] = useStateWithStorage<boolean>(
    "playground:switchEditor",
    false
  );
  const [editorMode, setEditorMode] = useStateWithStorage<
    "code" | "log" | "code+log"
  >("playground:editorMode", "code");

  const [matchType, setMatchType] = useState<MatchType>();

  useEffect(() => {
    const func = () => {
      const codeArea = document.getElementById("code-area");
      if (!codeArea) return;
      const topY = codeArea.getBoundingClientRect().top;
      const bottomY = window.innerHeight;
      const boxHeight = bottomY - topY;

      setCodeAreaHeight(`${boxHeight}px`);
    };

    func();
    addEventListener("resize", func);

    return () => {
      removeEventListener("resize", func);
    };
  }, []);

  useEffect(() => {
    if (logRef.current && autoScroll) {
      logRef.current.scrollTo(0, logRef.current.scrollHeight);
    }
  }, [log, autoScroll]);

  const stop = () => {
    if (worker) {
      setLog((prev) => [
        ...prev,
        {
          method: "info",
          data: ["実行停止"],
          id: prev.length.toString(),
        },
      ]);
      worker.terminate();
      setWorker(undefined);
      setGameUrl(undefined);
      if (editorMode !== "code+log" && switchEditor) {
        setEditorMode("code");
      }
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
        if (event.data.method === "match") {
          setGameUrl(getGameHref(event.data.data.gameId));
        } else {
          setLog((prev) => [...prev, event.data]);
        }
      });
      worker.addEventListener("error", (event) => {
        // setLog((prev) => [...prev, event.data]);
        console.error(event.error);
      });

      setWorker(worker);
    };

    setLog((prev) => [
      ...prev,
      { method: "info", data: ["実行開始"], id: prev.length.toString() },
    ]);
    if (editorMode !== "code+log" && switchEditor) {
      setEditorMode("log");
    }
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
        p: 1,
      }}
    >
      <Head>
        <title>エディタ - 囲みマス</title>
      </Head>
      <Box
        sx={{
          display: "flex",
          gap: 1,
          width: "100%",
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
            startIcon={<SportsEsportsIcon />}
            color="primary"
            disabled={gameUrl === undefined}
            href={gameUrl ?? ""}
            target="_blank"
          >
            ゲーム詳細へ
          </Button>
        </Paper>
      </Box>
      <Paper
        elevation={2}
        sx={{
          width: "100%",
          m: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            backgroundColor: "#F0F0F0",
            display: "grid",
            gridTemplateColumns:
              editorMode === "code+log"
                ? "50% 1fr min-content"
                : "1fr min-content",
            "&>div": {
              alignItems: "center",
              pl: 1,
              gap: 1,
              fontSize: "1em",
            },
          }}
        >
          <Box
            sx={{
              borderRight: editorMode === "code+log" ? "1px solid" : undefined,
              borderColor: (t) => t.palette.divider,
              display: editorMode.includes("code") ? "flex" : "none",
            }}
          >
            <CodeIcon fontSize="small" />
            <Box>Code</Box>
          </Box>
          <Box sx={{ display: editorMode.includes("log") ? "flex" : "none" }}>
            <ArticleIcon fontSize="small" />
            <Box>Log</Box>
          </Box>

          <Box
            sx={{
              p: 0.5,
              display: "flex",
              "& button": {
                py: 0.5,
              },
            }}
          >
            <ToggleButton
              color="secondary"
              value="code"
              sx={{ height: "100%" }}
              selected={editorMode === "code+log" ? false : switchEditor}
              disabled={editorMode === "code+log"}
              onChange={() => setSwitchEditor((prev) => !prev)}
            >
              <RepeatIcon fontSize="small" />
            </ToggleButton>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={editorMode}
              onChange={(_, v) => v && setEditorMode(v)}
            >
              <ToggleButton value="code">
                <CodeIcon />
                <Box sx={{ ml: 0.5 }}>Code</Box>
              </ToggleButton>
              <ToggleButton value="log">
                <ArticleIcon />
                <Box sx={{ ml: 0.5 }}>Log</Box>
              </ToggleButton>
              <ToggleButton value="code+log">
                <VerticalSplitIcon />
                <Box sx={{ ml: 0.5 }}>Code+Log</Box>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>
        <Box
          id="code-area"
          sx={{
            display: "grid",
            gridTemplateColumns: `50% 50%`,
            gridTemplateAreas:
              editorMode === "code"
                ? `"code code"`
                : editorMode === "log"
                ? `"log log"`
                : `"code log"`,
            gridTemplateRows: `${codeAreaHeight}`,
          }}
        >
          <Box
            sx={{
              gridArea: "code",
              borderRight: editorMode === "code+log" ? "1px solid" : undefined,
              borderColor: (t) => t.palette.divider,
              display: editorMode.includes("code") ? "block" : "none",
            }}
          >
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
            sx={{
              display: editorMode.includes("log") ? "flex" : "none",
              gridArea: "log",
              height: "100%",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                borderBottom: "1px solid",
                borderColor: (t) => t.palette.divider,
                px: 1,
              }}
            >
              <Button
                startIcon={<NotInterestedIcon />}
                color="inherit"
                size="small"
                variant="text"
                onClick={logDelete}
              >
                ログ消去
              </Button>

              <FormControlLabel
                color="secondary"
                sx={{ ml: 0.5 }}
                control={
                  <Switch
                    size="small"
                    color="secondary"
                    checked={autoScroll}
                    onChange={(_, v) => {
                      console.log("onchange", v);
                      setAutoScroll(v);
                    }}
                    inputProps={{ "aria-label": "controlled" }}
                  />
                }
                label="自動スクロール"
              />
            </Box>
            <Box ref={logRef} sx={{ height: "100%", overflowY: "auto" }}>
              <Console logs={log} />
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Page;
