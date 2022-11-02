import { useEffect, useState } from "react";

import { Game, WsGameReq, WsGameRes, host } from "./apiClient";

export const useGameStream = (req?: WsGameReq, bearerToken?: string) => {
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    if (!req) return;
    const ac = new AbortController();

    const url = new URL("/v1/game/stream", host);
    url.searchParams.append("q", req.q);
    if (req.allowNewGame !== undefined)
      url.searchParams.append("allowNewGame", String(req.allowNewGame));
    if (req.endIndex !== undefined)
      url.searchParams.append("endIndex", String(req.endIndex));
    if (req.startIndex !== undefined)
      url.searchParams.append("startIndex", String(req.startIndex));

    const headers = bearerToken
      ? new Headers()
      : new Headers({
          Authorization: "Bearer " + bearerToken,
        });

    fetch(url, {
      headers,
      signal: ac.signal,
    }).then(async (res) => {
      const reader = res.body?.getReader();
      if (!reader) return;

      new ReadableStream({
        start(controller) {
          const pump = async () => {
            return reader.read().then(({ done, value }) => {
              if (done) {
                controller.close();
                return;
              }

              const datas = new TextDecoder().decode(value).trim().split("\n");
              for (const data of datas) {
                const str = data.trim();
                if (!str) continue;
                try {
                  const res = JSON.parse(str) as WsGameRes;
                  // console.log("getData: ", data);

                  if (res.type === "initial") {
                    setGames(res.games);
                  } else if (res.type === "update") {
                    setGames((prev) => {
                      const games = [...prev];
                      const updateGameIndex = games.findIndex(
                        (g) => g.id === res.game.id
                      );
                      if (updateGameIndex >= 0)
                        games[updateGameIndex] = res.game;
                      return games;
                    });
                  } else if (res.type === "remove") {
                    setGames((prev) => {
                      const games = [...prev];
                      const removeGameIndex = games.findIndex(
                        (g) => g.id === res.gameId
                      );
                      if (removeGameIndex >= 0)
                        games.splice(removeGameIndex, 1);
                      return games;
                    });
                  } else if (res.type === "add") {
                    setGames((prev) => {
                      const games = [...prev];
                      games.push(res.game);
                      if (req?.q.includes("sort:startAtUnixTime-desc")) {
                        games.sort((a, b) => {
                          const aTime = a.startedAtUnixTime || 10000000000;
                          const bTime = b.startedAtUnixTime || 10000000000;
                          return bTime - aTime;
                        });
                      }
                      return games;
                    });
                  }
                } catch (e) {
                  console.log(e, str);
                }
              }
              pump();
            });
          };
          return pump();
        },
      });
    });
    return () => {
      ac.abort();
    };
  }, [req, bearerToken]);

  return games;
};
