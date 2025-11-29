
import React, { useState } from 'react';
import { Classroom, Exam, Question, QuestionType, AssessmentType } from '../types';
import { Plus, Trash2, Edit2, CheckCircle, FileText, Smartphone, Link as LinkIcon, Save, ArrowLeft, RefreshCw, BarChart2, Sparkles, X, Loader2, Award, TrendingUp } from 'lucide-react';
import QRCode from 'react-qr-code';
import { generateExamQuestions } from '../services/geminiService';
import { useToast } from './Toast';

interface QuestionBankProps {
  classrooms: Classroom[];
  onUpdateClassrooms: (updated: Classroom[]) => void;
  onNavigateToExam: (examId: string, classroomId: string) => void;
}

const QuestionBank: React.FC<QuestionBankProps> = ({ classrooms, onUpdateClassrooms, onNavigateToExam }) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(classrooms[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'list' | 'editor' | 'monitor'>('list');
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const { showToast } = useToast();

  // Editor States
  const [examTitle, setExamTitle] = useState('');
  const [examType, setExamType] = useState<AssessmentType>('PH');
  const [examDuration, setExamDuration] = useState(60);
  const [examKKM, setExamKKM] = useState(75);
  const [questions, setQuestions] = useState<Question[]>([]);

  // AI Modal States
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiCount, setAiCount] = useState(5);
  const [aiDifficulty, setAiDifficulty] = useState<'Mudah' | 'Sedang' | 'Sulit'>('Sedang');
  const [aiType, setAiType] = useState<'multiple_choice' | 'essay'>('multiple_choice');
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedClass = classrooms.find(c => c.id === selectedClassId);

  const handleCreateExam = () => {
    setEditingExam(null);
    setExamTitle('');
    setExamType('PH');
    setExamDuration(60);
    setExamKKM(75);
    setQuestions([]);
    setActiveTab('editor');
  };

  const handleEditExam = (exam: Exam) => {
    setEditingExam(exam);
    setExamTitle(exam.title);
    setExamType(exam.type);
    setExamDuration(exam.durationMinutes);
    setExamKKM(exam.kkm);
    setQuestions(exam.questions);
    setActiveTab('editor');
  };

  const handleAddQuestion = () => {
    const newQ: Question = {
        id: `q${Date.now()}`,
        text: '',
        type: 'multiple_choice',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        points: 10
    };
    setQuestions([...questions, newQ]);
  };

  const handleUpdateQuestion = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...questions];
    if (newQuestions[qIndex].options) {
        newQuestions[qIndex].options![oIndex] = value;
    }
    setQuestions(newQuestions);
  };

  const handleSaveExam = () => {
    if (!selectedClass || !examTitle) return;

    const newExam: Exam = {
        id: editingExam ? editingExam.id : `ex${Date.now()}`,
        title: examTitle,
        type: examType,
        durationMinutes: examDuration,
        kkm: examKKM,
        questions: questions,
        submissions: editingExam ? editingExam.submissions : [],
        isActive: true,
        dateCreated: editingExam ? editingExam.dateCreated : new Date().toISOString().split('T')[0]
    };

    const updatedClasses = classrooms.map(c => {
        if (c.id === selectedClassId) {
            const currentExams = c.exams || [];
            if (editingExam) {
                return { ...c, exams: currentExams.map(e => e.id === editingExam.id ? newExam : e) };
            } else {
                return { ...c, exams: [...currentExams, newExam] };
            }
        }
        return c;
    });

    onUpdateClassrooms(updatedClasses);
    setActiveTab('list');
    setEditingExam(null);
    showToast('Bank soal berhasil disimpan', 'success');
  };

  const handleDeleteExam = (examId: string) => {
    if (!confirm("Hapus ujian ini? Data hasil ujian juga akan terhapus.")) return;
    const updatedClasses = classrooms.map(c => {
        if (c.id === selectedClassId) {
            return { ...c, exams: (c.exams || []).filter(e => e.id !== examId) };
        }
        return c;
    });
    onUpdateClassrooms(updatedClasses);
    showToast('Ujian berhasil dihapus', 'info');
  };

  const handleSyncToGradebook = (exam: Exam) => {
     if (!selectedClass) return;
     
     // 1. Check if assessment column exists
     let assessmentId = selectedClass.assessments.find(a => a.examId === exam.id)?.id;
     let updatedAssessments = [...selectedClass.assessments];
     
     if (!assessmentId) {
         assessmentId = `a${Date.now()}`;
         updatedAssessments.push({
             id: assessmentId,
             title: exam.title,
             type: exam.type,
             maxScore: 100,
             date: exam.dateCreated,
             examId: exam.id
         });
     }

     // 2. Sync Grades
     let updatedGrades = [...selectedClass.grades];
     
     // Remove old grades for this exam
     updatedGrades = updatedGrades.filter(g => g.assessmentId !== assessmentId);

     // Add new grades from submissions
     exam.submissions.forEach(sub => {
         updatedGrades.push({
             studentId: sub.studentId,
             assessmentId: assessmentId!,
             score: sub.score
         });
     });

     const updatedClasses = classrooms.map(c => {
         if (c.id === selectedClassId) {
             return { ...c, assessments: updatedAssessments, grades: updatedGrades };
         }
         return c;
     });

     onUpdateClassrooms(updatedClasses);
     showToast("Nilai berhasil disinkronkan ke Buku Nilai!", 'success');
  };

  const handleGenerateAI = async () => {
     if (!selectedClass || !aiTopic) return;
     setIsGenerating(true);

     const generatedQuestions = await generateExamQuestions(
         aiTopic,
         selectedClass.gradeLevel,
         aiCount,
         aiType,
         aiDifficulty
     );

     if (generatedQuestions.length > 0) {
         setQuestions([...questions, ...generatedQuestions]);
         setIsAIModalOpen(false);
         setAiTopic('');
         showToast(`${generatedQuestions.length} soal berhasil dibuat oleh AI`, 'success');
     } else {
         showToast("Gagal membuat soal dengan AI", 'error');
     }
     
     setIsGenerating(false);
  };

  // --- Calculate Monitor Stats ---
  const getExamStats = () => {
      if (!editingExam) return { avg: 0, passRate: 0, perfect: 0 };
      
      const totalSubmissions = editingExam.submissions.length;
      if (totalSubmissions === 0) return { avg: 0, passRate: 0, perfect: 0 };

      const totalScore = editingExam.submissions.reduce((acc, sub) => acc + sub.score, 0);
      const avg = parseFloat((totalScore / totalSubmissions).toFixed(1));

      const passedCount = editingExam.submissions.filter(s => s.score >= editingExam.kkm).length;
      const passRate = Math.round((passedCount / totalSubmissions) * 100);

      const perfect = editingExam.submissions.filter(s => s.score === 100).length;

      return { avg, passRate, perfect };
  };

  if (!selectedClass) return <div className="p-8">Pilih kelas terlebih dahulu.</div>;

  const examStats = getExamStats();

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Bank Soal & CBT</h2>
           <p className="text-slate-500">Buat soal ujian, bagikan link ke siswa, dan pantau hasil secara real-time.</p>
        </div>
        <div className="flex gap-2">
            <select 
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
                {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
        </div>
      </header>

      {activeTab === 'list' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-700">Daftar Ujian</h3>
                <button 
                    onClick={handleCreateExam}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus size={18} /> Buat Ujian Baru
                </button>
            </div>
            
            <div className="grid gap-4">
                {(selectedClass.exams || []).length === 0 ? (
                    <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                        Belum ada ujian dibuat.
                    </div>
                ) : (
                    selectedClass.exams?.map(exam => (
                        <div key={exam.id} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded uppercase">{exam.type}</span>
                                        <span className="text-slate-400 text-xs flex items-center gap-1"><FileText size={12}/> {exam.questions.length} Soal</span>
                                        <span className="text-slate-400 text-xs flex items-center gap-1"><Smartphone size={12}/> {exam.submissions.length} Selesai</span>
                                    </div>
                                    <h4 className="font-bold text-lg text-slate-800">{exam.title}</h4>
                                    <p className="text-sm text-slate-500 mt-1">KKM: {exam.kkm} • Durasi: {exam.durationMinutes} menit</p>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-2">
                                    <button 
                                        onClick={() => handleSyncToGradebook(exam)}
                                        className="px-3 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-medium hover:bg-emerald-100 flex items-center gap-2"
                                        title="Sinkron ke Buku Nilai"
                                    >
                                        <RefreshCw size={16} /> Sync Nilai
                                    </button>
                                    <button 
                                        onClick={() => { setEditingExam(exam); setActiveTab('monitor'); }}
                                        className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 flex items-center gap-2"
                                    >
                                        <BarChart2 size={16} /> Monitor
                                    </button>
                                    <button 
                                        onClick={() => handleEditExam(exam)}
                                        className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteExam(exam.id)}
                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
      )}

      {activeTab === 'editor' && (
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col h-full min-h-[80vh]">
            <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-3">
                    <button onClick={() => setActiveTab('list')} className="hover:bg-indigo-700 p-1 rounded"><ArrowLeft size={20}/></button>
                    <h3 className="font-bold text-lg">Editor Soal Ujian</h3>
                </div>
                <button onClick={handleSaveExam} className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-50">
                    <Save size={18} /> Simpan Ujian
                </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
                <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm mb-6 space-y-4">
                    <h4 className="font-bold text-slate-700 border-b border-slate-100 pb-2">Konfigurasi Ujian</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Judul Ujian</label>
                            <input type="text" className="w-full border p-2 rounded" value={examTitle} onChange={e => setExamTitle(e.target.value)} placeholder="Contoh: Ulangan Harian Biologi" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Tipe Penilaian</label>
                            <select className="w-full border p-2 rounded" value={examType} onChange={e => setExamType(e.target.value as any)}>
                                <option value="PH">PH</option><option value="PTS">PTS</option><option value="PAS">PAS</option><option value="Tugas">Tugas</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Durasi (Menit)</label>
                            <input type="number" className="w-full border p-2 rounded" value={examDuration} onChange={e => setExamDuration(parseInt(e.target.value))} />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">KKM (Batas Remedial)</label>
                            <input type="number" className="w-full border p-2 rounded" value={examKKM} onChange={e => setExamKKM(parseInt(e.target.value))} />
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-slate-700">Daftar Pertanyaan ({questions.length})</h4>
                    <button 
                        onClick={() => setIsAIModalOpen(true)}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-purple-200 hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-2"
                    >
                        <Sparkles size={16} /> Buat Soal dengan AI
                    </button>
                </div>

                <div className="space-y-6">
                    {questions.map((q, qIndex) => (
                        <div key={q.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm relative group animate-in slide-in-from-bottom-2">
                            <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => {
                                    const newQ = questions.filter((_, i) => i !== qIndex);
                                    setQuestions(newQ);
                                }} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={18}/></button>
                            </div>
                            
                            <div className="flex gap-4 mb-4">
                                <div className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">{qIndex + 1}</div>
                                <div className="flex-1 space-y-3">
                                    <textarea 
                                        className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-indigo-500 outline-none" 
                                        placeholder="Tulis pertanyaan disini..."
                                        rows={2}
                                        value={q.text}
                                        onChange={e => handleUpdateQuestion(qIndex, 'text', e.target.value)}
                                    ></textarea>
                                    
                                    <div className="flex gap-4">
                                        <select 
                                            className="border p-1 rounded text-sm"
                                            value={q.type}
                                            onChange={e => handleUpdateQuestion(qIndex, 'type', e.target.value)}
                                        >
                                            <option value="multiple_choice">Pilihan Ganda</option>
                                            <option value="essay">Esai / Uraian</option>
                                        </select>
                                        <input 
                                            type="number" 
                                            className="border p-1 rounded text-sm w-20" 
                                            placeholder="Poin"
                                            value={q.points}
                                            onChange={e => handleUpdateQuestion(qIndex, 'points', parseInt(e.target.value))}
                                        />
                                        <span className="text-sm self-center text-slate-500">Poin</span>
                                    </div>

                                    {q.type === 'multiple_choice' && (
                                        <div className="space-y-2 mt-2">
                                            {q.options?.map((opt, oIndex) => (
                                                <div key={oIndex} className="flex items-center gap-2">
                                                    <input 
                                                        type="radio" 
                                                        name={`correct-${q.id}`} 
                                                        checked={q.correctOptionIndex === oIndex}
                                                        onChange={() => handleUpdateQuestion(qIndex, 'correctOptionIndex', oIndex)}
                                                    />
                                                    <input 
                                                        type="text" 
                                                        className={`flex-1 border-b border-slate-200 focus:border-indigo-500 outline-none py-1 text-sm ${q.correctOptionIndex === oIndex ? 'text-green-600 font-medium' : ''}`}
                                                        placeholder={`Pilihan ${String.fromCharCode(65 + oIndex)}`}
                                                        value={opt}
                                                        onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {q.type === 'essay' && (
                                        <div className="mt-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Rubrik Penilaian / Kunci Jawaban</label>
                                            <textarea 
                                                className="w-full border border-slate-200 bg-slate-50 rounded p-2 text-sm mt-1"
                                                placeholder="Jelaskan kriteria penilaian untuk jawaban sempurna..."
                                                value={q.rubric || ''}
                                                onChange={e => handleUpdateQuestion(qIndex, 'rubric', e.target.value)}
                                            ></textarea>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    <button 
                        onClick={handleAddQuestion}
                        className="w-full py-4 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 font-medium hover:border-indigo-500 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus size={20} /> Tambah Pertanyaan Manual
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* AI Generator Modal */}
      {isAIModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
             <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
                 <div className="flex justify-between items-center mb-6">
                     <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                         <Sparkles className="text-purple-600" /> AI Question Generator
                     </h3>
                     <button onClick={() => setIsAIModalOpen(false)} className="text-slate-400 hover:text-slate-600" disabled={isGenerating}>
                         <X size={20} />
                     </button>
                 </div>

                 <div className="space-y-4">
                     <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">Topik / Materi</label>
                         <input 
                            type="text" 
                            className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 outline-none"
                            placeholder="Contoh: Ekosistem Laut, Aljabar Linear, Sejarah Majapahit"
                            value={aiTopic}
                            onChange={(e) => setAiTopic(e.target.value)}
                         />
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4">
                         <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah Soal</label>
                             <input 
                                type="number" 
                                min="1" max="20"
                                className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 outline-none"
                                value={aiCount}
                                onChange={(e) => setAiCount(parseInt(e.target.value))}
                             />
                         </div>
                         <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1">Tingkat Kesulitan</label>
                             <select 
                                className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                                value={aiDifficulty}
                                onChange={(e) => setAiDifficulty(e.target.value as any)}
                             >
                                 <option value="Mudah">Mudah</option>
                                 <option value="Sedang">Sedang</option>
                                 <option value="Sulit">Sulit (HOTS)</option>
                             </select>
                         </div>
                     </div>

                     <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">Tipe Soal</label>
                         <div className="grid grid-cols-2 gap-3">
                             <button 
                                onClick={() => setAiType('multiple_choice')}
                                className={`p-3 rounded-lg border text-sm font-medium transition-all ${aiType === 'multiple_choice' ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                             >
                                 Pilihan Ganda
                             </button>
                             <button 
                                onClick={() => setAiType('essay')}
                                className={`p-3 rounded-lg border text-sm font-medium transition-all ${aiType === 'essay' ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                             >
                                 Esai / Uraian
                             </button>
                         </div>
                     </div>
                 </div>

                 <div className="mt-8 flex justify-end gap-3">
                     <button 
                        onClick={() => setIsAIModalOpen(false)}
                        disabled={isGenerating}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                     >
                         Batal
                     </button>
                     <button 
                        onClick={handleGenerateAI}
                        disabled={!aiTopic || isGenerating}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-purple-200 transition-all"
                     >
                         {isGenerating ? (
                             <><Loader2 className="animate-spin" size={18} /> Sedang Membuat...</>
                         ) : (
                             <><Sparkles size={18} /> Generate Soal</>
                         )}
                     </button>
                 </div>
             </div>
        </div>
      )}

      {activeTab === 'monitor' && editingExam && (
        <div className="space-y-6">
            <button onClick={() => setActiveTab('list')} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-4">
                <ArrowLeft size={18}/> Kembali ke Daftar
            </button>
            
            {/* Exam Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase">Rata-rata Nilai</p>
                        <p className="text-2xl font-bold text-slate-800">{examStats.avg}</p>
                    </div>
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                        <TrendingUp size={24} />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase">Kelulusan</p>
                        <p className={`text-2xl font-bold ${examStats.passRate >= 80 ? 'text-emerald-600' : 'text-amber-500'}`}>{examStats.passRate}%</p>
                    </div>
                     <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                        <CheckCircle size={24} />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase">Nilai Sempurna</p>
                        <p className="text-2xl font-bold text-amber-500">{examStats.perfect}</p>
                    </div>
                     <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                        <Award size={24} />
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* QR & Link Section */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                    <h3 className="font-bold text-lg text-slate-800 mb-4">Akses Ujian Siswa</h3>
                    <div className="bg-white p-4 rounded-lg shadow-inner border border-slate-100 mb-4">
                        <QRCode value={`https://digisschool.app/exam/${editingExam.id}`} size={150} />
                    </div>
                    <p className="text-sm text-slate-500 mb-4">Scan QR Code ini atau gunakan Link di bawah.</p>
                    
                    <div className="w-full flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                        <LinkIcon size={16} className="text-slate-400 shrink-0"/>
                        <input 
                            readOnly 
                            value={`https://digisschool.app/exam/${editingExam.id}`} 
                            className="bg-transparent text-sm w-full outline-none text-slate-600"
                        />
                    </div>
                    <div className="mt-3 w-full flex items-center justify-between bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                        <span className="text-xs text-indigo-700 font-bold uppercase">Kode Akses</span>
                        <span className="text-lg font-mono font-bold text-indigo-900 tracking-wider">{editingExam.id}</span>
                    </div>
                    <button 
                         onClick={() => onNavigateToExam(editingExam.id, selectedClass.id)}
                         className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-medium"
                    >
                        Buka Simulasi Mode Siswa
                    </button>
                </div>

                {/* Live Stats */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-lg text-slate-800 mb-4">Monitoring Real-time</h3>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                         <div className="bg-blue-50 p-4 rounded-lg text-center">
                             <div className="text-3xl font-bold text-blue-600">{editingExam.submissions.length}</div>
                             <div className="text-xs text-blue-500 uppercase font-bold">Sudah Mengerjakan</div>
                         </div>
                         <div className="bg-slate-50 p-4 rounded-lg text-center">
                             <div className="text-3xl font-bold text-slate-600">{selectedClass.students.length - editingExam.submissions.length}</div>
                             <div className="text-xs text-slate-500 uppercase font-bold">Belum Mengerjakan</div>
                         </div>
                    </div>
                    
                    <h4 className="font-bold text-sm text-slate-700 mb-2">Perlu Remedial (Nilai &lt; {editingExam.kkm})</h4>
                    <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {editingExam.submissions.filter(s => s.score < editingExam.kkm).map(sub => {
                            const student = selectedClass.students.find(s => s.id === sub.studentId);
                            return (
                                <li key={sub.studentId} className="flex justify-between items-center text-sm p-2 bg-red-50 rounded text-red-700">
                                    <span>{student?.name}</span>
                                    <span className="font-bold">{sub.score}</span>
                                </li>
                            );
                        })}
                        {editingExam.submissions.filter(s => s.score < editingExam.kkm).length === 0 && (
                            <li className="text-sm text-slate-400 italic">Tidak ada siswa remedial.</li>
                        )}
                    </ul>
                </div>
            </div>

            {/* Submission Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold">
                        <tr>
                            <th className="p-4">Nama Siswa</th>
                            <th className="p-4">Waktu Submit</th>
                            <th className="p-4 text-center">Nilai</th>
                            <th className="p-4 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {editingExam.submissions.map(sub => {
                             const student = selectedClass.students.find(s => s.id === sub.studentId);
                             return (
                                 <tr key={sub.studentId}>
                                     <td className="p-4 font-medium">{student?.name || sub.studentId}</td>
                                     <td className="p-4 text-slate-500">{new Date(sub.submittedAt).toLocaleString()}</td>
                                     <td className={`p-4 text-center font-bold text-lg ${sub.score < editingExam.kkm ? 'text-red-600' : 'text-emerald-600'}`}>{sub.score}</td>
                                     <td className="p-4 text-center">
                                         <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold">Selesai</span>
                                     </td>
                                 </tr>
                             );
                        })}
                         {editingExam.submissions.length === 0 && (
                            <tr><td colSpan={4} className="p-6 text-center text-slate-400">Belum ada submission.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      )}
    </div>
  );
};

export default QuestionBank;
