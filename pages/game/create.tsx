import React, { useEffect, useState, useContext } from "react";
import { GetStaticProps, InferGetStaticPropsType } from "next";
import { useRouter } from "next/router";
import { styled } from "@mui/material/styles";
import { TextField, Box, MenuItem, Button, Autocomplete } from "@mui/material";

import { apiClient, Board, Game } from "../../src/apiClient";
import { UserContext } from "../../src/userStore";

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
const StyledAutoComplete = styled(Autocomplete)({
  //textAlign: "left",
  marginTop: 20,
  width: "100%",
});

const StyledButton = styled(Button)({
  width: "20em",
  marginTop: 20,
});

export const getStaticProps: GetStaticProps<{ boards: Board[] }> = async () => {
  const res = await apiClient.getBoards();
  return {
    props: { boards: res },
    revalidate: 10,
  };
};

const Page = ({ boards }: InferGetStaticPropsType<typeof getStaticProps>) => {
  const router = useRouter();
  const query = router.query;
  const fixedUsers = (query.player as string[]) || [];

  const [data, setData] = useState({
    name: (query.name as string) || "",
    boardName: "",
    nPlayer: parseInt((query["n-player"] as string) || "2"),
    nAgent: undefined as number | undefined,
    playerIdentifiers: fixedUsers,
    tournamentId: (query["tournament-id"] as string) || "",
    totalTurn: undefined as number | undefined,
    operationSec: undefined as number | undefined,
    transitionSec: undefined as number | undefined,
  });
  const [btnStatus, setBtnStatus] = useState(false);
  const [game, setGame] = useState<Game>();
  const [addUserInput, setAddUserInput] = useState<{
    value: string;
    q: string[];
  }>({ value: "", q: fixedUsers });
  const [usersHelperText, setUsersHelperText] = useState("");
  const [selectedBoard, setSelectedBoard] = useState<Board>();

  const kkmmUser = useContext(UserContext).user;

  const submit = async () => {
    const sendData = { ...data };
    sendData.playerIdentifiers = sendData.playerIdentifiers.filter((e) =>
      Boolean(e)
    );
    try {
      const res = await apiClient.createMatch(sendData);
      console.log(res);
      if (query.return) {
        router.push("/tournament/detail/" + sendData.tournamentId);
      } else {
        setGame(res);
      }
    } catch (e) {}
  };

  const submitPersonal = async () => {
    const sendData = { ...data, isMySelf: true };
    sendData.playerIdentifiers = sendData.playerIdentifiers.filter((e) =>
      Boolean(e)
    );
    if (!kkmmUser?.bearerToken) return;
    const idToken = kkmmUser.bearerToken;

    try {
      const res = await apiClient.createMatch(sendData, {
        authMethods: { Bearer: `Bearer ${idToken}` },
      });
      console.log(res);
      setGame(res);
    } catch (e) {}
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
    let q: typeof addUserInput.q = [];
    try {
      const req = await apiClient.getUsers(value);
      q = req.map((user) => user.name);
    } catch (e) {}
    setAddUserInput({ value, q });
  };

  return (
    <Content title="ゲーム作成">
      <Form autoComplete="off">
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
            setSelectedBoard(boards.find((b) => b.name === value));
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
          <MenuItem value={2}>2</MenuItem>
          <MenuItem value={3}>3</MenuItem>
          <MenuItem value={4}>4</MenuItem>
        </StyledTextField>
        <StyledTextField
          name="totalTurn"
          label="エージェント数"
          placeholder="3"
          type="number"
          value={data.nAgent}
          onChange={({ target: { value } }) => {
            let nAgent = parseInt(value);
            if (nAgent < 1) nAgent = 1;
            setData({ ...data, nAgent });
          }}
          helperText={`指定なしでボードの既定エージェント数（${
            selectedBoard?.nAgent ?? 4
          }体）になります。`}
        />
        <StyledTextField
          name="totalTurn"
          label="ターン数"
          placeholder="3"
          type="number"
          value={data.totalTurn}
          onChange={({ target: { value } }) => {
            let totalTurn = parseInt(value);
            if (totalTurn < 1) totalTurn = 1;
            setData({ ...data, totalTurn });
          }}
          helperText={`指定なしでボードの既定ターン数（${
            selectedBoard?.totalTurn ?? 30
          }ターン）になります。`}
        />
        <StyledTextField
          name="operationSec"
          label="行動ステップ時間"
          placeholder="3"
          type="number"
          value={data.operationSec}
          onChange={({ target: { value } }) => {
            let operationSec = parseInt(value);
            if (operationSec < 1) operationSec = 1;
            setData({ ...data, operationSec });
          }}
          helperText={`行動ステップ時間（1ターンのうち行動を受け付けている時間）。指定なしでボードの既定秒数（${
            selectedBoard?.operationSec ?? 1
          }秒）になります。`}
        />
        <StyledTextField
          name="transitionSec"
          label="遷移ステップ時間"
          placeholder="3"
          type="number"
          value={data.transitionSec}
          onChange={({ target: { value } }) => {
            let transitionSec = parseInt(value);
            if (transitionSec < 1) transitionSec = 1;
            setData({ ...data, transitionSec });
          }}
          helperText={`遷移ステップ時間（1ターンのうち行動を受け付けていない時間）。指定なしでボードの既定秒数（${
            selectedBoard?.transitionSec ?? 1
          }秒）になります。`}
        />
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
        {!data.tournamentId && (
          <StyledButton
            onClick={submitPersonal}
            disabled={!(btnStatus && kkmmUser)}
          >
            マイゲーム作成！
          </StyledButton>
        )}
      </Form>
      {game && <GameList games={[game]} />}
      {data.boardName &&
        (() => {
          const board = boards?.find((b) => b.name === data.boardName);
          if (!board) return;
          const tiles = new Array(board.height * board.width);
          for (let i = 0; i < tiles.length; i++)
            tiles[i] = { type: 0, player: null };
          const game: React.ComponentProps<typeof GameBoard>["game"] = {
            field: {
              width: board.width,
              height: board.height,
              points: board.points,
              tiles,
            },
            nAgent: board.nAgent ?? 4,
            players: [
              {
                id: "",
                agents: [],
                point: { areaPoint: 0, wallPoint: 0 },
                type: "guest",
              },
              {
                id: "",
                agents: [],
                point: { areaPoint: 0, wallPoint: 0 },
                type: "guest",
              },
            ],
            log: [],
          };
          return (
            <Box
              sx={{
                height: "calc(100vh - 64px)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mt: 2,
              }}
            >
              <div>ボードプレビュー</div>
              <GameBoard game={game} users={new Map()} />
            </Box>
          );
        })()}
    </Content>
  );
};

export default Page;
