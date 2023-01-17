import React, { createContext, useState, useEffect } from "react";
import { User as firebaseUser, signOut } from "firebase/auth";

import { apiClient, User } from "./apiClient";
import { auth } from "./firebase";

type UserContextType =
  | {
      firebaseUser: undefined;
      kkmmUser: undefined;
    }
  | { firebaseUser: null; kkmmUser: null }
  | { firebaseUser: firebaseUser; kkmmUser: User | null };

const UserContext = createContext<UserContextType>({
  firebaseUser: undefined,
  kkmmUser: undefined,
});

const StateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserContextType>({
    firebaseUser: undefined,
    kkmmUser: undefined,
  });

  useEffect(() => {
    auth.onAuthStateChanged(async (user) => {
      if (user === null) {
        setUser({ firebaseUser: null, kkmmUser: null });
      } else {
        const idToken = await user.getIdToken(true);
        const res = await apiClient.getUser(user.uid, idToken);
        if (res.success === true) {
          setUser({ firebaseUser: user, kkmmUser: res.data });
          return;
        } else {
          if (location.pathname !== "/user/login") {
            signOut(auth);
          } else setUser({ firebaseUser: user, kkmmUser: null });
        }
      }
    });
  }, []);
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

export { UserContext, StateProvider };
