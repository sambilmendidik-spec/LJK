export type OptionChoice = 'A' | 'B' | 'C' | 'D' | 'E';

export interface Exam {
  id: string;
  title: string;
  subject: string;
  gradeClass: string;
  teacherName: string;
  schoolName: string;
  academicYear: string;
  semester: 'Ganjil' | 'Genap';
  examDate: string;
  durationMinutes: number;
  description: string;
  
  // Multiple Choice configuration
  pgCount: number;
  optionCount: 4 | 5; // 4: A-D, 5: A-E
  pgWeight: number; // e.g. 70
  
  // Essay configuration
  essayCount: number;
  essayWeight: number; // e.g. 30
  
  // Standard minimum score
  passingScore: number; // KKM, e.g. 75
  
  // Answer keys
  answerKeys: Record<number, OptionChoice>;
  essayMaxScores: Record<number, number>;
  
  createdAt: string;
}

export interface StudentResult {
  id: string;
  examId: string;
  studentNumber: string; // e.g. "07"
  studentName: string;
  pgAnswers: Record<number, OptionChoice | null>;
  essayScores: Record<number, number>; // questionNumber -> teacher score
  essayAnswers?: Record<number, string>;
  
  correctPgCount: number;
  wrongPgCount: number;
  blankPgCount: number;
  
  pgScore: number; // scaled score for PG
  essayScore: number; // scaled score for essay
  totalScore: number; // final score 0 - 100
  isPassed: boolean;
  
  scannedAt: string;
  scanImageUrl?: string;
  status: 'verified' | 'needs_review';
  teacherNotes?: string;
}

export interface ScanDetectionResult {
  studentNumber: string;
  studentName: string;
  confidence: number;
  answers: Record<number, OptionChoice | null>;
  essayAnswers: Array<{
    essayNumber: number;
    extractedText: string;
    isAnswered: boolean;
  }>;
  source: 'gemini-ai' | 'omr-engine';
  notes?: string;
}

export type ActiveTab = 'dashboard' | 'exams' | 'print' | 'scan' | 'results';
