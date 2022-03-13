import { styled, keyframes } from "@mui/material/styles";
import { Box } from "@mui/material";

import { type Game } from "../src/apiClient";
import { useGameUsers } from "../src/useGameUsers";

import datas from "./player_datas";

type Props = {
  game: Pick<Game, "board" | "tiled" | "players" | "log">;
  users: ReturnType<typeof useGameUsers>;
};

// conflictのアニメーション
const flash = keyframes({
  "0%,100%": {},
  "50%": { backgroundColor: "#00ff00" },
});

const BoardCellPoint = styled("div")<{ isAbs: boolean }>(({ isAbs }) => {
  return isAbs
    ? {
        textDecoration: "line-through",
        color: "red",
        fontSize: "80%",
      }
    : {};
});

const AgentDetailHistory = styled("div")({
  // agent詳細内の履歴のスクロールcss
  width: "13em",
  height: "10em",
  overflowY: "scroll",
});

const AgentDetail = styled("div")({
  // agentの詳細を表示するcss
  display: "none",
  position: "absolute",
  backgroundColor: "rgba(0, 0, 0, .7)",
  color: "white",
  zIndex: 1,
  top: "50%",
  left: "50%",
  textAlign: "center",
  borderRadius: "10px",
  padding: "1em",
  filter: "drop-shadow(0 0 5px rgba(0, 0, 0, .7))",
  width: "max-content",
  lineHeight: "1.2",
  ".tile:hover &": {
    display: "block",
  },
});

export default function GameBoard({ game, users }: Props) {
  const isAgent = (x: number, y: number) => {
    if (game.players) {
      const agent = game.players
        .map((e, i) =>
          e.agents.map((e_, j) => {
            return { agent: e_, player: i, n: j };
          })
        )
        .flat()
        .find((e) => e.agent.x === x && e.agent.y === y);
      return agent;
    } else return undefined;
  };
  const agentHistory = (agent: ReturnType<typeof isAgent>) => {
    if (!agent) return [];
    const log = game.log;
    if (!log) return [];
    const pid = agent.player,
      aid = agent.n;

    const history = [];
    for (let i = 0; i < log.length; i++) {
      const act = Object.assign(
        {},
        log[i].players[pid].actions?.find((e) => e.agentId === aid)
      );
      let type = "";
      if (act) {
        if (act.type === 1) type = "配置";
        else if (act.type === 3) type = "移動";
        else if (act.type === 4) type = "除去";
        else {
          type = "停留";
          //act.x = act.y = undefined;
        }
      } else {
        type = "停留";
      }
      //act.turn = i;
      history.push({ ...act, type, turn: i });
    }
    return history.reverse();
  };

  const getAgentTransform = (x: number, y: number) => {
    if (!game.board) return;
    const w = game.board.width;
    const h = game.board.height;
    const transX = x < w / 2 ? "0%" : "-100%";
    const transY = y < h / 2 ? "0%" : "-100%";
    return `translate(${transX},${transY})`;
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        aspectRatio: `${game.board?.width}/${game.board?.height}`,
      }}
    >
      {(() => {
        const board = game.board;
        const tiled = game.tiled;
        if (!board || !tiled) return;

        return (
          <Box
            id="field"
            sx={{
              userSelect: "none",
              display: "grid",
              gridTemplateColumns: `min-content repeat(${board.width}, 1fr) min-content`,
              gridTemplateRows: `min-content repeat(${board.height}, 1fr) min-content`,
              gap: "1px",
              width: "100%",
              lineHeight: "1",
              fontSize: `clamp(10px, calc(25vw/${board.width}), 15px)`,
            }}
          >
            {[1, board.height + 2].map((y) => {
              return new Array(board.width).fill(0).map((_, i) => {
                const x = i + 1;
                return (
                  <Box
                    key={`${board.name}-index-${x}-${y}`}
                    sx={{
                      gridColumn: x + 1,
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
                const y = i + 1;
                return (
                  <Box
                    key={`${board.name}-index-${x}-${y}`}
                    sx={{
                      gridColumn: x,
                      gridRow: y + 1,
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
            {(() => {
              return tiled.map((tile, i) => {
                const y = Math.floor(i / board.width);
                const x = i % board.width;
                const point = board.points[i];
                const isAbs =
                  point < 0 && tile.player !== null && tile.type === 0;
                const agent = (() => {
                  if (game.players) {
                    const agent = game.players
                      .map((e, i) =>
                        e.agents.map((e_, j) => {
                          return { agent: e_, player: i, n: j };
                        })
                      )
                      .flat()
                      .find((e) => e.agent.x === x && e.agent.y === y);
                    return agent;
                  } else return undefined;
                })();
                const bgColor = () => {
                  if (tile.player !== null) {
                    //console.log(tile);
                    //console.log("tile player", tile.player);
                    return datas[tile.player].colors[tile.type];
                  } else if (point < 0) {
                    const l = 100 - (Math.abs(point) * 50) / 16;
                    return `hsl(0,0%,${l}%)`;
                  } else if (point > 0) {
                    const l = 100 - (Math.abs(point) * 50) / 16;
                    return `hsl(60,100%,${l}%)`;
                  }
                };
                const isConflict = game.log
                  ? (() => {
                      const lastActLog = game.log
                        .at(-1)
                        ?.players.flatMap((e) => {
                          if (e.actions) return [...e.actions];
                          else return [];
                        });
                      const isConflict = lastActLog?.some(
                        (a) => a.res > 0 && a.res < 3 && a.x === x && a.y === y
                      );
                      return isConflict;
                    })()
                  : false;

                return (
                  <Box
                    key={`${board.name}-${i}`}
                    sx={{
                      position: "relative",
                      gridColumn: x + 2,
                      gridRow: y + 2,
                      aspectRatio: "1",
                      backgroundColor: bgColor(),
                      backgroundImage:
                        agent && `url(${datas[agent.player].agentUrl})`,
                      backgroundSize: "80%",
                      backgroundPosition: "0% 50%",
                      backgroundRepeat: "no-repeat",
                      outline: "1px solid #555555",
                      animation: isConflict
                        ? `${flash} 1s linear infinite`
                        : "",
                      height: "100%",
                      width: "100%",
                    }}
                    className="tile"
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        right: "0.2em",
                        bottom: "0.2em",
                      }}
                    >
                      <BoardCellPoint isAbs={isAbs}>{point}</BoardCellPoint>
                      {isAbs && <span>{Math.abs(point)}</span>}
                    </Box>
                    {agent && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: "0.2em",
                          left: "0.2em",
                          width: "1em",
                          height: "1em",
                          borderRadius: "50%",
                          backgroundColor: "yellow",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.8em",
                          p: "0.5em",
                        }}
                      >
                        {agent.n + 1}
                      </Box>
                    )}
                    {agent &&
                      (() => {
                        const userId = game.players[agent.player].id;
                        const user = users.get(userId);
                        return (
                          <AgentDetail
                            style={{
                              border: `solid 4px ${
                                datas[agent.player].colors[1]
                              }`,
                              transform: getAgentTransform(x, y),
                            }}
                          >
                            <span>
                              {user ? user.screenName : userId}
                              {" : "}
                              {agent.n + 1}
                            </span>
                            <br />
                            <span>行動履歴</span>
                            <AgentDetailHistory>
                              {agentHistory(agent).map((e, i) => {
                                return (
                                  <div
                                    key={`${board.name}-${i}`}
                                    style={{
                                      textDecoration:
                                        e.res > 0 ? "line-through" : "none",
                                    }}
                                  >
                                    T{e.turn}：
                                    {e.type !== "停留" &&
                                      `x:${e.x} , y:${e.y}に`}
                                    {e.type}
                                  </div>
                                );
                              })}
                            </AgentDetailHistory>
                          </AgentDetail>
                        );
                      })()}
                  </Box>
                );
              });
            })()}
          </Box>
        );
      })()}
    </Box>
  );
}
