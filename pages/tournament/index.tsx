import React, { useEffect, useState } from "react";
import Link from "next/link";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";

import Content from "../../components/content";
import TournamentCard from "../../components/tournament_card";

import { apiClient, Tournament } from "../../src/apiClient";

const StyledDiv = styled("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});

export default function Index() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  const getTournament = async () => {
    const res = await apiClient.tournamentsGet();
    if (res.success) setTournaments(res.data);
  };

  useEffect(() => {
    getTournament();
  }, []);

  return (
    <Content title="大会一覧">
      <StyledDiv>
        <Link href="/tournament/create" passHref>
          <Button>大会作成はこちらから</Button>
        </Link>
        <div
          style={{
            display: "flex",
            width: "100%",
            flexFlow: "row wrap",
            justifyContent: "center",
            marginTop: "20px",
          }}
        >
          {tournaments.map((t, i) => (
            <TournamentCard key={i} tournament={t} />
          ))}
        </div>
      </StyledDiv>
    </Content>
  );
}
