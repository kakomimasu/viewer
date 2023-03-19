import React, { useContext } from "react";
import Image from "next/image";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import MenuIcon from "@mui/icons-material/Menu";
import { signOut } from "firebase/auth";

import { auth } from "../src/firebase";
import Link from "../src/link";
import { UserContext } from "../src/userStore";
import { Box, Divider, IconButton, ListItemIcon } from "@mui/material";

export default function Header() {
  const { firebaseUser, kkmmUser } = useContext(UserContext);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(
    null
  );

  const accountMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const accountMenuClose = () => setAnchorEl(null);

  const menuOpen = (event: React.MouseEvent<HTMLElement>) =>
    setMenuAnchorEl(event.currentTarget);
  const menuClose = () => setMenuAnchorEl(null);

  const logOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.log(`ログアウト時にエラーが発生しました (${error})`);
    }
  };

  return (
    <AppBar position="sticky">
      <Toolbar sx={{ color: "black" }}>
        <IconButton
          sx={{ display: { sm: "none", xs: "inherit" } }}
          onClick={menuOpen}
        >
          <MenuIcon />
        </IconButton>
        <Menu
          anchorEl={menuAnchorEl}
          keepMounted
          open={Boolean(menuAnchorEl)}
          onClose={menuClose}
        >
          <Link href="/docs" color="inherit" underline="none">
            <MenuItem onClick={accountMenuClose}>DOCS</MenuItem>
          </Link>
          <Link
            href="https://scrapbox.io/kakomimasu/"
            color="inherit"
            underline="none"
          >
            <MenuItem onClick={accountMenuClose}>
              SCRAPBOX
              <OpenInNewIcon fontSize="small" sx={{ ml: 1 }} />
            </MenuItem>
          </Link>
          <Divider />

          <Link href="game/playground" color="inherit" underline="none">
            <MenuItem onClick={accountMenuClose}>PLAYGROUND</MenuItem>
          </Link>
        </Menu>
        <Link href="/">
          <Box
            sx={{
              display: { sm: "inherit", xs: "none" },
              width: "101px",
              height: "36px",
              position: "relative",
            }}
          >
            <Image
              layout="fill"
              src="/img/kakomimasu-logo.svg"
              alt="囲みマスロゴ"
            />
          </Box>
          <Box
            sx={{
              display: { sm: "none", xs: "inherit" },
              width: "36px",
              height: "36px",
              position: "relative",
            }}
          >
            <Image
              layout="fill"
              src="/img/kakomimasu-icon2.png"
              alt="囲みマスロゴ"
            />
          </Box>
        </Link>
        <Box sx={{ flexGrow: 1 }}>
          <Box
            sx={{
              display: { sm: "flex", xs: "none" },
              alignItems: "center",
              margin: "0 20px",
            }}
          >
            <Button href="/docs" variant="text" color="inherit">
              Docs
            </Button>
            <Button
              sx={{ px: 2 }}
              href="https://scrapbox.io/kakomimasu/"
              variant="text"
              color="inherit"
              target="_blank"
              endIcon={<OpenInNewIcon fontSize="small" />}
            >
              Scrapbox
            </Button>
            <Link href="/game/playground" underline="none">
              <Button variant="contained" color="secondary">
                Playground
              </Button>
            </Link>
          </Box>
        </Box>
        {kkmmUser !== undefined && (
          <>
            {kkmmUser ? (
              <>
                <div
                  aria-controls="user-icon"
                  onClick={accountMenuOpen}
                  style={{ cursor: "pointer" }}
                >
                  <Avatar src={firebaseUser.photoURL ?? ""} />
                </div>
                <Menu
                  id="user-icon"
                  anchorEl={anchorEl}
                  keepMounted
                  open={Boolean(anchorEl)}
                  onClose={accountMenuClose}
                >
                  <Link href="/user/detail" color="inherit" underline="none">
                    <MenuItem onClick={accountMenuClose}>
                      <ListItemIcon>
                        <PersonIcon fontSize="small" />
                      </ListItemIcon>
                      マイページ
                    </MenuItem>
                  </Link>
                  <Divider />
                  <MenuItem
                    onClick={() => {
                      logOut();
                      accountMenuClose();
                    }}
                  >
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    Log Out
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button href="/user/login" variant="outlined" color="inherit">
                login
              </Button>
            )}
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
