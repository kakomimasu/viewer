import React, { useEffect, useState, useMemo } from "react";
import { TextField, Box, MenuItem, Tab } from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { useStateWithStorage } from "../src/useStateWithStorage";

const aiList = [
  { label: "AI-1", name: "a1" },
  { label: "AI-2", name: "a2" },
  { label: "AI-3", name: "a3" },
  { label: "AI-4", name: "a4" },
  { label: "None", name: "none" },
] as const;
type AiName = (typeof aiList)[number]["name"];

export type MatchType =
  | {
      type: "free";
    }
  | {
      type: "ai";
      aiName: AiName;
      boardName?: string;
    }
  | {
      type: "gameId";
      gameId: string;
    };

export const Component: React.FC<{
  disabled: boolean;
  onChange?: (v: MatchType) => void;
}> = ({ disabled = false, onChange }) => {
  const [type, setType] = useStateWithStorage<MatchType["type"]>(
    "matchTypeTab:type",
    "free",
  );
  const [aiName, setAiName] = useStateWithStorage<AiName>(
    "matchTypeTab:aiName",
    aiList[0].name,
  );
  const [boardName, setBoardName] = useStateWithStorage<string | undefined>(
    "matchTypeTab:boardName",
    undefined,
  );
  const [gameId, setGameId] = useState<string>("");

  const value = useMemo<MatchType>(() => {
    if (type === "free") return { type };
    else if (type === "ai") return { type, aiName, boardName };
    else if (type === "gameId") return { type, gameId };
    else return type;
  }, [type, aiName, boardName, gameId]);

  useEffect(() => {
    onChange?.(value);
  }, [value, onChange]);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        borderColor: "divider",
      }}
    >
      <TabContext value={value.type}>
        <Box sx={{ borderRight: 1, borderColor: "divider" }}>
          <TabList
            textColor="secondary"
            indicatorColor="secondary"
            centered
            orientation="vertical"
            onChange={(_, type) => {
              setType(type as MatchType["type"]);
            }}
          >
            <Tab label="フリーマッチ参加" value="free" disabled={disabled} />
            <Tab label="ゲームIDで参加" value="gameId" disabled={disabled} />
            <Tab label="対AI戦" value="ai" disabled={disabled} />
          </TabList>
        </Box>
        <Box sx={{ width: "25em" }}>
          <TabPanel value="gameId">
            <TextField
              fullWidth
              label="ゲームID"
              value={gameId}
              disabled={disabled}
              onChange={({ target: { value } }) => {
                setGameId(value);
              }}
              onKeyDown={(e) => {
                e.stopPropagation();
              }}
            />
          </TabPanel>
          <TabPanel value="ai">
            <TextField
              fullWidth
              select
              label="対戦AI"
              value={aiName}
              disabled={disabled}
              onChange={({ target: { value } }) => {
                setAiName(value as typeof aiName);
              }}
            >
              {aiList.map((ai) => {
                return (
                  <MenuItem key={ai.name} value={ai.name}>
                    {ai.label}
                  </MenuItem>
                );
              })}
            </TextField>
          </TabPanel>
        </Box>
      </TabContext>
    </Box>
  );
};

export default Component;
