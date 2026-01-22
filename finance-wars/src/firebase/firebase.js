import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
 apiKey: "AIzaSyCDAGoSWQy43bcDgaM5RO5x2S1pzEy8aBI",
    authDomain: "financewar.firebaseapp.com",
    projectId: "financewar",
    storageBucket: "financewar.firebasestorage.app",
    messagingSenderId: "836112163542",
    appId: "1:836112163542:web:009e21f93c4269edd19f77",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);
