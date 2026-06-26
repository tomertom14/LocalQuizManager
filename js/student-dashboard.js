import { AuthService } from './services/AuthService.js';
import { ResultService } from './services/ResultService.js';

const resultService = new ResultService();

function redirectToLogin() {
    window.location.href = 'login.html';
}

function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function calculateAveragePercentage(results) {
    if (results.length === 0) {
        return null;
    }

    const totalPercentage = results.reduce((sum, result) => sum + result.getPercentage(), 0);
    return Math.round(totalPercentage / results.length);
}

function renderAverageScore(results) {
    const averageEl = document.getElementById('average-score');
    const average = calculateAveragePercentage(results);

    if (average === null) {
        averageEl.textContent = 'N/A';
        return;
    }

    averageEl.textContent = `${average}%`;
}

function renderResultsTable(results) {
    const tbody = document.getElementById('results-body');
    const emptyEl = document.getElementById('results-empty');
    const tableWrapper = document.querySelector('.results-table-wrapper');

    tbody.innerHTML = '';

    if (results.length === 0) {
        tableWrapper.hidden = true;
        emptyEl.hidden = false;
        return;
    }

    tableWrapper.hidden = false;
    emptyEl.hidden = true;

    results.forEach((result) => {
        const row = document.createElement('tr');

        const titleCell = document.createElement('td');
        titleCell.textContent = result.examTitle;

        const dateCell = document.createElement('td');
        dateCell.textContent = formatDate(result.completedAt);

        const scoreCell = document.createElement('td');
        scoreCell.textContent = `${result.score}/${result.totalQuestions}`;

        const percentageCell = document.createElement('td');
        percentageCell.textContent = `${result.getPercentage()}%`;

        row.appendChild(titleCell);
        row.appendChild(dateCell);
        row.appendChild(scoreCell);
        row.appendChild(percentageCell);

        tbody.appendChild(row);
    });
}

function init() {
    const user = AuthService.getCurrentUser();

    if (!user || user.role !== 'student') {
        redirectToLogin();
        return;
    }

    document.getElementById('welcome-message').textContent = `Welcome, ${user.name}!`;

    const results = resultService.getResultsByStudent(user.id);

    renderAverageScore(results);
    renderResultsTable(results);

    document.getElementById('logout-btn').addEventListener('click', () => {
        AuthService.logout();
        window.location.href = 'index.html';
    });
}

init();
