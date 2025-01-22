  // Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
} from "https://firebase.google.com/docs/web/setup#available-libraries";

const firebaseConfig = {
  apiKey: "AIzaSyBGyMdwXdC0xFow0aQX6OhF8Krz2IRZEp0",
  authDomain: "music-player-app-8f873.firebaseapp.com",
  databaseURL: "https://music-player-app-8f873-default-rtdb.firebaseio.com",
  projectId: "music-player-app-8f873",
  storageBucket: "music-player-app-8f873.firebasestorage.app",
  messagingSenderId: "719541221058",
  appId: "1:719541221058:web:ad119eee1d0ecb7e0c2d5b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
