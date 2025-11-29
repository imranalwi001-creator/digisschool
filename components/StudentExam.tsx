
import React, { useState, useEffect } from 'react';
import { Classroom, Exam, ExamSubmission } from '../types';
import { Clock, CheckCircle, AlertTriangle, ArrowRight, User } from 'lucide-react';

interface StudentExamProps {
  examId: string;
  classroomId: string;
  classrooms: Classroom[];
  onSubmit: (classroomId: string, submission: ExamSubmission) => void;
  onExit: () => void;
}

const StudentExam: React.FC<StudentExamProps> = ({ examId, classroomId, classrooms, onSubmit, onExit }) => {
  const [nis, setNis] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentStudentId, setCurrentStudentId] = useState('');
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const classroom = classrooms.find(c => c.id === classroomId);
  const exam = classroom?.exams.find(e => e.id === examId);

  useEffect(() => {
    if (exam && isLoggedIn) {
        setTimeLeft(exam.durationMinutes * 60);
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmitExam(); // Auto submit
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }
  }, [exam, isLoggedIn]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classroom) return;
    
    const student = classroom.students.find(s => s.nis === nis);
    if (student) {
        // Check if already submitted
        const existingSub = exam?.submissions.find(s => s.studentId === student.id);
        if (existingSub) {
            alert("Anda sudah mengerjakan ujian ini sebelumnya.");
            return;
        }
        setCurrentStudentId(student.id);
        setIsLoggedIn(true);
    } else {
        alert("NIS tidak ditemukan di kelas ini.");
    }
  };

  const handleAnswer = (qId: string, val: string | number) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const handleSubmitExam = () => {
    if (!exam || !currentStudentId) return;

    // Calculate Score (Simple logic for Multiple Choice)
    let totalPoints = 0;
    let earnedPoints = 0;
    
    const formattedAnswers = exam.questions.map(q => {
        const studentAns = answers[q.id];
        totalPoints += q.points;
        
        if (q.type === 'multiple_choice' && studentAns === q.correctOptionIndex) {
            earnedPoints += q.points;
        }
        // Essay grading would require teacher input later, for now assume 0 or handle mixed
        
        return { questionId: q.id, answer: studentAns !== undefined ? studentAns : '' };
    });

    const score = Math.round((earnedPoints / totalPoints) * 100);

    const submission: ExamSubmission = {
        studentId: currentStudentId,
        examId: exam.id,
        submittedAt: new Date().toISOString(),
        answers: formattedAnswers,
        score: score,
        status: 'Graded'
    };

    setFinalScore(score);
    setIsSubmitted(true);
    onSubmit(classroomId, submission);
  };

  if (!exam || !classroom) return <div className="min-h-screen flex items-center justify-center text-red-500">Ujian tidak ditemukan.</div>;

  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (isSubmitted) {
      return (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
              <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
                      <CheckCircle size={40} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Ujian Selesai!</h2>
                  <p className="text-slate-500 mb-6">Terima kasih telah mengerjakan ujian dengan jujur.</p>
                  
                  <div className="bg-slate-50 rounded-xl p-6 mb-6">
                      <div className="text-sm text-slate-500 uppercase font-bold tracking-wider">Nilai Kamu</div>
                      <div className={`text-5xl font-extrabold mt-2 ${finalScore >= exam.kkm ? 'text-emerald-600' : 'text-red-600'}`}>
                          {finalScore}
                      </div>
                      {finalScore < exam.kkm && (
                          <div className="mt-2 text-xs text-red-500 font-medium bg-red-50 px-2 py-1 rounded inline-block">
                              Harus Remedial (KKM {exam.kkm})
                          </div>
                      )}
                  </div>

                  <button onClick={onExit} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                      Kembali ke Halaman Utama
                  </button>
              </div>
          </div>
      );
  }

  if (!isLoggedIn) {
      return (
        <div className="min-h-screen bg-indigo-600 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-800">Digisschool CBT</h1>
                    <p className="text-slate-500 mt-2">Selamat datang di Portal Ujian Online.</p>
                </div>
                
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-6 text-left">
                    <h3 className="font-bold text-indigo-900">{exam.title}</h3>
                    <div className="text-sm text-indigo-700 mt-1 flex justify-between">
                        <span>Durasi: {exam.durationMinutes} Menit</span>
                        <span>Soal: {exam.questions.length}</span>
                    </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Masukkan NIS</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-slate-400" size={20}/>
                            <input 
                                type="text" 
                                className="w-full pl-10 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Contoh: 7001"
                                value={nis}
                                onChange={e => setNis(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                        Mulai Mengerjakan <ArrowRight size={18} />
                    </button>
                </form>
                <div className="mt-6 text-center">
                    <button onClick={onExit} className="text-sm text-slate-400 hover:text-slate-600">Batal / Kembali</button>
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
            <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
                <div>
                    <h2 className="font-bold text-slate-800 text-lg">{exam.title}</h2>
                    <p className="text-xs text-slate-500">Digisschool CBT System</p>
                </div>
                <div className={`px-4 py-2 rounded-lg font-mono font-bold text-xl flex items-center gap-2 ${timeLeft < 300 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-indigo-50 text-indigo-600'}`}>
                    <Clock size={20} /> {formatTime(timeLeft)}
                </div>
            </div>
        </header>

        {/* Question Area */}
        <main className="flex-1 max-w-3xl w-full mx-auto p-4 space-y-6">
            {exam.questions.map((q, index) => (
                <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex gap-4">
                        <div className="w-8 h-8 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-bold shrink-0 text-sm">
                            {index + 1}
                        </div>
                        <div className="flex-1">
                            <p className="text-lg text-slate-800 font-medium mb-4">{q.text}</p>
                            
                            {q.type === 'multiple_choice' && (
                                <div className="space-y-3">
                                    {q.options?.map((opt, optIndex) => (
                                        <label key={optIndex} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                            answers[q.id] === optIndex ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-200 hover:bg-slate-50'
                                        }`}>
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${answers[q.id] === optIndex ? 'border-indigo-600' : 'border-slate-300'}`}>
                                                {answers[q.id] === optIndex && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></div>}
                                            </div>
                                            <input 
                                                type="radio" 
                                                name={`q-${q.id}`} 
                                                className="hidden"
                                                checked={answers[q.id] === optIndex}
                                                onChange={() => handleAnswer(q.id, optIndex)}
                                            />
                                            <span className="text-slate-700">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            )}

                            {q.type === 'essay' && (
                                <textarea 
                                    className="w-full border border-slate-300 rounded-lg p-3 min-h-[120px] focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Tulis jawaban Anda disini..."
                                    value={answers[q.id] as string || ''}
                                    onChange={(e) => handleAnswer(q.id, e.target.value)}
                                ></textarea>
                            )}
                        </div>
                    </div>
                </div>
            ))}
            
            <div className="pt-6 pb-20">
                <button 
                    onClick={() => {
                        if (confirm("Apakah Anda yakin ingin mengumpulkan ujian ini?")) {
                            handleSubmitExam();
                        }
                    }}
                    className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
                >
                    Kumpulkan Jawaban
                </button>
            </div>
        </main>
    </div>
  );
};

export default StudentExam;
