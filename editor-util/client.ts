import {
  ApiClient,
  Game as GameType,
  JoinMatchResponse,
  SetActionRequest,
} from "@kakomimasu/client-js";
import type { MatchType } from "../components/matchTypeTab";

type Expand<T> = T extends object
  ? T extends infer O
    ? { [K in keyof O]: Expand<O[K]> }
    : never
  : T;

// ユーザー用の field を non-nullable にした型
export type Game = Expand<
  Omit<GameType, "field"> & {
    field: NonNullable<GameType["field"]>;
  }
>;
export type Actions = Expand<
  Omit<SetActionRequest["actions"][number], "type"> & { type: string }
>;

export type OnInitFn = (
  game: Game,
  match: JoinMatchResponse,
) => void | Promise<void>;
export type OnTurnFn = (game: Game) => Actions[] | Promise<Actions[]>;

// 型定義出力用にglobalに宣言
declare global {
  var option: {
    bearerToken: string | undefined;
    apiHost: string;
    matchType: MatchType | undefined;
  };

  /** 8方向の移動ベクトル */
  var DIR: [
    [0, -1],
    [1, -1],
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1],
  ];

  /** ゲーム開始時に呼ばれる関数 */
  var oninit: (fn: OnInitFn) => void;
  /** 各ターンに呼ばれる関数 */
  var onturn: (fn: OnTurnFn) => void;

  /** 自分のエージェント情報を取得する関数 */
  var getAgents: () => Game["players"][number]["agents"];
  /** index を x,y に変換する関数 */
  var idx2xy: (idx: number) => { x: number; y: number };
  /** x,y を index に変換する関数 */
  var xy2idx: (x: number, y: number) => number;
}

// consoleをpostMessageとしても送るように置き換え
let originalConsoleLog = console.log;
let originalConsoleError = console.error;
console.log = (...args) => {
  originalConsoleLog(...args);
  postMessage({ method: "log", data: args });
};
console.error = (...args) => {
  originalConsoleError(...args);
  postMessage({ method: "error", data: args });
};

addEventListener("unhandledrejection", (e) => {
  console.error(String(e.reason));
});

/** 指定時間待つ関数 */
function sleep(msec: number) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(undefined), msec);
  });
}

const func: { init: OnInitFn; turn: OnTurnFn } = {
  init: () => {}, // 何もしない関数
  turn: () => [], // 何もしない関数
};

globalThis.DIR = [
  [0, -1],
  [1, -1],
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
];

globalThis.oninit = (fn: OnInitFn) => {
  func.init = fn;
};
globalThis.onturn = (fn: OnTurnFn) => {
  func.turn = fn;
};

globalThis.getAgents = () => {
  return __game.players[__match.index].agents;
};

globalThis.idx2xy = (idx: number) => {
  if (!__game.field) return { x: -1, y: -1 };
  return {
    x: idx % __game.field.width,
    y: Math.floor(idx / __game.field.width),
  };
};

globalThis.xy2idx = (x: number, y: number) => {
  if (!__game.field) return -1;
  return y * __game.field.width + x;
};

const apiClient = new ApiClient({
  baseUrl: new URL("v1", option.apiHost).href,
});

/** 内部でのゲーム情報保持用 */
let __match: JoinMatchResponse;
/** 内部でのゲーム情報保持用 */
let __game: GameType;

async function matching() {
  const matchParam = { guestName: "ゲスト" };
  const auth = option.bearerToken && `${option.bearerToken}`;

  let matchRes: JoinMatchResponse;
  try {
    if (option.matchType?.type === "ai") {
      matchRes = await apiClient.joinAiMatch(
        {
          ...matchParam,
          aiName: option.matchType.aiName,
          boardName: option.matchType.boardName,
        },
        { authMethods: { Bearer: auth } },
      );
    } else if (option.matchType?.type === "gameId") {
      matchRes = await apiClient.joinGameIdMatch(
        option.matchType.gameId,
        matchParam,
        { authMethods: { Bearer: auth } },
      );
    } else {
      matchRes = await apiClient.joinFreeMatch(matchParam, {
        authMethods: { Bearer: auth },
      });
    }
  } catch (e: any) {
    console.error(e.toString());
    throw Error("Match Error");
  }
  __match = matchRes;
  postMessage({ method: "match", data: __match });

  do {
    try {
      let gameRes = await apiClient.getMatch(__match.gameId);
      __game = gameRes;
    } catch (e) {
      throw Error("Get Match Error");
    }
    await sleep(100);
  } while (__game.startedAtUnixTime === null);

  await func.init(__game as Game, __match);

  while (true) {
    try {
      const res = await apiClient.getMatch(__match.gameId);
      if (res.status === "ended") break;

      if (__game.turn !== res.turn) {
        __game = res;
        const actions = ((await func.turn(__game as Game)) ??
          []) as SetActionRequest["actions"];

        const actionRes = await apiClient.setAction(
          __match.gameId,
          { actions },
          { authMethods: { PIC: __match.pic } },
        );
      }
    } catch (e) {}
    await sleep(100);
  }
  console.log("match end");
}

matching();
