// Fetch song data from JSON file
function getData() {
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

                audio.src = '../music/' + song.music; // Set the audio source
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
                }, 2000000);
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
getData();
