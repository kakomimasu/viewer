import React, { useContext } from "react";
import Image from "next/image";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import firebase from "../src/firebase";
import Link from "../src/link";
import { UserContext } from "../src/userStore";

export default function Header() {
  const { firebaseUser, kkmmUser } = useContext(UserContext);
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

  return (
    <AppBar position="sticky">
      <Toolbar style={{ color: "black" }}>
        <Link href="/">
          <Image
            height={36}
            width={101}
            src="/img/kakomimasu-logo.svg"
            alt="囲みマスロゴ"
          />
        </Link>
        <div
          style={{
            flexGrow: 1,
            display: "flex",
            alignItems: "center",
            margin: "0 20px",
          }}
        >
          <Button href="/docs" variant="text" color="inherit">
            ドキュメント
          </Button>
        </div>
        {kkmmUser !== undefined && (
          <>
            {kkmmUser ? (
              <>
                <Button variant="text" color="inherit" onClick={logOut}>
                  ログアウト
                </Button>
                <div
                  aria-controls="user-icon"
                  onClick={handleClick}
                  style={{ cursor: "pointer" }}
                >
                  <Avatar src={firebaseUser.photoURL ?? ""} />
                </div>
                <Menu
                  id="user-icon"
                  anchorEl={anchorEl}
                  keepMounted
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem onClick={handleClose}>
                    <Link href="/user/detail" color="inherit" underline="none">
                      マイページ
                    </Link>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button href="/user/login" variant="text" color="inherit">
                ログイン・新規登録
              </Button>
            )}
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
