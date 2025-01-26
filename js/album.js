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
