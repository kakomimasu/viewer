import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import firebase from "../src/firebase";

import { apiClient } from "../src/apiClient";

export default function Header() {
  const [user, setUser] = useState<firebase.User | undefined | null>(undefined);
  const [verified, setVerified] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const logOut = async () => {
    try {
      await firebase.auth().signOut();
    } catch (error) {
      console.log(`ログアウト時にエラーが発生しました (${error})`);
    }
  };

  useEffect(() => {
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        const idToken = await user.getIdToken();
        const res = await apiClient.usersVerify(idToken);
        setVerified(res.success);
        if (res.success === false) {
          if (location.pathname !== "/user/login") {
            logOut();
            return;
          }
        }
      }
      setUser(user);
    });
  }, []);

  return (
    <AppBar position="sticky">
      <Toolbar style={{ color: "black" }}>
        <div style={{ flexGrow: 1 }}>
          <Link href="/" passHref>
            <Image
              height={36}
              width={101}
              src="/img/kakomimasu-logo.png"
              alt="囲みマスロゴ"
            />
          </Link>
        </div>
        {user !== undefined && (
          <>
            {user && verified ? (
              <>
                <Button variant="text" color="inherit" onClick={logOut}>
                  ログアウト
                </Button>
                <div
                  aria-controls="user-icon"
                  onClick={handleClick}
                  style={{ cursor: "pointer" }}
                >
                  <Avatar src={user.photoURL ? user.photoURL : ""} />
                </div>
                <Menu
                  id="user-icon"
                  anchorEl={anchorEl}
                  keepMounted
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem onClick={handleClose}>
                    <Link href="/user/detail">マイページ</Link>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Link href="/user/login" passHref>
                <Button variant="text" color="inherit">
                  ログイン・新規登録
                </Button>
              </Link>
            )}
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
