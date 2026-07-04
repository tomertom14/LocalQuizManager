import { AuthService } from '../services/AuthService.js';
import { ExamService } from '../services/ExamService.js';
import { ResultService } from '../services/ResultService.js';

const examService = new ExamService();
const resultService = new ResultService();

function redirectToLogin() {
    window.location.href = 'login.html';
}

function redirectToDashboard() {
    window.location.href = 'student-dashboard.html';
}

function showErrorAndRedirect(message) {
    const errorEl = document.getElementById('error-message');
    errorEl.textContent = message;
    errorEl.className = 'message error';
    errorEl.hidden = false;

    document.getElementById('result-container').hidden = true;

    setTimeout(() => {
        redirectToDashboard();
    }, 2000);
}

function getResultIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('resultId');
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

function renderQuestion(question, questionIndex, selectedAnswerIndex) {
    const questionBlock = document.createElement('article');
    questionBlock.className = 'question-block';
    questionBlock.dataset.questionIndex = String(questionIndex);

    const questionText = document.createElement('h3');
    questionText.className = 'question-block-title';
    questionText.textContent = `${questionIndex + 1}. ${question.text}`;

    const answersList = document.createElement('div');
    answersList.className = 'answers-list';

    question.answers.forEach((text, answerIndex) => {
        const label = document.createElement('label');
        label.className = 'answer-option';
        label.dataset.originalIndex = String(answerIndex);

        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = `question-${questionIndex}`;
        radio.value = String(answerIndex);
        radio.disabled = true;

        if (selectedAnswerIndex === answerIndex) {
            radio.checked = true;
        }

        const answerText = document.createElement('span');
        answerText.textContent = text;

        label.appendChild(radio);
        label.appendChild(answerText);
        answersList.appendChild(label);
    });

    questionBlock.appendChild(questionText);
    questionBlock.appendChild(answersList);

    return questionBlock;
}

function applyAnswerReview(exam, userAnswers) {
    exam.questions.forEach((question, questionIndex) => {
        const userAnswerIndex = userAnswers[questionIndex] ?? null;
        const correctIndex = question.correctAnswerIndex;

        const radios = document.querySelectorAll(`input[name="question-${questionIndex}"]`);

        radios.forEach((radio) => {
            const label = radio.closest('.answer-option');
            const originalIndex = Number(radio.value);
            const isUserSelection = originalIndex === userAnswerIndex;
            const isCorrectAnswer = originalIndex === correctIndex;

            if (isUserSelection && isCorrectAnswer) {
                label.classList.add('answer-correct');
            } else if (isUserSelection && !isCorrectAnswer) {
                label.classList.add('answer-incorrect');
            } else if (isCorrectAnswer) {
                label.classList.add('answer-correct');
            }
        });
    });
}

function renderResultReview(exam, result) {
    document.getElementById('exam-title').textContent = exam.title;
    document.getElementById('exam-description').textContent = exam.description || 'No description provided.';
    document.getElementById('final-score').textContent = `Score: ${result.score} / ${result.totalQuestions}`;
    document.getElementById('final-percentage').textContent = `Percentage: ${result.getPercentage()}%`;
    document.getElementById('completed-date').textContent = `Completed: ${formatDate(result.completedAt)}`;

    const container = document.getElementById('questions-container');
    container.innerHTML = '';

    exam.questions.forEach((question, index) => {
        const selectedAnswerIndex = result.userAnswers[index] ?? null;
        container.appendChild(renderQuestion(question, index, selectedAnswerIndex));
    });

    applyAnswerReview(exam, result.userAnswers);
}

function init() {
    const currentUser = AuthService.getCurrentUser();

    if (!currentUser || currentUser.role !== 'student') {
        redirectToLogin();
        return;
    }

    const resultId = getResultIdFromUrl();

    if (!resultId) {
        showErrorAndRedirect('No result ID provided. Redirecting to dashboard…');
        return;
    }

    const result = resultService.getResultById(resultId);

    if (!result) {
        showErrorAndRedirect('Exam result not found. Redirecting to dashboard…');
        return;
    }

    if (result.studentId !== currentUser.id) {
        showErrorAndRedirect('You do not have access to this result. Redirecting to dashboard…');
        return;
    }

    const exam = examService.getExamById(result.examId);

    if (!exam) {
        showErrorAndRedirect('Original exam not found. Redirecting to dashboard…');
        return;
    }

    if (exam.questions.length === 0) {
        showErrorAndRedirect('This exam has no questions. Redirecting to dashboard…');
        return;
    }

    renderResultReview(exam, result);
    document.getElementById('result-container').hidden = false;
}

init();
