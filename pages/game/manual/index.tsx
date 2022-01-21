import React, { useEffect, useState, useCallback } from "react";
import next, { NextPage } from "next";
import Link from "next/link";
import Button from "@mui/material/Button";
import { TextField, Box } from "@mui/material";

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

const ManualAgent = ({
  playerIndex,
  agentData,
}: {
  playerIndex: number;
  agentData: AgentData;
}) => {
  const playerData = datas[playerIndex];
  const na = agentData.nextAction;
  return (
    <Box
      sx={{
        border: "3px solid",
        borderColor: playerData.colors[1],
        borderRadius: "1em",
        p: 1,
      }}
    >
      <Box components="h5" sx={{ mb: 1 }}>
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
      // console.log(e.key);
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
      // console.log(e.key);
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
  const [nextActions, setNextActions] = useState<NextActionType[]>([
    NextActions.NONE,
    NextActions.NONE,
    NextActions.NONE,
    NextActions.NONE,
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
  // const [isShowNextAction, setIsShowNextAction] = useState(false);
  // const refGame = useRef(game);

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
    if (nextActions[0] === dirWSAD) return;
    const nas = [...nextActions];
    nas[0] = dirWSAD;
    setNextActions(nas);
  }, [dirWSAD, nextActions]);

  useEffect(() => {
    if (nextActions[1] === dirArrow) return;
    const nas = [...nextActions];
    nas[1] = dirArrow;
    setNextActions(nas);
  }, [dirArrow, nextActions]);

  useEffect(() => {
    if (!matchRes || !game || !game.gaming || !game.board || !game.tiled)
      return;
    const board = game.board;
    const tiled = game.tiled;
    if (!board || !tiled) return;
    const actions: ActionPost[] = nextActions.flatMap((nextAction, i) => {
      if (nextAction[0] === 0 && nextAction[1] === 0) return [];
      const agent = game.players[matchRes.index].agents[i];
      if (agent.x < 0) return [];
      const x = agent.x + nextAction[0];
      const y = agent.y + nextAction[1];
      const nextTile = tiled[y * board.width + x];
      if (!nextTile) return [];
      const type =
        nextTile.player !== matchRes.index && nextTile.type === 1
          ? "REMOVE"
          : "MOVE";
      return [
        {
          agentId: i,
          x,
          y,
          type,
        },
      ];
    });
    console.log("update actions", game);
    console.log(actions);
    apiClient.setAction(game.gameId, { actions }, matchRes.pic);
  }, [nextActions, game, matchRes]);

  useEffect(() => {
    if (!game || !matchRes || !game.gaming || !game.board) return;
    const board = game.board;
    if (game.turn === 1) {
      const playerIndex = matchRes.index;
      let x: number;
      if (playerIndex === 0) x = 1;
      else x = board.width - 2;
      const actions: ActionPost[] = new Array(4).fill(0).map((_, i) => {
        const y = Math.floor(((board.height - 1) / 3) * i);
        console.log(board.height, y);
        return { agentId: i, x, y, type: "PUT" };
      });
      console.log("actions", actions);
      const res = apiClient.setAction(
        matchRes.gameId,
        { actions },
        matchRes.pic
      );
      console.log(res);
    }
    /*if (game.turn >= 3) {
      setNextActions([
        NextActions.NONE,
        NextActions.NONE,
        NextActions.NONE,
        NextActions.NONE,
      ]);
    }*/
  }, [game, matchRes]);

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

  return (
    <Content title="手動ゲーム参加">
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Box
          sx={{ display: "flex", flexDirection: "row", gap: "0 1em", my: 1 }}
        >
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
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            gap: "0 1em",
            my: 1,
          }}
        >
          {nextActions.map((action, i) => (
            <ManualAgent
              key={i}
              playerIndex={matchRes?.index || 0}
              agentData={{ index: i, nextAction: action }}
            />
          ))}
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
