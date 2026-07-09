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

    // Rehydrate plain JSON from localStorage into Exam/Question class instances.
    const plainExams = JSON.parse(data);

    return plainExams.map((examData) => {
      const exam = new Exam(
        examData.title,
        examData.description ?? '',
        examData.category ?? '',
        examData.accessCode ?? '',
        examData.durationMinutes ?? 0,
        examData.teacherId ?? '',
        examData.maxAttempts ?? 1,
      );

      // Restore persisted identity fields (constructor generates new ones by default).
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

  deleteExam(examId, currentTeacherId) {
    const exams = this.getAllExams();
    const exam = exams.find((currentExam) => currentExam.id === examId);

    if (!exam) {
      throw new Error("Exam not found.");
    }

    if (exam.teacherId !== currentTeacherId) {
      throw new Error("You do not have permission to delete this exam.");
    }

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
