export class ExamResult {
    constructor(id, studentId, examId, examTitle, score, totalQuestions, completedAt, userAnswers = []) {
        this.id = id;
        this.studentId = studentId;
        this.examId = examId;
        this.examTitle = examTitle;
        this.score = score;
        this.totalQuestions = totalQuestions;
        this.completedAt = completedAt;
        this.userAnswers = userAnswers;
    }

    getPercentage() {
        return Math.round((this.score / this.totalQuestions) * 100);
    }
}
