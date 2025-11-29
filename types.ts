
export type AssessmentType = 'PH' | 'PTS' | 'PAS' | 'Tugas' | 'Sikap' | 'Keterampilan';

export interface SchoolProfile {
  name: string;
  address: string;
  email: string;
  website: string;
  logoUrl?: string; // Base64 string
  headmaster: string;
  headmasterNip: string;
}

export interface Student {
  id: string;
  nis: string;
  name: string;
  gender: 'L' | 'P';
  photo?: string; // New optional property for student photo (Base64 string)
  notes?: string; // Teacher's private notes for the student
}

export interface Assessment {
  id: string;
  title: string;
  type: AssessmentType;
  maxScore: number;
  date: string;
  examId?: string; // Link to CBT Exam if applicable
  assignmentId?: string; // Link to Homework/Assignment
}

export interface Grade {
  studentId: string;
  assessmentId: string;
  score: number;
}

export interface AttendanceRecord {
  date: string;
  status: 'H' | 'S' | 'I' | 'A'; // Hadir, Sakit, Izin, Alpa
  note?: string; // Detail alasan (misal: "Demam", "Acara Keluarga")
}

export interface ClassWeight {
  PH: number;
  PTS: number;
  PAS: number;
  Tugas: number;
  Sikap: number;
  Keterampilan: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  timeStart: string; // e.g. "07:00"
  timeEnd: string;   // e.g. "09:00"
  topic: string;     // Materi Pokok / TP
  subTopic?: string; // Sub materi
  method: string;    // Metode Pembelajaran (Diskusi, Ceramah, dll)
  notes: string;     // Catatan Kejadian / Refleksi
  absentSummary: string; // Ringkasan ketidakhadiran (Manual input, e.g. "Budi (S), Ani (I)")
  photo?: string;    // Dokumentasi kegiatan
  status: 'Terlaksana' | 'Reschedule' | 'Tugas Mandiri';
}

// --- CBT / Exam Types ---

export type QuestionType = 'multiple_choice' | 'essay';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[]; // For multiple choice
  correctOptionIndex?: number; // For multiple choice
  points: number; // Weight of the question
  rubric?: string; // For essay grading guide
}

export interface StudentAnswer {
  questionId: string;
  answer: string | number; // Option index or text
}

export interface ExamSubmission {
  studentId: string;
  examId: string;
  answers: StudentAnswer[];
  score: number; // Total score
  submittedAt: string;
  status: 'Graded' | 'Needs Grading';
}

export interface Exam {
  id: string;
  title: string;
  type: AssessmentType;
  durationMinutes: number;
  questions: Question[];
  submissions: ExamSubmission[];
  isActive: boolean; // Open for students?
  kkm: number; // Remedial threshold
  dateCreated: string;
}

// --- Assignment / Homework Types ---

export interface AssignmentSubmission {
  studentId: string;
  assignmentId: string;
  fileUrl?: string; // Base64 or Link
  textResponse?: string;
  submittedAt: string;
  grade?: number;
  feedback?: string;
  status: 'Submitted' | 'Graded' | 'Returned';
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  deadline: string; // ISO Date string
  maxScore: number;
  submissions: AssignmentSubmission[];
  isActive: boolean;
}

// --- Forum Types ---

export interface ForumReply {
  id: string;
  topicId: string;
  author: string;
  role: string; // e.g. "Guru Matematika"
  content: string;
  createdAt: string;
}

export interface ForumTopic {
  id: string;
  title: string;
  content: string;
  author: string;
  role: string;
  category: string; // e.g. "Kurikulum", "Pedagogik", "Teknis"
  createdAt: string;
  likes: number;
  replies: ForumReply[];
  avatarColor?: string; // Visual helper
  isPinned?: boolean; // New: For admins to pin important topics
}

// --- Questionnaire / Survey Types ---

export interface QuestionnaireOption {
  text: string;
  pointsToType: string; // e.g. "Visual", "Auditory", "Choleric"
}

export interface QuestionnaireQuestion {
  id: string;
  text: string;
  options: QuestionnaireOption[];
}

export interface QuestionnaireResultDefinition {
  typeKey: string; // matches pointsToType
  title: string; // e.g. "Tipe Belajar Visual"
  description: string; // Detailed description
  characteristics: string[]; // List of traits
  learningTips: string[]; // Recommendations
}

export interface StudentQuestionnaireResponse {
  studentId: string;
  questionnaireId: string;
  answers: { questionId: string; selectedOptionIndex: number }[]; // Index mapping
  resultType: string; // The calculated dominant type
  submittedAt: string;
}

export interface Questionnaire {
  id: string;
  title: string;
  description: string; // Instructions
  questions: QuestionnaireQuestion[];
  resultsDefinition: QuestionnaireResultDefinition[]; // The Rubric
  responses: StudentQuestionnaireResponse[];
  isActive: boolean;
  createdAt: string;
}

export interface Classroom {
  id: string;
  name: string; // e.g., "X-IPA-1"
  gradeLevel: string;
  academicYear: string;
  students: Student[];
  assessments: Assessment[];
  grades: Grade[];
  weights: ClassWeight;
  attendance: Record<string, AttendanceRecord[]>; // Key is studentId
  journals: JournalEntry[]; 
  exams: Exam[]; // Bank Soal
  assignments: Assignment[]; // Tugas & Proyek
  questionnaires: Questionnaire[]; // Kuesioner & Karakter
}

export interface AnalysisResult {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}