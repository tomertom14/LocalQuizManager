import { AuthService } from './services/AuthService.js';

const form = document.getElementById('register-form');
const messageEl = document.getElementById('message');

function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
}

form.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const idNumber = document.getElementById('idNumber').value.trim();
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    if (!name || !idNumber || !password || !role) {
        showMessage('Please fill in all fields.', 'error');
        return;
    }

    const result = AuthService.register(name, idNumber, role, password);

    if (!result.success) {
        showMessage(result.message, 'error');
        return;
    }

    showMessage(result.message + ' Redirecting to login…', 'success');
    form.reset();

    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);
});
