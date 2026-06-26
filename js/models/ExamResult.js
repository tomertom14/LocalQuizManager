export class ExamResult {
    constructor(id, studentId, examId, examTitle, score, totalQuestions, completedAt) {
        this.id = id;
        this.studentId = studentId;
        this.examId = examId;
        this.examTitle = examTitle;
        this.score = score;
        this.totalQuestions = totalQuestions;
        this.completedAt = completedAt;
    }

    getPercentage() {
        return Math.round((this.score / this.totalQuestions) * 100);
    }
}
