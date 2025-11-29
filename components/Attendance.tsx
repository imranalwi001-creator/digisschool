
import React, { useState, useEffect, useMemo } from 'react';
import { Classroom, AttendanceRecord } from '../types';
import { Calendar, Check, Save, UserCheck, AlertCircle, PieChart as PieIcon, ChevronLeft, ChevronRight, FileText, XCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { useToast } from './Toast';

interface AttendanceProps {
  classrooms: Classroom[];
  onUpdateClassrooms: (updated: Classroom[]) => void;
}

type StatusType = 'H' | 'S' | 'I' | 'A';

const Attendance: React.FC<AttendanceProps> = ({ classrooms, onUpdateClassrooms }) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(classrooms[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<'input' | 'recap'>('input');
  const { showToast } = useToast();
  
  // State buffers
  const [attendanceBuffer, setAttendanceBuffer] = useState<Record<string, StatusType>>({});
  const [attendanceNotesBuffer, setAttendanceNotesBuffer] = useState<Record<string, string>>({});
  
  const [isSaved, setIsSaved] = useState(false);

  const selectedClass = classrooms.find(c => c.id === selectedClassId);

  // Load existing attendance for the selected date into buffer
  useEffect(() => {
    if (selectedClass && selectedDate) {
      const statusBuffer: Record<string, StatusType> = {};
      const notesBuffer: Record<string, string> = {};
      
      selectedClass.students.forEach(student => {
        const records = selectedClass.attendance[student.id] || [];
        const recordToday = records.find(r => r.date === selectedDate);
        if (recordToday) {
          statusBuffer[student.id] = recordToday.status;
          notesBuffer[student.id] = recordToday.note || '';
        } else {
            // Default null/undefined handling handled in render
        }
      });
      setAttendanceBuffer(statusBuffer);
      setAttendanceNotesBuffer(notesBuffer);
      setIsSaved(true); 
    }
  }, [selectedClassId, selectedDate, selectedClass]);

  const handleStatusChange = (studentId: string, status: StatusType) => {
    setAttendanceBuffer(prev => ({ ...prev, [studentId]: status }));
    setIsSaved(false);
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setAttendanceNotesBuffer(prev => ({ ...prev, [studentId]: note }));
    setIsSaved(false);
  };

  const markAllPresent = () => {
    if (!selectedClass) return;
    const newStatusBuffer: Record<string, StatusType> = {};
    const newNotesBuffer: Record<string, string> = {};
    
    selectedClass.students.forEach(s => {
      newStatusBuffer[s.id] = 'H';
      newNotesBuffer[s.id] = ''; // Clear notes if marking all present
    });
    
    setAttendanceBuffer(newStatusBuffer);
    setAttendanceNotesBuffer(newNotesBuffer);
    setIsSaved(false);
  };

  const saveAttendance = () => {
    if (!selectedClass) return;

    const updatedClasses = classrooms.map(c => {
      if (c.id === selectedClassId) {
        const newAttendance = { ...c.attendance };
        
        // Ensure every student has an array initialized
        c.students.forEach(s => {
          if (!newAttendance[s.id]) newAttendance[s.id] = [];
        });

        Object.entries(attendanceBuffer).forEach(([studentId, status]) => {
          let studentRecords = [...(newAttendance[studentId] || [])];
          const note = attendanceNotesBuffer[studentId] || '';
          
          const existingIndex = studentRecords.findIndex(r => r.date === selectedDate);

          if (existingIndex >= 0) {
            // Update existing record
            studentRecords[existingIndex] = { date: selectedDate, status, note };
          } else {
            // Add new record
            studentRecords.push({ date: selectedDate, status, note });
          }
          newAttendance[studentId] = studentRecords;
        });

        return { ...c, attendance: newAttendance };
      }
      return c;
    });

    onUpdateClassrooms(updatedClasses);
    setIsSaved(true);
    showToast('Data absensi berhasil disimpan', 'success');
  };

  const getStatusColor = (status: StatusType, isSelected: boolean) => {
    if (isSelected) {
        switch (status) {
          case 'H': return 'bg-emerald-500 text-white shadow-md shadow-emerald-200 ring-2 ring-emerald-500 ring-offset-2';
          case 'S': return 'bg-blue-500 text-white shadow-md shadow-blue-200 ring-2 ring-blue-500 ring-offset-2';
          case 'I': return 'bg-amber-500 text-white shadow-md shadow-amber-200 ring-2 ring-amber-500 ring-offset-2';
          case 'A': return 'bg-red-500 text-white shadow-md shadow-red-200 ring-2 ring-red-500 ring-offset-2';
        }
    }
    // Inactive state
    return 'bg-white text-slate-400 border border-slate-200 hover:border-slate-300 hover:bg-slate-50';
  };

  // Helper for Row Background Color
  const getRowStyle = (status: StatusType | undefined) => {
      switch (status) {
          case 'S': return 'bg-blue-50/60 border-l-4 border-l-blue-500';
          case 'I': return 'bg-amber-50/60 border-l-4 border-l-amber-500';
          case 'A': return 'bg-red-50/60 border-l-4 border-l-red-500';
          case 'H': return 'bg-white border-l-4 border-l-emerald-500'; // Active present
          default: return 'bg-white border-l-4 border-l-transparent'; // Not marked yet
      }
  };

  // Statistics for the Pie Chart (Today)
  const dailyStats = useMemo(() => {
    const counts = { H: 0, S: 0, I: 0, A: 0, Unmarked: 0 };
    if (selectedClass) {
      selectedClass.students.forEach(s => {
        const status = attendanceBuffer[s.id];
        if (status) counts[status]++;
        else counts.Unmarked++;
      });
    }
    return [
      { name: 'Hadir', value: counts.H, color: '#10b981' },
      { name: 'Sakit', value: counts.S, color: '#3b82f6' },
      { name: 'Izin', value: counts.I, color: '#f59e0b' },
      { name: 'Alpa', value: counts.A, color: '#ef4444' },
    ].filter(item => item.value > 0);
  }, [attendanceBuffer, selectedClass]);

  // Statistics for Recap Table (All Time)
  const recapStats = useMemo(() => {
    if (!selectedClass) return [];
    return selectedClass.students.map(student => {
      const records = selectedClass.attendance[student.id] || [];
      const counts = { H: 0, S: 0, I: 0, A: 0 };
      records.forEach(r => { counts[r.status]++; });
      const total = records.length;
      const presencePercentage = total > 0 ? Math.round((counts.H / total) * 100) : 0;
      
      return { ...student, counts, total, presencePercentage };
    });
  }, [selectedClass]);

  if (!selectedClass) return <div className="p-8">Silakan buat kelas terlebih dahulu.</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto h-full flex flex-col">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Absensi Siswa</h2>
           <p className="text-slate-500">Kelola kehadiran dan rekapitulasi absensi.</p>
        </div>
        <div className="flex gap-2">
            <select 
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
            >
                {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
        </div>
      </header>

      {/* Top Stats Area (Only visible in Input tab for context) */}
      {activeTab === 'input' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-center justify-between animate-in fade-in duration-300">
           <div className="flex-1">
              <h3 className="font-bold text-slate-700 mb-1">Ringkasan Hari Ini</h3>
              <p className="text-sm text-slate-500 mb-4 flex items-center gap-2">
                 <Calendar size={14}/>
                 {new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <div className="flex gap-4 flex-wrap">
                 <div className="px-4 py-3 bg-white rounded-xl border border-slate-100 shadow-sm flex-1 min-w-[100px] flex items-center gap-3">
                    <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
                    <div>
                        <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Hadir</span>
                        <span className="text-2xl font-bold text-slate-700">{dailyStats.find(s => s.name === 'Hadir')?.value || 0}</span>
                    </div>
                 </div>
                 <div className="px-4 py-3 bg-white rounded-xl border border-slate-100 shadow-sm flex-1 min-w-[100px] flex items-center gap-3">
                    <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                    <div>
                        <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Sakit</span>
                        <span className="text-2xl font-bold text-slate-700">{dailyStats.find(s => s.name === 'Sakit')?.value || 0}</span>
                    </div>
                 </div>
                 <div className="px-4 py-3 bg-white rounded-xl border border-slate-100 shadow-sm flex-1 min-w-[100px] flex items-center gap-3">
                    <div className="w-2 h-8 bg-amber-500 rounded-full"></div>
                    <div>
                        <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Izin</span>
                        <span className="text-2xl font-bold text-slate-700">{dailyStats.find(s => s.name === 'Izin')?.value || 0}</span>
                    </div>
                 </div>
                 <div className="px-4 py-3 bg-white rounded-xl border border-slate-100 shadow-sm flex-1 min-w-[100px] flex items-center gap-3">
                    <div className="w-2 h-8 bg-red-500 rounded-full"></div>
                    <div>
                        <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Alpa</span>
                        <span className="text-2xl font-bold text-slate-700">{dailyStats.find(s => s.name === 'Alpa')?.value || 0}</span>
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="w-40 h-40 hidden md:block shrink-0">
              {dailyStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                        data={dailyStats}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={55}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                    >
                        {dailyStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    </PieChart>
                </ResponsiveContainer>
              ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs text-center border-2 border-dashed border-slate-100 rounded-full">
                      Belum ada data
                  </div>
              )}
           </div>
        </div>
      )}

      {/* Tabs and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center border-b border-slate-200 pb-0 gap-4">
         <div className="flex gap-1">
             <button 
                onClick={() => setActiveTab('input')}
                className={`px-5 py-2.5 rounded-t-xl font-medium text-sm transition-all ${activeTab === 'input' ? 'bg-white text-indigo-600 border border-b-0 border-slate-200 shadow-[0_-2px_4px_rgba(0,0,0,0.02)] relative top-[1px]' : 'bg-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
             >
                Input Harian
             </button>
             <button 
                onClick={() => setActiveTab('recap')}
                className={`px-5 py-2.5 rounded-t-xl font-medium text-sm transition-all ${activeTab === 'recap' ? 'bg-white text-indigo-600 border border-b-0 border-slate-200 shadow-[0_-2px_4px_rgba(0,0,0,0.02)] relative top-[1px]' : 'bg-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
             >
                Laporan Rekapitulasi
             </button>
         </div>

         {activeTab === 'input' && (
             <div className="flex items-center gap-2 mb-2 md:mb-0 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                 <button onClick={() => {
                     const d = new Date(selectedDate);
                     d.setDate(d.getDate() - 1);
                     setSelectedDate(d.toISOString().split('T')[0]);
                 }} className="p-2 hover:bg-indigo-50 hover:text-indigo-600 rounded-md text-slate-500 transition-colors"><ChevronLeft size={18}/></button>
                 
                 <div className="relative border-l border-r border-slate-100 px-2">
                     <input 
                        type="date" 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="pl-2 pr-0 py-1 text-sm outline-none text-slate-700 font-bold bg-transparent cursor-pointer"
                     />
                 </div>

                 <button onClick={() => {
                     const d = new Date(selectedDate);
                     d.setDate(d.getDate() + 1);
                     setSelectedDate(d.toISOString().split('T')[0]);
                 }} className="p-2 hover:bg-indigo-50 hover:text-indigo-600 rounded-md text-slate-500 transition-colors"><ChevronRight size={18}/></button>
             </div>
         )}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl rounded-tl-none shadow-sm border border-slate-200 flex-1 overflow-hidden flex flex-col min-h-[500px]">
          
          {activeTab === 'input' ? (
              <>
                <div className="px-6 py-4 bg-white border-b border-slate-100 flex justify-between items-center sticky top-0 z-20 shadow-[0_4px_10px_rgba(0,0,0,0.03)]">
                   <div className="text-sm text-slate-500">
                      Total Siswa: <span className="font-bold text-slate-800 text-base">{selectedClass.students.length}</span>
                   </div>
                   <div className="flex gap-3">
                      <button 
                          onClick={markAllPresent}
                          className="px-4 py-2 bg-white border border-emerald-200 text-emerald-600 hover:bg-emerald-50 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
                      >
                          <UserCheck size={18} /> <span className="hidden sm:inline">Semua Hadir</span>
                      </button>
                      <button 
                          onClick={saveAttendance}
                          disabled={isSaved}
                          className={`px-6 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
                              isSaved 
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:shadow-xl'
                          }`}
                      >
                          {isSaved ? <Check size={18} /> : <Save size={18} />}
                          {isSaved ? 'Tersimpan' : 'Simpan'}
                      </button>
                   </div>
                </div>

                <div className="overflow-auto flex-1 bg-slate-50/50">
                   <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold sticky top-0 z-10 shadow-sm">
                          <tr>
                             <th className="p-5 w-20 border-b border-slate-200">NIS</th>
                             <th className="p-5 border-b border-slate-200">Nama Siswa</th>
                             <th className="p-5 text-center border-b border-slate-200 w-[420px]">Status Kehadiran</th>
                          </tr>
                      </thead>
                      <tbody className="text-sm">
                          {selectedClass.students.map((student) => {
                             const status = attendanceBuffer[student.id];
                             const note = attendanceNotesBuffer[student.id];
                             const isAbsent = status && status !== 'H';

                             return (
                                 <tr key={student.id} className={`transition-all duration-200 ${getRowStyle(status)} hover:shadow-md`}>
                                     <td className="p-5 font-mono text-slate-500 align-middle border-b border-slate-100/50">{student.nis}</td>
                                     <td className="p-5 font-medium text-slate-800 align-middle border-b border-slate-100/50">
                                        <div className="flex flex-col">
                                            <span>{student.name}</span>
                                            {status === 'S' && <span className="text-[10px] text-blue-600 font-bold mt-0.5">SAKIT</span>}
                                            {status === 'I' && <span className="text-[10px] text-amber-600 font-bold mt-0.5">IZIN</span>}
                                            {status === 'A' && <span className="text-[10px] text-red-600 font-bold mt-0.5">ALPA</span>}
                                        </div>
                                     </td>
                                     <td className="p-4 align-middle border-b border-slate-100/50">
                                         <div className="flex flex-col items-center gap-3">
                                            {/* Status Buttons */}
                                            <div className="flex justify-center bg-white p-1.5 rounded-full shadow-sm border border-slate-200 gap-1">
                                                {(['H', 'S', 'I', 'A'] as StatusType[]).map((type) => (
                                                    <button
                                                        key={type}
                                                        onClick={() => handleStatusChange(student.id, type)}
                                                        className={`w-10 h-10 rounded-full font-bold text-sm transition-all duration-200 flex items-center justify-center ${getStatusColor(type, status === type)}`}
                                                        title={type === 'H' ? 'Hadir' : type === 'S' ? 'Sakit' : type === 'I' ? 'Izin' : 'Alpa'}
                                                    >
                                                        {status === type && <Check size={16} strokeWidth={3} />}
                                                        {status !== type && type}
                                                    </button>
                                                ))}
                                            </div>
                                            
                                            {/* Note Input */}
                                            {isAbsent && (
                                                <div className="w-full max-w-xs animate-in zoom-in-95 slide-in-from-top-2 duration-300">
                                                    <div className={`relative flex items-center bg-white rounded-lg border focus-within:ring-2 focus-within:ring-offset-1 transition-all
                                                        ${status === 'S' ? 'border-blue-200 focus-within:ring-blue-400' : 
                                                          status === 'I' ? 'border-amber-200 focus-within:ring-amber-400' : 
                                                          'border-red-200 focus-within:ring-red-400'}`
                                                    }>
                                                        <div className={`pl-3 pr-2 py-2 ${
                                                            status === 'S' ? 'text-blue-400' : 
                                                            status === 'I' ? 'text-amber-400' : 'text-red-400'
                                                        }`}>
                                                            <FileText size={16} />
                                                        </div>
                                                        <input 
                                                            type="text"
                                                            value={note || ''}
                                                            onChange={(e) => handleNoteChange(student.id, e.target.value)}
                                                            placeholder={status === 'S' ? "Sakit apa?" : status === 'I' ? "Keperluan apa?" : "Keterangan"}
                                                            className="w-full pr-3 py-2 text-sm outline-none bg-transparent placeholder-slate-400 text-slate-700"
                                                            autoFocus
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                         </div>
                                     </td>
                                 </tr>
                             )
                          })}
                      </tbody>
                   </table>
                </div>
              </>
          ) : (
              // RECAP TAB
              <div className="flex-1 flex flex-col">
                 <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                        <PieIcon size={20} />
                    </div>
                    <h3 className="font-bold text-slate-700">Rekapitulasi Kehadiran Semester Ini</h3>
                 </div>
                 <div className="overflow-auto flex-1">
                    <table className="w-full text-left border-collapse">
                       <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold sticky top-0 z-10">
                           <tr>
                              <th className="p-4 border-b w-16 text-center">No</th>
                              <th className="p-4 border-b">Nama Siswa</th>
                              <th className="p-4 border-b text-center w-24 bg-emerald-50 text-emerald-700 border-l border-r border-slate-200">Hadir</th>
                              <th className="p-4 border-b text-center w-24 bg-blue-50 text-blue-700 border-r border-slate-200">Sakit</th>
                              <th className="p-4 border-b text-center w-24 bg-amber-50 text-amber-700 border-r border-slate-200">Izin</th>
                              <th className="p-4 border-b text-center w-24 bg-red-50 text-red-700 border-r border-slate-200">Alpa</th>
                              <th className="p-4 border-b text-center w-32">% Kehadiran</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100 text-sm">
                           {recapStats.map((stat, index) => (
                               <tr key={stat.id} className={`hover:bg-slate-50 ${stat.presencePercentage < 80 ? 'bg-red-50/20' : ''}`}>
                                   <td className="p-4 text-slate-400 text-center font-mono">{index + 1}</td>
                                   <td className="p-4 font-medium text-slate-800">
                                      {stat.name}
                                      {stat.presencePercentage < 80 && (
                                         <div className="mt-1 inline-flex items-center text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-bold border border-red-200" title="Kehadiran rendah">
                                            <AlertCircle size={10} className="mr-1" /> Warning
                                         </div>
                                      )}
                                   </td>
                                   <td className="p-4 text-center font-bold text-emerald-600 bg-emerald-50/30 border-l border-r border-slate-100">{stat.counts.H}</td>
                                   <td className="p-4 text-center font-bold text-blue-600 bg-blue-50/30 border-r border-slate-100">{stat.counts.S}</td>
                                   <td className="p-4 text-center font-bold text-amber-600 bg-amber-50/30 border-r border-slate-100">{stat.counts.I}</td>
                                   <td className="p-4 text-center font-bold text-red-600 bg-red-50/30 border-r border-slate-100">{stat.counts.A}</td>
                                   <td className="p-4 text-center font-bold text-slate-800">
                                       <div className="flex flex-col items-center justify-center gap-1">
                                           <span className="text-sm">{stat.presencePercentage}%</span>
                                           <div className="w-full max-w-[80px] bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                                               <div 
                                                  className={`h-full rounded-full transition-all duration-500 ${stat.presencePercentage >= 90 ? 'bg-emerald-500' : stat.presencePercentage >= 80 ? 'bg-amber-500' : 'bg-red-500'}`} 
                                                  style={{ width: `${stat.presencePercentage}%` }}
                                               ></div>
                                           </div>
                                       </div>
                                   </td>
                               </tr>
                           ))}
                       </tbody>
                    </table>
                 </div>
              </div>
          )}
      </div>
    </div>
  );
};

export default Attendance;
