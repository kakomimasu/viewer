import { styled } from "@mui/material/styles";
import { CodeBlock, a11yDark } from "react-code-blocks";

const StyledDiv = styled("div")({
  fontFamily: `Consolas, Menlo, Monaco`,
});

export const KkmmCodeBlock = ({
  language,
  text,
}: {
  language: string;
  text: string;
}) => {
  return (
    <StyledDiv>
      <CodeBlock language={language} theme={a11yDark} text={text} />
    </StyledDiv>
  );
};
