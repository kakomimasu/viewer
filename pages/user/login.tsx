import React, { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";

import firebase from "../../src/firebase";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import Section from "../../components/section";
import Content from "../../components/content";

import { apiClient } from "../../src/apiClient";
import { UserContext } from "../../src/userStore";

const StyledContent = styled("div")({
  textAlign: "center",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const SignUpForm = styled("form")({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "0 20",
});

const StyledTextField = styled(TextField)({ marginTop: 20, width: "100%" });

const StyledButton = styled(Button)({
  width: "20em",
  marginTop: 20,
});

function Signup({ user }: { user: firebase.User }) {
  const [data, setData] = useState({
    screenName: user.displayName || "",
    name: "",
  });
  const [nameHelperText, setNameHelperText] = useState("");

  const checkName = async () => {
    if (!data.name) {
      setNameHelperText("入力必須項目です");
      return false;
    }
    const res = await apiClient.usersSearch(data.name);
    if (res.success) {
      if (res.data.some((user: any) => user.name === data.name)) {
        setNameHelperText("既にこのユーザネームは使用されています");
        return false;
      }
    }
    setNameHelperText("");
    return true;
  };

  const validate = () => {
    if (!data.screenName) return false;
    else if (nameHelperText) return false;
    return true;
  };

  const submit = async () => {
    const res = await apiClient.usersRegist(data, await user.getIdToken());
    if (res.success) {
      location.href = "/";
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const name = event.target.name;
    setData({ ...data, [name]: value });
  };

  useEffect(() => {
    checkName();
  });

  return (
    <Section title="新規登録">
      {user.providerData[0] && (
        <div>
          現在、{user.providerData[0].providerId}のアカウントで登録中です。
          <br />
          <StyledButton
            color="primary"
            onClick={async () => {
              await firebase.auth().signOut();
            }}
          >
            別のアカウントで登録する
          </StyledButton>
        </div>
      )}
      <SignUpForm autoComplete="off">
        <StyledTextField
          required
          name="screenName"
          label="表示名"
          placeholder="囲みマス太郎"
          value={data.screenName}
          onChange={handleChange}
          error={!data.screenName}
          helperText={data.screenName ? "" : "入力必須項目です"}
        />
        <StyledTextField
          required
          name="name"
          label="ユーザネーム"
          placeholder="kkmm_taro"
          value={data.name}
          onChange={handleChange}
          error={Boolean(nameHelperText)}
          helperText={nameHelperText}
        />
        <StyledButton onClick={submit} disabled={!validate()}>
          上記の内容で登録する
        </StyledButton>
      </SignUpForm>
    </Section>
  );
}

export default function Login() {
  const router = useRouter();

  const { kkmmUser, firebaseUser } = useContext(UserContext);

  useEffect(() => {
    if (kkmmUser) {
      router.push("/");
    }
  }, [router, kkmmUser]);

  return (
    <Content title="ログイン">
      <StyledContent>
        {firebaseUser !== undefined ? (
          <>
            {firebaseUser === null ? (
              <StyledFirebaseAuth
                uiConfig={{
                  callbacks: {
                    signInSuccessWithAuthResult: () => false,
                  },
                  signInOptions: [
                    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                    //props.firebaseP.auth.FacebookAuthProvider.PROVIDER_ID,
                    firebase.auth.TwitterAuthProvider.PROVIDER_ID,
                    firebase.auth.GithubAuthProvider.PROVIDER_ID,
                    firebase.auth.EmailAuthProvider.PROVIDER_ID,
                    firebase.auth.PhoneAuthProvider.PROVIDER_ID,
                    //firebaseP.auth.AnonymousAuthProvider.PROVIDER_ID
                  ],
                }}
                firebaseAuth={firebase.auth()}
              />
            ) : (
              <Signup user={firebaseUser} />
            )}
          </>
        ) : (
          <CircularProgress color="secondary" />
        )}
      </StyledContent>
    </Content>
  );
}
