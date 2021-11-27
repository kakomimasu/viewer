import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    discord: Palette["primary"];
  }
  interface PaletteOptions {
    discord: PaletteOptions["primary"];
  }
}

export default createTheme({
  palette: {
    // Material Design Color(https://material.io/resources/color/#!/?view.left=1&view.right=1&primary.color=FBD5A8&secondary.color=58AFDA)
    primary: {
      main: "#fbd5a8",
      light: "#ffffda",
      dark: "#c7a479",
      contrastText: "#000000",
    },
    secondary: {
      main: "#58afda",
      light: "#8ee1ff",
      dark: "#1280a8",
      contrastText: "#000000",
    },
    discord: {
      main: "#5865F2",
    },
  },
  components: {
    MuiTextField: {
      defaultProps: {
        variant: "filled",
        color: "secondary",
      },
    },
    MuiButton: {
      defaultProps: {
        variant: "contained",
        color: "secondary",
      },
    },
    MuiAutocomplete: {
      defaultProps: {
        color: "secondary",
      },
    },
    MuiToggleButtonGroup: {
      defaultProps: {
        color: "secondary",
      },
    },
  },
});
