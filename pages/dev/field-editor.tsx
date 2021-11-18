import React, { useEffect, useState } from "react";
import { makeStyles } from "@mui/styles";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

import Content from "../../components/content";
import GameBoard from "../../components/gameBoard";

import { apiClient, Board, Game } from "../../src/apiClient";

const useStyles = makeStyles({
  content: {
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
  },
  pieGraph: {
    height: 300,
  },
});

type NestedPartial<T> = {
  [K in keyof T]?: T[K] extends Array<infer R>
    ? Array<NestedPartial<R>>
    : NestedPartial<T[K]>;
};

export default function FieldEditor() {
  const classes = useStyles();
  const [boards, setBoards] = useState<Board[]>();
  const [game, setGame] =
    useState<
      Pick<
        Game,
        | "board"
        | "tiled"
        | "players"
        | "log"
        | "startedAtUnixTime"
        | "gaming"
        | "ending"
        | "nextTurnUnixTime"
      >
    >();

  useEffect(() => {
    getBoards();
  }, []);

  async function getBoards() {
    const res = await apiClient.getBoards();
    console.log();
    if (res.success) setBoards(res.data);
  }

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value;
    if (!boards) return;
    const board = boards.find((b) => b.name === value);
    if (!board) return;
    const tiled = new Array(board.height * board.width);
    for (let i = 0; i < tiled.length; i++) {
      tiled[i] = { type: 0, player: null };
    }
    const game: Pick<
      Game,
      | "board"
      | "tiled"
      | "players"
      | "log"
      | "startedAtUnixTime"
      | "gaming"
      | "ending"
      | "nextTurnUnixTime"
    > = {
      board,
      tiled,
      players: [
        { id: "", agents: [], point: { basepoint: 0, wallpoint: 0 } },
        {
          id: "",
          agents: [],
          point: { basepoint: 0, wallpoint: 0 },
        },
      ],
      log: [],
      startedAtUnixTime: null,
      nextTurnUnixTime: null,
      gaming: false,
      ending: false,
    };
    setGame(game);
  };

  useEffect(() => {
    if (!game) return;
    const table = document.querySelector("#game-board #field");
    if (!table) return;
    const board = game.board;
    if (!board) return;
    const tds = table.getElementsByTagName("td");

    for (let i = 0; i < tds.length; i++) {
      const [x, y] = [i % board.height, Math.floor(i / board.width)];
      const td = tds[i];
      td.oncontextmenu = () => false;
      td.onmousedown = (e) => {
        if (!game.tiled) return;
        const tiled = [...game.tiled];
        const players = [...game.players];

        const isAgent = (x: number, y: number) => {
          if (game.players) {
            const agent = game.players
              .map((e, i) =>
                e.agents.map((e_, j) => {
                  return { agent: e_, player: i, n: j };
                })
              )
              .flat()
              .find((e) => e.agent.x === x && e.agent.y === y);
            return agent;
          } else return undefined;
        };

        switch (e.button) {
          case 0: {
            // a = [no,p1base,p2base,p1wall,p2wall]
            let t = tiled[i];
            const tPlayer = t.player === null ? -1 : t.player;
            let a = t.type * 2 + tPlayer + 1;
            console.log(a, t);
            a = (a + 1) % 5;
            let tPlayer_: number | null = (a - 1) % 2;
            tPlayer_ = tPlayer_ === -1 ? null : tPlayer_;
            t = { type: Math.trunc((a - 1) / 2) as 0 | 1, player: tPlayer_ };
            console.log(a, t);
            tiled[i] = t;

            const agent = isAgent(x, y);
            if (agent) {
              players[agent.player].agents.splice(agent.n, 1);
            }
            break;
          }
          case 2: {
            const t = tiled[i];
            if (t.type === 1) {
              const a = isAgent(x, y);
              if (a) players[a.player].agents.splice(a.n, 1);
              else players[t.type].agents.push({ x, y });
            }
            break;
          }
        }
        setGame({ ...game, tiled, players });
      };
    }
  });

  return (
    <Content title="フィールド説明用エディタ">
      <div className={classes.content}>
        <TextField
          select
          label="使用ボード"
          color="secondary"
          autoComplete="off"
          style={{ width: "20em" }}
          onChange={handleChange}
        >
          {boards?.map((board) => {
            return (
              <MenuItem key={board.name} value={board.name}>
                {board.name}
              </MenuItem>
            );
          })}
        </TextField>
        {game && (
          <div id="game-board">
            <GameBoard game={game} />
          </div>
        )}
      </div>
    </Content>
  );
}
