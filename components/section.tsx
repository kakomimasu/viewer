import React from "react";
import { styled } from "@mui/material/styles";

type Props = {
  children?: React.ReactNode;
  title?: string;
};

const Section = styled("section")(({ theme }) => ({
  border: "solid 3px",
  borderColor: theme.palette.primary.main,
  marginTop: "50px",
  position: "relative",
  padding: "30px 30px 20px 30px",
  width: "100%",
}));

const Title = styled("h2")(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 20,
  padding: "0 10px",
  margin: 0,
  transform: "translateY(-50%)",
  backgroundColor: theme.palette.background.default,
  color: "#5C4C40",
}));

const SubTitle = styled("h3")(({ theme }) => ({
  fontSize: "0.8em",
  borderBottom: "solid 2px",
  borderBottomColor: theme.palette.secondary.main,
  margin: "0 auto",
  padding: "0 5px",
  display: "inline-block",
  color: "#5C4C40",
}));

export default function StyledSection(props: Props) {
  return (
    <Section>
      {props.title && <Title>{props.title}</Title>}
      {props.children}
    </Section>
  );
}

export function SubSection(props: Props) {
  return (
    <>
      <SubTitle>{props.title}</SubTitle>
      {props.children}
    </>
  );
}
