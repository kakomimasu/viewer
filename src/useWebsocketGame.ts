import { useEffect, useState } from "react";

import { Game, WsGameReq, WsGameRes, host } from "./apiClient";

export const useWebSocketGame = (req?: WsGameReq) => {
  const [games, setGames] = useState<Game[]>([]);
  const [socket, setSocket] = useState<WebSocket>();

  useEffect(() => {
    const sock = new WebSocket(
      (host.protocol === "https:" ? "wss://" : "ws://") +
        host.host +
        "/v1/ws/game"
    );
    sock.onopen = () => {
      setSocket(sock);
    };
    return () => {
      setSocket(undefined);
      sock.close();
      console.log("websocket close");
    };
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.onmessage = (event) => {
      const data = event.data;
      if (!data) return;
      const res = JSON.parse(data) as WsGameRes;
      //console.log(res);
      if (res.type === "initial") {
        setGames(res.games);
      } else {
        setGames((prev) => {
          const games = [...prev];
          const updateGameIndex = games.findIndex(
            (g) => g.gameId === res.game.gameId
          );
          if (updateGameIndex >= 0) games[updateGameIndex] = res.game;
          else {
            games.push(res.game);
            if (req?.q.includes("sort:startAtUnixTime-desc")) {
              games.sort((a, b) => {
                const aTime = a.startedAtUnixTime || 10000000000;
                const bTime = b.startedAtUnixTime || 10000000000;
                return bTime - aTime;
              });
            }
          }
          return games;
        });
      }
    };
  }, [req, socket]);

  useEffect(() => {
    setGames([]);
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(req));
    }
  }, [req, socket]);

  return games;
};
