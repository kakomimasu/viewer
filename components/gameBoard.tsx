import React, { useEffect, useState, useCallback, useMemo } from "react";
import { styled, keyframes } from "@mui/material/styles";

import { apiClient, Game, User } from "../src/apiClient";

import datas from "./player_datas";

type Props = {
  game: Pick<
    Game,
    | "board"
    | "tiled"
    | "players"
    | "log"
    | "startedAtUnixTime"
    | "gaming"
    | "ending"
    | "nextTurnUnixTime"
  >;
};

const Content = styled("div")({
  display: "grid",
  height: "auto",
  "&>div": {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});

const BoardTable = styled("table")({
  // table全体のcss
  borderCollapse: "collapse",
  userSelect: "none",
  margin: "auto",
  "& td,& th": {
    padding: 5,
    fontSize: "min(1em,2.5vw)",
    "--size": "min(10vw,50px)",
    width: "var(--size)",
    height: "var(--size)",
  },
  "& td": {
    border: "1px solid",
    textAlign: "right",
    verticalAlign: "bottom",
    whiteSpace: "pre-line",
    position: "relative",
  },
});

// conflictのアニメーション
const flash = keyframes({
  "0%,100%": {},
  "50%": { backgroundColor: "#00ff00" },
});

const BoardCell = styled("td")<{
  agent:
    | {
        agent: {
          x: number;
          y: number;
        };
        player: number;
        n: number;
      }
    | undefined;
  isConflict: boolean;
}>(({ agent, isConflict }) => {
  const agentCss = agent
    ? {
        // agentがいるマスのcss
        backgroundSize: "80%",
        backgroundPosition: "0% 50%",
        backgroundRepeat: "no-repeat",
      }
    : {};
  // conflictしているマスのcss
  const isConflictCss = isConflict
    ? { animation: `${flash} 1s linear infinite` }
    : {};
  return { ...agentCss, ...isConflictCss };
});

const BoardCellPoint = styled("span")<{ isAbs: boolean }>(({ isAbs }) => {
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

const PlayerTable = styled("table")({
  border: "1px solid black",
  textAlign: "center",
  borderCollapse: "collapse",
  "& td,& th": {
    border: "1px solid black",
    padding: 5,
  },
  "& td": {
    color: "black",
  },
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
  "td:hover &": {
    display: "block",
  },
});

export default function GameBoard(props: Props) {
  const game = props.game;

  const [users, setUsers] = useState<(User | undefined)[]>([]);
  const [status, setStatus] = useState<string>();
  const playerIds = useMemo(
    () => game.players.map((p) => p.id),
    [game.players]
  );

  /*const turnT = (game.gaming || game.ending)
    ? `${game.turn}/${game.totalTurn}`
    : "-";

  const points = (game.players as any[]).map(
    (player) => (player.point.basepoint + player.point.wallpoint),
  );
  */
  const setStatusT = useCallback(() => {
    let status = "";
    if (game.startedAtUnixTime === null) status = "プレイヤー入室待ち";
    else if (game.ending) status = "ゲーム終了";
    else if (game.gaming) {
      if (!game.nextTurnUnixTime) return;
      const nextTime = new Date(game.nextTurnUnixTime * 1000).getTime();
      const nowTime = new Date().getTime();
      const diffTime = (nextTime - nowTime) / 1000;
      if (diffTime > 0) {
        status = "次のターンまで" + diffTime.toFixed(1) + "秒";
        setTimeout(setStatusT, 100);
      } else status = "競合確認中…";
    } else status = "ゲームスタート待ち";
    setStatus(status);
  }, [game.ending, game.gaming, game.nextTurnUnixTime, game.startedAtUnixTime]);

  useEffect(() => {
    setStatusT();
  }, [setStatusT]);

  const index = (x: number, y: number) => {
    if (!game.board) return;
    return x + y * game.board.width;
  };
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
        log[i].players[pid].actions.find((e) => e.agentId === aid)
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
  const getCell = (x: number, y: number) => {
    const i = index(x, y);
    if (i === undefined) return;
    return {
      point: game.board ? game.board.points[i] : 0,
      tiled: game.tiled ? game.tiled[i] : { type: 0, player: -1 },
    };
  };
  useEffect(() => {
    console.log("useEffect gameBoard");
    const UpdateUsers = async () => {
      const users_ = [];
      for (const id of playerIds) {
        const res = await apiClient.usersShow(id);
        if (res.success) {
          const user = res.data;

          users_.push(user);
        } else users_.push(undefined);
      }
      setUsers(users_);
    };
    UpdateUsers();
  }, [playerIds]);

  const getAgentTransform = (x: number, y: number) => {
    if (!game.board) return;
    const w = game.board.width;
    const h = game.board.height;
    const transX = x < w / 2 ? "0%" : "-100%";
    const transY = y < h / 2 ? "0%" : "-100%";
    return `translate(${transX},${transY})`;
  };

  return (
    <Content>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
        }}
      >
        <div>{status}</div>
        {game.board && (
          <BoardTable id="field">
            <tbody>
              <tr>
                <th></th>
                {[...Array(game.board.width)].map((_, x) => {
                  return <th key={x}>{x + 1}</th>;
                })}
                <th></th>
              </tr>
              {[...Array(game.board.height)].map((_, y) => {
                return (
                  <tr key={y}>
                    <th>{y + 1}</th>
                    {[...Array(game.board?.width)].map((_, x) => {
                      const cell = getCell(x, y);
                      if (!cell) return;
                      const agent = isAgent(x, y);
                      const isAbs =
                        cell.point < 0 &&
                        cell.tiled.player !== null &&
                        cell.tiled.type === 0;
                      const isConflict = game.log
                        ? (() => {
                            const lastActLog = game.log[
                              game.log.length - 1
                            ]?.players
                              .map((e) => e.actions)
                              .flat();
                            const isConflict = lastActLog?.some(
                              (a) =>
                                a.res > 0 && a.res < 3 && a.x === x && a.y === y
                            );
                            return isConflict;
                          })()
                        : false;

                      const bgColor = () => {
                        if (cell.tiled.player !== null) {
                          return datas[cell.tiled.player].colors[
                            cell.tiled.type
                          ];
                        } else if (cell.point < 0) {
                          const l = 100 - (Math.abs(cell.point) * 50) / 16;
                          return `hsl(0,0%,${l}%)`;
                        } else if (cell.point > 0) {
                          const l = 100 - (Math.abs(cell.point) * 50) / 16;
                          return `hsl(60,100%,${l}%)`;
                        }
                      };

                      return (
                        <BoardCell
                          agent={agent}
                          isConflict={isConflict}
                          key={x}
                          style={{
                            backgroundImage:
                              agent && `url(${datas[agent.player].agentUrl})`,
                            backgroundColor: bgColor(),
                          }}
                        >
                          <BoardCellPoint isAbs={isAbs}>
                            {cell.point}
                          </BoardCellPoint>
                          {isAbs && (
                            <>
                              <br />
                              <span>{Math.abs(cell.point)}</span>
                            </>
                          )}
                          {agent && (
                            <AgentDetail
                              style={{
                                border: `solid 4px ${
                                  datas[agent.player].colors[1]
                                }`,
                                transform: getAgentTransform(x, y),
                              }}
                            >
                              <span>
                                {users[agent.player]?.screenName || "No player"}
                                :{agent.n + 1}
                              </span>
                              <br />
                              <span>行動履歴</span>
                              <AgentDetailHistory>
                                {agentHistory(agent).map((e, i) => {
                                  return (
                                    <div
                                      key={i}
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
                          )}
                        </BoardCell>
                      );
                    })}
                    <th>{y + 1}</th>
                  </tr>
                );
              })}
              <tr>
                <th></th>
                {[...Array(game.board.width)].map((_, x) => {
                  return <th key={x}>{x + 1}</th>;
                })}
                <th></th>
              </tr>
            </tbody>
          </BoardTable>
        )}
      </div>
    </Content>
  );
}
