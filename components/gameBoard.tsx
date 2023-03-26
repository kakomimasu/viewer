import { useMemo } from "react";
import Image from "next/image";
import { keyframes } from "@mui/material/styles";
import { Box } from "@mui/material";
import { useResizeDetector } from "react-resize-detector";

import { type Game } from "../src/apiClient";
import { useGameUsers } from "../src/useGameUsers";

import datas from "./player_datas";

type Props = {
  game: Pick<Game, "board" | "tiled" | "players" | "log">;
  users: ReturnType<typeof useGameUsers>;
  nextTiles?: { x: number; y: number }[];
};

const cellSize = 50;

// conflictのアニメーション
const flash = keyframes({
  "0%,100%": {},
  "50%": { backgroundColor: "#00ff00" },
});

export default function GameBoard({
  game: { board, tiled, players, log },
  users,
  nextTiles,
}: Props) {
  const { width, height, ref } = useResizeDetector();

  const scale = useMemo(() => {
    if (!width || !height || !board) return 1;
    const idealWidth = (board.width + 2) * 50 + (board.width + 1) * 1;
    const idealHeight = (board.height + 2) * 50 + (board.height + 1) * 1;
    const scaleX = width / idealWidth;
    const scaleY = height / idealHeight;
    return Math.min(scaleX, scaleY);
  }, [width, height, board]);

  const edgeCells = useMemo(() => {
    if (!board?.height) return;
    return (
      <>
        {[1, board.height + 2].map((y) => {
          return new Array(board.width).fill(0).map((_, i) => {
            const x = i;
            return (
              <Box
                key={`index-${x}-${y}`}
                sx={{
                  gridColumn: x + 2,
                  gridRow: y,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontWeight: "bold",
                }}
              >
                {x}
              </Box>
            );
          });
        })}
        {[1, board.width + 2].map((x) => {
          return new Array(board.width).fill(0).map((_, i) => {
            const y = i;
            return (
              <Box
                key={`index-${x}-${y}`}
                sx={{
                  gridColumn: x,
                  gridRow: y + 2,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontWeight: "bold",
                }}
              >
                {y}
              </Box>
            );
          });
        })}
      </>
    );
  }, [board?.height, board?.width]);

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
      ref={ref}
    >
      {board && (
        <Box
          id="field"
          sx={{
            userSelect: "none",
            display: "grid",
            position: "static",
            gridAutoColumns: "50px",
            gridAutoRows: "50px",
            gap: "1px",
            lineHeight: "1",
            fontSize: `15px`,
            transform: `scale(${scale})`,
          }}
        >
          {players.map((p, pIdx) => {
            return p.agents.flatMap((a, aIdx) => {
              if (a.x < 0) return [];

              const getAgentTransform = () => {
                if (!board) return;
                const w = board.width;
                const h = board.height;
                const transX = a.x < w / 2 ? "0%" : "-100%";
                const transY = a.y < h / 2 ? "0%" : "-100%";
                return `translate(${transX},${transY})`;
              };

              const top = (a.y + 1) * cellSize + a.y + 1;
              const left = (a.x + 1) * cellSize + a.x + 1;
              const agentData = datas[pIdx];

              const userId = p.id;
              const user = users.get(userId);
              const agentHistory = () => {
                // if (!log) return [];

                const history = [];
                for (let i = 0; i < log.length; i++) {
                  const act = structuredClone(
                    log[i].players[pIdx].actions?.find(
                      (e) => e.agentId === aIdx
                    )
                  );
                  let type = "";
                  if (act) {
                    if (act.type === 1) type = "配置";
                    else if (act.type === 3) type = "移動";
                    else if (act.type === 4) type = "除去";
                    else type = "停留";
                  } else {
                    type = "停留";
                  }
                  history.push({ ...act, type, turn: i });
                }
                return history.reverse();
              };
              return [
                <Box
                  sx={{
                    position: "absolute",
                    width: cellSize,
                    height: cellSize,
                    zIndex: 1,

                    top,
                    left,

                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",

                    transitionProperty: "top, left",
                    transitionDuration: "0.4s",
                  }}
                  key={`agent-${pIdx}-${aIdx}`}
                >
                  <Image
                    src={agentData.agentUrl}
                    width={cellSize * 0.8}
                    height={cellSize * 0.8}
                    alt={`agent player:${pIdx} n:${aIdx}`}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      fontSize: "12px",
                      top: "3px",
                      left: "3px",
                      width: "1em",
                      height: "1em",
                      borderRadius: "50%",
                      backgroundColor: "yellow",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      p: "0.5em",
                    }}
                  >
                    {aIdx + 1}
                  </Box>
                </Box>,
                <Box
                  key={`detail-${pIdx}-${aIdx}`}
                  sx={{
                    position: "absolute",
                    width: cellSize,
                    height: cellSize,
                    zIndex: 3,

                    top,
                    left,

                    "&:hover > *": {
                      display: "block",
                    },
                  }}
                >
                  <Box
                    sx={{
                      // agentの詳細を表示するcss
                      display: "none",
                      position: "absolute",
                      backgroundColor: "rgba(0, 0, 0, .7)",
                      color: "white",
                      top: "50%",
                      left: "50%",
                      textAlign: "center",
                      borderRadius: "10px",
                      p: 1,
                      filter: "drop-shadow(0 0 5px rgba(0, 0, 0, .7))",
                      width: "max-content",
                      lineHeight: "1.2",
                      border: `solid 4px ${agentData.colors[1]}`,
                      transform: getAgentTransform(),
                    }}
                  >
                    <span>
                      {user ? user.screenName : userId}
                      {" : "}
                      {aIdx + 1}
                    </span>
                    <br />
                    <span>行動履歴</span>
                    <Box
                      sx={{
                        width: "13em",
                        height: "10em",
                        overflowY: "scroll",
                      }}
                    >
                      {agentHistory().map((e, i) => {
                        return (
                          <div
                            key={i}
                            style={{
                              textDecoration: e.res ? "line-through" : "none",
                            }}
                          >
                            T{e.turn}：
                            {e.type !== "停留" && `x:${e.x} , y:${e.y}に`}
                            {e.type}
                          </div>
                        );
                      })}
                    </Box>
                  </Box>
                </Box>,
              ];
            });
          })}
          {edgeCells}
          {(() => {
            return board.points.map((point, i) => {
              const tile: NonNullable<typeof tiled>[number] = (tiled &&
                tiled[i]) || { type: 0, player: null };
              const y = Math.floor(i / board.width);
              const x = i % board.width;
              // const point = board.points[i];
              const isAbs =
                point < 0 && tile.player !== null && tile.type === 0;

              const bgColor = () => {
                if (tile.player !== null) {
                  return datas[tile.player].colors[tile.type];
                } else if (point < 0) {
                  const l = 100 - (Math.abs(point) * 50) / 16;
                  return `hsl(0,0%,${l}%)`;
                } else if (point > 0) {
                  const l = 100 - (Math.abs(point) * 50) / 16;
                  return `hsl(60,100%,${l}%)`;
                }
              };
              const nConflict = log
                ? (() => {
                    const lastActLog = log
                      .slice(-1)[0]
                      ?.players.flatMap((e) => {
                        if (e.actions) return [...e.actions];
                        else return [];
                      });
                    const isConflict =
                      lastActLog?.filter(
                        (a) => a.res > 0 && a.res < 3 && a.x === x && a.y === y
                      ) ?? [];
                    return isConflict.length;
                  })()
                : 0;

              return (
                <Box
                  key={i}
                  sx={{
                    position: "relative",
                    gridColumn: x + 2,
                    gridRow: y + 2,
                    aspectRatio: "1",
                    backgroundColor: bgColor(),
                    outline: "1px solid #555555",
                    animation:
                      nConflict > 0
                        ? `${flash} ${
                            1 - (0.6 / board.nAgent) * nConflict
                          }s linear infinite`
                        : "",
                    height: "100%",
                    width: "100%",
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      right: "0.2em",
                      bottom: "0.2em",
                    }}
                  >
                    <Box
                      sx={{
                        textDecoration: isAbs ? "line-through" : undefined,
                        color: isAbs ? "red" : undefined,
                        fontSize: isAbs ? "80%" : undefined,
                      }}
                    >
                      {point}
                    </Box>
                    {isAbs && <span>{Math.abs(point)}</span>}
                  </Box>
                </Box>
              );
            });
          })()}
          {nextTiles?.map((tile, aIdx) => {
            return (
              <Box
                key={`tile-${tile.x}-${tile.y}`}
                sx={{
                  width: cellSize,
                  height: cellSize,
                  gridRow: tile.y + 2,
                  gridColumn: tile.x + 2,
                  zIndex: 2,
                  pointerEvents: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    borderRadius: "50%",
                    border: "1px solid",
                    backgroundColor: "yellow",
                    backgroundClip: "content-box",
                    opacity: 0.8,
                    width: "50%",
                    height: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {aIdx + 1}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
