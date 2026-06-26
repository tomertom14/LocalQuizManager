import { AuthService } from './services/AuthService.js';
import { ExamService } from './services/ExamService.js';

const examService = new ExamService();

function redirectToLogin() {
    window.location.href = 'login.html';
}

function matchesSearch(exam, query) {
    const normalizedQuery = query.toLowerCase();
    const titleMatch = exam.title.toLowerCase().includes(normalizedQuery);
    const accessCodeMatch = exam.accessCode.toLowerCase().includes(normalizedQuery);
    return titleMatch || accessCodeMatch;
}

function createSearchResultCard(exam) {
    const card = document.createElement('article');
    card.className = 'exam-card search-result-card';

    const title = document.createElement('h3');
    title.className = 'exam-card-title';
    title.textContent = exam.title;

    const category = document.createElement('p');
    category.className = 'search-result-meta';
    category.textContent = `Category: ${exam.category || 'Uncategorized'}`;

    const description = document.createElement('p');
    description.className = 'search-result-description';
    description.textContent = exam.description || 'No description provided.';

    const takeExamBtn = document.createElement('a');
    takeExamBtn.className = 'btn btn-primary btn-inline';
    takeExamBtn.textContent = 'Take Exam';
    takeExamBtn.href = `take-exam.html?id=${encodeURIComponent(exam.id)}`;

    card.appendChild(title);
    card.appendChild(category);
    card.appendChild(description);
    card.appendChild(takeExamBtn);

    return card;
}

function renderSearchResults(exams) {
    const container = document.getElementById('search-results');
    const emptyEl = document.getElementById('search-empty');

    container.innerHTML = '';

    if (exams.length === 0) {
        emptyEl.hidden = false;
        return;
    }

    emptyEl.hidden = true;

    exams.forEach((exam) => {
        container.appendChild(createSearchResultCard(exam));
    });
}

function handleSearch(query) {
    const allExams = examService.getAllExams();
    const matchingExams = allExams.filter((exam) => matchesSearch(exam, query));
    renderSearchResults(matchingExams);
}

function init() {
    const user = AuthService.getCurrentUser();

    if (!user || user.role !== 'student') {
        redirectToLogin();
        return;
    }

    const searchForm = document.getElementById('search-form');

    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const query = document.getElementById('search-query').value.trim();

        if (!query) {
            return;
        }

        handleSearch(query);
    });
}

init();
