import { AuthService } from './services/AuthService.js';
import { ExamService } from './services/ExamService.js';

const examService = new ExamService();

function redirectToLogin() {
    window.location.href = 'login.html';
}

function createExamCard(exam) {
    const card = document.createElement('article');
    card.className = 'exam-card';

    const title = document.createElement('h3');
    title.className = 'exam-card-title';
    title.textContent = exam.title;

    const details = document.createElement('dl');
    details.className = 'exam-card-details';

    const categoryRow = document.createElement('div');
    categoryRow.className = 'exam-card-row';
    categoryRow.innerHTML = '<dt>Category</dt>';
    const categoryValue = document.createElement('dd');
    categoryValue.textContent = exam.category || 'Uncategorized';
    categoryRow.appendChild(categoryValue);

    const accessCodeRow = document.createElement('div');
    accessCodeRow.className = 'exam-card-row';
    accessCodeRow.innerHTML = '<dt>Access Code</dt>';
    const accessCodeValue = document.createElement('dd');
    accessCodeValue.textContent = exam.accessCode || 'N/A';
    accessCodeRow.appendChild(accessCodeValue);

    const questionsRow = document.createElement('div');
    questionsRow.className = 'exam-card-row';
    questionsRow.innerHTML = '<dt>Questions</dt>';
    const questionsValue = document.createElement('dd');
    questionsValue.textContent = exam.getQuestionCount();
    questionsRow.appendChild(questionsValue);

    details.appendChild(categoryRow);
    details.appendChild(accessCodeRow);
    details.appendChild(questionsRow);

    const editBtn = document.createElement('a');
    editBtn.className = 'btn btn-small btn-edit exam-card-edit-btn';
    editBtn.textContent = 'Edit Exam';
    editBtn.href = `exam-details.html?id=${encodeURIComponent(exam.id)}`;

    card.appendChild(title);
    card.appendChild(details);
    card.appendChild(editBtn);

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
