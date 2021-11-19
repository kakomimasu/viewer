import React from "react";
import { useRouter } from "next/router";
import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";

import { Tournament } from "../src/apiClient";

const StyledCard = styled(Card)(({ theme }) => {
  return {
    border: "solid 3px",
    borderColor: theme.palette.secondary.main,
    borderRadius: 10,
    display: "flex",
    flexDirection: "column",
    margin: "1em",
    width: "20em",
    "&:hover": {
      borderColor: theme.palette.primary.main,
    },
  };
});

const TournamentName = styled("div")({
  fontWeight: "bold",
  fontSize: "1.5em",
});

const TournamentOrganizer = styled("div")({
  textAlign: "left",
});
const TournamentType = styled("div")({
  textAlign: "left",
});
const TournamentRemarks = styled("div")({
  fontSize: "0.8em",
  textAlign: "left",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

export default function TournamentCard(props: { tournament: Tournament }) {
  const router = useRouter();

  const tournament = props.tournament;

  const getType = (type: string) => {
    if (type === "round-robin") return "総当たり戦";
    else if (type === "knockout") return "勝ち残り戦";
    return "";
  };

  return (
    <StyledCard
      onClick={() => {
        router.push("/tournament/detail/" + tournament.id);
      }}
    >
      <CardActionArea style={{ height: "100%" }}>
        <CardContent>
          <TournamentName>{tournament.name}</TournamentName>
          <TournamentOrganizer>
            主催：{tournament.organizer}
          </TournamentOrganizer>
          <TournamentType>大会形式：{getType(tournament.type)}</TournamentType>
          <TournamentRemarks>{tournament.remarks}</TournamentRemarks>
        </CardContent>
      </CardActionArea>
    </StyledCard>
  );
}
