import React, { useEffect, useState } from "react";
import Link from "next/link";
import { makeStyles } from "@mui/styles";
import Button from "@mui/material/Button";

import Content from "../../components/content";
import TournamentCard from "../../components/tournament_card";

import { apiClient, Tournament } from "../../src/apiClient";

const useStyles = makeStyles({
  content: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  list: {
    display: "flex",
    width: "100%",
    flexFlow: "row wrap",
    justifyContent: "center",
  },
});

export default function Index() {
  const classes = useStyles();
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
      <div className={classes.content}>
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
      </div>
    </Content>
  );
}
