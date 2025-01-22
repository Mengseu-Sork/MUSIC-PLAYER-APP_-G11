// Import the functions you need from the Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBPqtW45avyAsW2VKQvtPho2bWYUKr9b-s",
  authDomain: "music-player-3dbaa.firebaseapp.com",
  databaseURL: "https://music-player-3dbaa-default-rtdb.firebaseio.com",
  projectId: "music-player-3dbaa",
  storageBucket: "music-player-3dbaa.appspot.com",
  messagingSenderId: "446602459254",
  appId: "1:446602459254:web:26009c879e7ed1688fc757"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to add a song to Firestore
async function addSong(id, title, artist, src, duration) {
    try {
        const docRef = await addDoc(collection(db, "songs"), {
            id,
            title,
            artist,
            src,
            duration,
            createdAt: new Date(),
        });
        console.log("Document written with ID: ", docRef.id);
    } catch (error) {
        console.error("Error adding document: ", error);
    }
}

// Function to get all songs from Firestore
async function getAllSongs() {
    try {
        const snapshot = await getDocs(collection(db, "songs"));
        const songs = [];
        snapshot.forEach((doc) => {
            songs.push(doc.data());
        });
        return songs; // Return the songs array
    } catch (error) {
        console.error("Error getting documents: ", error);
        return []; // Return an empty array in case of error
    }
}

// Fetch song data from JSON file and store it in Firestore
async function getData() {
    try {
        const response = await fetch("../database/datasong.json");
        const data = await response.json();

        // Store each song in Firestore
        for (const song of data) {
            await addSong(song.id, song.title, song.artist, song.src, song.duration);
            console.log(`Song "${song.title}" added to Firestore`);
        }

        // Initialize the music player with songs from Firestore
        initializeMusicPlayer();
    } catch (error) {
        console.error("Error:", error);
    }
}

// Function to initialize the music player with songs from Firestore
async function initializeMusicPlayer() {
    try {
        const songs = await getAllSongs(); // Retrieve songs from Firestore

        // Initialize user data with songs from Firestore
        const userData = {
            songs: songs,
            currentSong: null,
        };
        // Initialize user data
        const previousButton = document.getElementById("previous");
        const playButton = document.getElementById("play");
        const pauseButton = document.getElementById("pause");
        const nextButton = document.getElementById("next");
        const shuffleButton = document.getElementById("shuffle");
        const playlistSongs = document.getElementById("playlist-songs");
        const progressSlider = document.getElementById("progressSlider");
        const currentTimeDisplay = document.getElementById("currentTime");
        const totalDurationDisplay = document.getElementById("totalDuration");
        const volumeControl = document.getElementById("volumeControl");
        const searchForm = document.querySelector("#search-form");
        const searchFormInput = searchForm.querySelector("input");
        const audio = new Audio();
        // Set initial state of user data
        userData.currentSong = songs[0]; // Set the current song to the first song
        updateSongInfo(userData.currentSong); // Update the song info
        updatePlaylist(userData.songs); // Update the playlist
        audio.src = userData.currentSong.src; // Set the audio source
        playSong(); // Play the current song
        audio.volume = volumeControl.value / 100; // Set the initial volume
        audio.addEventListener("loadedmetadata", updateDuration); // Update the total duration
        audio.addEventListener("timeupdate", updateProgress); // Update the progress slider
        audio.addEventListener("ended", nextSong); // Play the next song when the current song ends
        audio.addEventListener("error", (error) => {
            console.error("Error playing audio:", error);
            playButton.disabled = false;
            pauseButton.disabled = true;
        });
        previousButton.addEventListener("click", previousSong);
        playButton.addEventListener("click", playSong);
        pauseButton.addEventListener("click", pauseSong);
        nextButton.addEventListener("click", nextSong);
        shuffleButton.addEventListener("click", shuffleSongs);
        volumeControl.addEventListener("input", onVolumeInput);
        progressSlider.addEventListener("input", onSliderInput);
        searchForm.addEventListener("submit", (event) => {
            event.preventDefault();
            searchSongs(searchFormInput.value);
        });
        // Add your existing DOM and music player logic here
        // (Add your existing DOM and music player logic here)
        console.log("Music player initialized with songs from Firestore:", songs);
        // Add your existing DOM and music player logic here
        // (Add your existing DOM and music player logic here)
    } catch (error) {
        console.error("Error initializing music player:", error);
    }
}

// Function to update the song info in the DOM
    function updateSongInfo(song) {
        const songTitle = document.getElementById("songTitle");
        const songArtist = document.getElementById("songArtist");
        songTitle.textContent = song.title;
        songArtist.textContent = song.artist;
    }

// Function to update the playlist in the DOM
    function updatePlaylist(songs) {
        const playlistSongs = document.getElementById("playlist-songs");
        playlistSongs.innerHTML = "";
        songs.forEach((song) => {
            const listItem = document.createElement("li");
            listItem.textContent = song.title;
            listItem.addEventListener("click", () => playSong(song.id));
            playlistSongs.appendChild(listItem);
        });
    }

// Function to update the progress slider and current time display
    function updateProgress() {
        const progressSlider = document.getElementById("progressSlider");
        const currentTimeDisplay = document.getElementById("currentTime");
        const totalDurationDisplay = document.getElementById("totalDuration");
        progressSlider.value = (audio.currentTime / audio.duration) * 100;
        currentTimeDisplay.textContent = formatTime(audio.currentTime);
        totalDurationDisplay.textContent = formatTime(audio.duration);
    }


// Function to update the duration display
    function updateDuration() {
        const totalDurationDisplay = document.getElementById("totalDuration");
        totalDurationDisplay.textContent = formatTime(audio.duration);
    }

// Function to play a song by its ID
    function playSong(id) {
        const song = userData.songs.find((song) => song.id === id);
        if (!song) return;

        audio.src = song.src;
        userData.currentSong = song;
        updateSongInfo(song);
        updatePlaylist(userData.songs);
        playButton.disabled = true;
        pauseButton.disabled = false;
        audio.play();
    }


    // Function to pause the current song
    function pauseSong() {
        audio.pause();
        playButton.disabled = false;
        pauseButton.disabled = true;
    }

    // Function to play the next song
    function nextSong() {
        const currentSongIndex = getCurrentSongIndex();
        if (currentSongIndex < userData.songs.length - 1) {
            const nextSong = userData.songs[currentSongIndex + 1];
            playSong(nextSong.id);
        } else {
            playSong(userData.songs[0].id);
        }
    }

    // Function to play the previous song
    function previousSong() {
        const currentSongIndex = getCurrentSongIndex();
        if (currentSongIndex > 0) {
            const previousSong = userData.songs[currentSongIndex - 1];
            playSong(previousSong.id);
        } else {
            const lastSong = userData.songs[userData.songs.length - 1];
            playSong(lastSong.id);
        }
    }


    // Function to shuffle the songs
    function shuffleSongs() {
        userData.songs.sort(() => Math.random() - 0.5);
        updatePlaylist(userData.songs);
    }

    // Function to update the volume of the audio
    function onVolumeInput() {
        audio.volume = volumeControl.value / 100;
    }
    // Function to update the progress of the audio
    function onSliderInput() {
        audio.currentTime = (progressSlider.value / 100) * audio.duration;
    }
    // Function to format the time in seconds to minutes:seconds
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    }
    // Function to retrieve the current song index
    function getCurrentSongIndex() {
        return userData.songs.findIndex((song) => song.id === userData.currentSong.id);
    }
    // Function to search for songs by title
    function searchSongs(searchTerm) {
        const filteredSongs = userData.songs.filter((song) => song.title.toLowerCase().includes(searchTerm.toLowerCase()));
        updatePlaylist(filteredSongs);
    }
    // Your existing DOM and music player logic here
    // (Add your existing DOM and music player logic here)
    initializeMusicPlayer();

// Initialize the music player and store songs in Firestore
getSong();
// Fetch song data from JSON file
function getSong() {
    fetch("../database/datasong.json")
        .then(response => response.json())
        .then(data => {
            // Initialize user data
            const userData = {
                songs: data,
                currentSong: null,
            };

            // DOM Elements
            const previousButton = document.getElementById("previous");
            const playButton = document.getElementById("play");
            const pauseButton = document.getElementById("pause");
            const nextButton = document.getElementById("next");
            const shuffleButton = document.getElementById("shuffle");
            const playlistSongs = document.getElementById("playlist-songs");
            const progressSlider = document.getElementById("progressSlider");
            const currentTimeDisplay = document.getElementById("currentTime");
            const totalDurationDisplay = document.getElementById("totalDuration");
            const volumeControl = document.getElementById("volumeControl");
            const searchForm = document.querySelector("#search-form");
            const searchFormInput = searchForm.querySelector("input");

            // Audio element
            const audio = new Audio();

            // Play the previous song
            const playPreviousSong = () => {
                if (userData.currentSong === null) return;

                const currentSongIndex = getCurrentSongIndex();
                if (currentSongIndex > 0) {
                    const previousSong = userData.songs[currentSongIndex - 1];
                    playSong(previousSong.id);
                } else {
                    console.log("Beginning of playlist reached");
                }
            };

            // Play a song by ID
            const playSong = (id) => {
                const song = userData.songs.find((song) => song.id === id);
                if (!song) {
                    console.error("Song not found");
                    return;
                }

                audio.src = song.src; // Set the audio source
                audio.title = song.title;
                audio.currentTime = song.currentTime || 0; // Start from the beginning or saved time

                userData.currentSong = song; // Update the current song
                playButton.classList.add("playing"); // Update UI

                highlightCurrentSong();
                setPlayerDisplay();
                setPlayButtonAccessibleText();

                // Play the audio
                audio.play()
                    .then(() => {
                        console.log("Audio is playing");
                    })
                    .catch((error) => {
                        console.error("Error playing audio:", error);
                    });

                updateProgressSlider();
                // Show a SweetAlert2 confirmation dialog after 20 seconds
                setTimeout(() => {
                    audio.pause();

                    Swal.fire({
                        text: "Do you want to continue listening?",
                        showCancelButton: true,
                        confirmButtonText: "Yes",
                        cancelButtonText: "No",
                        width: '400px',
                        customClass: {
                            popup: "small-swal",
                        },
                    }).then((result) => {
                        if (result.isConfirmed) {
                            audio.play();
                        } else {
                            playButton.classList.remove("playing");
                        }
                    });
                }, 20000); // 20 seconds
            };

            // Pause the current song
            const pauseSong = () => {
                if (userData.currentSong) {
                    userData.currentSong.currentTime = audio.currentTime;
                }
                playButton.classList.remove("playing");
                audio.pause();
            };

            // Play the next song
            const playNextSong = () => {
                if (userData.currentSong === null) {
                    playSong(userData.songs[0].id); // Play the first song if no song is selected
                } else {
                    const currentSongIndex = getCurrentSongIndex();
                    if (currentSongIndex < userData.songs.length - 1) {
                        const nextSong = userData.songs[currentSongIndex + 1];
                        playSong(nextSong.id);
                    } else {
                        console.log("End of playlist reached");
                    }
                }
            };

            // Shuffle the playlist
            const shuffle = () => {
                const currentSong = userData.currentSong;

                const shuffledSongs = [...userData.songs].sort(() => Math.random() - 0.5);
                userData.songs = shuffledSongs;

                if (currentSong && userData.songs.includes(currentSong)) {
                    userData.currentSong = currentSong;
                } else {
                    userData.currentSong = null;
                    pauseSong();

                    // Auto-play the first song in the shuffled playlist
                    if (userData.songs.length > 0) {
                        playSong(userData.songs[0].id);
                    }
                }

                renderSongs(userData.songs);
                setPlayerDisplay();
                highlightCurrentSong();
                setPlayButtonAccessibleText();
            };

            // Delete a song by ID
            const deleteSong = (id) => {
                if (userData.currentSong?.id === id) {
                    userData.currentSong = null;
                    pauseSong();
                    setPlayerDisplay();
                }

                userData.songs = userData.songs.filter((song) => song.id !== id);
                renderSongs(userData.songs);
                highlightCurrentSong();
                setPlayButtonAccessibleText();

                if (userData.songs.length === 0) {
                    const resetButton = document.createElement("button");
                    const resetText = document.createTextNode("Reset Playlist");

                    resetButton.id = "reset";
                    resetButton.ariaLabel = "Reset playlist";
                    resetButton.appendChild(resetText);
                    playlistSongs.appendChild(resetButton);

                    resetButton.addEventListener("click", () => {
                        userData.songs = [...data];
                        renderSongs(userData.songs);
                        setPlayButtonAccessibleText();
                        resetButton.remove();
                    });
                }
            };

            // Update the player display with the current song details
            const setPlayerDisplay = () => {
                const playingSong = document.getElementById("player-song-title");
                const songArtist = document.getElementById("player-song-artist");
                const albumArt = document.getElementById("player-album-art").querySelector("img");

                const currentTitle = userData.currentSong?.title || "";
                const currentArtist = userData.currentSong?.artist || "";
                const currentImage = userData.currentSong?.image || "";

                playingSong.textContent = currentTitle;
                songArtist.textContent = currentArtist;

                if (albumArt) {
                    albumArt.src = currentImage;
                    albumArt.alt = `${currentTitle} by ${currentArtist}`;
                }
            };

            playlistSongs.addEventListener("click", (event) => {
                const songElement = event.target.closest(".playlist-song-info");
                if (songElement) {
                    const songId = songElement.parentElement.id.replace("song-", "");
                    playSong(parseInt(songId));
                }
            });

            // Highlight the current song in the playlist
            const highlightCurrentSong = () => {
                const playlistSongElements = document.querySelectorAll(".playlist-song");
                const songToHighlight = document.getElementById(`song-${userData.currentSong?.id}`);

                playlistSongElements.forEach((songEl) => {
                    songEl.removeAttribute("aria-current");
                });

                if (songToHighlight) songToHighlight.setAttribute("aria-current", "true");
            };

            // Render the playlist songs
            const renderSongs = (array) => {
                const songsHTML = array
                    .map((song) => {
                        return `
                        <li id="song-${song.id}" class="playlist-song">
                            <span class="playlist-song-info" onclick="playSong(${song.id})">
                                <span class="playlist-song-title">${song.title}</span>
                                <span class="playlist-song-artist">${song.artist}</span>
                                <span class="playlist-song-duration">${song.duration}</span>
                            </span>
                            <span onclick="deleteSong(${song.id})" class="playlist-song-delete" aria-label="Delete ${song.title}"></span>
                        </li>
                        `;
                    })
                    .join("");

                playlistSongs.innerHTML = songsHTML;
            };

            // Set accessible text for the play button
            const setPlayButtonAccessibleText = () => {
                const song = userData.currentSong || userData.songs[0];
                playButton.setAttribute("aria-label", song?.title ? `Play ${song.title}` : "Play");
            };

            // Get the index of the current song
            const getCurrentSongIndex = () => userData.songs.indexOf(userData.currentSong);

            // Format time in minutes and seconds
            const formatTime = (time) => {
                const minutes = Math.floor(time / 60);
                const seconds = Math.floor(time % 60);
                return `${minutes}:${seconds.toString().padStart(2, "0")}`;
            };

            // Update the progress slider and time display
            const updateProgressSlider = () => {
                progressSlider.value = (audio.currentTime / audio.duration) * 100 || 0;
                currentTimeDisplay.textContent = formatTime(audio.currentTime);
                totalDurationDisplay.textContent = formatTime(audio.duration);
            };

            // Handle slider input to seek through the song
            const onSliderInput = () => {
                const seekTime = (progressSlider.value / 100) * audio.duration;
                audio.currentTime = seekTime;
            };

            // Volume Control
            const onVolumeInput = () => {
                audio.volume = volumeControl.value;
            };

            // Event listeners
            previousButton.addEventListener("click", playPreviousSong);
            playButton.addEventListener("click", () => {
                if (userData.currentSong === null) {
                    playSong(userData.songs[0].id);
                } else {
                    playSong(userData.currentSong.id);
                }
            });
            pauseButton.addEventListener("click", pauseSong);
            nextButton.addEventListener("click", playNextSong);
            shuffleButton.addEventListener("click", shuffle);
            volumeControl.addEventListener("input", onVolumeInput);
            progressSlider.addEventListener("input", onSliderInput);

            // Update progress slider and time display as the song plays
            audio.addEventListener("timeupdate", () => {
                updateProgressSlider();
            });

            // Update total duration when the song metadata is loaded
            audio.addEventListener("loadedmetadata", () => {
                totalDurationDisplay.textContent = formatTime(audio.duration);
            });

            // Handle the end of a song
            audio.addEventListener("ended", () => {
                const currentSongIndex = getCurrentSongIndex();
                const nextSongExists = userData.songs[currentSongIndex + 1] !== undefined;

                if (nextSongExists) {
                    playNextSong();
                } else {
                    userData.currentSong = null;
                    pauseSong();
                    setPlayerDisplay();
                    highlightCurrentSong();
                    setPlayButtonAccessibleText();
                }
            });

            // Sort songs alphabetically by title
            const sortSongs = () => {
                userData.songs.sort((a, b) => a.title.localeCompare(b.title));
            };

            // Initialize the playlist
            sortSongs();
            renderSongs(userData.songs);
            setPlayButtonAccessibleText();

            // Speech Recognition
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

            if (SpeechRecognition) {
                console.log("Your browser supports speech recognition.");

                const recognition = new SpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = false;
                recognition.lang = "km-KH"; // Default to Khmer

                // Add microphone button
                searchForm.insertAdjacentHTML("beforeend", '<button type="button" id="mic-btn"><i class="fas fa-microphone"></i></button>');
                searchFormInput.style.paddingRight = "50px";

                const micBtn = searchForm.querySelector("#mic-btn");
                const micIcon = micBtn.querySelector("i");

                micBtn.addEventListener("click", () => {
                    if (micIcon.classList.contains("fa-microphone")) {
                        recognition.start();
                    } else {
                        recognition.stop();
                    }
                });

                recognition.addEventListener("start", () => {
                    micIcon.classList.remove("fa-microphone");
                    micIcon.classList.add("fa-microphone-slash");
                    searchFormInput.focus();
                    console.log("Speech recognition started. Speak now...");
                });

                recognition.addEventListener("end", () => {
                    micIcon.classList.remove("fa-microphone-slash");
                    micIcon.classList.add("fa-microphone");
                    searchFormInput.focus();
                    console.log("Speech recognition stopped.");
                });

                recognition.addEventListener("result", (event) => {
                    const transcript = event.results[0][0].transcript.toLowerCase().trim();
                    console.log("Transcript:", transcript);

                    const isKhmer = /[\u1780-\u17FF]/.test(transcript);
                    recognition.lang = isKhmer ? "km-KH" : "en-US";

                    if (transcript === "stop recording") {
                        recognition.stop();
                    } else if (transcript === "reset input") {
                        searchFormInput.value = "";
                    } else if (transcript === "go") {
                        searchForm.submit();
                    } else if (transcript.startsWith("play")) {
                        const songTitle = transcript.replace("play", "").trim();
                        const song = userData.songs.find(s => 
                            s.title.toLowerCase().includes(songTitle) || 
                            s.artist.toLowerCase().includes(songTitle)
                        );
                        if (song) {
                            playSong(song.id);
                        } else {
                            console.log("Song not found:", songTitle);
                        }
                    } else if (transcript === "next") {
                        playNextSong();
                    } else if (transcript === "previous") {
                        playPreviousSong();
                    } else if (transcript === "pause") {
                        pauseSong();
                    } else if (transcript === "shuffle") {
                        shuffle();
                    } else {
                        searchFormInput.value = transcript;
                        searchSongs();
                    }
                });
            } else {
                console.log("Your browser does not support speech recognition.");
                alert("Your browser does not support speech recognition. Please use Chrome or Edge.");
            }

            // Search functionality
            searchFormInput.addEventListener("input", () => {
                searchSongs();
            });

            const searchSongs = () => {
                const query = searchFormInput.value.toLowerCase().trim();
                const filteredSongs = query === "" 
                    ? userData.songs 
                    : userData.songs.filter(song => 
                        song.title.toLowerCase().includes(query)
                    );
                renderSongs(filteredSongs);
            };
        })
        .catch(error => console.error("Error:", error));
}

// Initialize the music player
getSong();