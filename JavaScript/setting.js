document.addEventListener('DOMContentLoaded', () => {
    const themeRadios = document.querySelectorAll('input[name="theme"]');

    themeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const selectedTheme = radio.value;

            if (selectedTheme === 'light') {
                document.body.className = 'light';
            } else if (selectedTheme === 'dark') {
                document.body.className = 'dark';
            } else if (selectedTheme === 'system') {
                const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.body.className = prefersDarkScheme ? 'dark' : 'light';
            }
        });
    });
});