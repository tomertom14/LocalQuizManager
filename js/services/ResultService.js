import { ExamResult } from '../models/ExamResult.js';

export class ResultService {
    constructor() {
        this.storageKey = 'exam_results';
    }

    getAllResults() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }

    saveResults(results) {
        localStorage.setItem(this.storageKey, JSON.stringify(results));
    }

    saveResult(examResult) {
        const results = this.getAllResults();
        results.push(examResult);
        this.saveResults(results);
    }

    mapResultData(resultData) {
        return new ExamResult(
            resultData.id,
            resultData.studentId,
            resultData.examId,
            resultData.examTitle,
            resultData.score,
            resultData.totalQuestions,
            resultData.completedAt,
            resultData.userAnswers ?? [],
        );
    }

    getResultById(resultId) {
        const results = this.getAllResults();
        const resultData = results.find((result) => result.id === resultId);

        if (!resultData) {
            return null;
        }

        return this.mapResultData(resultData);
    }

    getResultsByStudent(studentId) {
        const results = this.getAllResults();

        return results
            .filter((resultData) => resultData.studentId === studentId)
            .map((resultData) => this.mapResultData(resultData));
    }

    getResultsByExam(examId) {
        const results = this.getAllResults();

        return results
            .filter((resultData) => resultData.examId === examId)
            .map((resultData) => this.mapResultData(resultData));
    }
}
