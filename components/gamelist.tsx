import React, { useEffect, useMemo, useReducer, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useTheme, styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableContainer from "@mui/material/TableContainer";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableFooter from "@mui/material/TableFooter";
import TablePagination from "@mui/material/TablePagination";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import FirstPage from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LastPage from "@mui/icons-material/LastPage";

import { Game, Player, User, apiClient } from "../src/apiClient";

const StatusCircle = ({ className }: { className?: string }) => {
  return <span className={className}>●</span>;
};

const UnSpan = styled("span")({ color: "gray" });
const Waiting = styled(StatusCircle)({ color: "yellow" });
const Gaming = styled(StatusCircle)({ color: "green" });
const Ending = styled(StatusCircle)({ color: "red" });
const PlayerDiv = styled("div")({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "row",
});
const GameName = styled("div")({
  maxWidth: "30em",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});
const UnGameName = styled(GameName)({ color: "gray" });
const GameId = styled("div")({ fontSize: "0.8em" });

const GameList = (props: {
  games: Game[];
  pagenation?: boolean;
  hover?: boolean;
}) => {
  const pagenation = props.pagenation ?? true;
  const hover = props.hover ?? true;
  const games = props.games;

  const router = useRouter();

  type IUser =
    | {
        u: User;
        exists: true;
      }
    | { u: { id: string }; exists: false };
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [users, addUser] = useReducer((users: IUser[], action: IUser[]) => {
    return [...users, ...action];
  }, []);

  const unacquiredPlayerIds = useMemo(() => {
    const ids = new Set<string>();
    games.forEach((game) => {
      game.players.forEach((player) => {
        if (users.some((user) => user.u.id === player.id)) return;
        ids.add(player.id);
      });
    });
    return ids;
  }, [games, users]);

  useEffect(() => {
    console.log("UnacquiredPlayerIds", unacquiredPlayerIds);
    const getUsers = async () => {
      if (unacquiredPlayerIds.size === 0) return;
      const us: IUser[] = [];
      for (const id of Array.from(unacquiredPlayerIds)) {
        const res = await apiClient.usersShow(id);
        const u: IUser = res.success
          ? { exists: true, u: res.data }
          : { exists: false, u: { id } };
        us.push(u);
      }
      addUser(us);
    };
    getUsers();
  }, [unacquiredPlayerIds]);

  const getStatusClass = (game: Game) => {
    if (game.ending) return <Ending />;
    else if (game.gaming) return <Gaming />;
    else return <Waiting />;
  };

  const getStartTime = (startedAtUnixTime: number | null) => {
    if (startedAtUnixTime === null) return "-";
    else {
      return new Date(startedAtUnixTime * 1000).toLocaleString();
    }
  };

  const getPoint = (player: Player) => {
    return player.point.basepoint + player.point.wallpoint;
  };

  const getUser = (id: string) => {
    const user = users.find((user) => user.u.id === id);
    if (user?.exists) return user.u;
    else return undefined;
  };

  const toGameDetail = (id: string) => {
    router.push("/game/detail/" + id);
  };

  const getPlacedAgentStr = (game: Game, i: number) => {
    let num = 0;
    const total = game.players[i].agents.length;
    game.players[i].agents.forEach((agent) => {
      if (agent.x !== -1) num++;
    });
    return `(${num} / ${total})`;
  };

  return (
    <div>
      <div>
        <Waiting />
        ：ユーザ参加待ち
        <Gaming />
        ：ゲーム中
        <Ending />
        ：終了
      </div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={{ minWidth: "8em" }}>
                <div>ステータス</div>
                <div>ターン</div>
              </TableCell>
              <TableCell>
                <div>プレイヤー名(配置済みAgent数)</div>
                <div>ポイント</div>
              </TableCell>
              <TableCell>
                <GameName>ゲーム名</GameName>
                <GameId>ゲームID</GameId>
              </TableCell>
              <TableCell>開始時間</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
              ? games.slice(
                  page * rowsPerPage,
                  page * rowsPerPage + rowsPerPage
                )
              : games
            ).map((game) => (
              <TableRow
                key={game.gameId}
                hover={hover}
                onClick={() => hover && toGameDetail(game.gameId)}
              >
                <TableCell align="center">
                  {getStatusClass(game)}
                  <div>
                    {game.turn}/{game.totalTurn}
                  </div>
                </TableCell>
                <TableCell>
                  <PlayerDiv>
                    {game.players.map((player, i) => {
                      return (
                        <PlayerDiv
                          key={i}
                          style={{ margin: "0 0.5em", width: "max-content" }}
                        >
                          {i !== 0 && (
                            <div style={{ margin: "0 0.5em" }}>vs</div>
                          )}
                          <div>
                            {(() => {
                              const user = getUser(player.id);
                              return user ? (
                                <span>
                                  <Link href={`/user/detail/${user.name}`}>
                                    {user.screenName}
                                  </Link>
                                </span>
                              ) : (
                                <UnSpan>No player</UnSpan>
                              );
                            })()}
                            {getPlacedAgentStr(game, i)}
                            <br />
                            {getPoint(player)}
                          </div>
                        </PlayerDiv>
                      );
                    })}
                  </PlayerDiv>
                </TableCell>
                <TableCell>
                  {game.gameName ? (
                    <GameName>{game.gameName}</GameName>
                  ) : (
                    <UnGameName>Untitle</UnGameName>
                  )}
                  <GameId>{game.gameId}</GameId>
                </TableCell>
                <TableCell>{getStartTime(game.startedAtUnixTime)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          {pagenation && (
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[
                    10,
                    20,
                    30,
                    { label: "すべて", value: -1 },
                  ]}
                  colSpan={4}
                  count={games.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  SelectProps={{
                    inputProps: {
                      "aria-label": "1ページあたりの行数",
                    },
                    native: true,
                  }}
                  onPageChange={(_, newPage) => setPage(newPage)}
                  onRowsPerPageChange={(
                    event: React.ChangeEvent<{ value: string }>
                  ) => {
                    setRowsPerPage(parseInt(event.target.value, 10));
                    setPage(0);
                  }}
                  ActionsComponent={TablePaginationActions}
                />
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </TableContainer>
    </div>
  );
};

function TablePaginationActions(props: {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (
    event: React.MouseEvent<HTMLButtonElement>,
    newPage: number
  ) => void;
}) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === "rtl" ? <LastPage /> : <FirstPage />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === "rtl" ? (
          <KeyboardArrowRight />
        ) : (
          <KeyboardArrowLeft />
        )}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === "rtl" ? (
          <KeyboardArrowLeft />
        ) : (
          <KeyboardArrowRight />
        )}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === "rtl" ? <FirstPage /> : <LastPage />}
      </IconButton>
    </Box>
  );
}

export default GameList;
