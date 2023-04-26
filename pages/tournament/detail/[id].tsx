import React, { useState } from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

import { apiClient, Game, Tournament, User } from "../../../src/apiClient";
import Link from "../../../src/link";

import Content from "../../../components/content";
import Section, { SubSection } from "../../../components/section";

const StyledTable = styled("table")({
  margin: "0 auto",
  width: "max-content",
  border: "1px solid",
  borderCollapse: "collapse",
  textAlign: "center",
  "& td,& th": {
    border: "1px solid",
    padding: "5px",
  },
});

const Oblique = styled("td")({
  backgroundImage: `linear-gradient(to top right,
  transparent, transparent 49%,
  black 49%, black 51%,
  transparent 51%, transparent)`,
});

const Page: NextPage<{
  tournament?: Tournament;
  games: Game[];
  users: (User | undefined)[];
}> = ({ tournament, games, users }) => {
  const router = useRouter();

  const [addUser, setAddUser] = useState<User | null>(null);
  const [addUserList, setAddUserList] = useState<User[]>([]);
  const [addUserHelperText, setAddUserHelperText] = useState<string>("");

  const getType = (type: string) => {
    if (type === "round-robin") return "総当たり戦";
    else if (type === "knockout") return "勝ち残り戦";
    return "";
  };

  const getResult = (m: number, o: number) => {
    if (!tournament) return;
    if (!games) return;
    const mUserId = tournament.users[m];
    const oUserId = tournament.users[o];

    const game = games.find(
      (e) =>
        (e.reservedUsers[0] === mUserId && e.reservedUsers[1] === oUserId) ||
        (e.reservedUsers[0] === oUserId && e.reservedUsers[1] === mUserId)
    );
    if (game) {
      const url = `/game/detail/` + game.id;
      let pointText = "";
      let resultText = "-";
      if (["gaming", "ended"].includes(game.status)) {
        const p = game.players;
        const mPlayer = p.find((e) => e.id === mUserId);
        const oPlayer = p.find((e) => e.id === oUserId);
        if (!mPlayer || !oPlayer) return;
        const mPoint = mPlayer.point.areaPoint + mPlayer.point.wallPoint;
        const oPoint = oPlayer.point.areaPoint + oPlayer.point.wallPoint;
        pointText = `${mPoint} - ${oPoint}`;
        if (mPoint > oPoint) resultText = "○";
        else if (mPoint < oPoint) resultText = "×";
        else resultText = "△";
      }
      return { pointText, resultText, url };
    } else return;
  };

  const gameCreateUrl = (m: number, o: number): string => {
    if (!users) return "";
    if (!tournament) return "";
    const mUser = users[m];
    const oUser = users[o];
    if (!mUser || !oUser) return "";

    const params = new URLSearchParams();
    params.append(
      "name",
      `${tournament.name}:${mUser.screenName} vs ${oUser.screenName}`
    );
    params.append("n-player", "2");
    params.append("player", mUser.name);
    params.append("player", oUser.name);
    params.append("tournament-id", tournament.id);
    params.append("return", "true");
    return "/game/create?" + params.toString();
    //history.push("/game/create?" + params.toString());
  };

  const getRanking = () => {
    if (!games) return;
    const ranking: {
      userId: string;
      point: number;
      wallPoint: number;
      basePoint: number;
      result: [number, number, number];
    }[] = [];
    for (const game of games) {
      if (game.status !== "ended") continue;
      const userResult = getUserResult(game);
      console.log(userResult);
      const isDraw = userResult[0].point === userResult[1].point;
      userResult.forEach((pr, i) => {
        const userId = pr.id;

        let r = ranking.find((e) => e.userId === userId);
        if (!r) {
          ranking.push({
            userId,
            point: 0,
            wallPoint: 0,
            basePoint: 0,
            result: [0, 0, 0],
          });
          r = ranking[ranking.length - 1];
        }
        r.point += pr.point;
        r.wallPoint += pr.wallpoint;
        r.basePoint += pr.basepoint;
        if (isDraw) r.result[1]++;
        else if (i === 0) r.result[0]++;
        else r.result[2]++;
      });
    }
    ranking.sort((a, b) => {
      const win = b.result[0] - a.result[0];
      if (win !== 0) return win;
      const draw = b.result[1] - a.result[1];
      if (draw !== 0) return draw;
      const lose = a.result[2] - b.result[2];
      if (lose !== 0) return lose;
      const point = b.point - a.point;
      if (point !== 0) return point;
      const wallpoint = b.wallPoint - a.wallPoint;
      if (wallpoint !== 0) return wallpoint;
      const basepoint = b.basePoint - a.basePoint;
      if (basepoint !== 0) return basepoint;
      return 0;
    });
    console.log(ranking);
    return ranking;
  };

  function getUserResult(game: Game) {
    const a = game.players.map((p) => ({
      id: p.id,
      point: p.point.areaPoint + p.point.wallPoint,
      basepoint: p.point.areaPoint,
      wallpoint: p.point.wallPoint,
    }));
    a.sort((a, b) => {
      if (a.point < b.point) return 1;
      else if (a.point > b.point) return -1;
      else {
        // 同じ場合は、wallPointが大きい方が勝つ
        if (a.wallpoint < b.wallpoint) return 1;
        else if (a.wallpoint > b.wallpoint) return -1;
        else return 0;
      }
    });
    return a;
  }

  return (
    <Content title="大会詳細">
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Button href="/tournament" style={{ margin: "auto" }}>
          大会一覧に戻る
        </Button>
        {tournament ? (
          <>
            <Section title="基本情報">
              <div style={{ textAlign: "center" }}>
                <SubSection title="大会名">
                  <div>{tournament.name}</div>
                </SubSection>
                <SubSection title="主催">
                  <div>{tournament.organizer}</div>
                </SubSection>
                <SubSection title="大会ID">
                  <div>{tournament.id}</div>
                </SubSection>
                <SubSection title="試合形式">
                  <div>{getType(tournament.type)}</div>
                </SubSection>
                {tournament.remarks && (
                  <SubSection title="備考">
                    <div>{tournament.remarks}</div>
                  </SubSection>
                )}
              </div>
            </Section>

            <Section title="試合">
              <div
                style={{
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <SubSection title="試合形式">
                  <div>{getType(tournament.type)}</div>
                </SubSection>
                <Autocomplete
                  options={addUserList}
                  getOptionLabel={(option) => option.name}
                  onChange={(_, newUser) => {
                    if (!tournament) return;
                    if (
                      tournament.users.some((userId) => userId === newUser?.id)
                    ) {
                      setAddUserHelperText("既にこのユーザは参加しています。");
                      return;
                    } else setAddUserHelperText("");
                    setAddUser(newUser);
                  }}
                  style={{ width: "20em" }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="追加ユーザ"
                      onChange={async (event) => {
                        const value = event.target.value;
                        const req = await apiClient.getUsers(value);
                        if (!req.success) return;
                        setAddUserList(req.data);
                      }}
                      placeholder="id or name"
                      helperText={addUserHelperText}
                      error={Boolean(addUserHelperText)}
                    />
                  )}
                />
                <Button
                  onClick={async () => {
                    if (!addUser) return;
                    const req = await apiClient.addTournamentUser(
                      tournament.id,
                      {
                        user: addUser.id,
                      }
                    );
                    console.log(req);
                    if (req.success) router.reload();
                  }}
                  disabled={!addUser || Boolean(addUserHelperText)}
                >
                  ユーザ追加
                </Button>

                {users && (
                  <div style={{ width: "100%", overflow: "auto" }}>
                    <StyledTable>
                      <tbody>
                        <tr>
                          <Oblique />
                          {users.map((user) => {
                            return (
                              <th key={user?.name}>
                                {user ? user.name : "no player"}
                              </th>
                            );
                          })}
                        </tr>
                        {users.map((user, y) => {
                          return (
                            <tr key={y}>
                              <th>{user ? user.name : "no player"}</th>
                              {users.map((_, x) => {
                                if (x === y) return <Oblique key={x} />;
                                else
                                  return (
                                    <td key={x}>
                                      {(() => {
                                        const result = getResult(y, x);
                                        if (result) {
                                          return (
                                            <div>
                                              <div>{result.resultText}</div>
                                              <div>{result.pointText}</div>
                                              <Link
                                                href={result.url}
                                                noLinkStyle
                                              >
                                                ゲーム詳細へ
                                              </Link>
                                            </div>
                                          );
                                        } else {
                                          return (
                                            <Button
                                              href={gameCreateUrl(y, x)}
                                              variant="outlined"
                                            >
                                              ゲーム作成
                                            </Button>
                                          );
                                        }
                                      })()}
                                    </td>
                                  );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </StyledTable>
                  </div>
                )}
              </div>
            </Section>
            <Section title="ランキング">
              {
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell align="center" style={{ minWidth: "5em" }}>
                          順位
                        </TableCell>
                        <TableCell style={{ minWidth: "6em" }}>
                          ユーザ
                        </TableCell>
                        <TableCell align="center" style={{ minWidth: "8em" }}>
                          勝敗数
                        </TableCell>
                        <TableCell align="right" style={{ minWidth: "11em" }}>
                          累計獲得ポイント
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getRanking()?.map((user, i) => (
                        <TableRow key={i}>
                          <TableCell align="center" component="th" scope="row">
                            {i + 1}
                          </TableCell>
                          <TableCell>
                            {users?.find((u) => u?.id === user.userId)?.name}
                          </TableCell>
                          <TableCell align="center">
                            {user.result[0]}勝{user.result[2]}敗{user.result[1]}
                            分
                          </TableCell>
                          <TableCell align="right">
                            {user.point}
                            <br />
                            {"("}壁：{user.wallPoint}, 城壁：{user.basePoint}
                            {")"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              }
            </Section>
          </>
        ) : (
          <>大会が見つかりません</>
        )}
      </div>
    </Content>
  );
};

Page.getInitialProps = async (ctx) => {
  let id = ctx.query.id;
  if (id === undefined || Array.isArray(id)) id = "";

  const res = await apiClient.getTournament(id);
  const tournament = res.success ? res.data : undefined;
  const games: Game[] = [];
  const users: (User | undefined)[] = [];
  if (tournament) {
    for await (const gameId of tournament.gameIds) {
      const res = await apiClient.getMatch(gameId);
      if (res.success) games.push(res.data);
    }
    for await (const userId of tournament.users) {
      const res = await apiClient.getUser(userId);
      if (res.success) users.push(res.data);
      else users.push(undefined);
    }
  }

  return { tournament, games, users };
};

export default Page;
