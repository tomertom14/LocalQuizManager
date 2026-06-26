import { AuthService } from './services/AuthService.js';
import { ExamService } from './services/ExamService.js';
import { Exam } from './models/Exam.js';
import { Question } from './models/Question.js';

const examService = new ExamService();
const draftQuestions = [];
let currentUser = null;
let editingIndex = null;

const messageEl = document.getElementById('message');
const addQuestionBtn = document.getElementById('add-question-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

function redirectToLogin() {
    window.location.href = 'login.html';
}

function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
}

function clearMessage() {
    messageEl.textContent = '';
    messageEl.className = 'message';
}

function clearQuestionInputs() {
    document.getElementById('questionText').value = '';
    document.getElementById('answer1').value = '';
    document.getElementById('answer2').value = '';
    document.getElementById('answer3').value = '';
    document.getElementById('answer4').value = '';
    document.getElementById('correctAnswer').value = '';
}

function populateQuestionForm(question) {
    document.getElementById('questionText').value = question.text;
    document.getElementById('answer1').value = question.answers[0];
    document.getElementById('answer2').value = question.answers[1];
    document.getElementById('answer3').value = question.answers[2];
    document.getElementById('answer4').value = question.answers[3];
    document.getElementById('correctAnswer').value = String(question.correctAnswerIndex + 1);
}

function setEditMode(index) {
    editingIndex = index;
    addQuestionBtn.textContent = 'Update Question';
    cancelEditBtn.hidden = false;
}

function clearEditMode() {
    editingIndex = null;
    addQuestionBtn.textContent = 'Add Question';
    cancelEditBtn.hidden = true;
    clearQuestionInputs();
}

function createQuestionDraftItem(question, index) {
    const item = document.createElement('article');
    item.className = 'question-draft-item';

    if (editingIndex === index) {
        item.classList.add('question-draft-item-editing');
    }

    const header = document.createElement('div');
    header.className = 'question-draft-header';

    const number = document.createElement('span');
    number.className = 'question-number';
    number.textContent = `Question ${index + 1}`;

    const actions = document.createElement('div');
    actions.className = 'question-draft-actions';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'btn btn-small btn-edit';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => handleEditQuestion(index));

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn btn-small btn-delete';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => handleDeleteQuestion(index));

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    header.appendChild(number);
    header.appendChild(actions);

    const text = document.createElement('p');
    text.className = 'question-draft-text';
    text.textContent = question.text;

    const meta = document.createElement('p');
    meta.className = 'question-draft-meta';
    meta.textContent = `Correct answer: ${question.correctAnswerIndex + 1}`;

    item.appendChild(header);
    item.appendChild(text);
    item.appendChild(meta);

    return item;
}

function renderQuestionsList() {
    const container = document.getElementById('questions-list');
    container.innerHTML = '';

    if (draftQuestions.length === 0) {
        container.innerHTML = '<p class="empty-state">No questions added yet.</p>';
        return;
    }

    draftQuestions.forEach((question, index) => {
        container.appendChild(createQuestionDraftItem(question, index));
    });
}

function validateQuestionInputs() {
    const questionText = document.getElementById('questionText').value.trim();
    const answers = [
        document.getElementById('answer1').value.trim(),
        document.getElementById('answer2').value.trim(),
        document.getElementById('answer3').value.trim(),
        document.getElementById('answer4').value.trim(),
    ];
    const correctAnswerNumber = Number(document.getElementById('correctAnswer').value);

    if (!questionText) {
        showMessage('Please enter question text.', 'error');
        return null;
    }

    if (answers.some((answer) => answer === '')) {
        showMessage('Please fill in all four answers.', 'error');
        return null;
    }

    if (correctAnswerNumber < 1 || correctAnswerNumber > 4) {
        showMessage('Please select the correct answer (1–4).', 'error');
        return null;
    }

    return {
        questionText,
        answers,
        correctAnswerIndex: correctAnswerNumber - 1,
    };
}

function handleAddQuestion() {
    clearMessage();

    const validated = validateQuestionInputs();
    if (!validated) {
        return;
    }

    const question = new Question(
        validated.questionText,
        validated.answers,
        validated.correctAnswerIndex,
    );

    if (editingIndex !== null) {
        draftQuestions[editingIndex] = question;
        clearEditMode();
        renderQuestionsList();
        showMessage('Question updated.', 'success');
        return;
    }

    draftQuestions.push(question);
    clearQuestionInputs();
    renderQuestionsList();
    showMessage(`Question added. Total: ${draftQuestions.length}.`, 'success');
}

function handleEditQuestion(index) {
    clearMessage();

    const question = draftQuestions[index];
    populateQuestionForm(question);
    setEditMode(index);
    renderQuestionsList();

    document.getElementById('questionText').focus();
    document.querySelector('.form-section:nth-of-type(2)').scrollIntoView({ behavior: 'smooth', block: 'start' });
    showMessage(`Editing Question ${index + 1}. Update the fields and click Update Question.`, 'success');
}

function handleDeleteQuestion(index) {
    clearMessage();

    if (editingIndex === index) {
        clearEditMode();
    } else if (editingIndex !== null && editingIndex > index) {
        editingIndex -= 1;
    }

    draftQuestions.splice(index, 1);
    renderQuestionsList();
    showMessage('Question removed.', 'success');
}

function handleCancelEdit() {
    clearMessage();
    clearEditMode();
    renderQuestionsList();
    showMessage('Edit cancelled.', 'success');
}

function validateExamInfo() {
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const category = document.getElementById('category').value.trim();
    const accessCode = document.getElementById('accessCode').value.trim();
    const durationMinutes = Number(document.getElementById('durationMinutes').value);

    if (!title || !description || !category || !accessCode) {
        showMessage('Please fill in all exam information fields.', 'error');
        return null;
    }

    if (!durationMinutes || durationMinutes < 1) {
        showMessage('Please enter a valid duration in minutes.', 'error');
        return null;
    }

    if (draftQuestions.length === 0) {
        showMessage('Please add at least one question before saving.', 'error');
        return null;
    }

    return { title, description, category, accessCode, durationMinutes };
}

function handleSaveExam() {
    clearMessage();

    const examInfo = validateExamInfo();
    if (!examInfo) {
        return;
    }

    const exam = new Exam(
        examInfo.title,
        examInfo.description,
        examInfo.category,
        examInfo.accessCode,
        examInfo.durationMinutes,
        currentUser.id,
    );

    exam.questions = [...draftQuestions];

    examService.saveExam(exam);

    showMessage('Exam saved successfully! Redirecting to dashboard…', 'success');

    setTimeout(() => {
        window.location.href = 'teacher-dashboard.html';
    }, 1500);
}

function init() {
    currentUser = AuthService.getCurrentUser();

    if (!currentUser || currentUser.role !== 'teacher') {
        redirectToLogin();
        return;
    }

    renderQuestionsList();

    addQuestionBtn.addEventListener('click', handleAddQuestion);
    cancelEditBtn.addEventListener('click', handleCancelEdit);
    document.getElementById('save-exam-btn').addEventListener('click', handleSaveExam);
}

init();
