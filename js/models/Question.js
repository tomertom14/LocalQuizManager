export class Question {
  constructor(text, answers, correctAnswerIndex) {
    this.id = Date.now().toString() + Math.random().toString();
    this.text = text;
    this.answers = answers;
    this.correctAnswerIndex = correctAnswerIndex;
  }

  isCorrect(userAnswerIndex) {
    return userAnswerIndex === this.correctAnswerIndex;
  }
}
