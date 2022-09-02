import { useMemo } from "react";
import { Box, Skeleton, Button } from "@mui/material";
import Countdown from "react-countdown";

import GameBoard from "./gameBoard";
import PointsGraph from "./pointsGraph";
import datas from "./player_datas";

import { Game } from "../src/apiClient";
import { useGameUsers } from "../src/useGameUsers";
import Link, { getUserHref, getVRGameHref } from "../src/link";

export default function GamePanel({
  game,
  users,
}: {
  game: Game;
  users: ReturnType<typeof useGameUsers>;
}) {
  const turn = useMemo(() => {
    if (game.board) {
      const nTurn = game.board.nTurn;
      const turn = game.turn;
      return nTurn - turn;
    }
  }, [game.board, game.turn]);

  const nextTurnTime = useMemo(() => {
    if (game.startedAtUnixTime) {
      const nextTurnAtUnixTime =
        game.startedAtUnixTime +
        (game.operationSec + game.transitionSec) * game.turn;
      return nextTurnAtUnixTime * 1000;
    }
    return;
  }, [
    game.operationSec,
    game.startedAtUnixTime,
    game.transitionSec,
    game.turn,
  ]);

  const status = useMemo(() => {
    if (game.ending) return { label: "終了", color: "red" };
    else if (game.gaming) return { label: "ゲーム中", color: "green" };
    else return { label: "待機中", color: "yellow" };
  }, [game.ending, game.gaming]);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "auto minmax(max-content,1fr) 2fr",
        gridTemplateRows: "2em 1fr 1fr 1.4fr",
        gap: 1,
        width: "100%",
        height: "100%",
      }}
    >
      <Box
        sx={{
          gridColumn: "1 / -1",
          gridRow: "1",
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
              width: "fit-content",
              whiteSpace: "nowrap",
            }}
          >
            {status.label}
          </Box>
        )}

        <Box
          sx={{
            flexGrow: "1",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {game.name ?? "UnTitle"}
        </Box>
        <Box
          sx={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          ID : {game.id}
        </Box>
        <Box>
          <Button size="small" href={getVRGameHref(game.id)}>
            VR
          </Button>
        </Box>
      </Box>
      <Box
        sx={{
          gridColumn: "1",
          gridRow: "2 / -1",
          height: "100%",
          width: "100%",
          aspectRatio: game.board
            ? `${game.board?.width} / ${game.board?.height}`
            : "1",
        }}
      >
        {game.board ? (
          <GameBoard game={game} users={users} />
        ) : (
          <Skeleton variant="rectangular" width="inherit" height="inherit" />
        )}
      </Box>
      <Box
        sx={{
          gridColumn: "2 / -1",
          gridRow: "4",
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
          gridColumn: "3 / -1",
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
                  player.point.areaPoint + player.point.wallPoint;
                return { ...player, totalPoint, index: i };
              })
              ?.sort((a, b) => {
                if (a.totalPoint !== b.totalPoint)
                  return b.totalPoint - a.totalPoint;
                else if (a.point.wallPoint !== b.point.wallPoint)
                  return b.point.wallPoint - a.point.wallPoint;
                else return b.point.areaPoint - a.point.areaPoint;
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
          gridColumn: "2",
          gridRow: "2",
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
          gridColumn: "2",
          gridRow: "3",
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
              precision={1}
              renderer={({ seconds, milliseconds }) => {
                return (
                  <>
                    <Box component="span">{seconds}</Box>.
                    <Box component="span" sx={{ fontSize: "0.7em" }}>
                      {(milliseconds.toString() + "0").slice(0, 1)}
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
  );
}
