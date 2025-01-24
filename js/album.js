
  // Add click event listeners to artist and album cards
  document.querySelectorAll('.artist-card, .album-card').forEach(card => {
    card.addEventListener('click', function () {
      const url = this.dataset.url;
      if (url) {
        // Open YouTube link in a new tab
        window.open(url, '_blank');
      } else {
        console.error('No URL found for this card.');
      }
    });
  });
