import React, {
  useEffect,
  useState,
  useMemo,
  useContext,
  useCallback,
} from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { styled } from "@mui/material/styles";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import Section, { SubSection } from "../../../components/section";
import Content from "../../../components/content";
import GameList from "../../../components/gamelist";
import { useGameStream } from "../../../src/useGameStream";
import { UserContext } from "../../../src/userStore";

import {
  apiClient,
  Game,
  StreamMatchesReq,
  User,
  AuthedUser,
} from "../../../src/apiClient";
import Link from "../../../src/link";

const StyledContent = styled(Content)({
  display: "flex",
  alignItems: "center",
  flexDirection: "column",
});

const PieGraph = styled("div")({ height: 300 });
const wsReq: StreamMatchesReq = {
  q: "sort:startAtUnixTime-desc type:personal",
};

const UserDeleteButton = ({ user }: { user: AuthedUser }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const handleOpen = () => setDialogOpen(true);
  const handleClose = () => setDialogOpen(false);

  const buttonClick = async () => {
    const res = await apiClient.deleteUserMe({}, `Bearer ${user.bearerToken}`);
    if (res.success) {
      setDialogOpen(false);
      window.location.href = "/";
    }
  };

  return (
    <Box>
      <SubSection title="ユーザ削除">
        <Button onClick={handleOpen} variant="contained" color="error">
          ユーザを削除する
        </Button>
        <Dialog onClose={handleClose} open={dialogOpen}>
          <DialogTitle>本当に削除しますか？</DialogTitle>
          <DialogContent>
            <DialogContentText>ユーザ削除は取り消せません。</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={buttonClick} variant="contained" color="error">
              ユーザを削除する
            </Button>
          </DialogActions>
        </Dialog>
      </SubSection>
    </Box>
  );
};

const UserBearerTokenArea = ({ user }: { user: AuthedUser }) => {
  const [showToken, setShowToken] = useState(false);
  const toggleShowToken = () => setShowToken(!showToken);

  const setUser = useContext(UserContext).setUser;

  const [dialogOpen, setDialogOpen] = useState(false);
  const handleOpen = () => setDialogOpen(true);
  const handleClose = () => setDialogOpen(false);

  const buttonClick = async () => {
    const res = await apiClient.regenerateUserMeToken(
      `Bearer ${user.bearerToken}`
    );
    if (res.success) {
      setUser(res.data);
      setDialogOpen(false);
    }
  };

  return (
    <Box>
      <SubSection title="BearerToken (この値は他人に教えないようにしてください)">
        <Box
          sx={{
            fontFamily: "monospace",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {showToken
            ? user.bearerToken
            : "************************************"}
          <IconButton onClick={toggleShowToken}>
            {showToken ? <VisibilityIcon /> : <VisibilityOffIcon />}
          </IconButton>
          <Box sx={{ flexGrow: "1" }}></Box>
          <Button onClick={handleOpen} variant="contained" color="secondary">
            Token再生成
          </Button>
          <Dialog onClose={handleClose} open={dialogOpen}>
            <DialogTitle>Token再生成</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Tokenを再生成すると、古いTokenは使用できなくなります。
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={buttonClick} variant="contained" color="error">
                BearerTokenを再生成する
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </SubSection>
    </Box>
  );
};

const Detail: NextPage<{}> = () => {
  const router = useRouter();
  const { id: id_ } = router.query;
  const id = (() => {
    if (Array.isArray(id_)) {
      return id_[0];
    } else return id_;
  })();

  const kkmmUser = useContext(UserContext).user;

  const [user, setUser] = useState<User | AuthedUser | undefined | null>(
    undefined
  );
  const myGames = useGameStream(wsReq, kkmmUser?.bearerToken);

  const [games, setGames] = useState<Game[]>([]);
  const updateGames = useCallback(async () => {
    const games: Game[] = [];
    if (user) {
      for (const gameId of user.gameIds) {
        const res = await apiClient.getMatch(gameId);
        if (res.success) games.push(res.data);
      }
    }
    setGames(games);
  }, [user]);
  useEffect(() => {
    updateGames();
  }, [updateGames]);

  const pieData = useMemo<
    {
      name: string;
      value: number;
    }[]
  >(() => {
    const result = [0, 0, 0]; // 勝ち、負け、引き分け
    if (user) {
      games.forEach((g) => {
        if (g.status !== "ended") return;
        const players = g.players.map((p) => {
          return {
            id: p.id,
            point: p.point.wallPoint + p.point.areaPoint,
          };
        });
        players.sort((a, b) => a.point - b.point);

        if (players[0].id === user.id) {
          if (players[0].point === players[players.length - 1].point) {
            result[2]++;
          } else result[1]++;
        }
        if (players[players.length - 1].id === user.id) {
          result[0]++;
        }
        //console.log(result);
      });
    }
    const pieData = [
      { name: "Win", value: result[0] },
      { name: "Lose", value: result[1] },
      { name: "Even", value: result[2] },
    ];
    return pieData;
  }, [user, games]);

  const getUser = useCallback(async () => {
    if (kkmmUser === undefined) return;
    if (id === undefined) {
      // ログインしているユーザを表示
      setUser(kkmmUser);
    } else {
      const res = await apiClient.getUser(id);
      if (res.success === false) {
        setUser(null);
      } else {
        const user = res.data;
        setUser(user);
      }
    }
  }, [id, kkmmUser]);
  useEffect(() => {
    getUser();
  }, [getUser]);

  return (
    <StyledContent title="ユーザ詳細">
      {user === undefined ? (
        <CircularProgress color="secondary" />
      ) : (
        <>
          {user ? (
            <>
              <Section title="基本情報">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "column",
                  }}
                >
                  <SubSection title="表示名">{user.screenName}</SubSection>
                  <SubSection title="ユーザネーム">{user.name}</SubSection>
                  <SubSection title="ユーザID">{user.id}</SubSection>
                  {"bearerToken" in user && (
                    <SubSection title="BearerToken(この値は他人に教えないようにしてください)">
                      {user.bearerToken}
                    </SubSection>
                  )}
                </div>
              </Section>
              <Section title="勝敗記録">
                <PieGraph>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        fill="#8884d8"
                        label={({
                          cx: cx_,
                          cy: cy_,
                          midAngle: midAngle_,
                          innerRadius: innerRadius_,
                          outerRadius: outerRadius_,
                          percent: percent_,
                        }) => {
                          const [
                            cx,
                            cy,
                            midAngle,
                            innerRadius,
                            outerRadius,
                            percent,
                          ] = [
                            cx_,
                            cy_,
                            midAngle_,
                            innerRadius_,
                            outerRadius_,
                            percent_,
                          ].map(Number);
                          const RADIAN = Math.PI / 180;
                          const radius =
                            innerRadius + (outerRadius - innerRadius) * 0.5;
                          const x = cx + radius * Math.cos(-midAngle * RADIAN);
                          const y = cy + radius * Math.sin(-midAngle * RADIAN);

                          return (
                            <text
                              x={x}
                              y={y}
                              fill="white"
                              textAnchor={x > cx ? "start" : "end"}
                              dominantBaseline="central"
                            >
                              {`${(percent * 100).toFixed(0)}%`}
                            </text>
                          );
                        }}
                        labelLine={false}
                      >
                        <Cell fill="#D92546" />
                        <Cell fill="#A7D4D9" />
                        <Cell fill="#F2BB9B" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </PieGraph>
              </Section>
              <Section title="参加ゲーム一覧">
                <GameList games={games} />
              </Section>
              {"bearerToken" in user && (
                <>
                  <Section title="マイゲーム一覧">
                    <GameList games={myGames} />
                  </Section>
                  <Section title="ユーザ管理">
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                    >
                      <UserBearerTokenArea user={user} />
                      <UserDeleteButton user={user} />
                    </Box>
                  </Section>
                </>
              )}
            </>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <div>ユーザが存在しません</div>
              <Link href="/" noLinkStyle>
                囲みマス トップページへ
              </Link>
            </div>
          )}
        </>
      )}
    </StyledContent>
  );
};

export default Detail;
