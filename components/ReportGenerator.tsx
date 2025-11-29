
import React, { useState, useEffect } from 'react';
import { Classroom, Student, SchoolProfile } from '../types';
import { FileDown, Printer, ArrowLeft, Search, User, RefreshCw, Save } from 'lucide-react';
import { loadSchoolProfile } from '../services/storageService';

interface ReportGeneratorProps {
  classrooms: Classroom[];
}

// Interface for the local editable state
interface EditableReportData {
  studentName: string;
  studentNis: string;
  className: string;
  semester: string;
  academicYear: string;
  notes: string;
  date: string;
  teacherName: string;
  teacherNip: string;
  headmasterName: string;
  headmasterNip: string;
  grades: {
    key: string;
    label: string;
    kkm: number;
    score: number | string;
    predicate: string;
    description: string;
  }[];
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ classrooms }) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(classrooms[0]?.id || '');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Editable State
  const [reportData, setReportData] = useState<EditableReportData | null>(null);
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile | null>(null);

  const selectedClass = classrooms.find(c => c.id === selectedClassId);

  // Filter students
  const filteredStudents = selectedClass?.students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.nis.includes(searchTerm)
  ) || [];

  const selectedStudent = selectedClass?.students.find(s => s.id === selectedStudentId);

  useEffect(() => {
      setSchoolProfile(loadSchoolProfile());
  }, []);

  const assessmentTypes = [
      { key: 'PH', label: 'Penilaian Harian' },
      { key: 'PTS', label: 'Penilaian Tengah Semester' },
      { key: 'PAS', label: 'Penilaian Akhir Semester' },
      { key: 'Tugas', label: 'Tugas / Proyek' },
      { key: 'Sikap', label: 'Sikap & Karakter' },
      { key: 'Keterampilan', label: 'Keterampilan / Praktik' },
  ];

  // Helper: Get Predicate
  const getPredicate = (score: number) => {
      if (score >= 92) return { grade: 'A', desc: 'Sangat Baik' };
      if (score >= 83) return { grade: 'B', desc: 'Baik' };
      if (score >= 75) return { grade: 'C', desc: 'Cukup' };
      return { grade: 'D', desc: 'Kurang' };
  };

  // Helper: Get Average Score by Type for a Student
  const getScoreByType = (studentId: string, type: string) => {
      if (!selectedClass) return 0;
      
      const assessments = selectedClass.assessments.filter(a => a.type === type);
      if (assessments.length === 0) return 0;

      let total = 0;
      let count = 0;

      assessments.forEach(ass => {
          const grade = selectedClass.grades.find(g => g.assessmentId === ass.id && g.studentId === studentId);
          if (grade) {
              total += grade.score;
              count++;
          }
      });

      return count > 0 ? Math.round(total / count) : 0;
  };

  // Initialize or Reset Report Data when student changes
  useEffect(() => {
    if (selectedClass && selectedStudent) {
        generateInitialData();
    }
  }, [selectedStudent, selectedClass, schoolProfile]);

  const generateInitialData = () => {
      if (!selectedClass || !selectedStudent) return;

      const generatedGrades = assessmentTypes.map(type => {
          const score = getScoreByType(selectedStudent.id, type.key);
          const pred = getPredicate(score);
          return {
              key: type.key,
              label: type.label,
              kkm: 75,
              score: score > 0 ? score : 0,
              predicate: score > 0 ? pred.grade : '-',
              description: score > 0 ? pred.desc : '-'
          };
      });

      setReportData({
          studentName: selectedStudent.name,
          studentNis: selectedStudent.nis,
          className: selectedClass.name,
          semester: 'Ganjil',
          academicYear: selectedClass.academicYear,
          notes: selectedStudent.notes || "Tingkatkan terus prestasi belajarmu. Pertahankan sikap disiplin dan rajin membaca.",
          date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
          teacherName: 'Imran Alwi, S.Pd',
          teacherNip: '19850101 201001 1 001',
          headmasterName: schoolProfile?.headmaster || 'Dr. H. Ahmad Fauzi, M.Pd',
          headmasterNip: schoolProfile?.headmasterNip || '19700505 199503 1 002',
          grades: generatedGrades
      });
  };

  const handleUpdateField = (field: keyof EditableReportData, value: any) => {
      if (reportData) {
          setReportData({ ...reportData, [field]: value });
      }
  };

  const handleUpdateGrade = (index: number, field: 'score' | 'predicate' | 'description', value: string) => {
      if (reportData) {
          const newGrades = [...reportData.grades];
          newGrades[index] = { ...newGrades[index], [field]: value };
          setReportData({ ...reportData, grades: newGrades });
      }
  };

  const handlePrint = () => {
    window.print();
  };

  // --- VIEW: LIST OF STUDENTS ---
  if (!selectedStudentId) {
    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Laporan Hasil Belajar</h2>
                    <p className="text-slate-500">Pilih siswa untuk melihat, mengedit, dan mencetak rapor.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                     <select 
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                        className="border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 no-print">
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-3 text-slate-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Cari nama siswa atau NIS..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredStudents.map(student => (
                        <div 
                            key={student.id} 
                            onClick={() => setSelectedStudentId(student.id)}
                            className="p-4 border border-slate-200 rounded-xl hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer bg-white group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 group-hover:border-indigo-500">
                                    {student.photo ? (
                                        <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="text-slate-400 group-hover:text-indigo-500" size={24} />
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 group-hover:text-indigo-600">{student.name}</h4>
                                    <p className="text-sm text-slate-500">NIS: {student.nis}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredStudents.length === 0 && (
                        <div className="col-span-full text-center py-10 text-slate-400">
                            Siswa tidak ditemukan.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
  }

  // --- VIEW: REPORT CARD (RAPOR) ---
  if (!selectedClass || !selectedStudent || !reportData) return null;

  return (
    <div className="max-w-4xl mx-auto">
        {/* Toolbar (Hidden when printing) */}
        <div className="flex justify-between items-center mb-8 no-print sticky top-0 bg-slate-50 py-4 z-10">
            <button 
                onClick={() => setSelectedStudentId(null)}
                className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-medium transition-colors"
            >
                <ArrowLeft size={20} /> Kembali
            </button>
            <div className="flex gap-2">
                <button 
                    onClick={generateInitialData}
                    className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-50"
                    title="Kembalikan data ke perhitungan sistem"
                >
                    <RefreshCw size={18} /> Reset Data
                </button>
                <button 
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                >
                    <Printer size={18} /> Cetak / Download PDF
                </button>
            </div>
        </div>

        {/* REPORT CARD CONTAINER (A4 Style) */}
        <div className="bg-white p-8 md:p-12 shadow-xl print:shadow-none print:p-0 print:w-full mx-auto print:text-black" style={{ minHeight: '297mm' }}>
            
            {/* HEADER */}
            <div className="flex items-center gap-6 mb-8 border-b-2 border-slate-800 pb-6">
                 {schoolProfile?.logoUrl ? (
                     <img src={schoolProfile.logoUrl} alt="Logo" className="w-24 h-24 object-contain" />
                 ) : (
                     <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 border border-slate-200 print:border-slate-800">
                         <span className="text-xs text-slate-400 font-bold">Logo</span>
                     </div>
                 )}
                 <div className="text-center flex-1">
                     <h1 className="text-3xl font-extrabold text-slate-800 tracking-wide uppercase">{schoolProfile?.name || "DIGISS BOARDING SCHOOL"}</h1>
                     <p className="text-sm text-slate-600 mt-1">{schoolProfile?.address || "Alamat Sekolah"}</p>
                     <h2 className="text-lg text-slate-800 font-bold mt-4 uppercase border-t border-slate-300 pt-2 inline-block px-4">Laporan Capaian Hasil Belajar Siswa</h2>
                 </div>
            </div>

            {/* STUDENT INFO & PHOTO */}
            <div className="flex justify-between items-start mb-10">
                <div className="space-y-3 flex-1 w-full">
                    <div className="grid grid-cols-[140px_10px_1fr] items-center">
                        <span className="text-slate-500 font-medium">Nama Peserta Didik</span>
                        <span className="text-slate-800">:</span>
                        <input 
                            value={reportData.studentName} 
                            onChange={(e) => handleUpdateField('studentName', e.target.value)}
                            className="font-bold text-slate-900 uppercase bg-transparent border-b border-dashed border-slate-300 print:border-none w-full outline-none focus:border-indigo-500"
                        />
                    </div>
                    <div className="grid grid-cols-[140px_10px_1fr] items-center">
                        <span className="text-slate-500 font-medium">NIS / NISN</span>
                        <span className="text-slate-800">:</span>
                        <input 
                            value={reportData.studentNis} 
                            onChange={(e) => handleUpdateField('studentNis', e.target.value)}
                            className="font-mono text-slate-900 bg-transparent border-b border-dashed border-slate-300 print:border-none w-full outline-none focus:border-indigo-500"
                        />
                    </div>
                    <div className="grid grid-cols-[140px_10px_1fr] items-center">
                        <span className="text-slate-500 font-medium">Kelas</span>
                        <span className="text-slate-800">:</span>
                        <input 
                            value={reportData.className} 
                            onChange={(e) => handleUpdateField('className', e.target.value)}
                            className="font-semibold text-slate-900 bg-transparent border-b border-dashed border-slate-300 print:border-none w-full outline-none focus:border-indigo-500"
                        />
                    </div>
                    <div className="grid grid-cols-[140px_10px_1fr] items-center">
                        <span className="text-slate-500 font-medium">Semester / T.A</span>
                        <span className="text-slate-800">:</span>
                        <div className="flex items-center gap-2">
                            <input 
                                value={reportData.semester} 
                                onChange={(e) => handleUpdateField('semester', e.target.value)}
                                className="text-slate-900 bg-transparent border-b border-dashed border-slate-300 print:border-none w-24 outline-none focus:border-indigo-500"
                            />
                            <span>/</span>
                            <input 
                                value={reportData.academicYear} 
                                onChange={(e) => handleUpdateField('academicYear', e.target.value)}
                                className="text-slate-900 bg-transparent border-b border-dashed border-slate-300 print:border-none w-24 outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>
                </div>

                {/* 3x4 Photo Box */}
                <div className="w-[113px] h-[151px] border border-slate-300 bg-slate-50 flex items-center justify-center ml-8 shrink-0 overflow-hidden shadow-sm print:border-slate-800">
                    {selectedStudent.photo ? (
                        <img src={selectedStudent.photo} alt="Foto Siswa" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-slate-300 text-xs font-medium">Foto 3x4</span>
                    )}
                </div>
            </div>

            {/* TABLE SECTION A */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-3 border-l-4 border-indigo-600 pl-3 print:border-black">
                    <h3 className="font-bold text-lg text-slate-800">A. Nilai Akademik & Sikap</h3>
                </div>

                <table className="w-full border-collapse border border-slate-300 text-sm print:border-black">
                    <thead>
                        <tr className="bg-slate-100 text-slate-700 print:bg-gray-200 print:text-black">
                            <th className="border border-slate-300 print:border-black p-3 text-left w-1/2">Aspek Penilaian</th>
                            <th className="border border-slate-300 print:border-black p-3 text-center w-24">KKM</th>
                            <th className="border border-slate-300 print:border-black p-3 text-center w-24">Nilai</th>
                            <th className="border border-slate-300 print:border-black p-3 text-left">Predikat & Deskripsi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.grades.map((grade, index) => (
                            <tr key={grade.key}>
                                <td className="border border-slate-300 print:border-black p-2 text-slate-800 font-medium">
                                    {grade.label}
                                </td>
                                <td className="border border-slate-300 print:border-black p-2 text-center text-slate-500">
                                    {grade.kkm}
                                </td>
                                <td className="border border-slate-300 print:border-black p-0">
                                    <input 
                                        type="text"
                                        value={grade.score}
                                        onChange={(e) => handleUpdateGrade(index, 'score', e.target.value)}
                                        className="w-full h-full text-center font-bold text-slate-900 text-base bg-transparent outline-none focus:bg-indigo-50"
                                    />
                                </td>
                                <td className="border border-slate-300 print:border-black p-2 text-slate-700">
                                    <div className="flex items-center gap-2">
                                        <input 
                                            value={grade.predicate}
                                            onChange={(e) => handleUpdateGrade(index, 'predicate', e.target.value)}
                                            className="w-8 font-bold text-center bg-transparent border-b border-dashed border-slate-300 print:border-none outline-none focus:border-indigo-500"
                                        />
                                        <span className="text-slate-400">(</span>
                                        <input 
                                            value={grade.description}
                                            onChange={(e) => handleUpdateGrade(index, 'description', e.target.value)}
                                            className="flex-1 text-slate-500 bg-transparent border-b border-dashed border-slate-300 print:border-none outline-none focus:border-indigo-500"
                                        />
                                        <span className="text-slate-400">)</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* SECTION B: CATATAN */}
            <div className="mb-12">
                <div className="flex items-center gap-2 mb-3 border-l-4 border-indigo-600 pl-3 print:border-black">
                    <h3 className="font-bold text-lg text-slate-800">B. Catatan Wali Kelas</h3>
                </div>
                <textarea
                    value={reportData.notes}
                    onChange={(e) => handleUpdateField('notes', e.target.value)}
                    className="w-full border border-slate-300 print:border-black p-4 rounded min-h-[100px] text-slate-700 italic bg-slate-50/50 print:bg-transparent outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
            </div>

            {/* SIGNATURES */}
            <div className="flex justify-between mt-20 text-center break-inside-avoid">
                <div className="space-y-20">
                    <p className="text-slate-600">Mengetahui,<br/>Orang Tua / Wali</p>
                    <div className="border-b border-slate-400 w-48 mx-auto print:border-black"></div>
                </div>
                
                <div className="space-y-4">
                    <p className="text-slate-600">
                        Jakarta, <input value={reportData.date} onChange={e => handleUpdateField('date', e.target.value)} className="bg-transparent border-b border-dashed border-slate-300 print:border-none w-40 text-center outline-none" /><br/>
                        Wali Kelas
                    </p>
                    <div className="mt-16">
                        <input 
                            value={reportData.teacherName} 
                            onChange={e => handleUpdateField('teacherName', e.target.value)}
                            className="font-bold text-slate-800 underline text-center w-full bg-transparent outline-none block"
                        />
                        <div className="flex justify-center items-center gap-1 text-sm text-slate-500">
                            NIP. <input value={reportData.teacherNip} onChange={e => handleUpdateField('teacherNip', e.target.value)} className="bg-transparent outline-none w-40 text-center" />
                        </div>
                    </div>
                </div>
            </div>
            
            {/* HEADMASTER SIGNATURE */}
             <div className="mt-12 text-center break-inside-avoid">
                 <p className="text-slate-600 mb-20">Mengetahui,<br/>Kepala Sekolah</p>
                 <div>
                    <input 
                        value={reportData.headmasterName} 
                        onChange={e => handleUpdateField('headmasterName', e.target.value)}
                        className="font-bold text-slate-800 underline text-center w-full bg-transparent outline-none block"
                    />
                    <div className="flex justify-center items-center gap-1 text-sm text-slate-500">
                        NIP. <input value={reportData.headmasterNip} onChange={e => handleUpdateField('headmasterNip', e.target.value)} className="bg-transparent outline-none w-40 text-center" />
                    </div>
                </div>
             </div>

        </div>
    </div>
  );
};

export default ReportGenerator;
