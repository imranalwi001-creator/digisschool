
import React, { useState } from 'react';
import { Classroom, Questionnaire, QuestionnaireQuestion, QuestionnaireResultDefinition } from '../types';
import { Plus, Edit2, Trash2, Save, ArrowLeft, Link as LinkIcon, BarChart2, BookOpen, FileText } from 'lucide-react';
import QRCode from 'react-qr-code';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

interface QuestionnaireManagerProps {
  classrooms: Classroom[];
  onUpdateClassrooms: (updated: Classroom[]) => void;
  onNavigateToStudentPortal: (quizId: string, classroomId: string) => void;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const QuestionnaireManager: React.FC<QuestionnaireManagerProps> = ({ classrooms, onUpdateClassrooms, onNavigateToStudentPortal }) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(classrooms[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'list' | 'editor' | 'monitor'>('list');
  const [editingQuiz, setEditingQuiz] = useState<Questionnaire | null>(null);

  // Editor State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<QuestionnaireQuestion[]>([]);
  const [resultsDefinition, setResultsDefinition] = useState<QuestionnaireResultDefinition[]>([]);

  const selectedClass = classrooms.find(c => c.id === selectedClassId);

  // --- Handlers ---

  const handleCreate = () => {
    setEditingQuiz(null);
    setTitle('');
    setDescription('');
    setQuestions([]);
    setResultsDefinition([]);
    setActiveTab('editor');
  };

  const handleEdit = (quiz: Questionnaire) => {
    setEditingQuiz(quiz);
    setTitle(quiz.title);
    setDescription(quiz.description);
    setQuestions(quiz.questions);
    setResultsDefinition(quiz.resultsDefinition);
    setActiveTab('editor');
  };

  const handleDelete = (id: string) => {
    if(!confirm("Hapus kuesioner ini? Data respon siswa akan hilang.")) return;
    const updatedClasses = classrooms.map(c => {
        if (c.id === selectedClassId) {
            return { ...c, questionnaires: (c.questionnaires || []).filter(q => q.id !== id) };
        }
        return c;
    });
    onUpdateClassrooms(updatedClasses);
  };

  const handleSave = () => {
      if (!selectedClass || !title) return;

      const newQuiz: Questionnaire = {
          id: editingQuiz ? editingQuiz.id : `qz${Date.now()}`,
          title,
          description,
          questions,
          resultsDefinition,
          responses: editingQuiz ? editingQuiz.responses : [],
          isActive: true,
          createdAt: editingQuiz ? editingQuiz.createdAt : new Date().toISOString()
      };

      const updatedClasses = classrooms.map(c => {
          if(c.id === selectedClassId) {
              const current = c.questionnaires || [];
              if (editingQuiz) {
                  return { ...c, questionnaires: current.map(q => q.id === editingQuiz.id ? newQuiz : q) };
              } else {
                  return { ...c, questionnaires: [...current, newQuiz] };
              }
          }
          return c;
      });

      onUpdateClassrooms(updatedClasses);
      setActiveTab('list');
      setEditingQuiz(null);
  };

  // --- Helper to add/edit questions & results ---

  const addQuestion = () => {
      setQuestions([...questions, {
          id: `qq${Date.now()}`,
          text: '',
          options: [{ text: '', pointsToType: '' }, { text: '', pointsToType: '' }]
      }]);
  };

  const updateQuestion = (idx: number, field: keyof QuestionnaireQuestion, val: any) => {
      const updated = [...questions];
      updated[idx] = { ...updated[idx], [field]: val };
      setQuestions(updated);
  };

  const updateOption = (qIdx: number, oIdx: number, field: 'text'|'pointsToType', val: string) => {
      const updated = [...questions];
      updated[qIdx].options[oIdx] = { ...updated[qIdx].options[oIdx], [field]: val };
      setQuestions(updated);
  };
  
  const addOption = (qIdx: number) => {
      const updated = [...questions];
      updated[qIdx].options.push({ text: '', pointsToType: '' });
      setQuestions(updated);
  };

  const addResultDefinition = () => {
      setResultsDefinition([...resultsDefinition, {
          typeKey: '', title: '', description: '', characteristics: [], learningTips: []
      }]);
  };

  const updateResultDefinition = (idx: number, field: keyof QuestionnaireResultDefinition, val: any) => {
      const updated = [...resultsDefinition];
      updated[idx] = { ...updated[idx], [field]: val };
      setResultsDefinition(updated);
  };

  if (!selectedClass) return <div className="p-8">Pilih kelas terlebih dahulu.</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Kuesioner Psikologi & Gaya Belajar</h2>
           <p className="text-slate-500">Pahami karakter siswa untuk metode pengajaran yang lebih efektif.</p>
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
                   <h3 className="text-lg font-bold text-slate-700">Daftar Kuesioner</h3>
                   <button 
                       onClick={handleCreate}
                       className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                   >
                       <Plus size={18} /> Buat Kuesioner
                   </button>
               </div>

               <div className="grid gap-4">
                   {(selectedClass.questionnaires || []).length === 0 ? (
                       <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                           Belum ada kuesioner.
                       </div>
                   ) : (
                       selectedClass.questionnaires?.map(quiz => (
                           <div key={quiz.id} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white">
                               <div className="flex flex-col md:flex-row justify-between gap-4">
                                   <div>
                                       <h4 className="font-bold text-lg text-slate-800">{quiz.title}</h4>
                                       <p className="text-sm text-slate-500 mt-1 line-clamp-1">{quiz.description}</p>
                                       <div className="flex gap-3 mt-2 text-xs text-slate-400">
                                           <span>{quiz.questions.length} Pertanyaan</span>
                                           <span>{quiz.responses.length} Respon</span>
                                       </div>
                                   </div>
                                   <div className="flex flex-wrap items-center gap-2">
                                       <button 
                                           onClick={() => { setEditingQuiz(quiz); setActiveTab('monitor'); }}
                                           className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 flex items-center gap-2"
                                       >
                                           <BarChart2 size={16} /> Hasil & Kode
                                       </button>
                                       <button 
                                           onClick={() => handleEdit(quiz)}
                                           className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100"
                                       >
                                           <Edit2 size={18} />
                                       </button>
                                       <button 
                                           onClick={() => handleDelete(quiz.id)}
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
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
               <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
                   <div className="flex items-center gap-3">
                       <button onClick={() => setActiveTab('list')} className="hover:bg-indigo-700 p-1 rounded"><ArrowLeft size={20}/></button>
                       <h3 className="font-bold text-lg">Editor Kuesioner</h3>
                   </div>
                   <button onClick={handleSave} className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-50">
                       <Save size={18} /> Simpan
                   </button>
               </div>
               
               <div className="p-6 space-y-8 bg-slate-50 h-[80vh] overflow-y-auto">
                   
                   {/* Basic Info */}
                   <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
                       <h4 className="font-bold text-slate-700 border-b border-slate-100 pb-2">Informasi Dasar</h4>
                       <div>
                           <label className="block text-sm font-medium text-slate-600 mb-1">Judul Kuesioner</label>
                           <input className="w-full border p-2 rounded" value={title} onChange={e => setTitle(e.target.value)} placeholder="Contoh: Tes Gaya Belajar VAK"/>
                       </div>
                       <div>
                           <label className="block text-sm font-medium text-slate-600 mb-1">Deskripsi / Instruksi</label>
                           <textarea className="w-full border p-2 rounded" value={description} onChange={e => setDescription(e.target.value)} placeholder="Instruksi pengerjaan..."/>
                       </div>
                   </div>

                   {/* Rubric Definition */}
                   <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
                       <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                            <h4 className="font-bold text-slate-700">Definisi Hasil (Rubrik)</h4>
                            <button onClick={addResultDefinition} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded hover:bg-indigo-100">+ Tambah Tipe</button>
                       </div>
                       <p className="text-xs text-slate-500">Definisikan tipe kepribadian/belajar yang akan menjadi hasil akhir.</p>
                       
                       {resultsDefinition.map((res, idx) => (
                           <div key={idx} className="p-4 border border-slate-200 rounded bg-slate-50 space-y-3 relative">
                                <button onClick={() => {
                                    const updated = resultsDefinition.filter((_, i) => i !== idx);
                                    setResultsDefinition(updated);
                                }} className="absolute top-2 right-2 text-red-400 hover:text-red-600"><Trash2 size={16}/></button>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500">Kunci Tipe (ID)</label>
                                        <input className="w-full border p-1 rounded text-sm" value={res.typeKey} onChange={e => updateResultDefinition(idx, 'typeKey', e.target.value)} placeholder="Misal: Visual"/>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500">Judul Tampilan</label>
                                        <input className="w-full border p-1 rounded text-sm" value={res.title} onChange={e => updateResultDefinition(idx, 'title', e.target.value)} placeholder="Misal: Si Pelihat (Visual)"/>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500">Deskripsi Lengkap</label>
                                    <textarea className="w-full border p-1 rounded text-sm" value={res.description} onChange={e => updateResultDefinition(idx, 'description', e.target.value)} placeholder="Penjelasan detail tentang tipe ini..."/>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500">Saran Belajar (Pisahkan dengan koma)</label>
                                    <input className="w-full border p-1 rounded text-sm" value={res.learningTips.join(', ')} onChange={e => updateResultDefinition(idx, 'learningTips', e.target.value.split(', '))} placeholder="Tips 1, Tips 2..."/>
                                </div>
                           </div>
                       ))}
                   </div>

                   {/* Questions */}
                   <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                            <h4 className="font-bold text-slate-700">Daftar Pertanyaan</h4>
                       </div>
                       
                       {questions.map((q, qIdx) => (
                           <div key={q.id} className="p-4 border border-slate-200 rounded relative">
                                <button onClick={() => {
                                    const updated = questions.filter((_, i) => i !== qIdx);
                                    setQuestions(updated);
                                }} className="absolute top-2 right-2 text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                                
                                <div className="mb-3">
                                    <label className="text-xs font-bold text-slate-500">Pertanyaan #{qIdx + 1}</label>
                                    <input className="w-full border p-2 rounded" value={q.text} onChange={e => updateQuestion(qIdx, 'text', e.target.value)} placeholder="Tulis pertanyaan..."/>
                                </div>

                                <div className="space-y-2 pl-4 border-l-2 border-indigo-100">
                                    {q.options.map((opt, oIdx) => (
                                        <div key={oIdx} className="flex gap-2 items-center">
                                            <input className="flex-1 border p-1 rounded text-sm" value={opt.text} onChange={e => updateOption(qIdx, oIdx, 'text', e.target.value)} placeholder="Pilihan Jawaban"/>
                                            <select className="w-32 border p-1 rounded text-sm bg-white" value={opt.pointsToType} onChange={e => updateOption(qIdx, oIdx, 'pointsToType', e.target.value)}>
                                                <option value="">- Tipe -</option>
                                                {resultsDefinition.map(r => <option key={r.typeKey} value={r.typeKey}>{r.typeKey}</option>)}
                                            </select>
                                        </div>
                                    ))}
                                    <button onClick={() => addOption(qIdx)} className="text-xs text-indigo-600 hover:underline">+ Tambah Opsi</button>
                                </div>
                           </div>
                       ))}

                       <button onClick={addQuestion} className="w-full py-3 border-2 border-dashed border-slate-300 rounded text-slate-500 font-bold hover:border-indigo-500 hover:text-indigo-600 transition-colors">
                           + Tambah Pertanyaan Baru
                       </button>
                   </div>
               </div>
          </div>
      )}

      {activeTab === 'monitor' && editingQuiz && (
          <div className="space-y-6">
              <button onClick={() => setActiveTab('list')} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-4">
                  <ArrowLeft size={18}/> Kembali ke Daftar
              </button>

              <div className="grid md:grid-cols-2 gap-6">
                  {/* QR Code Section */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                      <h3 className="font-bold text-lg text-slate-800 mb-4">Akses Kuesioner Siswa</h3>
                      <div className="bg-white p-4 rounded-lg shadow-inner border border-slate-100 mb-4">
                          <QRCode value={`https://edutrack.app/quiz/${editingQuiz.id}`} size={150} />
                      </div>
                      <div className="w-full flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200 text-sm mb-4">
                          <LinkIcon size={16} className="text-slate-400 shrink-0"/>
                          <span className="truncate text-slate-500">edutrack.app/quiz/{editingQuiz.id}</span>
                      </div>
                      <button 
                           onClick={() => onNavigateToStudentPortal(editingQuiz.id, selectedClass.id)}
                           className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-medium"
                      >
                          Buka Portal Siswa (Simulasi)
                      </button>
                  </div>

                  {/* Analytics Chart */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                      <h3 className="font-bold text-lg text-slate-800 mb-4">Sebaran Hasil Kelas</h3>
                      
                      {editingQuiz.responses.length > 0 ? (
                          <div className="h-64">
                              <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                      <Pie
                                          data={(() => {
                                              const counts: Record<string, number> = {};
                                              editingQuiz.responses.forEach(r => {
                                                  counts[r.resultType] = (counts[r.resultType] || 0) + 1;
                                              });
                                              return Object.entries(counts).map(([name, value]) => ({ name, value }));
                                          })()}
                                          cx="50%" cy="50%"
                                          innerRadius={60} outerRadius={80}
                                          paddingAngle={5}
                                          dataKey="value"
                                      >
                                          {editingQuiz.resultsDefinition.map((_, index) => (
                                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                          ))}
                                      </Pie>
                                      <RechartsTooltip />
                                      <Legend />
                                  </PieChart>
                              </ResponsiveContainer>
                          </div>
                      ) : (
                          <div className="h-64 flex items-center justify-center text-slate-400 border border-dashed rounded bg-slate-50">
                              Belum ada respon siswa.
                          </div>
                      )}
                  </div>
              </div>

              {/* Response Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-4 bg-slate-50 border-b border-slate-200">
                      <h3 className="font-bold text-slate-700">Detail Respon Siswa</h3>
                  </div>
                  <table className="w-full text-left text-sm">
                      <thead className="bg-white text-slate-500 border-b border-slate-200">
                          <tr>
                              <th className="p-4">Nama Siswa</th>
                              <th className="p-4">Waktu Submit</th>
                              <th className="p-4">Hasil Dominan</th>
                              <th className="p-4">Detail</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {editingQuiz.responses.map(resp => {
                              const student = selectedClass.students.find(s => s.id === resp.studentId);
                              return (
                                  <tr key={resp.studentId}>
                                      <td className="p-4 font-medium">{student?.name || resp.studentId}</td>
                                      <td className="p-4 text-slate-500">{new Date(resp.submittedAt).toLocaleDateString()}</td>
                                      <td className="p-4">
                                          <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded font-bold text-xs border border-indigo-100">
                                              {resp.resultType}
                                          </span>
                                      </td>
                                      <td className="p-4 text-slate-400">
                                          <BookOpen size={16} />
                                      </td>
                                  </tr>
                              );
                          })}
                          {editingQuiz.responses.length === 0 && (
                              <tr><td colSpan={4} className="p-6 text-center text-slate-400">Belum ada data.</td></tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
      )}
    </div>
  );
};

export default QuestionnaireManager;
