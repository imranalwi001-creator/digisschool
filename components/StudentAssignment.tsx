
import React, { useState } from 'react';
import { Classroom, Assignment, AssignmentSubmission } from '../types';
import { ArrowRight, User, Upload, FileText, CheckCircle, Clock, ArrowLeft, ExternalLink } from 'lucide-react';

interface StudentAssignmentProps {
  assignmentId: string;
  classroomId: string;
  classrooms: Classroom[];
  onSubmit: (classroomId: string, updatedAssignment: Assignment) => void;
  onExit: () => void;
}

const StudentAssignment: React.FC<StudentAssignmentProps> = ({ assignmentId, classroomId, classrooms, onSubmit, onExit }) => {
  const [nis, setNis] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentStudentId, setCurrentStudentId] = useState('');
  
  // Submission Form
  const [textResponse, setTextResponse] = useState('');
  const [fileUrl, setFileUrl] = useState('');

  const classroom = classrooms.find(c => c.id === classroomId);
  const assignment = classroom?.assignments.find(a => a.id === assignmentId);

  const existingSubmission = assignment?.submissions.find(s => s.studentId === currentStudentId);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classroom) return;
    
    const student = classroom.students.find(s => s.nis === nis);
    if (student) {
        setCurrentStudentId(student.id);
        setIsLoggedIn(true);
    } else {
        alert("NIS tidak ditemukan.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          if (file.size > 2 * 1024 * 1024) { // 2MB Limit for demo
              alert("File terlalu besar (Maks 2MB)"); 
              return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
              setFileUrl(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSubmit = () => {
      if (!textResponse && !fileUrl) {
          alert("Mohon isi jawaban atau upload file.");
          return;
      }

      if (!assignment || !classroom) return;

      const newSubmission: AssignmentSubmission = {
          studentId: currentStudentId,
          assignmentId: assignment.id,
          textResponse,
          fileUrl,
          submittedAt: new Date().toISOString(),
          status: 'Submitted'
      };

      // Update submissions array
      const updatedSubmissions = assignment.submissions.filter(s => s.studentId !== currentStudentId);
      updatedSubmissions.push(newSubmission);

      const updatedAssignment = { ...assignment, submissions: updatedSubmissions };
      
      onSubmit(classroomId, updatedAssignment);
      alert("Tugas berhasil dikirim!");
  };

  if (!assignment || !classroom) return <div className="p-8 text-center text-red-500">Tugas tidak ditemukan.</div>;

  if (!isLoggedIn) {
     return (
        <div className="min-h-screen bg-emerald-600 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-800">Digisschool Portal Tugas</h1>
                    <p className="text-slate-500 mt-2">Masuk untuk melihat dan mengumpulkan tugas.</p>
                </div>
                
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 mb-6 text-left">
                    <div className="flex items-start gap-3">
                         <FileText className="text-emerald-600 mt-1" size={20} />
                         <div>
                            <h3 className="font-bold text-emerald-900">{assignment.title}</h3>
                            <p className="text-sm text-emerald-700 mt-1">Deadline: {new Date(assignment.deadline).toLocaleDateString()}</p>
                         </div>
                    </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Masukkan NIS</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-slate-400" size={20}/>
                            <input 
                                type="text" 
                                className="w-full pl-10 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                                placeholder="Contoh: 7001"
                                value={nis}
                                onChange={e => setNis(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <button type="submit" className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                        Masuk <ArrowRight size={18} />
                    </button>
                </form>
                <div className="mt-6 text-center">
                    <button onClick={onExit} className="text-sm text-slate-400 hover:text-slate-600">Kembali</button>
                </div>
            </div>
        </div>
     );
  }

  const studentName = classroom.students.find(s => s.id === currentStudentId)?.name;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 md:p-8">
         <div className="w-full max-w-3xl">
             <button onClick={onExit} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 font-medium">
                 <ArrowLeft size={20}/> Kembali ke Dashboard
             </button>

             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                 <div className="bg-emerald-600 p-6 text-white">
                      <h2 className="text-2xl font-bold">{assignment.title}</h2>
                      <div className="flex gap-4 mt-2 text-emerald-100 text-sm">
                          <span className="flex items-center gap-1"><Clock size={16}/> Deadline: {new Date(assignment.deadline).toLocaleDateString('id-ID', {weekday: 'long', day: 'numeric', month: 'long'})}</span>
                          <span>• Poin Maks: {assignment.maxScore}</span>
                      </div>
                 </div>
                 <div className="p-6">
                     <h3 className="font-bold text-slate-700 mb-2">Deskripsi & Instruksi:</h3>
                     <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{assignment.description}</p>
                 </div>
             </div>

             {existingSubmission ? (
                 <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                          <CheckCircle className="text-emerald-500" size={28} />
                          <div>
                              <h3 className="font-bold text-slate-800 text-lg">Tugas Sudah Dikumpulkan</h3>
                              <p className="text-slate-500 text-sm">Diserahkan pada {new Date(existingSubmission.submittedAt).toLocaleString('id-ID')}</p>
                          </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                           <div>
                               <h4 className="font-bold text-slate-700 mb-3">Jawaban Anda</h4>
                               <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                                   {existingSubmission.textResponse && (
                                       <div>
                                           <span className="text-xs font-bold text-slate-400 uppercase">Teks / Link</span>
                                           <p className="text-slate-700 mt-1">{existingSubmission.textResponse}</p>
                                       </div>
                                   )}
                                   {existingSubmission.fileUrl && (
                                       <div>
                                            <span className="text-xs font-bold text-slate-400 uppercase">File Lampiran</span>
                                            <div className="mt-1">
                                                <a href={existingSubmission.fileUrl} target="_blank" className="inline-flex items-center gap-2 text-blue-600 hover:underline font-medium">
                                                    <ExternalLink size={16}/> Lihat File
                                                </a>
                                            </div>
                                       </div>
                                   )}
                               </div>
                           </div>

                           <div>
                               <h4 className="font-bold text-slate-700 mb-3">Status Penilaian</h4>
                               {existingSubmission.status === 'Returned' ? (
                                   <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-indigo-800 font-bold">Nilai Akhir</span>
                                            <span className="text-3xl font-extrabold text-indigo-600">{existingSubmission.grade} <span className="text-sm font-normal text-slate-500">/ {assignment.maxScore}</span></span>
                                        </div>
                                        {existingSubmission.feedback && (
                                            <div className="mt-3 pt-3 border-t border-indigo-100">
                                                <span className="text-xs font-bold text-indigo-400 uppercase">Catatan Guru</span>
                                                <p className="text-indigo-900 mt-1 text-sm italic">"{existingSubmission.feedback}"</p>
                                            </div>
                                        )}
                                   </div>
                               ) : (
                                   <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-amber-700 flex items-center gap-2">
                                       <Clock size={20}/> Menunggu penilaian guru...
                                   </div>
                               )}
                           </div>
                      </div>
                 </div>
             ) : (
                 <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                      <h3 className="font-bold text-slate-800 text-lg mb-4">Form Pengumpulan</h3>
                      
                      <div className="space-y-4">
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Jawaban Teks / Link Google Drive</label>
                              <textarea 
                                  className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none h-32 resize-none"
                                  placeholder="Tulis jawaban atau tempel link dokumen disini..."
                                  value={textResponse}
                                  onChange={(e) => setTextResponse(e.target.value)}
                              ></textarea>
                          </div>
                          
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Upload File (Dokumen/Gambar)</label>
                              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-emerald-50 hover:border-emerald-400 transition-colors cursor-pointer relative">
                                  <input 
                                    type="file" 
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={handleFileUpload}
                                  />
                                  {fileUrl ? (
                                      <div className="text-center">
                                          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                              <CheckCircle size={24}/>
                                          </div>
                                          <p className="text-emerald-700 font-medium text-sm">File Siap Upload</p>
                                          <p className="text-xs text-slate-400 mt-1">Klik untuk ganti</p>
                                      </div>
                                  ) : (
                                      <div className="text-center text-slate-400">
                                          <Upload size={32} className="mx-auto mb-2"/>
                                          <p className="text-sm font-medium">Klik atau geser file kesini</p>
                                          <p className="text-xs mt-1">Maks. 2MB</p>
                                      </div>
                                  )}
                              </div>
                          </div>

                          <div className="pt-4">
                              <button 
                                onClick={handleSubmit}
                                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                              >
                                  Kirim Tugas
                              </button>
                          </div>
                      </div>
                 </div>
             )}
         </div>
    </div>
  );
};

export default StudentAssignment;
