import React, {
  useEffect,
  useState,
  useReducer,
  useMemo,
  useCallback,
} from "react";
import { NextPage } from "next";
import Head from "next/head";
import {
  Box,
  Paper,
  FormControlLabel,
  Checkbox,
  Skeleton,
  CircularProgress,
} from "@mui/material";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import PushPinIcon from "@mui/icons-material/PushPin";
import FiberNewIcon from "@mui/icons-material/FiberNew";
import DisplaySettingsIcon from "@mui/icons-material/DisplaySettings";
import * as dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Countdown from "react-countdown";

import Content from "../../components/content";
import GameList from "../../components/gamelist";
import Clock from "../../components/clock";
import GameBoard from "../../components/gameBoard";
import PointsGraph from "../../components/pointsGraph";

import { WsGameReq, Game } from "../../src/apiClient";
import { useWebSocketGame } from "../../src/useWebsocketGame";
import { useGameUsers } from "../../src/useGameUsers";
import Link, { getGameHref, getUserHref } from "../../src/link";
import datas from "../../components/player_datas";

dayjs.extend(relativeTime);

const types = [
  { type: "normal", label: "フリー" },
  { type: "self", label: "カスタム" },
] as const;

const Page: NextPage<{ id?: string }> = ({ id }) => {
  const [gameListPin, ToggleGameListPin] = useReducer((prev) => !prev, false);
  const [gameType, setGameType] = React.useState<"normal" | "self">("normal");
  const [req, setReq] = useState<WsGameReq>();
  const query = useMemo(
    () => ["sort:startAtUnixTime-desc", "is:newGame", `is:${gameType}`],
    [gameType]
  );
  const selectedGameReq = useMemo(() => {
    const q = (id ? [`id:${id}`] : query).join(" ");
    const req: WsGameReq = {
      q,
      endIndex: 1,
    };
    return req;
  }, [id, query]);

  const games = useWebSocketGame(req);
  const selectedGame = useWebSocketGame(selectedGameReq);
  const game = useMemo<Game | undefined>(() => selectedGame[0], [selectedGame]);

  const playerIds = useMemo(() => game?.players.map((p) => p.id) || [], [game]);
  const users = useGameUsers(playerIds);

  useEffect(() => {
    if (gameType) {
      const q = query.join(" ");
      console.log(q);
      const req: WsGameReq = {
        q,
        //endIndex: 0,
      };
      setReq(req);
    }
  }, [gameType, query]);

  const turn = useMemo(() => {
    if (game?.board) {
      const nTurn = game.board.nTurn;
      const turn = game.turn;
      return nTurn - turn;
    }
  }, [game?.board, game?.turn]);

  const nextTurnTime = useMemo(() => {
    if (game?.nextTurnUnixTime) {
      return game.nextTurnUnixTime * 1000;
    }
    return;
  }, [game?.nextTurnUnixTime]);

  const status = useMemo(() => {
    if (game) {
      if (game?.ending) return { label: "終了", color: "red" };
      else if (game?.gaming) return { label: "ゲーム中", color: "green" };
      else return { label: "待機中", color: "yellow" };
    } else return;
  }, [game]);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "auto auto 1fr 2fr",
        gridTemplateRows: "2em 1fr 1fr 1.4fr",
        height: "calc(2em + 50vw)",
        maxHeight: "calc(100vh - 64px)",
        py: 3,
        pr: 2,
        gap: 1,
      }}
    >
      <Head>
        <title>ゲーム詳細 - 囲みマス</title>
      </Head>
      <Box
        sx={{
          minWidth: "7em",
          position: "relative",
          gridColumn: "1",
          gridRow: "1 / -1",
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
                    href={getGameHref(game_.gameId)}
                    color="inherit"
                    underline="none"
                    key={game_.gameId}
                    sx={{
                      display: "flex",
                      gap: 1,
                      alignItems: "center",
                      borderBottom: "1px solid gray",
                      p: 0.5,
                      fontSize: "0.8em",
                      backgroundColor: (t) =>
                        game_.gameId === game?.gameId
                          ? t.palette.primary.main
                          : "",
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
                      <Box>{game_.gameName || "UnTitle"}</Box>
                      <Box sx={{ fontSize: "0.5em", fontFamily: "monospace" }}>
                        {game_.gameId}
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
          gridColumn: "2 / -1",
          gridRow: "1 / 2",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        {status && (
          <Box
            sx={{
              backgroundColor: status.color,
              py: 0.2,
              px: 1,
              borderRadius: "1em",
              boxShadow: "0px 0px 3px gray",
            }}
          >
            {status.label}
          </Box>
        )}
        <Box sx={{ flexGrow: "1" }}>
          {game?.gameName ? game.gameName : "UnTitle"}
        </Box>
        <Box>{game && game.gameId}</Box>
      </Box>
      <Box
        sx={{
          gridColumn: "2",
          gridRow: "2 / -1",
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          aspectRatio: game?.board
            ? `${game?.board?.width} / ${game?.board?.height}`
            : "1",
        }}
      >
        {game?.board ? (
          <GameBoard game={game} users={users} />
        ) : (
          <Skeleton variant="rectangular" width="inherit" height="inherit" />
        )}
      </Box>
      <Box
        sx={{
          gridColumn: "3 / 5",
          gridRow: "4 / 5",
        }}
      >
        {game ? (
          <PointsGraph game={game} users={users} />
        ) : (
          <Skeleton variant="rectangular" width="100%" height="100%" />
        )}
      </Box>
      <Box
        sx={{
          gridColumn: "4 / 5",
          gridRow: "2 / 4",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Box sx={{ textAlign: "center", fontSize: "0.8em" }}>順位</Box>
        <Box>
          {game ? (
            game.players
              .map((player, i) => {
                const totalPoint =
                  player.point.basepoint + player.point.wallpoint;
                return { ...player, totalPoint, index: i };
              })
              ?.sort((a, b) => {
                if (a.totalPoint !== b.totalPoint)
                  return b.totalPoint - a.totalPoint;
                else if (a.point.wallpoint !== b.point.wallpoint)
                  return b.point.wallpoint - a.point.wallpoint;
                else return b.point.basepoint - a.point.basepoint;
              })
              .map((player, i) => {
                return (
                  <Box
                    key={i}
                    sx={{
                      display: "grid",
                      gap: 2,
                      gridTemplateColumns:
                        "max-content max-content 1fr max-content",
                      borderBottom: "1px solid gray",
                    }}
                  >
                    <Box
                      sx={{
                        gridColumn: "1",
                      }}
                    >
                      <Box component="span" sx={{ fontSize: "1.5em" }}>
                        {i + 1}
                      </Box>
                      <Box component="span">位</Box>
                    </Box>
                    <Box
                      sx={{
                        width: "10px",
                        backgroundColor: datas[player.index].colors[1],
                      }}
                    />
                    <Box
                      sx={{
                        my: "auto",
                        textAlign: "left",
                        width: "90%",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        overflowX: "hidden",
                        fontSize: "0.8em",
                      }}
                    >
                      {(() => {
                        const user = users.get(player.id);
                        console.log(player);
                        if (user) {
                          return (
                            <Link
                              href={getUserHref(user.name)}
                              color="inherit"
                              underline="none"
                            >
                              {user.screenName}
                            </Link>
                          );
                        } else return player.id;
                      })()}
                    </Box>
                    <Box
                      sx={{
                        // gridColumn: "3",
                        my: "auto",
                        textAlign: "right",
                        fontSize: "1.3em",
                      }}
                    >
                      {player.totalPoint}
                    </Box>
                  </Box>
                );
              })
          ) : (
            <Skeleton variant="rectangular" width="100%" height="5em" />
          )}
        </Box>
      </Box>
      <Box
        sx={{
          gridColumn: "3",
          gridRow: "2 / 3",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box sx={{ fontSize: "0.8em" }}>残りターン</Box>
        <Box sx={{ fontSize: "3em" }}>{turn || "-"}</Box>
      </Box>
      <Box
        sx={{
          gridColumn: "3",
          gridRow: "3 / 3",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box sx={{ fontSize: "0.8em" }}>次のターンまで</Box>
        <Box sx={{ fontSize: "3em" }}>
          {nextTurnTime ? (
            <Countdown
              key={nextTurnTime}
              date={nextTurnTime}
              intervalDelay={0}
              precision={2}
              renderer={({ seconds, milliseconds }) => {
                return (
                  <>
                    <Box component="span">{seconds}</Box>.
                    <Box component="span" sx={{ fontSize: "0.7em" }}>
                      {(milliseconds.toString() + "0").slice(0, 2)}
                    </Box>
                    <Box component="span" sx={{ fontSize: "0.5em" }}>
                      秒
                    </Box>
                  </>
                );
              }}
            />
          ) : (
            "-"
          )}
        </Box>
      </Box>
    </Box>
    // <Content title="ゲーム一覧">
    //   <div style={{ textAlign: "center" }}>
    //     <Clock />
    //     <ToggleButtonGroup
    //       value={gameType}
    //       exclusive
    //       onChange={(_, value) => setGameType(value)}
    //     >
    //       <ToggleButton value="normal">フリーマッチ</ToggleButton>
    //       <ToggleButton value="self">カスタムマッチ</ToggleButton>
    //     </ToggleButtonGroup>
    //     <GameList games={games} />
    //   </div>
    // </Content>
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
