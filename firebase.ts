import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDRNtjMdydlosXK9AbaHKD2jJXSh20UfVE",
  authDomain: "testlandingapp.firebaseapp.com",
  projectId: "testlandingapp",
  storageBucket: "testlandingapp.firebasestorage.app",
  messagingSenderId: "173109463992",
  appId: "1:173109463992:web:de95721d800f72981ddd4d",
  measurementId: "G-M8S8W3G4V3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;