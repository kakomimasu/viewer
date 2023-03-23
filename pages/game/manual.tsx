import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { NextPage } from "next";
import Head from "next/head";
import {
  TextField,
  Box,
  MenuItem,
  Button,
  Paper,
  Dialog,
  DialogTitle,
} from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import TuneIcon from "@mui/icons-material/Tune";

import {
  apiClient,
  Game,
  JoinMatchRes,
  ApiRes,
  StreamMatchesReq,
  ActionMatchReq,
  JoinMatchReqBase,
} from "../../src/apiClient";
import { useGameUsers } from "../../src/useGameUsers";
import { useGameStream } from "../../src/useGameStream";

import datas from "../../components/player_datas";
import GamePanel from "../../components/gamePanel";
import MatchTypeTab, { MatchType } from "../../components/matchTypeTab";

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
type Controller = { label: string; helperText?: string; agentIndex: number };

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

const localStorageKey = "controllerSettings";

const Page: NextPage = () => {
  const [matchType, setMatchType] = useState<MatchType>();
  const [matchRes, setMatchRes] = useState<JoinMatchRes>();
  const query = useMemo<StreamMatchesReq | undefined>(() => {
    if (!matchRes) {
      if (matchType?.type === "free") {
        return {
          q: "sort:startAtUnixTime-desc type:normal is:waiting",
          allowNewGame: true,
        };
      }
    } else {
      return { q: `id:${matchRes.gameId}` };
    }
  }, [matchRes, matchType]);
  const selectedGame = useGameStream(query);
  const game = useMemo<Game | undefined>(() => selectedGame[0], [selectedGame]);
  const playerIds = useMemo(() => game?.players.map((p) => p.id) || [], [game]);
  const users = useGameUsers(playerIds);
  const [controllerList, setControllerList] = useState<Controller[]>([
    { label: "WSADキー", agentIndex: 0 },
    { label: "Arrowキー", agentIndex: 1 },
    { label: "GamePad 1", agentIndex: 2 },
    { label: "GamePad 2", agentIndex: 3 },
    { label: "GamePad 3", agentIndex: 4 },
    { label: "GamePad 4", agentIndex: 5 },
  ]);
  const [axisList, setAxisList] = useState<NextActionType[]>([
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
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
    const index = controllerList[0].agentIndex;
    if (index < 0) return;
    setAxisList((prev) => {
      if (prev[index] === dirWSAD) return prev;
      const list = [...prev];
      list[index] = dirWSAD;
      return list;
    });
  }, [dirWSAD, controllerList]);

  useEffect(() => {
    if (dirArrow[0] === 0 && dirArrow[1] === 0) return;
    const index = controllerList[1].agentIndex;
    if (index < 0) return;
    setAxisList((prev) => {
      if (prev[index] === dirArrow) return prev;
      const list = [...prev];
      list[index] = dirArrow;
      return list;
    });
  }, [dirArrow, controllerList]);

  const changeController = useCallback(
    (i: number, dir: NextActionType) => {
      rawGamepadAxis.current[i] = dir;
      const axisListIndex = controllerList[i + 2].agentIndex;
      if (axisListIndex < 0) return;

      if (gamepadChangeTime.current[i] === undefined) {
        gamepadChangeTime.current[i] = Date.now();
        setTimeout(() => {
          gamepadChangeTime.current[i] = undefined;

          setAxisList((prev) => {
            const list = [...prev];
            const c = list[axisListIndex];
            const axis = rawGamepadAxis.current[i];
            if (
              (axis[0] === c[0] && axis[1] === c[1]) ||
              (axis[0] === 0 && axis[1] === 0)
            ) {
              return prev;
            } else {
              list[axisListIndex] = axis as NextActionType;
              return list;
            }
          });
        }, 50);
      }
    },
    [controllerList]
  );

  useEffect(() => {
    setControllerList((prev) => {
      const list = structuredClone(prev);
      let isUpdate = false;
      for (let i = 0; i < gamepads.length; i++) {
        const gp = gamepads[i];
        const c = list[i + 2];
        const helperText = gp?.id || "未接続";
        if (c.helperText !== helperText) {
          c.helperText = helperText;
          isUpdate = true;
        }
      }
      if (isUpdate) return list;
      else return prev;
    });
    for (let i = 0; i < gamepads.length; i++) {
      const gp = gamepads[i];
      const axis =
        (gp?.axes.map((a) => Math.round(a)) as NextActionType) ||
        NextActions.NONE;
      changeController(i, axis);
    }
  }, [gamepads, changeController]);

  useEffect(() => {
    if (!matchRes || !game || !game.gaming || !game.board || !game.tiled)
      return;
    const board = game.board;
    const tiled = game.tiled;
    if (!board || !tiled) return;

    const actions: ActionMatchReq["actions"] = axisList.flatMap(
      (axis, agentId) => {
        const agent = game.players[matchRes.index].agents[agentId] || {
          x: -1,
          y: -1,
        };
        if (agent.x < 0) return [];
        const x = agent.x + axis[0];
        const y = agent.y + axis[1];
        const nextTile = tiled[y * board.width + x];
        if (!nextTile) return [];
        const type =
          nextTile.player !== matchRes.index && nextTile.type === 1
            ? "REMOVE"
            : "MOVE";
        return [{ agentId, x, y, type }];
      }
    );
    apiClient.setAction(game.id, { actions }, matchRes.pic);
  }, [controllerList, game, matchRes, axisList]);

  useEffect(() => {
    if (!game || !matchRes || !game.gaming || !game.board) return;
    const board = game.board;
    if (game.turn === 1) {
      const playerIndex = matchRes.index;
      let x = playerIndex === 0 ? 1 : board.width - 2;
      const actions: ActionMatchReq["actions"] = controllerList
        .filter((c) => c.agentIndex >= 0)
        .map((c, i, array) => {
          const y = Math.floor(((board.height - 1) / (array.length - 1)) * i);
          return { agentId: c.agentIndex, x, y, type: "PUT" };
        });
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
      setAxisList(new Array(6).fill(NextActions.NONE));
    }
  }, [game]);

  const joinGame = useCallback(async () => {
    const req: JoinMatchReqBase = { guestName: "guest" };
    let matchRes: ApiRes<JoinMatchRes>;
    if (matchType?.type === "gameId") {
      matchRes = await apiClient.joinGameIdMatch(matchType.gameId, req);
    } else if (matchType?.type === "ai") {
      matchRes = await apiClient.joinAiMatch({
        ...req,
        aiName: matchType.aiName,
        boardName: matchType.boardName,
      });
    } else {
      matchRes = await apiClient.joinFreeMatch(req);
    }
    if (matchRes.success) {
      setMatchRes(matchRes.data);
    }
  }, [matchType]);

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

  const participateButton = useMemo(() => {
    let buttonDiasbled = false;
    if (matchRes) buttonDiasbled = true;
    // ゲームIDが入力されていない場合は参加ボタンを無効化
    else if (matchType?.type === "gameId" && !matchType.gameId)
      buttonDiasbled = true;

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 3,
          justifyContent: "center",
        }}
      >
        <Button onClick={joinGame} disabled={buttonDiasbled}>
          参加する
        </Button>
      </Box>
    );
  }, [matchType, joinGame, matchRes]);

  const [controllerSettingDialogOpened, setControllerSettingDialogOpened] =
    useState<boolean>(false);

  const controllerSetting = useMemo(() => {
    return (
      <Box>
        <Button
          color="primary"
          sx={{ height: "100%" }}
          startIcon={<TuneIcon />}
          onClick={() => {
            setControllerSettingDialogOpened(true);
          }}
        >
          コントローラ設定
        </Button>
        <Dialog
          open={controllerSettingDialogOpened}
          onClose={() => {
            setControllerSettingDialogOpened(false);
          }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box>コントローラ設定</Box>
            <Button
              onClick={resetControllerSettings}
              startIcon={<RestartAltIcon />}
            >
              初期設定に戻す
            </Button>
          </DialogTitle>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              p: 2,
              gap: 2,
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
        </Dialog>
      </Box>
    );
  }, [
    controllerList,
    changeAgentController,
    resetControllerSettings,
    controllerSettingDialogOpened,
  ]);

  const agentViewer = useMemo(() => {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        {axisList.map((axis, i) => {
          const c = controllerList.find((c) => c.agentIndex === i);
          return (
            <ManualAgent
              key={i}
              playerIndex={matchRes?.index || 0}
              agentData={{
                index: i,
                nextAction: axis || NextActions.NONE,
              }}
              enable={Boolean(c)}
            />
          );
        })}
      </Box>
    );
  }, [controllerList, matchRes?.index, axisList]);

  const gamePanel = useMemo(() => {
    if (query && game) {
      return <GamePanel game={game} users={users} />;
    } else return;
  }, [game, users, query]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, m: 1 }}>
      <Head>
        <title>手動ゲーム参加 - 囲みマス</title>
      </Head>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr max-content max-content",
          gap: 1,
        }}
      >
        <Paper>
          <MatchTypeTab disabled={Boolean(matchRes)} onChange={setMatchType} />
        </Paper>
        {controllerSetting}
        {participateButton}
      </Box>
      {agentViewer}
      {gamePanel}
    </Box>
  );
};

export default Page;
