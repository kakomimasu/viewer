import React, { useEffect, useState } from "react";
import { NextPage } from "next";
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

import { apiClient, Game, User } from "../src/apiClient";
import datas from "./player_datas";

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

export default PointsGraph;
