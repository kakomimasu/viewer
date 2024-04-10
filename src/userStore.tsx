import React, { createContext, useState, useEffect } from "react";

import { AuthedUser, host } from "./apiClient";

type UserContextType = {
  user: AuthedUser | null;
  setUser: React.Dispatch<React.SetStateAction<AuthedUser | null>>;
};

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
});

const StateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthedUser | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(host.href + "v1/users/me", {
        credentials: "include",
      });
      if (res.ok) {
        const user = await res.json();
        setUser(user);
      }
    })();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, StateProvider };
