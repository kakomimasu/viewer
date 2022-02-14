import React, { useEffect, useState, useCallback, useRef } from "react";
import { NextPage } from "next";
import Link from "next/link";
import Button from "@mui/material/Button";
import { TextField, Box, MenuItem } from "@mui/material";

import {
  apiClient,
  Game,
  WsGameReq,
  WsGameRes,
  MatchRes,
  ActionPost,
  host,
} from "../../../src/apiClient";
import datas from "../../../components/player_datas";

import Content from "../../../components/content";
import GameList from "../../../components/gamelist";
import GameBoard from "../../../components/gameBoard";
import PointsGraph from "../../../components/pointsGraph";

type NextActionType = [-1 | 0 | 1, -1 | 0 | 1];
const NextActions: Record<
  | "UP"
  | "LEFT"
  | "RIGHT"
  | "DOWN"
  | "UPRIGHT"
  | "UPLEFT"
  | "DOWNRIGHT"
  | "DOWNLEFT"
  | "NONE",
  NextActionType
> = {
  UP: [0, -1],
  LEFT: [-1, 0],
  RIGHT: [1, 0],
  DOWN: [0, 1],
  UPRIGHT: [1, -1],
  UPLEFT: [-1, -1],
  DOWNRIGHT: [1, 1],
  DOWNLEFT: [-1, 1],
  NONE: [0, 0],
};

type AgentData = { index: number; nextAction: NextActionType };

type Gamepads = ReturnType<typeof navigator["getGamepads"]>;
type Controller = {
  label: string;
  helperText?: string;
  agentIndex: number;
  axis: NextActionType;
};

const ManualAgent = ({
  playerIndex,
  agentData,
  enable,
}: {
  playerIndex: number;
  agentData: AgentData;
  enable: boolean;
}) => {
  const playerData = datas[playerIndex];
  const na = agentData.nextAction;
  return (
    <Box
      sx={{
        border: "3px solid",
        borderColor: playerData.colors[1],
        borderRadius: 2,
        backgroundColor: enable ? "" : "#eee",
        p: 1,
      }}
    >
      <Box component="h5" sx={{ my: 0 }}>
        Agent {agentData.index + 1}
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(25px, 1fr))",
          gap: "1px",
          "&>div": {
            outline: "1px solid #333",
            aspectRatio: "1 / 1",
          },
        }}
      >
        {[-1, 0, 1].map((y) => {
          return [-1, 0, 1].map((x) => {
            const gridColumn = x + 2;
            const gridRow = y + 2;
            if (x === 0 && y === 0) {
              return (
                <Box
                  sx={{
                    gridColumn,
                    gridRow,
                    backgroundSize: "80%",
                    backgroundPosition: "0% 50%",
                    backgroundRepeat: "no-repeat",
                    backgroundImage: `url(${playerData.agentUrl})`,
                    backgroundColor: playerData.colors[1],
                    boxSizing: "content-box",
                  }}
                />
              );
            } else {
              const backgroundColor =
                na[0] === x && na[1] === y ? playerData.colors[0] : "";
              return (
                <Box
                  sx={{
                    gridColumn,
                    gridRow,
                    backgroundColor,
                  }}
                />
              );
            }
          });
        })}
      </Box>
    </Box>
  );
};

function useKeyDirection(useKey: {
  up: string;
  down: string;
  left: string;
  right: string;
}) {
  const [direction, setDirection] = useState<NextActionType>(NextActions.NONE);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      let dir: NextActionType = [...direction];
      if (e.key === useKey.up) dir[1] = -1;
      else if (e.key === useKey.down) dir[1] = 1;
      else if (e.key === useKey.left) dir[0] = -1;
      else if (e.key === useKey.right) dir[0] = 1;
      else return;
      e.preventDefault();

      const isUpdate = dir.reduce(
        (acc, cur, i) => acc || cur !== direction[i],
        false
      );
      if (!isUpdate) return;
      setDirection(dir);
    },
    [direction, useKey]
  );

  const onKeyUp = useCallback(
    (e: KeyboardEvent) => {
      let dir: NextActionType = [...direction];
      if (e.key === useKey.up && dir[1] === -1) dir[1] = 0;
      else if (e.key === useKey.down && dir[1] === 1) dir[1] = 0;
      else if (e.key === useKey.left && dir[0] === -1) dir[0] = 0;
      else if (e.key === useKey.right && dir[0] === 1) dir[0] = 0;
      else return;
      e.preventDefault();

      const isUpdate = dir.reduce(
        (acc, cur, i) => acc || cur !== direction[i],
        false
      );
      if (!isUpdate) return;
      setDirection(dir);
    },
    [direction, useKey]
  );

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown, false);
    document.addEventListener("keyup", onKeyUp, false);
    return () => {
      document.removeEventListener("keydown", onKeyDown, false);
      document.removeEventListener("keyup", onKeyUp, false);
    };
  }, [onKeyDown, onKeyUp]);

  return direction;
}

const Page: NextPage<{ id?: string }> = ({ id }) => {
  const [matchRes, setMatchRes] = useState<MatchRes>();
  const [game, setGame] = useState<Game>();
  const [controllerList, setControllerList] = useState<Controller[]>([
    { label: "WSADキー", agentIndex: 0, axis: [0, 0] },
    { label: "Arrowキー", agentIndex: 1, axis: [0, 0] },
    { label: "GamePad 1", agentIndex: 2, axis: [0, 0] },
    { label: "GamePad 2", agentIndex: 3, axis: [0, 0] },
    { label: "GamePad 3", agentIndex: 4, axis: [0, 0] },
    { label: "GamePad 4", agentIndex: 5, axis: [0, 0] },
  ]);
  const dirWSAD = useKeyDirection({
    up: "w",
    down: "s",
    left: "a",
    right: "d",
  });
  const dirArrow = useKeyDirection({
    up: "ArrowUp",
    down: "ArrowDown",
    left: "ArrowLeft",
    right: "ArrowRight",
  });

  const [gamepads, setGamepads] = useState<Gamepads>([null, null, null, null]);
  const requestId = useRef<number>();
  const updateGamepads = useCallback(() => {
    const gps = navigator.getGamepads();
    setGamepads(gps);
    requestId.current = requestAnimationFrame(updateGamepads);
  }, []);

  useEffect(() => {
    updateGamepads();
    return () => {
      if (requestId.current) {
        cancelAnimationFrame(requestId.current);
      }
    };
  }, [updateGamepads]);

  const connect = useCallback(() => {
    if (!matchRes) return;
    const socket = new WebSocket(
      (host.protocol === "https:" ? "wss://" : "ws://") +
        host.host +
        "/v1/ws/game"
    );
    socket.onopen = () => {
      const q = `id:${matchRes.gameId}`;
      console.log(q);
      const req: WsGameReq = {
        q,
      };
      socket.send(JSON.stringify(req));
    };
    socket.onmessage = (event) => {
      const res = JSON.parse(event.data) as WsGameRes;
      console.log(res);
      let game: Game | undefined;
      if (res.type === "initial") {
        game = res.games[0];
      } else {
        game = res.game;
      }
      // console.log("setGame");
      setGame(game);
    };
    return () => {
      socket.close();
      console.log("websocket close");
    };
  }, [matchRes]);

  useEffect(() => {
    return connect();
  }, [connect]);

  useEffect(() => {
    if (controllerList[0].axis === dirWSAD) return;
    const list = [...controllerList];
    list[0].axis = dirWSAD;
    setControllerList(list);
  }, [dirWSAD, controllerList]);

  useEffect(() => {
    if (controllerList[1].axis === dirArrow) return;
    const list = [...controllerList];
    list[1].axis = dirArrow;
    setControllerList(list);
  }, [dirArrow, controllerList]);

  useEffect(() => {
    const list = [...controllerList];
    let isUpdate = false;
    for (let i = 0; i < gamepads.length; i++) {
      const gp = gamepads[i];
      const c = list[i + 2];
      const helperText = gp?.id || "未接続";
      if (c.helperText !== helperText) {
        c.helperText = helperText;
        isUpdate = true;
      }
      const axis =
        (gp?.axes.map((a) => Math.round(a)) as NextActionType) ||
        NextActions.NONE;
      if (c.axis[0] !== axis[0] || c.axis[1] !== axis[1]) {
        c.axis = axis;
        isUpdate = true;
      }
    }

    if (isUpdate) setControllerList(list);
  }, [gamepads, controllerList]);

  useEffect(() => {
    if (!matchRes || !game || !game.gaming || !game.board || !game.tiled)
      return;
    const board = game.board;
    const tiled = game.tiled;
    if (!board || !tiled) return;
    const actions: ActionPost[] = controllerList.flatMap((controller, i) => {
      const agentIndex = controller.agentIndex;
      const agent = game.players[matchRes.index].agents[agentIndex] || {
        x: -1,
        y: -1,
      };
      if (agent.x < 0) return [];
      const x = agent.x + controller.axis[0];
      const y = agent.y + controller.axis[1];
      const nextTile = tiled[y * board.width + x];
      if (!nextTile) return [];
      const type =
        nextTile.player !== matchRes.index && nextTile.type === 1
          ? "REMOVE"
          : "MOVE";
      return [
        {
          agentId: agentIndex,
          x,
          y,
          type,
        },
      ];
    });
    // console.log("update actions", game);
    // console.log(actions);
    apiClient.setAction(game.gameId, { actions }, matchRes.pic);
  }, [controllerList, game, matchRes]);

  useEffect(() => {
    if (!game || !matchRes || !game.gaming || !game.board) return;
    const board = game.board;
    if (game.turn === 1) {
      const playerIndex = matchRes.index;
      let x = playerIndex === 0 ? 1 : board.width - 2;
      const actions: ActionPost[] = controllerList
        .filter((c) => c.agentIndex >= 0)
        .map((c, i, array) => {
          const y = Math.floor(((board.height - 1) / (array.length - 1)) * i);
          // console.log(board.height, y);
          return { agentId: c.agentIndex, x, y, type: "PUT" };
        });
      // console.log("actions", actions);
      const res = apiClient.setAction(
        matchRes.gameId,
        { actions },
        matchRes.pic
      );
      // console.log(res);
    }
    /*if (game.turn >= 3) {
      setNextActions([
        NextActions.NONE,
        NextActions.NONE,
        NextActions.NONE,
        NextActions.NONE,
      ]);
    }*/
  }, [game, matchRes, controllerList]);

  async function joinGame(gameId?: string) {
    const matchRes = await apiClient.match({
      gameId,
      guest: {
        name: "guest1",
      },
    });
    if (matchRes.success) {
      setMatchRes(matchRes.data);
    }
  }

  const changeAgentController = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      agentIndex: number
    ) => {
      const list = [...controllerList];

      const oldController = list.find((c) => c.agentIndex === agentIndex);
      const newControllerIndex = parseInt(e.target.value);

      if (newControllerIndex >= 0) {
        const newController = list[newControllerIndex];
        if (oldController) {
          oldController.agentIndex = newController.agentIndex;
        }
        newController.agentIndex = agentIndex;
      } else if (oldController) {
        oldController.agentIndex = -1;
      }
      setControllerList(list);
    },
    [controllerList]
  );

  return (
    <Content title="手動ゲーム参加">
      <div style={{ display: "flex", flexDirection: "column", gap: "1em" }}>
        <Box sx={{ display: "flex", flexDirection: "row", gap: "0 1em" }}>
          <Button
            onClick={() => {
              joinGame();
            }}
          >
            フリーマッチ参加
          </Button>
          <Box component="p">or</Box>
          <form style={{ display: "flex", gap: "0 1em", flexGrow: "1" }}>
            <TextField sx={{ flexGrow: "1" }} label="ゲームID" />
            <Button
              sx={{
                height: "100%",
              }}
            >
              ゲームIDで参加
            </Button>
          </form>
        </Box>
        <Box
          sx={{
            border: "3px solid",
            borderColor: "#BBB",
            borderRadius: 1,
            p: 1.5,
          }}
        >
          <Box component="h4" sx={{ m: 0 }}>
            コントローラ設定
          </Box>
          <Box sx={{ mx: 1, display: "flex" }}>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-evenly",
                m: 1,
                gap: 1,
                width: "100%",
                "& > *": {
                  display: "flex",
                  minWidth: "15em",
                },
              }}
            >
              {new Array(6).fill(0).map((_, i) => {
                const controllerIndex = controllerList.findIndex(
                  (c) => c.agentIndex === i
                );

                return (
                  <TextField
                    key={i}
                    select
                    value={controllerIndex}
                    label={`Agent ${i + 1}`}
                    size="small"
                    onChange={(e) => changeAgentController(e, i)}
                  >
                    <MenuItem key={-1} value={-1}>
                      None
                    </MenuItem>
                    {controllerList.map((c, j) => (
                      <MenuItem key={j} value={j}>
                        {c.label}{" "}
                        <Box sx={{ fontSize: "0.8em", display: "inline" }}>
                          {c.helperText && `[${c.helperText}]`}
                        </Box>
                      </MenuItem>
                    ))}
                  </TextField>
                );
              })}
            </Box>
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            gap: "0 1em",
          }}
        >
          {new Array(6).fill(0).map((_, i) => {
            const c = controllerList.find((c) => c.agentIndex === i);
            return (
              <ManualAgent
                key={i}
                playerIndex={matchRes?.index || 0}
                agentData={{
                  index: i,
                  nextAction: c?.axis || NextActions.NONE,
                }}
                enable={Boolean(c)}
              />
            );
          })}
        </Box>
        {game && (
          <>
            <Link
              href={id ? `/vr/index.html?id=${id}` : "/vr/latest.html"}
              passHref
            >
              <Button style={{ margin: "auto" }}>VR版はこちら</Button>
            </Link>
            <GameList games={[game]} pagenation={false} hover={false} />
            <GameBoard game={game} />
            <PointsGraph game={game} />
          </>
        )}
      </div>
    </Content>
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
