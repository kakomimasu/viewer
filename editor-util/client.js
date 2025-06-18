//@ts-check
/// <reference path="./client.d.ts" />
/// <reference path="./module.d.ts" />

//** consoleをpostMessageに置き換え */
console.log = (...args) => {
  postMessage({ method: "log", data: args });
};
console.error = (...args) => {
  postMessage({ method: "error", data: args, })
}

addEventListener("unhandledrejection", (e) => {
  console.error(String(e.reason));
});

function sleep(msec) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(undefined), msec);
  });
}

import { ApiClient } from "https://esm.sh/jsr/@kakomimasu/client-js@0.1.0";

const func = {
  init: async (game, match) => { },
  turn: async (game) => [],
}
function oninit(fn) { func.init = fn };
function onturn(fn) { func.turn = fn };

const DIR = [
  [0, -1],
  [1, -1],
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
];

const apiClient = new ApiClient({
  baseUrl: option.apiHost + "v1"
});

/** @type {import("@kakomimasu/client-js").JoinMatchResponse}  */
let match;
/** @type {import("@kakomimasu/client-js").Game}  */
let game;

matching();

async function matching() {
  const matchParam = { guestName: "ゲスト" };
  const auth = option.bearerToken && `${option.bearerToken}`;

  let matchRes;
  try {
    if (option.matchType.type === "ai") {
      matchRes = await apiClient.joinAiMatch({ ...matchParam, aiName: option.matchType.aiName, boardName: option.matchType.boardName }, { authMethods: { Bearer: auth } });
    } else if (option.matchType.type === "gameId") {
      matchRes = await apiClient.joinGameIdMatch(option.matchType.gameId, matchParam, { authMethods: { Bearer: auth } })
    } else {
      matchRes = await apiClient.joinFreeMatch(matchParam, { authMethods: { Bearer: auth } });
    }
  } catch (e) {
    console.error(e.toString());
    throw Error("Match Error");
  }
  match = matchRes;
  postMessage({ method: "match", data: match });
  // console.log("match!");

  do {
    try {
      let gameRes = await apiClient.getMatch(match.gameId);
      game = gameRes;
    } catch (e) {
      throw Error("Get Match Error");
    }
    await sleep(100);
  } while (game.startedAtUnixTime === null);

  await func.init(game, match);

  while (true) {
    try {
      const res = await apiClient.getMatch(match.gameId);
      if (res.status === "ended") break;

      if (game.turn !== res.turn) {

        const actions = await func.turn(game) ?? [];

        const actionRes = await apiClient.setAction(
          match.gameId,
          { actions },
          { authMethods: { PIC: match.pic } }
        );
        //console.log("setActions", res);
        // if (actionRes.success === false) throw Error("Set Action Error");

        // console.log(actionRes);
        game = res;
      }
    } catch (e) { }
    await sleep(100);
  }
  console.log("match end");
}

export function getAgents() {
  return game.players[match.index].agents
}

/** @param idx {number} */
export function idx2xy(idx) {
  if (!game.field) return { x: -1, y: -1 };
  return {
    x: idx % game.field.width,
    y: Math.floor(idx / game.field.width),
  };
}
/** 
 * @param x {number} 
 * @param y {number}
*/
export function xy2idx(x, y) {
  if (!game.field) return -1;
  return y * game.field.width + x;
}