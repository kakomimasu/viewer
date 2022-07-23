import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { NextPage } from "next";
import {
  TextField,
  Box,
  MenuItem,
  Tab,
  IconButton,
  Button,
} from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { TabContext, TabList, TabPanel } from "@mui/lab";

import {
  apiClient,
  Game,
  WsGameReq,
  MatchRes,
  ActionPost,
  MatchReq,
} from "../../../src/apiClient";
import { useGameUsers } from "../../../src/useGameUsers";
import { useWebSocketGame } from "../../../src/useWebsocketGame";

import datas from "../../../components/player_datas";
import GamePanel from "../../../components/gamePanel";
import Content from "../../../components/content";

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

const aiList = [
  { label: "AI-1", name: "a1" },
  { label: "AI-2", name: "a2" },
  { label: "AI-3", name: "a3" },
  { label: "AI-4", name: "a4" },
  { label: "AI-5", name: "a5" },
  { label: "None", name: "none" },
] as const;

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
                  key={`${x}-${y}`}
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
                  key={`${x}-${y}`}
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
  const rawDirection = useRef<NextActionType>(NextActions.NONE);
  const changeTime = useRef<number>();

  const changeDirection = useCallback((dir: NextActionType) => {
    rawDirection.current = dir;

    if (changeTime.current === undefined) {
      changeTime.current = Date.now();
      setTimeout(() => {
        changeTime.current = undefined;

        setDirection((prev) => {
          const curr = rawDirection.current;
          if (curr[0] === prev[0] && curr[1] === prev[1]) return prev;
          else return curr;
        });
      }, 20);
    }
  }, []);

  const onKeyChange = useCallback(
    (e: KeyboardEvent) => {
      const dir: NextActionType = [...rawDirection.current];
      const isKeyDown = e.type === "keydown";
      if (e.key === useKey.up) dir[1] = isKeyDown ? -1 : 0;
      else if (e.key === useKey.down) dir[1] = isKeyDown ? 1 : 0;
      else if (e.key === useKey.left) dir[0] = isKeyDown ? -1 : 0;
      else if (e.key === useKey.right) dir[0] = isKeyDown ? 1 : 0;
      else return;
      e.preventDefault(); // 該当するキーが押されたらキーイベントをキャンセル
      if (e.repeat) return;

      changeDirection(dir);
    },
    [changeDirection, useKey]
  );
  useEffect(() => {
    document.addEventListener("keydown", onKeyChange, false);
    document.addEventListener("keyup", onKeyChange, false);
    return () => {
      document.removeEventListener("keydown", onKeyChange, false);
      document.removeEventListener("keyup", onKeyChange, false);
    };
  }, [onKeyChange]);

  return direction;
}

const useGamepads = () => {
  const [gamepads, setGamepads] = useState<Gamepads>([null, null, null, null]);

  useEffect(() => {
    let requestId: number | undefined;
    const updateGamepads = () => {
      const gps = navigator.getGamepads();
      setGamepads((prev) => {
        const isUpdate = !gps.every((gp, i) => gp === prev[i]);
        return isUpdate ? gps : prev;
      });
      requestId = requestAnimationFrame(updateGamepads);
    };
    updateGamepads();
    return () => {
      if (requestId) {
        cancelAnimationFrame(requestId);
      }
    };
  }, []);

  return gamepads;
};

type ParticipateType = "free" | "gameId" | "ai";
const localStorageKey = "controllerSettings";

const Page: NextPage<{ id?: string }> = ({ id }) => {
  const [participateType, setParticipateType] =
    useState<ParticipateType>("free");
  const [gameId, setGameId] = useState<string>();
  const [ai, setAi] = useState<typeof aiList[number]["name"]>(aiList[0].name);

  const [matchRes, setMatchRes] = useState<MatchRes>();
  const query = useMemo<WsGameReq | undefined>(() => {
    if (!matchRes) {
      if (participateType === "free") {
        return {
          q: "sort:startAtUnixTime-desc type:normal is:waiting",
          allowNewGame: true,
        };
      }
    } else {
      return { q: `id:${matchRes.gameId}` };
    }
  }, [matchRes, participateType]);
  const selectedGame = useWebSocketGame(query);
  const game = useMemo<Game | undefined>(() => selectedGame[0], [selectedGame]);
  const playerIds = useMemo(() => game?.players.map((p) => p.id) || [], [game]);
  const users = useGameUsers(playerIds);
  const [controllerList, setControllerList] = useState<Controller[]>([
    { label: "WSADキー", agentIndex: 0, axis: [0, 0] },
    { label: "Arrowキー", agentIndex: 1, axis: [0, 0] },
    { label: "GamePad 1", agentIndex: 2, axis: [0, 0] },
    { label: "GamePad 2", agentIndex: 3, axis: [0, 0] },
    { label: "GamePad 3", agentIndex: 4, axis: [0, 0] },
    { label: "GamePad 4", agentIndex: 5, axis: [0, 0] },
  ]);
  const readControllerSettings = useCallback(() => {
    const dataStr = localStorage.getItem(localStorageKey);
    setControllerList((prev) => {
      const indexList = dataStr ? JSON.parse(dataStr) : [];
      return prev.map((c, i) => ({ ...c, agentIndex: indexList[i] ?? i }));
    });
  }, []);
  useEffect(() => {
    readControllerSettings();
  }, [readControllerSettings]);
  const resetControllerSettings = useCallback(() => {
    localStorage.removeItem(localStorageKey);
    readControllerSettings();
  }, [readControllerSettings]);
  useEffect(() => {
    const list = controllerList.map(({ agentIndex }) => agentIndex);
    localStorage.setItem(localStorageKey, JSON.stringify(list));
  }, [controllerList]);

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

  const gamepads = useGamepads();
  const rawGamepadAxis = useRef<[number, number][]>([
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
  ]);
  const gamepadChangeTime = useRef<(number | undefined)[]>([
    undefined,
    undefined,
    undefined,
    undefined,
  ]);

  useEffect(() => {
    if (dirWSAD[0] === 0 && dirWSAD[1] === 0) return;
    setControllerList((prev) => {
      if (prev[0].axis === dirWSAD) return prev;
      const list = [...prev];
      const l = { ...list[0] };
      l.axis = dirWSAD;
      list[0] = l;
      return list;
    });
  }, [dirWSAD]);

  useEffect(() => {
    if (dirArrow[0] === 0 && dirArrow[1] === 0) return;
    setControllerList((prev) => {
      if (prev[1].axis === dirArrow) return prev;
      const list = [...prev];
      const l = { ...list[1] };
      l.axis = dirArrow;
      list[1] = l;
      return list;
    });
  }, [dirArrow]);

  const changeController = useCallback((i: number, dir: NextActionType) => {
    rawGamepadAxis.current[i] = dir;

    if (gamepadChangeTime.current[i] === undefined) {
      gamepadChangeTime.current[i] = Date.now();
      setTimeout(() => {
        gamepadChangeTime.current[i] = undefined;

        setControllerList((prev) => {
          const list = [...prev];
          const c = list[i + 2];
          const axis = rawGamepadAxis.current[i];
          if (
            (axis[0] === c.axis[0] && axis[1] === c.axis[1]) ||
            (axis[0] === 0 && axis[1] === 0)
          ) {
            return prev;
          } else {
            c.axis = axis as NextActionType;
            return list;
          }
        });
      }, 50);
    }
  }, []);

  useEffect(() => {
    setControllerList((prev) => {
      const list = [...prev];
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
        changeController(i, axis);
      }
      if (isUpdate) return list;
      else return prev;
    });
  }, [gamepads, changeController]);

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
    apiClient.setAction(game.id, { actions }, matchRes.pic);
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
      console.log(res);
    }
  }, [game, matchRes, controllerList]);

  useEffect(() => {
    if (!game) return;
    if (game.turn >= 3) {
      setControllerList((prev) => {
        const list = [...prev];
        list.forEach((c) => {
          c.axis = NextActions.NONE;
        });
        return list;
      });
    }
  }, [game]);

  const joinGame = useCallback(async () => {
    const req: MatchReq = { guest: { name: "guest" } };
    if (participateType === "gameId") {
      req.gameId = gameId;
    } else if (participateType === "ai") {
      req.useAi = true;
      req.aiOption = {
        aiName: ai,
      };
    }
    const matchRes = await apiClient.match(req);
    if (matchRes.success) {
      setMatchRes(matchRes.data);
    }
  }, [gameId, participateType, ai]);

  // const preview = useCallback(() => {
  //   console.log(participateType, gameId, ai);
  // }, [participateType, gameId, ai]);

  const changeAgentController = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      agentIndex: number
    ) => {
      setControllerList((prev) => {
        const list = [...prev];

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
        return list;
      });
    },
    []
  );

  return (
    <Content title="手動ゲーム参加">
      <div style={{ display: "flex", flexDirection: "column", gap: "1em" }}>
        <TabContext value={participateType}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <TabList
              textColor="secondary"
              indicatorColor="secondary"
              centered
              onChange={(_, v) => {
                setParticipateType(v);
              }}
            >
              <Tab
                label="フリーマッチ参加"
                value="free"
                disabled={Boolean(matchRes)}
              />
              <Tab
                label="ゲームIDで参加"
                value="gameId"
                disabled={Boolean(matchRes)}
              />
              <Tab label="対AI戦" value="ai" disabled={Boolean(matchRes)} />
            </TabList>
          </Box>
          <TabPanel value="gameId">
            <TextField
              fullWidth
              label="ゲームID"
              value={gameId}
              disabled={Boolean(matchRes)}
              onChange={({ target: { value } }) => {
                setGameId(value);
                // console.log(e);
              }}
            />
          </TabPanel>
          <TabPanel value="ai">
            <TextField
              fullWidth
              select
              label="対戦AI"
              value={ai}
              disabled={Boolean(matchRes)}
              onChange={({ target: { value } }) => {
                setAi(value as typeof ai);
              }}
            >
              {aiList.map((ai) => {
                return (
                  <MenuItem key={ai.name} value={ai.name}>
                    {ai.label}
                  </MenuItem>
                );
              })}
            </TextField>
          </TabPanel>
        </TabContext>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 3,
            justifyContent: "center",
          }}
        >
          {/* <Button
            disabled={participateType === "ai"}
            onClick={() => {
              preview();
            }}
          >
            ゲームプレビュー
          </Button> */}
          <Button onClick={joinGame} disabled={Boolean(matchRes)}>
            参加する
          </Button>
        </Box>
        <Box
          sx={{
            border: "3px solid",
            borderColor: "#BBB",
            borderRadius: 1,
            p: 1.5,
          }}
        >
          <Box
            component="h4"
            sx={{ m: 0, display: "flex", alignItems: "center" }}
          >
            コントローラ設定
            <IconButton
              color="secondary"
              onClick={resetControllerSettings}
              size="small"
            >
              <RestartAltIcon />
            </IconButton>
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
        {query && (
          <Box
            sx={{
              height: "calc(2em + 50vw)",
              maxHeight: "calc(100vh - 64px)",
            }}
          >
            <GamePanel game={game} users={users} />
          </Box>
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
