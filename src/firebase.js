import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyBwUJZ9SLcvETEk6k-KU4xPRGqSgWhc4rU",
  authDomain: "scholarship-app-9cdd7.firebaseapp.com",
  projectId: "scholarship-app-9cdd7",
  storageBucket: "scholarship-app-9cdd7.appspot.com",
  messagingSenderId: "185837851627",
  appId: "1:185837851627:web:605b53a5f71b0f2ea93fae"
};;

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const firestore = getFirestore(app);
export const storage = getStorage(app);