import { AuthService } from '../services/AuthService.js';
import { ExamService } from '../services/ExamService.js';
import { ResultService } from '../services/ResultService.js';
import { ExamResult } from '../models/ExamResult.js';

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

function showExamError(message) {
    const errorEl = document.getElementById('error-message');
    errorEl.textContent = message;
    errorEl.className = 'message error';
    errorEl.hidden = false;
}

function hideExamError() {
    const errorEl = document.getElementById('error-message');
    errorEl.textContent = '';
    errorEl.className = 'message';
    errorEl.hidden = true;
}

function showErrorAndRedirect(message) {
    const errorEl = document.getElementById('error-message');
    errorEl.textContent = message;
    errorEl.className = 'message error';
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

// Fisher-Yates shuffle so each attempt shows questions/options in a random order.
function shuffleArray(items) {
    const shuffled = [...items];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
}

function shuffleQuestions(questions) {
    return shuffleArray(questions);
}

// Keep each option paired with its original index so grading stays correct after shuffle.
function shuffleAnswers(answers) {
    const entries = answers.map((text, originalIndex) => ({ text, originalIndex }));
    return shuffleArray(entries);
}

function renderQuestion(question, questionIndex) {
    const questionBlock = document.createElement('article');
    questionBlock.className = 'question-block';
    questionBlock.dataset.questionIndex = String(questionIndex);

    const questionText = document.createElement('h3');
    questionText.className = 'question-block-title';
    questionText.textContent = `${questionIndex + 1}. ${question.text}`;

    const answersList = document.createElement('div');
    answersList.className = 'answers-list';

    const shuffledAnswers = shuffleAnswers(question.answers);

    shuffledAnswers.forEach(({ text, originalIndex }) => {
        const label = document.createElement('label');
        label.className = 'answer-option';
        label.dataset.originalIndex = String(originalIndex);

        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = `question-${questionIndex}`;
        // Store the original answer index (not the shuffled display position).
        radio.value = String(originalIndex);

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

function renderExam(exam) {
    document.getElementById('exam-title').textContent = exam.title;
    document.getElementById('exam-description').textContent = exam.description || 'No description provided.';

    const container = document.getElementById('questions-container');
    container.innerHTML = '';

    exam.questions.forEach((question, index) => {
        container.appendChild(renderQuestion(question, index));
    });
}

function getSelectedOriginalIndex(questionIndex) {
    const selectedAnswer = document.querySelector(
        `input[name="question-${questionIndex}"]:checked`,
    );

    if (!selectedAnswer) {
        return null;
    }

    return Number(selectedAnswer.value);
}

// Map selected answers back to the original question order for storage.
function collectUserAnswers(exam, originalExam) {
    return originalExam.questions.map((question) => {
        const shuffledIndex = exam.questions.findIndex((q) => q.id === question.id);
        return getSelectedOriginalIndex(shuffledIndex);
    });
}

function calculateScore(exam) {
    let score = 0;

    exam.questions.forEach((question, questionIndex) => {
        const userAnswerIndex = getSelectedOriginalIndex(questionIndex);

        if (userAnswerIndex === null) {
            return;
        }

        if (question.isCorrect(userAnswerIndex)) {
            score++;
        }
    });

    return score;
}

function showAnswerReview(exam) {
    exam.questions.forEach((question, questionIndex) => {
        const userAnswerIndex = getSelectedOriginalIndex(questionIndex);
        const correctIndex = question.correctAnswerIndex;

        const radios = document.querySelectorAll(`input[name="question-${questionIndex}"]`);

        radios.forEach((radio) => {
            radio.disabled = true;

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

function handleSubmitExam() {
    const unansweredCount = currentExam.questions.filter((_, questionIndex) => {
        return getSelectedOriginalIndex(questionIndex) === null;
    }).length;

    if (unansweredCount > 0) {
        showExamError('Please answer all questions before submitting.');
        return;
    }

    hideExamError();

    const score = calculateScore(currentExam);
    const totalQuestions = currentExam.questions.length;
    const originalExam = examService.getExamById(currentExam.id);
    const userAnswers = collectUserAnswers(currentExam, originalExam);

    const examResult = new ExamResult(
        Date.now().toString(),
        currentUser.id,
        currentExam.id,
        currentExam.title,
        score,
        totalQuestions,
        new Date().toISOString(),
        userAnswers,
    );

    resultService.saveResult(examResult);

    document.getElementById('final-score').textContent = `Score: ${score} / ${totalQuestions}`;
    document.getElementById('final-percentage').textContent = `Percentage: ${examResult.getPercentage()}%`;
    document.getElementById('results-summary').hidden = false;

    showAnswerReview(currentExam);

    document.getElementById('submit-exam-btn').hidden = true;
    document.getElementById('return-dashboard-btn').hidden = false;

    document.getElementById('results-summary').scrollIntoView({ behavior: 'smooth', block: 'start' });
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

    currentExam.questions = shuffleQuestions(currentExam.questions);

    renderExam(currentExam);

    document.getElementById('submit-exam-btn').addEventListener('click', handleSubmitExam);
}

init();
