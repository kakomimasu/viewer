class Game {
  constructor() {
    //const [status, startTime] = Game.getGameStatus(game);
    this.gameId = "";
    this.status = "";
    this.startTime = "";
  }

  static getGameStatus(gameJson) {
    let status = "";
    let startTime = "";
    if (gameJson.startedAtUnixTime === null) {
      status = "プレイヤー入室待ち";
      startTime = "-";
    } else {
      startTime = new Date(gameJson.startedAtUnixTime * 1000).toLocaleString(
        "ja-JP",
      );
      if (!gameJson.gaming && !gameJson.ending) status = "ゲームスタート待ち";
      else if (gameJson.gaming && !gameJson.ending) status = "プレイ中";
      else if (gameJson.ending) status = "ゲーム終了";
    }
    //console.log(gameJson);
    return [status, startTime, gameJson.board ? gameJson.board.name : null];
  }
}

function getTurnText(game) {
  let turnText = "-";
  if (game.gaming || game.ending) {
    turnText = `${game.turn}/${game.totalTurn}`;
  }
  return turnText;
}

function nowUnixTime() {
  return Math.floor(new Date().getTime() / 1000);
}

function getUrlQueries() {
  const queries = {};
  const params = new URLSearchParams(window.location.search);
  params.forEach((v, k) => {
    queries[k] = v;
  });
  return queries;
}

export {
  Game,
  getTurnText,
  getUrlQueries,
  nowUnixTime,
};

export const getUserDetailUrl = (a) => `/user/detail.html?id=${a}`;
export const getGameDetailUrl = (a) => `/gamedetails.html?id=${a}`;
