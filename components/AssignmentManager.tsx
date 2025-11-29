
import React, { useState } from 'react';
import { Classroom, Assignment, AssignmentSubmission, Assessment } from '../types';
import { Plus, Trash2, Edit2, Link as LinkIcon, Save, ArrowLeft, FileText, CheckCircle, Clock, Upload, User, ExternalLink, RefreshCw } from 'lucide-react';
import QRCode from 'react-qr-code';
import { useToast } from './Toast';

interface AssignmentManagerProps {
  classrooms: Classroom[];
  onUpdateClassrooms: (updated: Classroom[]) => void;
  onNavigateToStudentPortal: (assignmentId: string, classroomId: string) => void;
}

const AssignmentManager: React.FC<AssignmentManagerProps> = ({ classrooms, onUpdateClassrooms, onNavigateToStudentPortal }) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(classrooms[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'list' | 'editor' | 'monitor'>('list');
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const { showToast } = useToast();

  // Editor States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [maxScore, setMaxScore] = useState(100);

  // Grading State
  const [gradingSubmission, setGradingSubmission] = useState<{sid: string, submission: AssignmentSubmission} | null>(null);
  const [gradeInput, setGradeInput] = useState<number>(0);
  const [feedbackInput, setFeedbackInput] = useState('');

  const selectedClass = classrooms.find(c => c.id === selectedClassId);

  const handleCreate = () => {
    setEditingAssignment(null);
    setTitle('');
    setDescription('');
    setDeadline(new Date().toISOString().split('T')[0]);
    setMaxScore(100);
    setActiveTab('editor');
  };

  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setTitle(assignment.title);
    setDescription(assignment.description);
    setDeadline(assignment.deadline);
    setMaxScore(assignment.maxScore);
    setActiveTab('editor');
  };

  const handleSave = () => {
    if (!selectedClass || !title) return;

    const newAssignment: Assignment = {
        id: editingAssignment ? editingAssignment.id : `as${Date.now()}`,
        title,
        description,
        deadline,
        maxScore,
        submissions: editingAssignment ? editingAssignment.submissions : [],
        isActive: true
    };

    const updatedClasses = classrooms.map(c => {
        if (c.id === selectedClassId) {
            const current = c.assignments || [];
            if (editingAssignment) {
                return { ...c, assignments: current.map(a => a.id === editingAssignment.id ? newAssignment : a) };
            } else {
                return { ...c, assignments: [...current, newAssignment] };
            }
        }
        return c;
    });

    onUpdateClassrooms(updatedClasses);
    setActiveTab('list');
    setEditingAssignment(null);
    showToast('Tugas berhasil disimpan', 'success');
  };

  const handleDelete = (id: string) => {
      if (!confirm("Hapus tugas ini? Data pengumpulan siswa juga akan terhapus.")) return;
      const updatedClasses = classrooms.map(c => {
          if (c.id === selectedClassId) {
              return { ...c, assignments: (c.assignments || []).filter(a => a.id !== id) };
          }
          return c;
      });
      onUpdateClassrooms(updatedClasses);
      showToast('Tugas berhasil dihapus', 'info');
  };

  const handleGradeSubmission = () => {
      if (!selectedClass || !editingAssignment || !gradingSubmission) return;

      // 1. Update Assignment Submission Status
      const updatedSubmissions = editingAssignment.submissions.map(sub => {
          if (sub.studentId === gradingSubmission.sid) {
              return { 
                  ...sub, 
                  grade: gradeInput, 
                  feedback: feedbackInput, 
                  status: 'Returned' as const 
              };
          }
          return sub;
      });

      const updatedAssignment = { ...editingAssignment, submissions: updatedSubmissions };

      // 2. Sync to Gradebook (Main Grades Array)
      // Check if assessment column exists for this assignment
      let assessmentId = selectedClass.assessments.find(a => a.assignmentId === editingAssignment.id)?.id;
      let updatedAssessments = [...selectedClass.assessments];

      if (!assessmentId) {
          assessmentId = `a_as_${editingAssignment.id}`; // Simple unique ID
          updatedAssessments.push({
              id: assessmentId,
              title: editingAssignment.title,
              type: 'Tugas',
              maxScore: editingAssignment.maxScore,
              date: editingAssignment.deadline,
              assignmentId: editingAssignment.id
          });
      }

      // Update the grade in the main gradebook
      let updatedGrades = [...selectedClass.grades];
      const gradeIndex = updatedGrades.findIndex(g => g.studentId === gradingSubmission.sid && g.assessmentId === assessmentId);
      
      if (gradeIndex >= 0) {
          updatedGrades[gradeIndex] = { ...updatedGrades[gradeIndex], score: gradeInput };
      } else {
          updatedGrades.push({ studentId: gradingSubmission.sid, assessmentId: assessmentId!, score: gradeInput });
      }

      // Final update to classrooms state
      const updatedClasses = classrooms.map(c => {
          if (c.id === selectedClassId) {
              return { 
                  ...c, 
                  assignments: c.assignments.map(a => a.id === editingAssignment.id ? updatedAssignment : a),
                  assessments: updatedAssessments,
                  grades: updatedGrades
              };
          }
          return c;
      });

      onUpdateClassrooms(updatedClasses);
      setEditingAssignment(updatedAssignment); // Update local state view
      setGradingSubmission(null); // Close modal
      showToast('Nilai berhasil disimpan & disinkronkan', 'success');
  };

  if (!selectedClass) return <div className="p-8">Pilih kelas terlebih dahulu.</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Manajemen Tugas & Proyek</h2>
           <p className="text-slate-500">Buat tugas, terima file siswa, dan beri nilai secara digital.</p>
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
                <h3 className="text-lg font-bold text-slate-700">Daftar Tugas Aktif</h3>
                <button 
                    onClick={handleCreate}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus size={18} /> Buat Tugas Baru
                </button>
            </div>

            <div className="grid gap-4">
                 {(selectedClass.assignments || []).length === 0 ? (
                    <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                        Belum ada tugas dibuat.
                    </div>
                ) : (
                    selectedClass.assignments.map(assign => (
                        <div key={assign.id} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white">
                             <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded uppercase">Tugas</span>
                                        <span className="text-slate-400 text-xs flex items-center gap-1"><Clock size={12}/> Deadline: {new Date(assign.deadline).toLocaleDateString('id-ID')}</span>
                                    </div>
                                    <h4 className="font-bold text-lg text-slate-800">{assign.title}</h4>
                                    <p className="text-sm text-slate-500 mt-1 line-clamp-1">{assign.description}</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                     <button 
                                        onClick={() => { setEditingAssignment(assign); setActiveTab('monitor'); }}
                                        className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 flex items-center gap-2"
                                    >
                                        <CheckCircle size={16} /> Periksa ({assign.submissions.length})
                                    </button>
                                     <button 
                                        onClick={() => handleEdit(assign)}
                                        className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(assign.id)}
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
                        <h3 className="font-bold text-lg">Editor Tugas</h3>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Judul Tugas</label>
                        <input type="text" className="w-full border p-2 rounded" value={title} onChange={e => setTitle(e.target.value)} placeholder="Contoh: Makalah Sejarah" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Deskripsi & Instruksi</label>
                        <textarea className="w-full border p-2 rounded h-32" value={description} onChange={e => setDescription(e.target.value)} placeholder="Jelaskan detail tugas..."></textarea>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                             <label className="block text-sm font-medium text-slate-600 mb-1">Deadline Pengumpulan</label>
                             <input type="date" className="w-full border p-2 rounded" value={deadline} onChange={e => setDeadline(e.target.value)} />
                        </div>
                         <div>
                             <label className="block text-sm font-medium text-slate-600 mb-1">Skor Maksimal</label>
                             <input type="number" className="w-full border p-2 rounded" value={maxScore} onChange={e => setMaxScore(parseInt(e.target.value))} />
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                         <button onClick={handleSave} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700">
                            <Save size={18} /> Simpan Tugas
                        </button>
                    </div>
                </div>
           </div>
      )}

      {activeTab === 'monitor' && editingAssignment && (
           <div className="space-y-6">
                 <button onClick={() => setActiveTab('list')} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-4">
                    <ArrowLeft size={18}/> Kembali ke Daftar
                </button>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Info & QR */}
                    <div className="md:col-span-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                         <h3 className="font-bold text-lg text-slate-800 mb-2">{editingAssignment.title}</h3>
                         <div className="bg-white p-4 rounded-lg shadow-inner border border-slate-100 mb-4">
                            <QRCode value={`https://edutrack.app/assignment/${editingAssignment.id}`} size={120} />
                         </div>
                         <div className="w-full flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200 text-sm mb-4">
                            <LinkIcon size={14} className="text-slate-400 shrink-0"/>
                            <span className="truncate text-slate-500">edutrack.app/assignment/{editingAssignment.id}</span>
                         </div>
                         <button 
                             onClick={() => onNavigateToStudentPortal(editingAssignment.id, selectedClass.id)}
                             className="w-full bg-indigo-50 text-indigo-600 py-2 rounded-lg hover:bg-indigo-100 font-medium text-sm"
                         >
                            Buka Portal Siswa (Simulasi)
                        </button>
                    </div>

                    {/* Submissions List */}
                    <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                             <h3 className="font-bold text-slate-700">Pengumpulan Siswa</h3>
                             <span className="text-sm text-slate-500">Total: {selectedClass.students.length} Siswa</span>
                        </div>
                        <div className="overflow-y-auto max-h-[500px]">
                            {selectedClass.students.map(student => {
                                const submission = editingAssignment.submissions.find(s => s.studentId === student.id);
                                return (
                                    <div key={student.id} className="p-4 border-b border-slate-100 flex items-center justify-between hover:bg-slate-50">
                                         <div className="flex items-center gap-3">
                                             <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                                 {student.name.charAt(0)}
                                             </div>
                                             <div>
                                                 <p className="font-medium text-slate-800">{student.name}</p>
                                                 <p className="text-xs text-slate-500">{student.nis}</p>
                                             </div>
                                         </div>
                                         
                                         <div className="flex items-center gap-4">
                                             {submission ? (
                                                 <>
                                                    <div className="text-right">
                                                        <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                                                            submission.status === 'Returned' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                            {submission.status === 'Returned' ? 'Dinilai' : 'Diserahkan'}
                                                        </span>
                                                        <p className="text-[10px] text-slate-400 mt-1">{new Date(submission.submittedAt).toLocaleDateString()}</p>
                                                    </div>
                                                    
                                                    {submission.grade !== undefined && (
                                                        <div className="font-bold text-lg text-slate-800 w-8 text-center">{submission.grade}</div>
                                                    )}

                                                    <button 
                                                        onClick={() => {
                                                            setGradingSubmission({ sid: student.id, submission });
                                                            setGradeInput(submission.grade || 0);
                                                            setFeedbackInput(submission.feedback || '');
                                                        }}
                                                        className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
                                                    >
                                                        Periksa & Nilai
                                                    </button>
                                                 </>
                                             ) : (
                                                 <span className="text-xs text-slate-400 italic">Belum mengumpulkan</span>
                                             )}
                                         </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
           </div>
      )}

      {/* Grading Modal */}
      {gradingSubmission && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
               <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Penilaian Tugas</h3>
                    
                    <div className="mb-4 bg-slate-50 p-3 rounded border border-slate-200">
                         <p className="text-sm font-bold text-slate-700 mb-2">File / Jawaban Siswa:</p>
                         {gradingSubmission.submission.textResponse && (
                             <p className="text-sm text-slate-600 mb-2 italic">"{gradingSubmission.submission.textResponse}"</p>
                         )}
                         {gradingSubmission.submission.fileUrl && (
                             <a 
                                href={gradingSubmission.submission.fileUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 text-blue-600 hover:underline text-sm"
                             >
                                 <ExternalLink size={14}/> Lihat Lampiran File
                             </a>
                         )}
                    </div>

                    <div className="space-y-3">
                         <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1">Nilai (0-100)</label>
                             <input type="number" className="w-full border p-2 rounded" value={gradeInput} onChange={e => setGradeInput(parseInt(e.target.value))} />
                         </div>
                         <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1">Feedback / Catatan</label>
                             <textarea className="w-full border p-2 rounded h-24" value={feedbackInput} onChange={e => setFeedbackInput(e.target.value)} placeholder="Berikan masukan untuk siswa..."></textarea>
                         </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <button onClick={() => setGradingSubmission(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
                        <button onClick={handleGradeSubmission} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                             <RefreshCw size={16} /> Simpan & Sinkron Nilai
                        </button>
                    </div>
               </div>
          </div>
      )}
    </div>
  );
};

export default AssignmentManager;
