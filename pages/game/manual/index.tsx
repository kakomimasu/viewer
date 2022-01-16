import React, { useEffect, useState, useCallback } from "react";
import { NextPage } from "next";
import Link from "next/link";
import Button from "@mui/material/Button";
import { TextField, Box } from "@mui/material";

import {
  apiClient,
  Game,
  WsGameReq,
  WsGameRes,
  host,
} from "../../../src/apiClient";
import datas from "../../../components/player_datas";

import Content from "../../../components/content";
import GameList from "../../../components/gamelist";
import GameBoard from "../../../components/gameBoard";
import PointsGraph from "../../../components/pointsGraph";

type NextActionType = [number, number];
const NextActions: Record<
  "UP" | "LEFT" | "RIGHT" | "DOWN" | "NONE",
  NextActionType
> = {
  UP: [0, -1],
  LEFT: [-1, 0],
  RIGHT: [1, 0],
  DOWN: [0, 1],
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
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(50px, 1fr))",
          gap: "1px",
          "&>div": {
            outline: "1px solid #333",
            aspectRatio: "1 / 1",
          },
        }}
      >
        <Box
          sx={{
            gridColumn: "2",
            gridRow: "2",
            backgroundSize: "80%",
            backgroundPosition: "0% 50%",
            backgroundRepeat: "no-repeat",
            backgroundImage: `url(${playerData.agentUrl})`,
            backgroundColor: playerData.colors[1],
            boxSizing: "content-box",
          }}
        />
        <Box
          sx={{
            gridColumn: "2",
            gridRow: "1",
            backgroundColor: na === NextActions.UP ? playerData.colors[0] : "",
          }}
        />
        <Box
          sx={{
            gridColumn: "1",
            gridRow: "2",
            backgroundColor:
              na === NextActions.LEFT ? playerData.colors[0] : "",
          }}
        />
        <Box
          sx={{
            gridColumn: "3",
            gridRow: "2",
            backgroundColor:
              na === NextActions.RIGHT ? playerData.colors[0] : "",
          }}
        />
        <Box
          sx={{
            gridColumn: "2",
            gridRow: "3",
            backgroundColor:
              na === NextActions.DOWN ? playerData.colors[0] : "",
          }}
        />
      </Box>
    </Box>
  );
};

const Page: NextPage<{ id?: string }> = ({ id }) => {
  const [gameId, setGameId] = useState<string>();
  const [game, setGame] = useState<Game>();
  // const [isShowNextAction, setIsShowNextAction] = useState(false);
  // const refGame = useRef(game);

  const connect = useCallback(() => {
    if (!gameId) return;
    const socket = new WebSocket(
      (host.protocol === "https:" ? "wss://" : "ws://") +
        host.host +
        "/v1/ws/game"
    );
    socket.onopen = () => {
      const q = `id:${gameId}`;
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
  }, [gameId]);

  useEffect(() => {
    return connect();
  }, [connect]);

  // useEffect(() => {
  //   refGame.current = game;
  // }, [game]);

  async function joinGame(gameId?: string) {
    const matchRes = await apiClient.match({
      gameId,
      guest: {
        name: "guest1",
      },
    });
    if (matchRes.success) {
      // const gameRes = await apiClient.getMatch(matchRes.data.gameId);
      setGameId(matchRes.data.gameId);
      console.log(matchRes);
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
          sx={{ display: "flex", flexDirection: "row", gap: "0 1em", my: 1 }}
        >
          <ManualAgent
            playerIndex={0}
            agentData={{ index: 0, nextAction: NextActions.UP }}
          />
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
