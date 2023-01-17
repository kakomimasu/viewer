import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator, Auth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBOas3O1fmIrl51n7I_hC09YCG0EEe7tlc",
  authDomain: "kakomimasu.firebaseapp.com",
  projectId: "kakomimasu",
  storageBucket: "kakomimasu.appspot.com",
  messagingSenderId: "883142143351",
  appId: "1:883142143351:web:dc6ddc1158aa54ada74572",
  measurementId: "G-L43FT511YW",
};

let app: FirebaseApp;
let auth: Auth;
if (typeof window !== undefined && getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  auth = getAuth();
  isSupported().then((isSupported) => {
    if (isSupported) getAnalytics(app);
  });

  if (process.env.NEXT_PUBLIC_APISERVER_HOST?.includes("127.0.0.1")) {
    connectAuthEmulator(getAuth(app), `http://127.0.0.1:9099`);
  } else {
  }
}

export { auth };
