export class Exam {
  constructor(
    title,
    description = '',
    category = '',
    accessCode = '',
    durationMinutes = 0,
    teacherId = '',
    maxAttempts = 1,
  ) {
    this.id = Date.now().toString() + Math.random().toString();
    this.title = title;
    this.description = description;
    this.category = category;
    this.accessCode = accessCode;
    this.durationMinutes = durationMinutes;
    this.teacherId = teacherId;
    this.maxAttempts = maxAttempts;
    this.questions = [];
    this.createdAt = new Date().toISOString();
  }

  addQuestion(question) {
    this.questions.push(question);
  }

  getQuestionCount() {
    return this.questions.length;
  }
}
