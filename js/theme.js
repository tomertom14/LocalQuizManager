const THEME_KEY = 'theme';

export function initTheme() {
    const theme = localStorage.getItem(THEME_KEY);

    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
    }
}

export function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
}
