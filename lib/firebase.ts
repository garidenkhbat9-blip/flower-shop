import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Өгөгдлийн сан нэмсэн
import { getStorage } from "firebase/storage"; 

const rawApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAWD6xtSfVnxbPePu423KpKJm4OqqH6FR8";

const cleanApiKey = rawApiKey.replace(":1", "").trim(); 

const firebaseConfig = {
  apiKey: cleanApiKey, // Цэвэрлэсэн түлхүүрээ энд өгнө
  authDomain: "unurflower-0913.firebaseapp.com",
  projectId: "unurflower-0913",
  storageBucket: "unurflower-0913.firebasestorage.app", 
  messagingSenderId: "184666178926",
  appId: "1:184666178926:web:cf90b53545307e9fef6d7f"
};
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);      // Firestore-ийг эхлүүлэх
const storage = getStorage(app);
export { app, auth , db, storage };