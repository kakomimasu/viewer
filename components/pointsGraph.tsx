import React, { useMemo } from "react";
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

import { type Game } from "../src/apiClient";
import { useGameUsers } from "../src/useGameUsers";
import datas from "./player_datas";

const PointsGraph: NextPage<{ game: Game }> = ({ game }) => {
  const data: { turn: number; points: number[] }[] = [];

  game.log.forEach((turn, i) => {
    const points = turn.players.map((player) => {
      return player.point.basepoint + player.point.wallpoint;
    });
    data.push({ turn: i, points });
  });

  const playerIds = useMemo(
    () => game.players.map((p) => p.id),
    [game.players]
  );
  const users = useGameUsers(playerIds);

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

          {game.players.map((player, i) => {
            const user = users.get(player.id);
            return (
              <Line
                key={i}
                type="monotone"
                dataKey={`points[${i}]`}
                stroke={datas[i].colors[1]}
                name={user ? user.screenName : player.id}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PointsGraph;
