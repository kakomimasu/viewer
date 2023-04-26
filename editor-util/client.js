//@ts-check
/// <reference path="./client.d.ts" />
/// <reference path="./module.d.ts" />

//** consoleをpostMessageに置き換え */
console.log = (...args) => {
  postMessage({ type: "log", data: args });
};
console.error = (...args) => {
  postMessage({ type: "error", data: args, })
}

addEventListener("unhandledrejection", (e) => {
  console.error(String(e.reason));
});

function sleep(msec) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(undefined), msec);
  });
}

import ApiClient from "https://cdn.jsdelivr.net/gh/kakomimasu/client-js@main/esm/mod.js";

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

const apiClient = new ApiClient(option.apiHost);

/** @type {import("@kakomimasu/client-js").JoinMatchRes}  */
let match;
/** @type {import("@kakomimasu/client-js").Game}  */
let game;

matching();

async function matching() {
  const matchParam = { guestName: "ゲスト" };
  const auth = option.bearerToken && `Bearer ${option.bearerToken}`;

  let matchRes;
  if (option.matchType.type === "ai") {
    matchRes = await apiClient.joinAiMatch({ ...matchParam, aiName: option.matchType.aiName, boardName: option.matchType.boardName }, auth);
  } else if (option.matchType.type === "gameId") {
    matchRes = await apiClient.joinGameIdMatch(option.matchType.gameId, matchParam, auth)
  } else {
    matchRes = await apiClient.joinFreeMatch(matchParam, auth);
  }

  if (!matchRes.success) {
    console.log(matchRes.data);
    throw Error("Match Error");
  }
  match = matchRes.data;
  postMessage({ type: "match", data: match });
  // console.log("match!");

  do {
    let gameRes = await apiClient.getMatch(match.gameId);
    if (gameRes.success) game = gameRes.data;
    else throw Error("Get Match Error");

    await sleep(100);
  } while (game.startedAtUnixTime === null);

  await func.init(game, match);

  while (true) {
    const res = await apiClient.getMatch(match.gameId);
    if (res.success) {
      if (res.data.status === "ended") break;

      if (game.turn !== res.data.turn) {

        const actions = await func.turn(game) ?? [];

        const actionRes = await apiClient.setAction(
          match.gameId,
          { actions },
          match.pic,
        );
        //console.log("setActions", res);
        // if (actionRes.success === false) throw Error("Set Action Error");

        // console.log(actionRes);
        game = res.data;
      }
    }
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