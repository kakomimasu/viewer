import { useMemo } from "react";
import { Box } from "@mui/material";
import { Game } from "@kakomimasu/client-js";

type Props = { game: Game };

const MatchTimer: React.FC<Props> = ({ game }) => {
  const data = useMemo(() => {
    if (game.field === null) {
      return {
        turn: "-",
        nTurn: "",
      };
    } else {
      return {
        turn: `${game.turn}`,
        nTurn: `/${game.totalTurn}`,
      };
    }
  }, [game.field, game.turn, game.totalTurn]);

  return (
    <Box>
      <Box
        sx={{
          width: "6.5em",
          height: "4em",
          position: "relative",
        }}
      >
        <Box
          sx={{
            fontSize: "3em",
            position: "absolute",
            p: 1,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          {data.turn}
        </Box>
        <Box
          sx={{
            position: "absolute",
            bottom: "0rem",
            right: "0rem",
          }}
        >
          {data.nTurn}
        </Box>
      </Box>
    </Box>
  );
};

export default MatchTimer;
