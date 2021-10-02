import React, { useEffect, useState } from "react";
import { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { styled, useTheme } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import AutoComplete from "@mui/material/Autocomplete";

import { apiClient, Board, Game, User } from "../../src/apiClient";

import Content from "../../components/content";
import GameList from "../../components/gamelist";
import GameBoard from "../../components/gameBoard";

const Form = styled("form")({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "0 20",
});

const StyledTextField = styled(TextField)({
  //textAlign: "left",
  marginTop: 20,
  width: "100%",
});
const StyledAutoComplete = styled(AutoComplete)({
  //textAlign: "left",
  marginTop: 20,
  width: "100%",
});

const StyledButton = styled(Button)({
  width: "20em",
  marginTop: 20,
});

const Page: NextPage<{ boards: Board[] }> = ({ boards }) => {
  const router = useRouter();
  const query = router.query;
  const fixedUsers = (query.player as string[]) || [];

  const [data, setData] = useState({
    name: (query.name as string) || "",
    boardName: "",
    nPlayer: parseInt((query["n-player"] as string) || "2"),
    playerIdentifiers: fixedUsers,
    tournamentId: (query["tournament-id"] as string) || "",
  });
  const [btnStatus, setBtnStatus] = useState(false);
  const [game, setGame] = useState<Game>();
  const [addUserInput, setAddUserInput] = useState<{
    value: string;
    q: string[];
  }>({ value: "", q: fixedUsers });
  const [usersHelperText, setUsersHelperText] = useState("");

  const submit = async () => {
    const sendData = { ...data };
    sendData.playerIdentifiers = sendData.playerIdentifiers.filter((e) =>
      Boolean(e)
    );
    const res = await apiClient.gameCreate(sendData);
    console.log(res);
    if (!res.success) return;
    if (query.return) {
      router.push("/tournament/detail/" + sendData.tournamentId);
    } else {
      setGame(res.data);
    }
  };

  // 参加ユーザのHeplerTextを更新
  useEffect(() => {
    const getHelperText = () => {
      if (data.playerIdentifiers.length > data.nPlayer) {
        return "プレイヤー数を超えています";
      }
      return "";
    };
    setUsersHelperText(getHelperText());
  }, [data.playerIdentifiers, data.nPlayer]);

  // 送信するデータが変更されたときのsubmitボタン状態を更新
  useEffect(() => {
    const validate = () => {
      if (data.playerIdentifiers.length > data.nPlayer) return false;
      if (!data.name) return false;
      if (!data.boardName) return false;
      if (!data.nPlayer) return false;
      return true;
    };
    setBtnStatus(validate());
  }, [data]);

  const addHandleChange = async (
    event: React.ChangeEvent<{ value: string }>
  ) => {
    const value = event.target.value;
    const req = await apiClient.usersSearch(value);
    let q: typeof addUserInput.q = [];
    if (req.success) q = req.data.map((user) => user.name);
    setAddUserInput({ value, q });
  };

  return (
    <Content title="ゲーム作成">
      <Form
        autoComplete="off"
        onChange={() => {
          console.log("form onchange");
        }}
      >
        <StyledTextField
          required
          name="name"
          label="ゲーム名"
          placeholder="〇〇大会 予選Aグループ 〇〇vs△△"
          value={data.name}
          onChange={({ target: { value } }) => {
            setData({ ...data, name: value });
          }}
          error={!data.name}
          helperText={data.name ? "" : "入力必須項目です"}
        />
        <StyledTextField
          required
          select
          name="boardName"
          label="使用ボード"
          value={data.boardName}
          defaultValue=""
          onChange={({ target: { value } }) => {
            setData({ ...data, boardName: value });
          }}
          error={!data.boardName}
          helperText={data.boardName ? "" : "入力必須項目です"}
        >
          {boards.map((board) => {
            return (
              <MenuItem key={board.name} value={board.name}>
                {board.name}
              </MenuItem>
            );
          })}
        </StyledTextField>
        <StyledTextField
          required
          select
          name="nPlayer"
          label="プレイヤー数"
          value={data.nPlayer}
          onChange={({ target: { value } }) => {
            setData({ ...data, nPlayer: parseInt(value) });
          }}
        >
          <MenuItem value={2}>2</MenuItem>;
        </StyledTextField>
        <StyledAutoComplete
          multiple
          id="tags-standard"
          options={addUserInput.q}
          value={data.playerIdentifiers}
          onChange={(_, newValue) => {
            console.log("onInputChange", newValue);
            setAddUserInput({ ...addUserInput, q: [] });
            setData({
              ...data,
              playerIdentifiers: newValue as string[],
            });
          }}
          disabled={Boolean(fixedUsers.length > 0)}
          renderInput={(params) => (
            <StyledTextField
              {...params}
              label="参加ユーザ"
              placeholder="name"
              onChange={addHandleChange}
              helperText={usersHelperText}
              error={Boolean(usersHelperText)}
            />
          )}
        />
        {data.tournamentId && (
          <StyledTextField
            name="boardName"
            label="所属大会ID"
            disabled
            value={data.tournamentId}
            onChange={({ target: { value } }) => {
              setData({ ...data, tournamentId: value });
            }}
          />
        )}
        <StyledButton onClick={submit} disabled={!btnStatus}>
          ゲーム作成！
        </StyledButton>
      </Form>
      {game && <GameList games={[game]} />}
      {data.boardName &&
        (() => {
          const board = boards?.find((b) => b.name === data.boardName);
          if (!board) return;
          const tiled = new Array(board.height * board.width);
          for (let i = 0; i < tiled.length; i++) tiled[i] = [0, -1];
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
              {
                id: "",
                agents: [],
                point: { basepoint: 0, wallpoint: 0 },
              },
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
          return (
            <div>
              <div>ボードプレビュー</div>
              <GameBoard game={game} />
            </div>
          );
        })()}
    </Content>
  );
};

Page.getInitialProps = async () => {
  const res = await apiClient.getBoards();
  const boards = res.success ? res.data : [];
  return { boards };
};

export default Page;
