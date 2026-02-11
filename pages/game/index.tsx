import { useEffect, useState, useReducer, useMemo } from "react";
import { NextPage } from "next";
import Head from "next/head";
import {
  Box,
  Paper,
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from "@mui/material";
import PushPinIcon from "@mui/icons-material/PushPin";
import FiberNewIcon from "@mui/icons-material/FiberNew";
import DisplaySettingsIcon from "@mui/icons-material/DisplaySettings";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import GamePanel from "../../components/gamePanel";

import { StreamMatchesReq, Game } from "../../src/apiClient";
import { useGameStream } from "../../src/useGameStream";
import { useGameUsers } from "../../src/useGameUsers";
import Link, { getGameHref } from "../../src/link";

dayjs.extend(relativeTime);

const types = [
  { type: "normal", label: "フリー" },
  { type: "self", label: "カスタム" },
] as const;

const Page: NextPage<{ id?: string }> = ({ id }) => {
  const [gameListPin, ToggleGameListPin] = useReducer((prev) => !prev, false);
  const [gameType, setGameType] = useState<"normal" | "self">("normal");
  const [req, setReq] = useState<StreamMatchesReq>();
  const query = useMemo(
    () => ["sort:startAtUnixTime-desc", `type:${gameType}`],
    [gameType],
  );
  const selectedGameReq = useMemo(() => {
    const q = (id ? [`id:${id}`] : query).join(" ");
    const allowNewGame = !Boolean(id);
    const req: StreamMatchesReq = {
      q,
      endIndex: 1,
      allowNewGame,
    };
    return req;
  }, [id, query]);

  const games = useGameStream(req);
  const selectedGame = useGameStream(selectedGameReq);
  const game = useMemo<Game | undefined>(() => selectedGame[0], [selectedGame]);
  const playerIds = useMemo(() => game?.players.map((p) => p.id) || [], [game]);
  const users = useGameUsers(playerIds);

  useEffect(() => {
    if (gameType) {
      const q = query.join(" ");
      console.log(q);
      const req: StreamMatchesReq = {
        q,
        // endIndex: 1,
        allowNewGame: true,
      };
      setReq(req);
    }
  }, [gameType, query]);

  return (
    <Box
      sx={{
        display: "flex",
        fontSize: { xs: "0.6em", md: "1em" },
        py: 3,
        pr: 1,
        gap: 1,
      }}
    >
      <Head>
        <title>ゲーム詳細 - 囲みマス</title>
      </Head>
      <Box
        sx={{
          minWidth: gameListPin ? undefined : "7em",
          position: "relative",
        }}
      >
        <Paper
          variant="outlined"
          sx={{
            position: gameListPin ? "relative" : "absolute",
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            height: "100%",
            width: gameListPin ? "max-content" : "7em",
            overflowY: "scroll",
            overflowX: "hidden",
            whiteSpace: "nowrap",
            p: 1,
            pr: 0,
            zIndex: 1,
            "&:hover": {
              width: "fit-content",
            },
          }}
        >
          <Box sx={{ display: "flex", gap: 1 }}>
            <PushPinIcon
              sx={{
                width: "0.7em",
                color: (t) => (gameListPin ? t.palette.secondary.main : "gray"),
              }}
              onClick={ToggleGameListPin}
            />
            <Link href={getGameHref()}>
              <FiberNewIcon
                sx={{
                  width: "0.7em",
                  color: (t) => (!id ? t.palette.secondary.main : "gray"),
                }}
              />
            </Link>
            <Box>ゲーム一覧</Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              my: 0.5,
              gap: 1,
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                position: "relative",
                "&:hover #list-query-settings": {
                  display: "block",
                },
              }}
            >
              <DisplaySettingsIcon sx={{}} />
              <Box
                id="list-query-settings"
                sx={{
                  display: "none",
                  position: "absolute",
                  top: "0%",
                  left: "100%",
                }}
              >
                <Box
                  sx={{
                    position: "fixed",
                    backgroundColor: (t) => t.palette.background.paper,
                    border: "1px solid gray",
                    borderRadius: "1px",
                    p: 1,
                    display: "flex",
                  }}
                >
                  <div>
                    <Box>タイプ</Box>
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                      {types.map(({ type, label }) => {
                        return (
                          <FormControlLabel
                            key={type}
                            label={`${label}マッチ`}
                            control={
                              <Checkbox
                                checked={gameType === type}
                                onChange={(_, checked) => {
                                  if (checked) setGameType(type);
                                }}
                              />
                            }
                          />
                        );
                      })}
                    </Box>
                  </div>
                </Box>
              </Box>
            </Box>
            <Box
              sx={{
                fontSize: "0.5em",
              }}
            >
              {query.map((q) => (
                <Box key={q}>{q}</Box>
              ))}
            </Box>
          </Box>
          <Box>
            {games.length !== 0 ? (
              games.map((game_) => {
                const fromNow = game_.startedAtUnixTime
                  ? dayjs.unix(game_.startedAtUnixTime).fromNow()
                  : "待機中";

                return (
                  <Link
                    href={getGameHref(game_.id)}
                    color="inherit"
                    underline="none"
                    key={game_.id}
                    sx={{
                      display: "flex",
                      gap: 1,
                      alignItems: "center",
                      borderBottom: "1px solid gray",
                      p: 0.5,
                      fontSize: "0.8em",
                      backgroundColor: (t) =>
                        game_.id === game?.id ? t.palette.primary.main : "",
                      "&:hover": {
                        backgroundColor: (t) => t.palette.secondary.light,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: "15vw",
                        whiteSpace: "nowrap",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        "& > div": {
                          overflow: "hidden",
                          width: "100%",
                          textOverflow: "ellipsis",
                        },
                      }}
                    >
                      <Box>{game_.name || "UnTitle"}</Box>
                      <Box sx={{ fontSize: "0.5em", fontFamily: "monospace" }}>
                        {game_.id}
                      </Box>
                    </Box>
                    <Box sx={{ width: "max-content" }}>{fromNow}</Box>
                  </Link>
                );
              })
            ) : (
              <Box sx={{ width: "100%", textAlign: "center", mt: 3 }}>
                <CircularProgress />
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
      <Box
        sx={{
          width: "100%",
          minHeight: { xs: undefined, sm: "fit-content" },
          height: { xs: undefined, sm: "50vw" },
          maxHeight: { xs: undefined, sm: "calc(100vh - 64px)" },
        }}
      >
        {game && <GamePanel game={game} users={users} />}
      </Box>
    </Box>
  );
};

Page.getInitialProps = async (ctx) => {
  const id = ctx.query.id;
  if (Array.isArray(id)) {
    return { id: id[0] };
  } else {
    return { id };
  }
};

export default Page;
