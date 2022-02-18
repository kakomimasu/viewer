import { useState, useCallback, useEffect } from "react";

import { apiClient, User } from "./apiClient";

export const useGameUsers = (inPlayerIds: string[]) => {
  const [users, setUsers] = useState(new Map<string, User | null>());

  const updateUsers = useCallback(async () => {
    const playerIdsSet = new Set(inPlayerIds);
    const addUsers: Map<string, User | null> = new Map();
    for await (const playerId of playerIdsSet) {
      if (!users.has(playerId)) {
        const res = await apiClient.usersShow(playerId);
        const user = res.success ? res.data : null;
        addUsers.set(playerId, user);
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
