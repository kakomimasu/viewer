import { useCallback, useEffect, useState } from "react";

import { Game, WsGameReq, WsGameRes, host } from "./apiClient";

export const useWebSocketGame = (req?: WsGameReq, bearerToken?: string) => {
  const [games, setGames] = useState<Game[]>([]);
  const [socket, setSocket] = useState<WebSocket>();

  const connect = useCallback(() => {
    console.log("websocket connecting...");
    const sock = new WebSocket(
      (host.protocol === "https:" ? "wss://" : "ws://") +
        host.host +
        "/v1/ws/game",
      bearerToken
    );
    sock.onopen = () => {
      console.log("websocket open");
      setSocket(sock);
    };
    sock.onclose = () => {
      setSocket(undefined);
      console.log("websocket close");
    };
  }, [bearerToken]);

  useEffect(() => {
    connect();
  }, [connect]);

  useEffect(() => {
    if (socket == undefined) {
      const id = setInterval(connect, 5000);
      return () => {
        clearInterval(id);
      };
    } else {
      return () => {
        socket.close();
      };
    }
  }, [socket, connect]);

  useEffect(() => {
    if (!socket) return;
    socket.onmessage = (event) => {
      const data = event.data;
      if (!data) return;
      const res = JSON.parse(data) as WsGameRes;
      //console.log(res);
      if (res.type === "initial") {
        setGames(res.games);
      } else if (res.type === "update") {
        setGames((prev) => {
          const games = [...prev];
          const updateGameIndex = games.findIndex((g) => g.id === res.game.id);
          if (updateGameIndex >= 0) games[updateGameIndex] = res.game;
          return games;
        });
      } else if (res.type === "remove") {
        setGames((prev) => {
          const games = [...prev];
          const removeGameIndex = games.findIndex((g) => g.id === res.gameId);
          if (removeGameIndex >= 0) games.splice(removeGameIndex, 1);
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
