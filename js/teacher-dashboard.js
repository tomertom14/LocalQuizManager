import { AuthService } from './services/AuthService.js';
import { ExamService } from './services/ExamService.js';

const examService = new ExamService();

function redirectToLogin() {
    window.location.href = 'login.html';
}

function createExamCard(exam) {
    const card = document.createElement('article');
    card.className = 'exam-card';

    card.innerHTML = `
        <h3 class="exam-card-title">${exam.title}</h3>
        <dl class="exam-card-details">
            <div class="exam-card-row">
                <dt>Category</dt>
                <dd>${exam.category || 'Uncategorized'}</dd>
            </div>
            <div class="exam-card-row">
                <dt>Access Code</dt>
                <dd>${exam.accessCode || 'N/A'}</dd>
            </div>
            <div class="exam-card-row">
                <dt>Questions</dt>
                <dd>${exam.getQuestionCount()}</dd>
            </div>
        </dl>
    `;

    return card;
}

function renderExams(exams) {
    const examList = document.getElementById('exam-list');
    examList.innerHTML = '';

    if (exams.length === 0) {
        examList.innerHTML = '<p class="empty-state">You haven\'t created any exams yet.</p>';
        return;
    }

    exams.forEach((exam) => {
        examList.appendChild(createExamCard(exam));
    });
}

function init() {
    const user = AuthService.getCurrentUser();

    if (!user || user.role !== 'teacher') {
        redirectToLogin();
        return;
    }

    document.getElementById('welcome-message').textContent = `Welcome, ${user.name}!`;

    const exams = examService.getExamsByTeacher(user.id);
    renderExams(exams);

    document.getElementById('logout-btn').addEventListener('click', () => {
        AuthService.logout();
        window.location.href = 'index.html';
    });
}

init();
