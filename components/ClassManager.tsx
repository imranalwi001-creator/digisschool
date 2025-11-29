
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Classroom, Student } from '../types';
import { Plus, Trash2, UserPlus, Upload, Camera, X, Edit2, Save, School, FileText, Calendar, Award, BarChart2, TrendingUp, TrendingDown, PieChart as PieChartIcon } from 'lucide-react';
import { calculateFinalScore } from '../services/storageService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { useToast } from './Toast';

interface ClassManagerProps {
  classrooms: Classroom[];
  onUpdateClassrooms: (updated: Classroom[]) => void;
}

const ClassManager: React.FC<ClassManagerProps> = ({ classrooms, onUpdateClassrooms }) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(classrooms[0]?.id || '');
  const { showToast } = useToast();
  
  // UI Toggle State
  const [showAnalytics, setShowAnalytics] = useState(true);

  // Modal States
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Classroom | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
  // Detail Modal State
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [teacherNote, setTeacherNote] = useState('');

  // Class Form States
  const [className, setClassName] = useState('');
  const [classGradeLevel, setClassGradeLevel] = useState('VII');
  const [classYear, setClassYear] = useState('2023/2024');
  
  // Student Form States
  const [studentName, setStudentName] = useState('');
  const [studentNIS, setStudentNIS] = useState('');
  const [studentGender, setStudentGender] = useState<'L' | 'P'>('L');
  const [studentPhoto, setStudentPhoto] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedClass = classrooms.find(c => c.id === selectedClassId);

  // --- Analytics Data Preparation ---
  const analyticsData = useMemo(() => {
    if (!selectedClass) return null;

    // 1. Student Scores for Bar Chart (Sorted)
    const studentScores = selectedClass.students.map(s => ({
      name: s.name,
      score: calculateFinalScore(selectedClass, s.id),
      gender: s.gender
    })).sort((a, b) => b.score - a.score); // Highest to Lowest

    // 2. Distribution Data for Pie Chart
    let remedial = 0;
    let passed = 0;
    let excellent = 0;
    let totalScore = 0;

    studentScores.forEach(s => {
      totalScore += s.score;
      if (s.score < 75) remedial++;
      else if (s.score < 90) passed++;
      else excellent++;
    });

    const average = studentScores.length > 0 ? (totalScore / studentScores.length).toFixed(1) : 0;
    const highest = studentScores.length > 0 ? studentScores[0].score : 0;
    const lowest = studentScores.length > 0 ? studentScores[studentScores.length - 1].score : 0;

    const distributionData = [
      { name: 'Remedial (<75)', value: remedial, color: '#ef4444' }, // Red
      { name: 'Lulus (75-89)', value: passed, color: '#f59e0b' },   // Amber
      { name: 'Sangat Baik (≥90)', value: excellent, color: '#10b981' } // Emerald
    ].filter(d => d.value > 0);

    return { studentScores, distributionData, average, highest, lowest };
  }, [selectedClass]);

  // --- Class CRUD ---

  const openAddClassModal = () => {
    setEditingClass(null);
    setClassName('');
    setClassGradeLevel('VII');
    setClassYear('2023/2024');
    setIsClassModalOpen(true);
  };

  const openEditClassModal = () => {
    if (!selectedClass) return;
    setEditingClass(selectedClass);
    setClassName(selectedClass.name);
    setClassGradeLevel(selectedClass.gradeLevel);
    setClassYear(selectedClass.academicYear);
    setIsClassModalOpen(true);
  };

  const handleSaveClass = () => {
    if (!className) return;

    if (editingClass) {
      // Update existing class
      const updated = classrooms.map(c => 
        c.id === editingClass.id 
          ? { ...c, name: className, gradeLevel: classGradeLevel, academicYear: classYear } 
          : c
      );
      onUpdateClassrooms(updated);
      showToast('Data kelas berhasil diperbarui', 'success');
    } else {
      // Create new class
      const newClass: Classroom = {
        id: `c${Date.now()}`,
        name: className,
        gradeLevel: classGradeLevel,
        academicYear: classYear,
        weights: { PH: 20, PTS: 30, PAS: 40, Tugas: 10, Sikap: 0, Keterampilan: 0 },
        students: [],
        assessments: [],
        grades: [],
        attendance: {},
        journals: [],
        exams: [],
        assignments: [],
        questionnaires: []
      };
      onUpdateClassrooms([...classrooms, newClass]);
      setSelectedClassId(newClass.id);
      showToast('Kelas baru berhasil ditambahkan', 'success');
    }
    setIsClassModalOpen(false);
  };

  const handleDeleteClass = (id: string) => {
    if (confirm('Yakin ingin menghapus kelas ini? Semua data siswa dan nilai akan hilang permanen.')) {
      const updated = classrooms.filter(c => c.id !== id);
      onUpdateClassrooms(updated);
      if (selectedClassId === id) setSelectedClassId(updated[0]?.id || '');
      showToast('Kelas berhasil dihapus', 'info');
    }
  };

  // --- Student CRUD ---

  const openAddStudentModal = () => {
    setEditingStudent(null);
    setStudentName('');
    setStudentNIS('');
    setStudentGender('L');
    setStudentPhoto('');
    setIsStudentModalOpen(true);
  };

  const openEditStudentModal = (student: Student) => {
    setEditingStudent(student);
    setStudentName(student.name);
    setStudentNIS(student.nis);
    setStudentGender(student.gender);
    setStudentPhoto(student.photo || '');
    setIsStudentModalOpen(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast("Ukuran foto terlalu besar. Maksimal 2MB.", 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setStudentPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveStudent = () => {
    if (!selectedClass || !studentName || !studentNIS) {
        showToast("Mohon lengkapi Nama dan NIS", 'error');
        return;
    }

    const updatedStudents = [...selectedClass.students];

    if (editingStudent) {
      // Update existing student
      const index = updatedStudents.findIndex(s => s.id === editingStudent.id);
      if (index !== -1) {
        updatedStudents[index] = {
          ...editingStudent,
          name: studentName,
          nis: studentNIS,
          gender: studentGender,
          photo: studentPhoto
        };
      }
      showToast('Data siswa berhasil diperbarui', 'success');
    } else {
      // Add new student
      const newStudent: Student = {
        id: `s${Date.now()}`,
        nis: studentNIS,
        name: studentName,
        gender: studentGender,
        photo: studentPhoto
      };
      updatedStudents.push(newStudent);
      showToast('Siswa baru berhasil ditambahkan', 'success');
    }

    const updatedClasses = classrooms.map(c => 
      c.id === selectedClassId ? { ...c, students: updatedStudents } : c
    );

    onUpdateClassrooms(updatedClasses);
    setIsStudentModalOpen(false);
  };

  const handleDeleteStudent = (studentId: string) => {
     if (!selectedClass) return;
     if (confirm('Hapus siswa ini? Data nilai siswa ini juga akan terhapus.')) {
        const updatedClasses = classrooms.map(c => {
          if (c.id === selectedClassId) {
            return { 
                ...c, 
                students: c.students.filter(s => s.id !== studentId),
                grades: c.grades.filter(g => g.studentId !== studentId) // Clean up grades too
            };
          }
          return c;
        });
        onUpdateClassrooms(updatedClasses);
        showToast('Siswa berhasil dihapus', 'info');
     }
  };

  // --- Student Detail View Logic ---

  const openStudentDetail = (student: Student) => {
    setViewingStudent(student);
    setTeacherNote(student.notes || '');
  };

  const handleSaveNote = () => {
    if (!selectedClass || !viewingStudent) return;
    
    const updatedStudents = selectedClass.students.map(s => 
      s.id === viewingStudent.id ? { ...s, notes: teacherNote } : s
    );

    const updatedClasses = classrooms.map(c => 
      c.id === selectedClassId ? { ...c, students: updatedStudents } : c
    );

    onUpdateClassrooms(updatedClasses);
    setViewingStudent({ ...viewingStudent, notes: teacherNote }); 
    showToast("Catatan berhasil disimpan.", 'success');
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Manajemen Kelas & Siswa</h2>
           <p className="text-slate-500">Kelola data kelas, tahun ajaran, dan daftar siswa.</p>
        </div>
        <button 
          onClick={openAddClassModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={18} /> Tambah Kelas
        </button>
      </header>

      {/* Class Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {classrooms.map(cls => (
          <button
            key={cls.id}
            onClick={() => setSelectedClassId(cls.id)}
            className={`px-4 py-2 rounded-t-lg font-medium whitespace-nowrap transition-colors border-t border-l border-r ${
              selectedClassId === cls.id 
                ? 'bg-white text-indigo-600 border-b-2 border-b-white -mb-[2px] border-slate-200' 
                : 'bg-slate-50 text-slate-500 hover:text-slate-700 border-slate-100'
            }`}
          >
            {cls.name}
          </button>
        ))}
      </div>

      {selectedClass ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Class Header Info */}
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                  <School size={24} />
               </div>
               <div>
                 <h3 className="text-xl font-bold text-slate-800">{selectedClass.name}</h3>
                 <p className="text-sm text-slate-500">Tingkat {selectedClass.gradeLevel} • Tahun Ajaran {selectedClass.academicYear}</p>
               </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setShowAnalytics(!showAnalytics)}
                className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors text-sm font-medium ${showAnalytics ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-slate-600 border-slate-300'}`}
              >
                <BarChart2 size={16} /> Analisis Data
              </button>
              <button onClick={openEditClassModal} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition-colors text-sm font-medium">
                <Edit2 size={16} /> Edit Info
              </button>
              <button onClick={() => handleDeleteClass(selectedClass.id)} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-600 hover:text-red-600 hover:border-red-300 transition-colors text-sm font-medium">
                <Trash2 size={16} /> Hapus
              </button>
            </div>
          </div>

          {/* Analytics Section */}
          {showAnalytics && analyticsData && analyticsData.studentScores.length > 0 && (
             <div className="p-6 bg-slate-50/50 border-b border-slate-200 animate-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Key Stats */}
                    <div className="grid grid-cols-3 lg:grid-cols-1 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-xs text-slate-500 font-bold uppercase">Rata-rata Kelas</p>
                                <p className="text-2xl font-bold text-slate-800">{analyticsData.average}</p>
                            </div>
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><BarChart2 size={20}/></div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-xs text-slate-500 font-bold uppercase">Nilai Tertinggi</p>
                                <p className="text-2xl font-bold text-emerald-600">{analyticsData.highest}</p>
                            </div>
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><TrendingUp size={20}/></div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-xs text-slate-500 font-bold uppercase">Nilai Terendah</p>
                                <p className="text-2xl font-bold text-red-600">{analyticsData.lowest}</p>
                            </div>
                            <div className="p-2 bg-red-50 text-red-600 rounded-lg"><TrendingDown size={20}/></div>
                        </div>
                    </div>

                    {/* Middle: Student Ranking Bar Chart */}
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm lg:col-span-2 flex flex-col">
                        <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                           <Award size={18} className="text-amber-500"/> Peringkat Nilai Siswa
                        </h4>
                        <div className="flex-1 min-h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analyticsData.studentScores} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" domain={[0, 100]} hide />
                                    <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11}} />
                                    <Tooltip 
                                        cursor={{fill: '#f1f5f9'}} 
                                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                    />
                                    <Bar dataKey="score" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20}>
                                        {analyticsData.studentScores.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.score < 75 ? '#ef4444' : entry.score >= 90 ? '#10b981' : '#6366f1'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
                
                {/* Second Row for Distribution */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                        <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                           <PieChartIcon size={18} className="text-indigo-500"/> Distribusi Kelulusan (KKM 75)
                        </h4>
                        <div className="h-48 flex items-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={analyticsData.distributionData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={60}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {analyticsData.distributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                     </div>
                </div>
             </div>
          )}

          <div className="p-4 bg-white flex justify-between items-center border-b border-slate-100">
             <h4 className="font-semibold text-slate-700">Daftar Siswa ({selectedClass.students.length})</h4>
             <button 
                onClick={openAddStudentModal}
                className="bg-indigo-50 border border-indigo-100 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-colors font-medium"
              >
                <UserPlus size={16} /> Tambah Siswa
              </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-sm">
                <tr>
                  <th className="p-4 font-medium">NIS</th>
                  <th className="p-4 font-medium">Siswa</th>
                  <th className="p-4 font-medium">Jenis Kelamin</th>
                  <th className="p-4 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedClass.students.length === 0 ? (
                    <tr>
                        <td colSpan={4} className="p-12 text-center text-slate-400">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                              <UserPlus size={24} />
                            </div>
                            <p>Belum ada siswa di kelas ini.</p>
                          </div>
                        </td>
                    </tr>
                ) : (
                    selectedClass.students.map(student => (
                    <tr 
                      key={student.id} 
                      className="hover:bg-indigo-50/50 group transition-colors cursor-pointer"
                      onClick={() => openStudentDetail(student)}
                    >
                        <td className="p-4 text-slate-600 font-mono text-sm">{student.nis}</td>
                        <td className="p-4 font-medium text-slate-800">
                          <div className="flex items-center gap-3">
                            {student.photo ? (
                              <img 
                                src={student.photo} 
                                alt={student.name} 
                                className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-200">
                                {student.name.charAt(0)}
                              </div>
                            )}
                            <div>
                                <span className="block">{student.name}</span>
                                <span className="text-[10px] text-slate-400 font-normal">Klik untuk detail</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-slate-600">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${student.gender === 'L' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                            {student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                              onClick={(e) => { e.stopPropagation(); openEditStudentModal(student); }}
                              className="text-slate-400 hover:text-indigo-600 transition-colors p-2 hover:bg-indigo-50 rounded-lg"
                              title="Edit Siswa"
                          >
                              <Edit2 size={18} />
                          </button>
                          <button 
                              onClick={(e) => { e.stopPropagation(); handleDeleteStudent(student.id); }}
                              className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                              title="Hapus Siswa"
                          >
                              <Trash2 size={18} />
                          </button>
                        </div>
                        </td>
                    </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-dashed border-slate-300 flex flex-col items-center gap-3">
            <div className="p-3 bg-slate-100 rounded-full text-slate-400">
               <Plus size={32} />
            </div>
            <p>Silakan buat kelas baru untuk memulai manajemen siswa.</p>
        </div>
      )}

      {/* Class Modal (Create/Edit) */}
      {isClassModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">{editingClass ? 'Edit Kelas' : 'Tambah Kelas Baru'}</h3>
              <button onClick={() => setIsClassModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Kelas</label>
                <input 
                  type="text" 
                  placeholder="Contoh: VII-A"
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tingkat</label>
                  <select 
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={classGradeLevel}
                    onChange={(e) => setClassGradeLevel(e.target.value)}
                  >
                    <option value="VII">Kelas VII</option>
                    <option value="VIII">Kelas VIII</option>
                    <option value="IX">Kelas IX</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tahun Ajaran</label>
                  <input 
                    type="text" 
                    placeholder="2023/2024"
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={classYear}
                    onChange={(e) => setClassYear(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setIsClassModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
              <button onClick={handleSaveClass} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                <Save size={18} /> Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Modal (Create/Edit) */}
       {isStudentModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-lg font-bold">{editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}</h3>
               <button onClick={() => setIsStudentModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                 <X size={20} />
               </button>
            </div>
            
            <div className="space-y-4">
                {/* Photo Upload Section */}
                <div className="flex flex-col items-center justify-center mb-6">
                   <div 
                      className="relative w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-indigo-500 transition-colors group"
                      onClick={() => fileInputRef.current?.click()}
                   >
                      {studentPhoto ? (
                        <img src={studentPhoto} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center text-slate-400 group-hover:text-indigo-500">
                           <Camera size={24} />
                           <span className="text-[10px] mt-1">Upload</span>
                        </div>
                      )}
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <Camera className="text-white" size={24} />
                      </div>
                   </div>
                   <input 
                      type="file" 
                      ref={fileInputRef}
                      className="hidden" 
                      accept="image/*"
                      onChange={handlePhotoUpload}
                   />
                   <p className="text-xs text-slate-500 mt-2">Format: JPG/PNG (Max 2MB)</p>
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Nomor Induk Siswa (NIS)</label>
                   <input 
                    type="text" 
                    placeholder="Contoh: 10293"
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={studentNIS}
                    onChange={(e) => setStudentNIS(e.target.value)}
                  />
                </div>
                
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                   <input 
                    type="text" 
                    placeholder="Contoh: Budi Santoso"
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                  />
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Jenis Kelamin</label>
                   <select 
                      className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                      value={studentGender}
                      onChange={(e) => setStudentGender(e.target.value as 'L'|'P')}
                  >
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                  </select>
                </div>
            </div>

            <div className="flex justify-end gap-2 mt-8">
              <button onClick={() => setIsStudentModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Batal</button>
              <button onClick={handleSaveStudent} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2">
                 <Save size={18} /> Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Details & History Slide-over */}
      {viewingStudent && selectedClass && (
        <div className="fixed inset-0 overflow-hidden z-50" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            {/* Background overlay */}
            <div className="absolute inset-0 bg-slate-900/50 transition-opacity" onClick={() => setViewingStudent(null)}></div>

            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-2xl transform transition-transform duration-500 ease-in-out sm:duration-700 bg-white shadow-xl flex flex-col h-full animate-in slide-in-from-right">
                
                {/* Header */}
                <div className="bg-indigo-600 px-4 py-6 sm:px-6 shadow-md z-10 shrink-0">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center overflow-hidden shrink-0">
                             {viewingStudent.photo ? (
                               <img src={viewingStudent.photo} alt={viewingStudent.name} className="w-full h-full object-cover" />
                             ) : (
                               <span className="text-2xl font-bold text-white">{viewingStudent.name.charAt(0)}</span>
                             )}
                        </div>
                        <div className="text-white">
                            <h2 className="text-xl font-bold leading-6" id="slide-over-title">
                              {viewingStudent.name}
                            </h2>
                            <p className="text-indigo-100 text-sm mt-1">
                                {viewingStudent.nis} • {viewingStudent.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                            </p>
                        </div>
                    </div>
                    <div className="ml-3 flex h-7 items-center">
                      <button
                        type="button"
                        className="rounded-md bg-indigo-600 text-indigo-200 hover:text-white focus:outline-none"
                        onClick={() => setViewingStudent(null)}
                      >
                        <span className="sr-only">Close panel</span>
                        <X size={24} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto bg-slate-50">
                    <div className="px-4 py-6 sm:px-6 space-y-8">
                        
                        {/* Grade History Section */}
                        <section>
                           <div className="flex items-center justify-between mb-4">
                               <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                   <Award className="text-amber-500" size={20} />
                                   Riwayat Penilaian
                               </h3>
                               <div className="text-sm text-slate-500">
                                   Rata-rata: <span className="font-bold text-slate-800">{calculateFinalScore(selectedClass, viewingStudent.id)}</span>
                               </div>
                           </div>
                           
                           <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                               <table className="w-full text-sm text-left">
                                   <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                       <tr>
                                           <th className="px-4 py-3">Penilaian</th>
                                           <th className="px-4 py-3 text-center">Tipe</th>
                                           <th className="px-4 py-3 text-right">Tanggal</th>
                                           <th className="px-4 py-3 text-center">Nilai</th>
                                       </tr>
                                   </thead>
                                   <tbody className="divide-y divide-slate-100">
                                       {selectedClass.assessments.length === 0 ? (
                                           <tr><td colSpan={4} className="p-4 text-center text-slate-400">Belum ada data.</td></tr>
                                       ) : (
                                           selectedClass.assessments.map(assessment => {
                                               const grade = selectedClass.grades.find(g => g.studentId === viewingStudent.id && g.assessmentId === assessment.id);
                                               return (
                                                   <tr key={assessment.id} className="hover:bg-slate-50 transition-colors">
                                                       <td className="px-4 py-3 font-medium text-slate-700">{assessment.title}</td>
                                                       <td className="px-4 py-3 text-center">
                                                           <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 uppercase tracking-wide">
                                                               {assessment.type}
                                                           </span>
                                                       </td>
                                                       <td className="px-4 py-3 text-right text-slate-500 text-xs">
                                                           {new Date(assessment.date).toLocaleDateString('id-ID')}
                                                       </td>
                                                       <td className={`px-4 py-3 text-center font-bold ${grade ? (grade.score < 75 ? 'text-red-500' : 'text-emerald-600') : 'text-slate-300'}`}>
                                                           {grade ? grade.score : '-'}
                                                       </td>
                                                   </tr>
                                               );
                                           })
                                       )}
                                   </tbody>
                               </table>
                           </div>
                        </section>

                        {/* Teacher Notes Section */}
                        <section>
                             <div className="flex items-center gap-2 mb-3 text-slate-800 font-bold text-lg border-b border-slate-200 pb-2">
                               <FileText className="text-indigo-500" size={20} />
                               <h3>Catatan Guru</h3>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                                <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">
                                    Catatan Pribadi & Observasi
                                </label>
                                <textarea 
                                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none bg-slate-50 focus:bg-white transition-colors h-32"
                                    placeholder="Tulis catatan mengenai perkembangan siswa, sikap, atau hal yang perlu diperhatikan..."
                                    value={teacherNote}
                                    onChange={(e) => setTeacherNote(e.target.value)}
                                ></textarea>
                                <div className="mt-3 flex justify-end">
                                    <button 
                                        onClick={handleSaveNote}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
                                    >
                                        <Save size={16} /> Simpan Catatan
                                    </button>
                                </div>
                            </div>
                        </section>

                    </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassManager;
