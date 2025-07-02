import { useMemo } from "react";
import { NextPage } from "next";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Box } from "@mui/material";
import { useResizeDetector } from "react-resize-detector";

import { type Game } from "../src/apiClient";
import { useGameUsers } from "../src/useGameUsers";
import datas from "./player_datas";

const PointsGraph: NextPage<{
  game: Game;
  users: ReturnType<typeof useGameUsers>;
}> = ({ game, users }) => {
  const data = useMemo(() => {
    return game.log.map((turn, i) => {
      const points = turn.players.map((player) => {
        return player.point.areaPoint + player.point.wallPoint;
      });
      return { turn: i, points };
    });
  }, [game.log]);

  const { width, height, ref } = useResizeDetector();

  return (
    <Box sx={{ width: "100%", height: "100%" }} ref={ref}>
      <LineChart
        data={data}
        width={width}
        height={height}
        style={{ position: "absolute", fontSize: "0.8em" }}
      >
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis
          dataKey="turn"
          domain={[0, game.totalTurn - 1]}
          tickFormatter={(turn: number) => String(turn + 1)}
          type="number"
          tickCount={game.totalTurn / 2}
          height={20}
        />
        <YAxis width="auto" />
        <Tooltip labelFormatter={(props) => "Turn : " + (Number(props) + 1)} />
        <Legend />

        {game.players.map((player, i) => {
          const user = users.get(player.id);
          return (
            <Line
              key={i}
              isAnimationActive={false}
              dataKey={`points[${i}]`}
              stroke={datas[i].colors[1]}
              name={user ? user.screenName : player.id}
            />
          );
        })}
      </LineChart>
    </Box>
  );
};

export default PointsGraph;
