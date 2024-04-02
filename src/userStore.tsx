import React, { createContext, useState, useEffect } from "react";
import { User as firebaseUser, signOut } from "firebase/auth";

import { apiClient, User, AuthedUser, host } from "./apiClient";
import { auth } from "./firebase";

// type UserContextType =
//   | {
//       firebaseUser: undefined;
//       kkmmUser: undefined;
//     }
//   | { firebaseUser: null; kkmmUser: null }
// | { firebaseUser: firebaseUser; kkmmUser: User | null };
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

  // useEffect(() => {
  //   auth.onAuthStateChanged(async (user) => {
  //     if (user === null) {
  //       setUser({ firebaseUser: null, kkmmUser: null });
  //     } else {
  //       const idToken = await user.getIdToken(true);
  //       const res = await apiClient.getUser(user.uid, idToken);
  //       if (res.success === true) {
  //         setUser({ firebaseUser: user, kkmmUser: res.data });
  //         return;
  //       } else {
  //         if (location.pathname !== "/user/login") {
  //           signOut(auth);
  //         } else setUser({ firebaseUser: user, kkmmUser: null });
  //       }
  //     }
  //   });
  // }, []);

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
