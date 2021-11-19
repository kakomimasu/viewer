import React, { useEffect, useRef, useState, useCallback } from "react";
import { NextPage } from "next";
import Link from "next/link";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  apiClient,
  Game,
  User,
  WsGameReq,
  WsGameRes,
  host,
} from "../../../src/apiClient";

import datas from "../../../components/player_datas";

import Content from "../../../components/content";
import GameList from "../../../components/gamelist";
import GameBoard from "../../../components/gameBoard";

const PointsGraph: NextPage<{ game: Game }> = ({ game }) => {
  const data: { turn: number; points: number[] }[] = [];

  game.log.forEach((turn, i) => {
    const points = turn.players.map((player) => {
      return player.point.basepoint + player.point.wallpoint;
    });
    data.push({ turn: i, points });
  });

  const [users, setUsers] = useState<User[]>([]);
  const [playerIds, setPlayerIds] = useState<string[]>([]);

  useEffect(() => {
    const getUsers = async () => {
      const users_: typeof users = [];
      for (const id of playerIds) {
        const res = await apiClient.usersShow(id);
        if (res.success) users_.push(res.data);
      }
      setUsers([...users_]);
    };
    getUsers();
  }, [playerIds]);

  useEffect(() => {
    setPlayerIds(game.players.map((player) => player.id));
  }, [game.players]);

  return (
    <div style={{ width: "100%", height: "300px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 10, left: 5, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="turn"
            domain={[0, game.totalTurn - 1]}
            tickFormatter={(turn: number) => String(turn + 1)}
            type="number"
            tickCount={game.totalTurn / 2}
          />
          <YAxis />
          <Tooltip
            labelFormatter={(props) => "Turn : " + (Number(props) + 1)}
          />
          <Legend />

          {game.players.map((_, i) => {
            return (
              <Line
                key={users[i]?.screenName}
                type="monotone"
                dataKey={`points[${i}]`}
                stroke={datas[i].colors[1]}
                name={users[i]?.screenName || "loading..."}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

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
