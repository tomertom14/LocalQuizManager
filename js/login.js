import { AuthService } from './services/AuthService.js';

const form = document.getElementById('login-form');
const messageEl = document.getElementById('message');

function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
}

form.addEventListener('submit', (event) => {
    event.preventDefault();

    const idNumber = document.getElementById('idNumber').value.trim();
    const password = document.getElementById('password').value;

    if (!idNumber || !password) {
        showMessage('Please fill in all fields.', 'error');
        return;
    }

    const user = AuthService.login(idNumber, password);

    if (!user) {
        showMessage('Invalid ID number or password. Please try again.', 'error');
        return;
    }

    if (user.role === 'teacher') {
        window.location.href = 'teacher-dashboard.html';
    } else {
        window.location.href = 'student-dashboard.html';
    }
});
