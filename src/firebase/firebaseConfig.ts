import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Note: These are not secrets. Safe to expose to client side
const firebaseConfig = {
  apiKey: "AIzaSyDtHqPiCQKq7qwgT1OkIsZQ3IJOq6OUDms",
  authDomain: "kanban-board-1bb6e.firebaseapp.com",
  projectId: "kanban-board-1bb6e",
  storageBucket: "kanban-board-1bb6e.firebasestorage.app",
  messagingSenderId: "531807229991",
  appId: "1:531807229991:web:f8954579c08065bf0c1602",
  measurementId: "G-LLVECWBKK7"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const firestore = getFirestore(app);