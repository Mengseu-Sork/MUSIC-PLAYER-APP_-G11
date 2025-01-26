document.addEventListener('DOMContentLoaded', () => {
    const themeRadios = document.querySelectorAll('input[name="theme"]');
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme) {
        document.body.className = savedTheme;
        document.querySelector(`input[value="${savedTheme}"]`).checked = true;
    }

    themeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const selectedTheme = radio.value;
            document.body.className = selectedTheme;
            localStorage.setItem('theme', selectedTheme);
        });
    });
});
