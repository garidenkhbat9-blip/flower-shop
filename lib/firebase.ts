import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Өгөгдлийн сан нэмсэн
import { getStorage } from "firebase/storage"; 

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAWD6xtSfVnxbPePu423KpKJm4OqqH6FR8",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "unurflower-0913.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "unurflower-0913",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "unurflower-0913.firebasestorage.app", 
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "184666178926",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:184666178926:web:cf90b53545307e9fef6d7f"
};
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);      // Firestore-ийг эхлүүлэх
const storage = getStorage(app);
export { app, auth , db, storage };