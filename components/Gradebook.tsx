
import React, { useState, useMemo, useEffect } from 'react';
import { Classroom, Assessment, AssessmentType, ClassWeight } from '../types';
import { Plus, Settings, X, AlertCircle, CheckCircle, Trash2, Calendar, TrendingUp, Users, BarChart3, Award, ChevronDown } from 'lucide-react';
import { calculateFinalScore } from '../services/storageService';
import { useToast } from './Toast';

interface GradebookProps {
  classrooms: Classroom[];
  onUpdateClassrooms: (updated: Classroom[]) => void;
}

const Gradebook: React.FC<GradebookProps> = ({ classrooms, onUpdateClassrooms }) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(classrooms[0]?.id || '');
  const { showToast } = useToast();
  const [isAddAssessmentOpen, setIsAddAssessmentOpen] = useState(false);
  const [isWeightsOpen, setIsWeightsOpen] = useState(false);
  
  // Dropdown Menu State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // State for tracking which cell is being edited
  const [editingCell, setEditingCell] = useState<{ studentId: string; assessmentId: string } | null>(null);
  
  // Local state for buffering weight changes before saving
  const [tempWeights, setTempWeights] = useState<ClassWeight | null>(null);

  // New Assessment Form
  const [newAssessmentTitle, setNewAssessmentTitle] = useState('');
  const [newAssessmentType, setNewAssessmentType] = useState<AssessmentType>('PH');

  const selectedClass = classrooms.find(c => c.id === selectedClassId);

  // Initialize selectedClassId if needed
  useEffect(() => {
    if (!selectedClassId && classrooms.length > 0) {
        setSelectedClassId(classrooms[0].id);
    }
  }, [classrooms, selectedClassId]);

  // Calculate total weight for Main UI indicator (from saved data)
  const savedTotalWeight = useMemo(() => {
    if (!selectedClass) return 0;
    return (Object.values(selectedClass.weights) as number[]).reduce((sum, val) => sum + val, 0);
  }, [selectedClass]);

  // Calculate total weight for Modal UI (from temp data)
  const tempTotalWeight = useMemo(() => {
    if (!tempWeights) return 0;
    return (Object.values(tempWeights) as number[]).reduce((sum, val) => sum + val, 0);
  }, [tempWeights]);

  // --- Statistics for Visualization ---
  const classStats = useMemo(() => {
    if (!selectedClass || selectedClass.students.length === 0) return { avg: 0, passRate: 0, highest: 0 };
    
    let totalScore = 0;
    let passedCount = 0;
    let highest = 0;

    selectedClass.students.forEach(s => {
        const score = calculateFinalScore(selectedClass, s.id);
        totalScore += score;
        if (score >= 75) passedCount++;
        if (score > highest) highest = score;
    });

    return {
        avg: parseFloat((totalScore / selectedClass.students.length).toFixed(1)),
        passRate: Math.round((passedCount / selectedClass.students.length) * 100),
        highest
    };
  }, [selectedClass]);

  // Column Averages
  const columnStats = useMemo(() => {
    if (!selectedClass) return {};
    const stats: Record<string, number> = {};
    
    selectedClass.assessments.forEach(ass => {
        let sum = 0;
        let count = 0;
        selectedClass.grades.forEach(g => {
            if (g.assessmentId === ass.id) {
                sum += g.score;
                count++;
            }
        });
        stats[ass.id] = count > 0 ? parseFloat((sum / count).toFixed(1)) : 0;
    });
    return stats;
  }, [selectedClass]);

  // Helper: Color coding for assessment types
  const getAssessmentColor = (type: AssessmentType) => {
    switch (type) {
        case 'PH': return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700' };
        case 'PTS': return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700' };
        case 'PAS': return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700' };
        case 'Tugas': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700' };
        case 'Sikap': return { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', badge: 'bg-pink-100 text-pink-700' };
        case 'Keterampilan': return { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', badge: 'bg-cyan-100 text-cyan-700' };
        default: return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', badge: 'bg-slate-100 text-slate-700' };
    }
  };

  // Handlers
  const handleAddAssessment = () => {
    if (!selectedClass || !newAssessmentTitle) return;
    const newAss: Assessment = {
        id: `a${Date.now()}`,
        title: newAssessmentTitle,
        type: newAssessmentType,
        maxScore: 100,
        date: new Date().toISOString().split('T')[0]
    };
    
    const updatedClasses = classrooms.map(c => {
        if (c.id === selectedClassId) {
            return { ...c, assessments: [...c.assessments, newAss] };
        }
        return c;
    });
    
    onUpdateClassrooms(updatedClasses);
    setNewAssessmentTitle('');
    setIsAddAssessmentOpen(false);
    showToast(`Penilaian "${newAssessmentTitle}" berhasil ditambahkan`, 'success');
  };

  const handleDeleteAssessment = (assessmentId: string) => {
    if (!selectedClass) return;

    const assessmentToDelete = selectedClass.assessments.find(a => a.id === assessmentId);
    const title = assessmentToDelete ? assessmentToDelete.title : 'Penilaian ini';

    const confirmMessage = 
      `⚠️ PERINGATAN HAPUS DATA\n\n` +
      `Anda akan menghapus penilaian: "${title}"\n\n` +
      `Tindakan ini bersifat PERMANEN. Seluruh data nilai siswa yang telah diinput pada kolom ini akan TERHAPUS dan TIDAK DAPAT DIKEMBALIKAN.\n\n` +
      `Apakah Anda yakin ingin melanjutkan?`;

    if (confirm(confirmMessage)) {
        const updatedClasses = classrooms.map(c => {
            if (c.id === selectedClassId) {
                return {
                    ...c,
                    assessments: c.assessments.filter(a => a.id !== assessmentId),
                    grades: c.grades.filter(g => g.assessmentId !== assessmentId)
                };
            }
            return c;
        });
        onUpdateClassrooms(updatedClasses);
        showToast('Penilaian berhasil dihapus', 'info');
    }
  };

  const handleGradeChange = (studentId: string, assessmentId: string, value: string) => {
      const numValue = Math.min(100, Math.max(0, parseInt(value) || 0));
      if (!selectedClass) return;

      const updatedClasses = classrooms.map(c => {
          if (c.id === selectedClassId) {
              const existingGradeIndex = c.grades.findIndex(g => g.studentId === studentId && g.assessmentId === assessmentId);
              let newGrades = [...c.grades];
              
              if (existingGradeIndex >= 0) {
                  newGrades[existingGradeIndex] = { ...newGrades[existingGradeIndex], score: numValue };
              } else {
                  newGrades.push({ studentId, assessmentId, score: numValue });
              }
              return { ...c, grades: newGrades };
          }
          return c;
      });
      onUpdateClassrooms(updatedClasses);
  };

  const getGrade = (studentId: string, assessmentId: string) => {
      return selectedClass?.grades.find(g => g.studentId === studentId && g.assessmentId === assessmentId)?.score ?? '';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur(); // Trigger onBlur to close edit mode
    }
  };

  const openWeightsModal = () => {
      if (selectedClass) {
          setTempWeights({ ...selectedClass.weights });
          setIsWeightsOpen(true);
      }
  };

  const handleTempWeightChange = (type: keyof ClassWeight, value: string) => {
     if(!tempWeights) return;
     const numValue = Math.max(0, parseInt(value) || 0);
     setTempWeights({ ...tempWeights, [type]: numValue });
  };

  const saveWeights = () => {
      if (!selectedClass || !tempWeights) return;
      if (tempTotalWeight !== 100) return; // Validasi strict

      const updatedClasses = classrooms.map(c => {
         if(c.id === selectedClassId) {
             return { ...c, weights: tempWeights };
         }
         return c;
     });
     onUpdateClassrooms(updatedClasses);
     setIsWeightsOpen(false);
     showToast('Pengaturan bobot berhasil disimpan', 'success');
  };

  const weightKeys: (keyof ClassWeight)[] = ['PH', 'PTS', 'PAS', 'Tugas', 'Sikap', 'Keterampilan'];

  if (!selectedClass) return <div className="p-8 text-center text-slate-500">Belum ada kelas. Buat kelas terlebih dahulu.</div>;

  return (
    <div className="space-y-6 h-full flex flex-col">
       <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Buku Nilai</h2>
           <p className="text-slate-500">Input dan kelola nilai siswa secara terpusat.</p>
        </div>
        <div className="flex gap-2 items-center">
            <select 
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm font-medium"
            >
                {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            
            {/* Aksi Penilaian Dropdown */}
            <div className="relative">
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm shadow-indigo-200 transition-colors font-medium"
                >
                    <span>Aksi Penilaian</span>
                    <ChevronDown size={16} />
                    {savedTotalWeight !== 100 && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                    )}
                </button>

                {isMenuOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-1">
                                <button 
                                    onClick={() => { setIsAddAssessmentOpen(true); setIsMenuOpen(false); }}
                                    className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 text-slate-700 font-medium transition-colors rounded-md"
                                >
                                    <div className="bg-indigo-50 p-1.5 rounded text-indigo-600">
                                        <Plus size={16} />
                                    </div>
                                    Tambah Penilaian
                                </button>
                                <button 
                                    onClick={() => { openWeightsModal(); setIsMenuOpen(false); }}
                                    className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 text-slate-700 font-medium transition-colors rounded-md"
                                >
                                    <div className="bg-orange-50 p-1.5 rounded text-orange-600">
                                        <Settings size={16} />
                                    </div>
                                    <span className="flex-1">Atur Bobot</span>
                                    {savedTotalWeight !== 100 && <AlertCircle size={16} className="text-red-500" />}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
      </header>

      {/* Mini Dashboard / Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rata-rata Kelas</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{classStats.avg}</p>
            </div>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                <BarChart3 size={20} />
            </div>
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kelulusan (KKM 75)</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{classStats.passRate}%</p>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <CheckCircle size={20} />
            </div>
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nilai Tertinggi</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{classStats.highest}</p>
            </div>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
                <Award size={20} />
            </div>
         </div>
      </div>

      {/* Grade Table Area */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1 pb-4">
            <table className="w-full text-left border-collapse">
                <thead className="text-xs uppercase tracking-wider sticky top-0 z-30 shadow-sm bg-slate-50">
                    <tr>
                        <th className="p-4 border-b border-r border-slate-200 min-w-[60px] w-[60px] sticky left-0 bg-slate-50 z-40 font-bold text-slate-500">NIS</th>
                        <th className="p-4 border-b border-r border-slate-200 min-w-[300px] sticky left-[60px] bg-slate-50 z-40 font-bold text-slate-500 text-left">Nama Siswa</th>
                        
                        {selectedClass.assessments.map(ass => {
                            const colors = getAssessmentColor(ass.type);
                            return (
                                <th key={ass.id} className={`p-0 min-w-[130px] w-[130px] group relative align-top bg-slate-50 border-b border-slate-200`}>
                                    {/* Color stripe at top */}
                                    <div className={`h-1 w-full ${colors.bg.replace('bg-', 'bg-').replace('50', '400')}`}></div>
                                    
                                    <div className="p-3 flex flex-col items-center gap-1.5 h-full relative">
                                        <div className="flex items-center gap-1.5 w-full justify-center">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${colors.badge} border-transparent`}>
                                                {ass.type}
                                            </span>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteAssessment(ass.id);
                                                }}
                                                className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1 rounded transition-colors absolute right-1 top-2 opacity-0 group-hover:opacity-100"
                                                title="Hapus Kolom"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                        
                                        <span className="text-[11px] text-slate-700 font-bold text-center leading-tight line-clamp-2 w-full px-1 cursor-help" title={ass.title}>
                                            {ass.title}
                                        </span>
                                        
                                        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-auto">
                                            <Calendar size={10} />
                                            {new Date(ass.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                        </span>
                                    </div>

                                    {/* Tooltip */}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-48 bg-slate-800 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl text-left scale-95 group-hover:scale-100 duration-200 origin-top font-sans normal-case tracking-normal">
                                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-800"></div>
                                        <div className="font-bold mb-1 border-b border-slate-600 pb-1">{ass.title}</div>
                                        <div className="text-slate-300 text-[10px]">Tipe: {ass.type}</div>
                                        <div className="text-slate-300 text-[10px]">Tanggal: {new Date(ass.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                    </div>
                                </th>
                            );
                        })}
                        
                        <th className="p-4 border-b border-l border-slate-200 min-w-[100px] text-center sticky right-0 bg-slate-100 z-40 font-bold text-slate-700">
                            Nilai Akhir
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                    {selectedClass.students.map((student) => {
                        const finalScore = calculateFinalScore(selectedClass, student.id);
                        const isBelowKKM = finalScore < 75;

                        return (
                            <tr key={student.id} className={`group transition-colors ${isBelowKKM ? 'hover:bg-red-50' : 'hover:bg-slate-50'}`}>
                                {/* Sticky Student Info */}
                                <td className={`p-3 border-r border-slate-200 sticky left-0 font-mono text-xs text-slate-500 z-20 group-hover:bg-inherit align-middle ${isBelowKKM ? 'bg-red-50/30' : 'bg-white'}`}>
                                    {student.nis}
                                </td>
                                <td className={`p-3 border-r border-slate-200 sticky left-[60px] font-medium text-slate-800 z-20 group-hover:bg-inherit align-middle ${isBelowKKM ? 'bg-red-50/30' : 'bg-white'}`}>
                                    {student.name}
                                </td>
                                
                                {/* Grade Cells */}
                                {selectedClass.assessments.map(ass => {
                                    const isEditing = editingCell?.studentId === student.id && editingCell?.assessmentId === ass.id;
                                    const grade = getGrade(student.id, ass.id);
                                    const hasGrade = grade !== '';
                                    const gradeVal = parseInt(grade as string) || 0;
                                    const isFail = hasGrade && gradeVal < 75;
                                    
                                    return (
                                    <td 
                                        key={ass.id} 
                                        className={`p-1 text-center border-slate-100 cursor-pointer relative group-hover:bg-inherit align-middle ${isBelowKKM ? 'bg-red-50/30' : 'bg-white'}`}
                                        onClick={() => setEditingCell({ studentId: student.id, assessmentId: ass.id })}
                                    >
                                        {isEditing ? (
                                            <input 
                                                autoFocus
                                                type="number" 
                                                min="0" max="100"
                                                className="w-full h-10 text-center bg-white border-2 border-indigo-500 rounded shadow-sm outline-none text-slate-900 font-bold text-base animate-in zoom-in-95 duration-100"
                                                value={grade}
                                                onChange={(e) => handleGradeChange(student.id, ass.id, e.target.value)}
                                                onBlur={() => setEditingCell(null)}
                                                onKeyDown={handleKeyDown}
                                            />
                                        ) : (
                                            <div className={`w-full h-10 flex items-center justify-center rounded transition-all ${
                                                hasGrade 
                                                    ? (isFail ? 'text-red-600 font-bold bg-red-50/50' : 'text-slate-700 font-semibold hover:bg-slate-100') 
                                                    : 'text-slate-300 hover:bg-slate-100'
                                            }`}>
                                                {hasGrade ? grade : '-'}
                                            </div>
                                        )}
                                    </td>
                                    );
                                })}
                                
                                {/* Final Score Cell */}
                                <td className={`p-3 border-l border-slate-200 sticky right-0 text-center font-bold text-base z-20 group-hover:bg-inherit align-middle ${
                                    isBelowKKM ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-800'
                                }`}>
                                    {finalScore}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
                {/* Footer with Averages */}
                <tfoot className="bg-slate-50 border-t border-slate-200 font-semibold text-xs text-slate-600 sticky bottom-0 z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <tr>
                        <td className="p-3 border-r border-slate-200 sticky left-0 bg-slate-50 z-40" colSpan={2}>RATA-RATA KELAS</td>
                        {selectedClass.assessments.map(ass => (
                            <td key={ass.id} className="p-3 text-center bg-slate-50 text-slate-800">
                                {columnStats[ass.id] || '-'}
                            </td>
                        ))}
                        <td className="p-3 text-center border-l border-slate-200 sticky right-0 bg-slate-100 z-40 text-slate-900">
                           {classStats.avg}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
      </div>

      {/* Add Assessment Modal */}
      {isAddAssessmentOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Tambah Penilaian Baru</h3>
                  <button onClick={() => setIsAddAssessmentOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Judul Penilaian</label>
                        <input 
                            type="text" 
                            className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Contoh: Ulangan Harian Bab 1"
                            value={newAssessmentTitle}
                            onChange={(e) => setNewAssessmentTitle(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                        <select 
                            className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={newAssessmentType}
                            onChange={(e) => setNewAssessmentType(e.target.value as AssessmentType)}
                        >
                            <option value="PH">Penilaian Harian (PH)</option>
                            <option value="PTS">PTS</option>
                            <option value="PAS">PAS</option>
                            <option value="Tugas">Tugas</option>
                            <option value="Sikap">Sikap</option>
                            <option value="Keterampilan">Keterampilan</option>
                        </select>
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <button onClick={() => setIsAddAssessmentOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
                    <button onClick={handleAddAssessment} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Simpan</button>
                </div>
            </div>
        </div>
      )}

      {/* Weights Modal */}
      {isWeightsOpen && tempWeights && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 animate-in zoom-in-95 duration-200">
             <div className="flex justify-between items-center mb-6">
                <div>
                   <h3 className="text-xl font-bold text-slate-800">Pengaturan Bobot Nilai</h3>
                   <p className="text-sm text-slate-500">Sesuaikan persentase bobot untuk setiap kategori.</p>
                </div>
                <button onClick={() => setIsWeightsOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
             </div>

             <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {weightKeys.map((type) => (
                   <div key={type} className="flex items-center gap-4">
                      <div className="w-24 font-medium text-slate-700">{type}</div>
                      <div className="flex-1">
                        <input 
                           type="range" 
                           min="0" max="100" 
                           value={tempWeights[type]}
                           onChange={(e) => handleTempWeightChange(type, e.target.value)}
                           className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                      </div>
                      <div className="w-16 relative">
                        <input 
                           type="number"
                           min="0" max="100"
                           value={tempWeights[type]}
                           onChange={(e) => handleTempWeightChange(type, e.target.value)}
                           className="w-full border border-slate-300 rounded px-2 py-1 text-center font-mono text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                        <span className="absolute right-6 top-1.5 text-xs text-slate-400 pointer-events-none">%</span>
                      </div>
                   </div>
                ))}
             </div>

             <div className="mt-8 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-end mb-2">
                   <span className="text-sm font-semibold text-slate-600">Total Bobot</span>
                   <span className={`text-2xl font-bold ${tempTotalWeight === 100 ? 'text-emerald-600' : 'text-slate-800'}`}>
                     {tempTotalWeight}%
                   </span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden mb-2">
                   <div 
                      className={`h-full transition-all duration-300 rounded-full ${
                        tempTotalWeight === 100 ? 'bg-emerald-500' : 
                        tempTotalWeight > 100 ? 'bg-red-500' : 'bg-blue-500'
                      }`} 
                      style={{ width: `${Math.min(100, tempTotalWeight)}%` }}
                   ></div>
                </div>

                {/* Validation Message */}
                {tempTotalWeight !== 100 ? (
                   <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg mt-3">
                      <AlertCircle size={16} />
                      <span>Total bobot harus tepat 100%. Saat ini: {tempTotalWeight}%</span>
                   </div>
                ) : (
                   <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 p-3 rounded-lg mt-3">
                      <CheckCircle size={16} />
                      <span>Konfigurasi bobot valid (100%).</span>
                   </div>
                )}

                <div className="flex justify-end gap-2 mt-6">
                    <button 
                       onClick={() => setIsWeightsOpen(false)} 
                       className="px-6 py-2.5 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition-all"
                    >
                       Batal
                    </button>
                    <button 
                       onClick={saveWeights}
                       disabled={tempTotalWeight !== 100}
                       className={`px-6 py-2.5 rounded-lg font-medium text-white shadow-lg shadow-indigo-200 transition-all ${
                          tempTotalWeight === 100 
                          ? 'bg-indigo-600 hover:bg-indigo-700' 
                          : 'bg-slate-400 cursor-not-allowed opacity-50'
                       }`}
                    >
                       <Settings size={18} className="mr-2 inline" /> Simpan Perubahan
                    </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gradebook;
