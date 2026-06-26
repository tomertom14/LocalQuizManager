export class Exam {
  constructor(title) {
    this.id = Date.now().toString() + Math.random().toString();
    this.title = title;
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
