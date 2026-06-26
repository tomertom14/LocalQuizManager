import { AuthService } from './services/AuthService.js';
import { ExamService } from './services/ExamService.js';
import { ResultService } from './services/ResultService.js';
import { ExamResult } from './models/ExamResult.js';

const examService = new ExamService();
const resultService = new ResultService();

let currentUser = null;
let currentExam = null;

function redirectToLogin() {
    window.location.href = 'login.html';
}

function redirectToSearch() {
    window.location.href = 'search-exam.html';
}

function showErrorAndRedirect(message) {
    const errorEl = document.getElementById('error-message');
    errorEl.textContent = message;
    errorEl.hidden = false;

    document.getElementById('exam-container').hidden = true;

    setTimeout(() => {
        redirectToSearch();
    }, 2000);
}

function getExamIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

function renderQuestion(question, questionIndex) {
    const questionBlock = document.createElement('article');
    questionBlock.className = 'question-block';

    const questionText = document.createElement('h3');
    questionText.className = 'question-block-title';
    questionText.textContent = `${questionIndex + 1}. ${question.text}`;

    const answersList = document.createElement('div');
    answersList.className = 'answers-list';

    question.answers.forEach((answer, answerIndex) => {
        const label = document.createElement('label');
        label.className = 'answer-option';

        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = `question-${questionIndex}`;
        radio.value = answerIndex.toString();

        const answerText = document.createElement('span');
        answerText.textContent = answer;

        label.appendChild(radio);
        label.appendChild(answerText);
        answersList.appendChild(label);
    });

    questionBlock.appendChild(questionText);
    questionBlock.appendChild(answersList);

    return questionBlock;
}

function renderExam(exam) {
    document.getElementById('exam-title').textContent = exam.title;
    document.getElementById('exam-description').textContent = exam.description || 'No description provided.';

    const container = document.getElementById('questions-container');
    container.innerHTML = '';

    exam.questions.forEach((question, index) => {
        container.appendChild(renderQuestion(question, index));
    });
}

function calculateScore(exam) {
    let score = 0;

    exam.questions.forEach((question, questionIndex) => {
        const selectedAnswer = document.querySelector(
            `input[name="question-${questionIndex}"]:checked`,
        );

        if (!selectedAnswer) {
            return;
        }

        const userAnswerIndex = Number(selectedAnswer.value);

        if (question.isCorrect(userAnswerIndex)) {
            score++;
        }
    });

    return score;
}

function handleSubmitExam() {
    const unansweredCount = currentExam.questions.filter((_, questionIndex) => {
        const selectedAnswer = document.querySelector(
            `input[name="question-${questionIndex}"]:checked`,
        );
        return !selectedAnswer;
    }).length;

    if (unansweredCount > 0) {
        const errorEl = document.getElementById('error-message');
        errorEl.textContent = 'Please answer all questions before submitting.';
        errorEl.hidden = false;
        return;
    }

    document.getElementById('error-message').hidden = true;

    const score = calculateScore(currentExam);
    const totalQuestions = currentExam.questions.length;

    const examResult = new ExamResult(
        Date.now().toString(),
        currentUser.id,
        currentExam.id,
        currentExam.title,
        score,
        totalQuestions,
        new Date().toISOString(),
    );

    resultService.saveResult(examResult);

    document.getElementById('exam-container').hidden = true;

    const resultsContainer = document.getElementById('results-container');
    document.getElementById('final-score').textContent = `Score: ${score} / ${totalQuestions}`;
    document.getElementById('final-percentage').textContent = `Percentage: ${examResult.getPercentage()}%`;

    resultsContainer.hidden = false;
}

function init() {
    currentUser = AuthService.getCurrentUser();

    if (!currentUser || currentUser.role !== 'student') {
        redirectToLogin();
        return;
    }

    const examId = getExamIdFromUrl();

    if (!examId) {
        showErrorAndRedirect('No exam ID provided. Redirecting to search…');
        return;
    }

    currentExam = examService.getExamById(examId);

    if (!currentExam) {
        showErrorAndRedirect('Exam not found. Redirecting to search…');
        return;
    }

    if (currentExam.questions.length === 0) {
        showErrorAndRedirect('This exam has no questions. Redirecting to search…');
        return;
    }

    renderExam(currentExam);

    document.getElementById('submit-exam-btn').addEventListener('click', handleSubmitExam);
}

init();
