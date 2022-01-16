import React, { useEffect, useRef, useState, useCallback } from "react";
import { NextPage } from "next";
import Link from "next/link";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";

import { Game, WsGameReq, WsGameRes, host } from "../../../src/apiClient";

import Content from "../../../components/content";
import GameList from "../../../components/gamelist";
import GameBoard from "../../../components/gameBoard";
import PointsGraph from "../../../components/pointsGraph";

const Page: NextPage<{ id?: string }> = ({ id }) => {
  const [game, setGame] = useState<Game | null>();
  const refGame = useRef(game);

  const connect = useCallback(() => {
    const socket = new WebSocket(
      (host.protocol === "https:" ? "wss://" : "ws://") +
        host.host +
        "/v1/ws/game"
    );
    socket.onopen = () => {
      const q = (
        id
          ? [`id:${id}`]
          : ["sort:startAtUnixTime-desc", "is:newGame", `is:normal`]
      ).join(" ");
      console.log(q);
      const req: WsGameReq = {
        q,
        endIndex: 1,
      };
      socket.send(JSON.stringify(req));
    };
    socket.onmessage = (event) => {
      const res = JSON.parse(event.data) as WsGameRes;
      console.log(res);
      if (res.type === "initial") {
        if (res.games.length > 0) {
          console.log("setGame");
          setGame(res.games[0]);
        } else {
          setGame(null);
        }
      } else {
        if (res.game.gameId === refGame.current?.gameId) {
          setGame(res.game);
        } else if (
          (res.game.startedAtUnixTime ?? 10000000000) >
          (refGame.current?.startedAtUnixTime ?? 10000000000)
        ) {
          connect();
        }
      }
    };
    return () => {
      socket.close();
      console.log("websocket close");
    };
  }, [id]);

  useEffect(() => {
    return connect();
  }, [connect]);

  useEffect(() => {
    refGame.current = game;
  }, [game]);

  return (
    <Content title="ゲーム詳細">
      <div style={{ display: "flex", flexDirection: "column" }}>
        {game ? (
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
        ) : (
          <CircularProgress color="secondary" />
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
