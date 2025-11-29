import { GoogleGenAI, Type } from "@google/genai";
import { Classroom, AnalysisResult, Question } from "../types";
import { calculateFinalScore } from "./storageService";

// Helper to get safe API key
const getApiKey = () => {
  const key = process.env.API_KEY;
  if (!key) {
    console.warn("API Key not found in environment variables.");
    return "";
  }
  return key;
};

export const analyzeClassPerformance = async (classroom: Classroom): Promise<AnalysisResult | null> => {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const ai = new GoogleGenAI({ apiKey });

  // Prepare data context for AI
  const studentPerformance = classroom.students.map(s => ({
    name: s.name,
    finalScore: calculateFinalScore(classroom, s.id),
  }));

  const averages = studentPerformance.reduce((acc, curr) => acc + curr.finalScore, 0) / studentPerformance.length;
  
  const promptData = {
    className: classroom.name,
    gradeLevel: classroom.gradeLevel,
    averageScore: averages.toFixed(2),
    studentData: studentPerformance,
    weights: classroom.weights
  };

  const prompt = `
    Bertindaklah sebagai konsultan pendidikan senior. Analisis data kelas berikut dalam format JSON.
    Data Kelas: ${JSON.stringify(promptData)}
    
    Berikan analisis mendalam mengenai performa kelas ini. Identifikasi siswa yang berisiko (nilai rendah) dan berikan strategi pengajaran spesifik untuk meningkatkan hasil belajar mereka sesuai Kurikulum Merdeka.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "Anda adalah asisten AI yang membantu guru menganalisis performa siswa. Gunakan Bahasa Indonesia yang formal namun mudah dipahami.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Ringkasan umum performa kelas (1-2 paragraf)" },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Poin-poin kekuatan kelas ini" },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Area yang perlu perbaikan" },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Saran strategi pengajaran konkret untuk guru" }
          },
          required: ["summary", "strengths", "weaknesses", "suggestions"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    }
    return null;

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return null;
  }
};

export const generateStudentComment = async (studentName: string, score: number, type: string): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) return "API Key missing.";

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Buatkan komentar singkat (1-2 kalimat) untuk rapor siswa bernama ${studentName} yang mendapatkan nilai ${score} (skala 0-100) pada kategori ${type}. Gunakan bahasa yang memotivasi dan konstruktif.`,
    });
    return response.text || "";
  } catch (error) {
    return "Gagal membuat komentar otomatis.";
  }
};

export const generateExamQuestions = async (
  topic: string, 
  gradeLevel: string, 
  count: number, 
  type: 'multiple_choice' | 'essay', 
  difficulty: 'Mudah' | 'Sedang' | 'Sulit'
): Promise<Question[]> => {
  const apiKey = getApiKey();
  if (!apiKey) return [];

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Buatkan ${count} soal ujian tipe ${type === 'multiple_choice' ? 'Pilihan Ganda' : 'Esai/Uraian'} 
    untuk siswa kelas ${gradeLevel} dengan topik "${topic}".
    Tingkat kesulitan: ${difficulty}.
    
    Pastikan bahasa yang digunakan baku dan sesuai kaidah pendidikan Indonesia.
    Untuk Pilihan Ganda, berikan 4 opsi jawaban dan tentukan indeks jawaban yang benar (0-3).
    Untuk Esai, berikan rubrik penilaian singkat.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "Anda adalah Ahli Pembuat Soal Ujian (AI Exam Specialist). Output harus JSON array valid.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING, description: "Teks pertanyaan" },
              type: { type: Type.STRING, description: "Tipe soal (multiple_choice atau essay)" },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING }, 
                description: "Array berisi 4 pilihan jawaban (hanya untuk multiple_choice)" 
              },
              correctOptionIndex: { type: Type.NUMBER, description: "Index jawaban benar 0-3 (hanya untuk multiple_choice)" },
              points: { type: Type.NUMBER, description: "Poin default untuk soal ini (misal 10 atau 20)" },
              rubric: { type: Type.STRING, description: "Panduan penilaian (hanya untuk essay)" }
            },
            required: ["text", "type", "points"]
          }
        }
      }
    });

    if (response.text) {
      const rawQuestions = JSON.parse(response.text);
      // Map and assign IDs locally
      return rawQuestions.map((q: any) => ({
        id: `q_ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        text: q.text,
        type: type, // Ensure type consistency
        options: q.options || [],
        correctOptionIndex: q.correctOptionIndex,
        points: q.points || (type === 'multiple_choice' ? 10 : 20),
        rubric: q.rubric
      })) as Question[];
    }
    return [];

  } catch (error) {
    console.error("Gemini Question Generation Failed:", error);
    alert("Gagal membuat soal dengan AI. Periksa koneksi atau API Key.");
    return [];
  }
};