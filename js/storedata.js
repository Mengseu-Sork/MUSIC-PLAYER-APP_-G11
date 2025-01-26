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
  apiKey: "AIzaSyBPqtW45avyAsW2VKQvtPho2bWYUKr9b-s",
  authDomain: "music-player-3dbaa.firebaseapp.com",
  databaseURL: "https://music-player-3dbaa-default-rtdb.firebaseio.com",
  projectId: "music-player-3dbaa",
  storageBucket: "music-player-3dbaa.firebasestorage.app",
  messagingSenderId: "446602459254",
  appId: "1:446602459254:web:26009c879e7ed1688fc757"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firestore instance
const db = getFirestore(app);

// Function to add data to Firestore
async function addData(data) {
  try {
    const docRef = await addDoc(collection(db, "music_player"), {
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

// fetch("../database/datasong.json")
//   .then((response) => response.json())
//   .then((data) => {
//     data.forEach((song) => {
//         addData(song);
//     });
//   });
// Function to fetch data from Firestore
async function fetchData() {
    const querySnapshot = await getDocs(collection(db, "music_player"));
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log("Fetching data: ", data);
    });
  }

  // Call the function to fetch data
  fetchData();
