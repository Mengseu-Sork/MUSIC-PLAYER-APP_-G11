// Import the Firebase library
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use

// Your web app's Firebase configuration
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

// Get Firestore instance
const db = getFirestore(app);

// Function to add data to Firestore
async function addData(data) {
  try {
    const docRef = await addDoc(collection(db, "music"), {
      id: data.id,
      title: data.title,
      artist: data.artist,
      duration: data.duration,
      image: data.image,
      music: data.music,
      currentTime: data.currentTime
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (error) {
    console.error("Error adding document: ", error);
  }
}

fetch("../database/datasong.json")
  .then((response) => response.json())
  .then((data) => {
    data.forEach((song) => {
        addData(song);
    });
  });
// Function to fetch data from Firestore
async function fetchData() {
    const querySnapshot = await getDocs(collection(db, "music"));
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log("Fetching data: ", data);
    });
  }

  // Call the function to fetch data
fetchData();

