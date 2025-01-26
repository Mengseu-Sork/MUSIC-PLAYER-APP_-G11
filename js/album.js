 document.querySelectorAll('.artist-card, .album-card').forEach(card => {
    card.addEventListener('click', function () {
      const url = this.dataset.url;
      if (url) {
        // Open YouTube link in a new tab
        window.open(url, 'pages/playlist.html');
      } else {
        console.error('No URL found for this card.');
      }
    });
  });

// Ensure the DOM is fully loaded before running the script
document.addEventListener("DOMContentLoaded", () => {
  const searchForm = document.getElementById("search-form");
  const searchFormInput = searchForm.querySelector('input[name="q"]');

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (SpeechRecognition) {
    console.log("Your browser supports speech recognition.");

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "km-KH"; // Default to Khmer

    // Add microphone button to the search form
    searchForm.insertAdjacentHTML(
      "beforeend",
      '<button type="button" id="mic-btn"><i class="fas fa-microphone"></i></button>'
    );
    searchFormInput.style.paddingRight = "50px"; // Adjust input padding for the button

    const micBtn = searchForm.querySelector("#mic-btn");
    const micIcon = micBtn.querySelector("i");

    // Toggle voice recognition on button click
    micBtn.addEventListener("click", () => {
      if (micIcon.classList.contains("fa-microphone")) {
        recognition.start();
      } else {
        recognition.stop();
      }
    });

    // Handle speech recognition start
    recognition.addEventListener("start", () => {
      micIcon.classList.remove("fa-microphone");
      micIcon.classList.add("fa-microphone-slash");
      searchFormInput.focus();
      console.log("Speech recognition started. Speak now...");
    });

    // Handle speech recognition end
    recognition.addEventListener("end", () => {
      micIcon.classList.remove("fa-microphone-slash");
      micIcon.classList.add("fa-microphone");
      searchFormInput.focus();
      console.log("Speech recognition stopped.");
    });

    // Handle speech recognition results
    recognition.addEventListener("result", (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim();
      console.log("Transcript:", transcript);

      // Detect if the transcript is in Khmer
      const isKhmer = /[\u1780-\u17FF]/.test(transcript);
      recognition.lang = isKhmer ? "km-KH" : "en-US";

      // Handle specific voice commands
      if (transcript === "stop recording") {
        recognition.stop();
      } else if (transcript === "reset input") {
        searchFormInput.value = "";
      } else if (transcript === "go") {
        searchForm.submit();
      } else if (transcript.startsWith("play")) {
        const songTitle = transcript.replace("play", "").trim();
        const song = userData.songs.find(
          (s) =>
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
});
