import { useState, useCallback, useEffect } from "react";

import { apiClient, User } from "./apiClient";

export const useGameUsers = (inPlayerIds: string[]) => {
  const [users, setUsers] = useState(new Map<string, User | null>());

  const updateUsers = useCallback(async () => {
    const playerIdsSet = new Set(inPlayerIds);
    const addUsers: Map<string, User | null> = new Map();
    for await (const playerId of playerIdsSet) {
      if (!users.has(playerId)) {
        try {
          const res = await apiClient.getUser(playerId);
          addUsers.set(playerId, res);
        } catch (e) {
          addUsers.set(playerId, null);
        }
      }
    }
    if (addUsers.size > 0) {
      setUsers((users) => {
        const a = new Map(users);
        addUsers.forEach((user, playerId) => {
          a.set(playerId, user);
        });
        return a;
      });
    }
  }, [inPlayerIds, users]);

  useEffect(() => {
    updateUsers();
  }, [updateUsers]);

  return users;
};
