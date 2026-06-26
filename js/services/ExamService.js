import { Exam } from "../models/Exam.js";
import { Question } from "../models/Question.js";

export class ExamService {
  constructor() {
    this.storageKey = "exams";
  }

  getAllExams() {
    const data = localStorage.getItem(this.storageKey);

    if (!data) {
      return [];
    }

    const plainExams = JSON.parse(data);

    return plainExams.map((examData) => {
      const exam = new Exam(
        examData.title,
        examData.description ?? '',
        examData.category ?? '',
        examData.accessCode ?? '',
        examData.durationMinutes ?? 0,
        examData.teacherId ?? '',
      );

      exam.id = examData.id;
      exam.createdAt = examData.createdAt;

      exam.questions = examData.questions.map((questionData) => {
        const question = new Question(
          questionData.text,
          questionData.answers,
          questionData.correctAnswerIndex,
        );

        question.id = questionData.id;

        return question;
      });

      return exam;
    });
  }

  saveExam(exam) {
    const exams = this.getAllExams();
    const existingIndex = exams.findIndex((existingExam) => existingExam.id === exam.id);

    if (existingIndex !== -1) {
      exams[existingIndex] = exam;
    } else {
      exams.push(exam);
    }

    localStorage.setItem(this.storageKey, JSON.stringify(exams));
  }

  deleteExam(examId) {
    const exams = this.getAllExams();

    const filteredExams = exams.filter((exam) => exam.id !== examId);

    localStorage.setItem(this.storageKey, JSON.stringify(filteredExams));
  }

  getExamById(examId) {
    const exams = this.getAllExams();

    return exams.find((exam) => exam.id === examId);
  }

  getExamsByTeacher(teacherId) {
    const exams = this.getAllExams();

    return exams.filter((exam) => exam.teacherId === teacherId);
  }

  clearAllExams() {
    localStorage.removeItem(this.storageKey);
  }
}
