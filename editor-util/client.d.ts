import { Game, JoinMatchRes, ActionMatchReq } from "@kakomimasu/client-js";

declare global {
  const option: {
    bearerToken: string | undefined;
    apiHost: string;
    matchType: MatchType | undefined;
  };

  const DIR: [number, number][];

  function oninit(fn: (game: Game, match: JoinMatchRes) => void): void;
  function onturn(fn: (game: Game) => ActionMatchReq["actions"]): void;

  function getAgents(): Game["players"][number]["agents"];
  function idx2xy(idx: number): { x: number; y: number };
  function xy2idx(x: number, y: number): number;
}
