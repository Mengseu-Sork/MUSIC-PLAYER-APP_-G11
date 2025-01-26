document.addEventListener("DOMContentLoaded", () => {
    const themeRadios = document.querySelectorAll('input[name="theme"]');

    themeRadios.forEach(radio => {
        radio.addEventListener("change", (event) => {
            const selectedTheme = event.target.value;
            document.body.className = ""; // Clear existing classes
            document.body.classList.add(`${selectedTheme}-theme`);
        });
    });
});