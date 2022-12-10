import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Autocomplete from "@mui/material/Autocomplete";

import {
  apiClient,
  CreateTournamentReq,
  Tournament,
  User,
} from "../../src/apiClient";

import Content from "../../components/content";
import TournamentCard from "../../components/tournament_card";

const Form = styled("form")({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "0 20",
});
const StyledTextField = styled(TextField)({
  marginTop: 20,
  width: "100%",
});

const StyledButton = styled(Button)({
  width: "20em",
  marginTop: 20,
});

export default function Create() {
  const [data, setData] = useState<CreateTournamentReq>({
    name: "",
    organizer: "",
    type: "round-robin",
    remarks: "",
    participants: [] as string[],
  });

  const [tournament, setTournament] = useState<Tournament>();

  const [addUserInput, setAddUserInput] = useState<{
    value: string;
    helperText: string;
    q: User[];
  }>({ value: "", helperText: "", q: [] });

  const validate = () => {
    if (!data) return false;
    if (!data.name) return false;
    if (!data.type) return false;
    return true;
  };

  const submit = async () => {
    const req = await apiClient.createTournament(data);
    if (req.success) {
      setTournament(req.data);
    }
    console.log(req);
  };

  const addHandleChange = async (
    event: React.ChangeEvent<{ value: string }>
  ) => {
    const value = event.target.value;
    const req = await apiClient.getUsers(value);
    let q: typeof addUserInput.q = [];
    if (req.success) q = req.data;
    //console.log(req);
    //if (req.errorCode) req = [];
    setAddUserInput({ value, helperText: "", q });
  };

  return (
    <>
      <Content title="大会作成">
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Button href="/tournament" style={{ margin: "auto" }}>
            大会一覧に戻る
          </Button>
          <Form autoComplete="off">
            <StyledTextField
              required
              label="大会名"
              placeholder="〇〇大会"
              value={data.name}
              onChange={({ target: { value } }) => {
                setData({ ...data, name: value });
              }}
              error={!data.name}
              helperText={data.name ? "" : "入力必須項目です"}
            />
            <StyledTextField
              label="主催"
              placeholder="Code for KOSEN"
              value={data.organizer}
              onChange={({ target: { value } }) => {
                setData({ ...data, organizer: value });
              }}
            />
            <StyledTextField
              required
              select
              label="試合形式"
              value={data.type}
              onChange={({ target: { value } }) => {
                setData({ ...data, type: value as Tournament["type"] });
              }}
              error={!data.type}
              helperText={data.type ? "" : "入力必須項目です"}
            >
              <MenuItem value="round-robin">総当たり戦</MenuItem>
              {/*<MenuItem value="knockout">勝ち残り戦</MenuItem>;*/}
            </StyledTextField>
            <Autocomplete
              sx={{ width: "100%" }}
              multiple
              id="tags-standard"
              options={addUserInput.q}
              getOptionLabel={(option) => option.name}
              onChange={(_, newValue) => {
                console.log("onInputChange", newValue);
                setAddUserInput({ ...addUserInput, q: [] });
                setData({ ...data, participants: newValue.map((e) => e.id) });
              }}
              renderInput={(params) => (
                <StyledTextField
                  {...params}
                  label="参加ユーザ"
                  placeholder="name"
                  onChange={addHandleChange}
                />
              )}
            />
            <StyledTextField
              label="備考"
              value={data.remarks}
              onChange={({ target: { value } }) => {
                setData({ ...data, remarks: value });
              }}
            />
            <StyledButton onClick={submit} disabled={!validate()}>
              ゲーム作成！
            </StyledButton>
          </Form>
          {tournament && <TournamentCard tournament={tournament} />}
        </div>
      </Content>
    </>
  );
}
