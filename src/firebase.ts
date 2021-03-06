import firebase from "firebase/app";
import "firebase/auth";
import "firebase/analytics";
import "firebase/firestore";

if (typeof window !== "undefined" && firebase.apps.length === 0) {
  const firebaseConfig = {
    apiKey: "AIzaSyBOas3O1fmIrl51n7I_hC09YCG0EEe7tlc",
    authDomain: "kakomimasu.firebaseapp.com",
    projectId: "kakomimasu",
    storageBucket: "kakomimasu.appspot.com",
    messagingSenderId: "883142143351",
    appId: "1:883142143351:web:dc6ddc1158aa54ada74572",
    measurementId: "G-L43FT511YW",
  };

  firebase.initializeApp(firebaseConfig);
  firebase.auth();
  firebase.analytics();
  firebase.firestore();
}

export default firebase;
