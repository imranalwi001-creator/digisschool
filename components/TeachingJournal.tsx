
import React, { useState, useRef } from 'react';
import { Classroom, JournalEntry } from '../types';
import { Book, Plus, Clock, Users, Camera, X, Save, Calendar, FileText, CheckCircle, Clock as ClockIcon, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { useToast } from './Toast';

interface TeachingJournalProps {
  classrooms: Classroom[];
  onUpdateClassrooms: (updated: Classroom[]) => void;
}

const TeachingJournal: React.FC<TeachingJournalProps> = ({ classrooms, onUpdateClassrooms }) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(classrooms[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  // Form State
  const [formData, setFormData] = useState<Partial<JournalEntry>>({
    date: new Date().toISOString().split('T')[0],
    timeStart: '07:30',
    timeEnd: '09:00',
    topic: '',
    subTopic: '',
    method: 'Diskusi Kelompok',
    notes: '',
    absentSummary: '',
    status: 'Terlaksana',
    photo: ''
  });

  const selectedClass = classrooms.find(c => c.id === selectedClassId);

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      timeStart: '07:30',
      timeEnd: '09:00',
      topic: '',
      subTopic: '',
      method: 'Diskusi Kelompok',
      notes: '',
      absentSummary: '',
      status: 'Terlaksana',
      photo: ''
    });
  };

  const handleInputChange = (field: keyof JournalEntry, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
        handleInputChange('photo', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!selectedClass || !formData.topic || !formData.date) {
      showToast("Mohon lengkapi Tanggal dan Materi Pokok.", 'error');
      return;
    }

    const newEntry: JournalEntry = {
      id: `j${Date.now()}`,
      date: formData.date!,
      timeStart: formData.timeStart || '07:30',
      timeEnd: formData.timeEnd || '09:00',
      topic: formData.topic!,
      subTopic: formData.subTopic || '',
      method: formData.method || 'Ceramah',
      notes: formData.notes || '',
      absentSummary: formData.absentSummary || '-',
      photo: formData.photo,
      status: (formData.status as any) || 'Terlaksana'
    };

    const updatedClasses = classrooms.map(c => {
      if (c.id === selectedClassId) {
        const currentJournals = c.journals || [];
        // Sort by date descending
        const newJournals = [newEntry, ...currentJournals].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return { ...c, journals: newJournals };
      }
      return c;
    });

    onUpdateClassrooms(updatedClasses);
    setIsModalOpen(false);
    resetForm();
    showToast('Jurnal mengajar berhasil disimpan', 'success');
  };

  // Group journals by month for better visualization
  const journalsByMonth = (selectedClass?.journals || []).reduce((acc, journal) => {
    const monthYear = new Date(journal.date).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    if (!acc[monthYear]) acc[monthYear] = [];
    acc[monthYear].push(journal);
    return acc;
  }, {} as Record<string, JournalEntry[]>);

  if (!selectedClass) return <div className="p-8">Silakan buat kelas terlebih dahulu.</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
       <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Jurnal Mengajar</h2>
           <p className="text-slate-500">Rekam jejak aktivitas pembelajaran di kelas.</p>
        </div>
        <div className="flex gap-2">
            <select 
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
                {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button 
                onClick={() => { resetForm(); setIsModalOpen(true); }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm shadow-indigo-200 transition-colors"
            >
                <Plus size={18} /> Isi Jurnal Baru
            </button>
        </div>
      </header>

      {/* Main Content: Timeline of Journals */}
      <div className="space-y-8">
        {(selectedClass.journals && selectedClass.journals.length > 0) ? (
            Object.entries(journalsByMonth).map(([month, entries]: [string, JournalEntry[]]) => (
                <div key={month} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">{month}</h3>
                    <div className="grid gap-6">
                        {entries.map(journal => (
                            <div key={journal.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col md:flex-row">
                                {/* Date Box */}
                                <div className="bg-indigo-50 p-6 flex flex-col items-center justify-center text-center w-full md:w-32 shrink-0 border-b md:border-b-0 md:border-r border-indigo-100">
                                    <span className="text-3xl font-bold text-indigo-600 leading-none">
                                        {new Date(journal.date).getDate()}
                                    </span>
                                    <span className="text-xs font-bold text-indigo-400 uppercase mt-1">
                                        {new Date(journal.date).toLocaleDateString('id-ID', { weekday: 'short' })}
                                    </span>
                                    <span className="text-xs text-indigo-400">
                                        {new Date(journal.date).toLocaleDateString('id-ID', { month: 'short' })}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="p-5 flex-1 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                                    journal.status === 'Terlaksana' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                                    journal.status === 'Reschedule' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                    'bg-blue-50 text-blue-700 border-blue-100'
                                                }`}>
                                                    {journal.status.toUpperCase()}
                                                </span>
                                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                                    <Clock size={12} /> {journal.timeStart} - {journal.timeEnd}
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-lg text-slate-800">{journal.topic}</h4>
                                            {journal.subTopic && <p className="text-slate-500 text-sm">{journal.subTopic}</p>}
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4 text-sm mt-2">
                                        <div className="space-y-2">
                                            <div className="flex gap-2">
                                                <div className="w-6 shrink-0 text-slate-400"><Book size={16} /></div>
                                                <div>
                                                    <span className="block text-xs text-slate-400">Metode</span>
                                                    <span className="text-slate-700">{journal.method}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="w-6 shrink-0 text-slate-400"><FileText size={16} /></div>
                                                <div>
                                                    <span className="block text-xs text-slate-400">Catatan / Kejadian</span>
                                                    <span className="text-slate-700">{journal.notes || '-'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex gap-2">
                                                <div className="w-6 shrink-0 text-slate-400"><Users size={16} /></div>
                                                <div>
                                                    <span className="block text-xs text-slate-400">Absensi Siswa</span>
                                                    <span className="text-slate-700 font-medium">{journal.absentSummary}</span>
                                                </div>
                                            </div>
                                            {journal.photo && (
                                                 <div className="flex gap-2 mt-2">
                                                    <div className="w-6 shrink-0 text-slate-400"><Camera size={16} /></div>
                                                    <div>
                                                        <span className="block text-xs text-slate-400 mb-1">Dokumentasi / Bukti</span>
                                                        <img src={journal.photo} alt="Bukti" className="h-20 w-auto rounded-lg border border-slate-200 object-cover cursor-pointer hover:scale-105 transition-transform shadow-sm" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))
        ) : (
             <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-4">
                    <Book size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-700">Belum Ada Jurnal</h3>
                <p className="text-slate-500 max-w-md mx-auto mt-2">
                    Mulai catat aktivitas mengajar Anda hari ini untuk administrasi yang lebih rapi.
                </p>
                <button 
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="mt-6 text-indigo-600 font-medium hover:text-indigo-700 hover:underline"
                >
                    + Buat Jurnal Pertama
                </button>
             </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h3 className="text-xl font-bold text-slate-800">Isi Jurnal Mengajar</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Section 1: Waktu & Status */}
                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 text-slate-400" size={18} />
                                <input 
                                    type="date" 
                                    value={formData.date}
                                    onChange={(e) => handleInputChange('date', e.target.value)}
                                    className="w-full pl-10 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Jam Pelajaran</label>
                            <div className="flex gap-2 items-center">
                                <input 
                                    type="time" 
                                    value={formData.timeStart}
                                    onChange={(e) => handleInputChange('timeStart', e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                                <span className="text-slate-400">-</span>
                                <input 
                                    type="time" 
                                    value={formData.timeEnd}
                                    onChange={(e) => handleInputChange('timeEnd', e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Status Pelaksanaan</label>
                            <select 
                                value={formData.status}
                                onChange={(e) => handleInputChange('status', e.target.value)}
                                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="Terlaksana">Terlaksana</option>
                                <option value="Reschedule">Reschedule</option>
                                <option value="Tugas Mandiri">Tugas Mandiri</option>
                            </select>
                        </div>
                    </div>

                    {/* Section 2: Materi */}
                    <div className="space-y-4 border-t border-slate-100 pt-4">
                        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2"><Book size={16}/> Materi Pembelajaran</h4>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Materi Pokok / Kompetensi Dasar (KD)</label>
                            <input 
                                type="text" 
                                placeholder="Contoh: Teks Eksplanasi"
                                value={formData.topic}
                                onChange={(e) => handleInputChange('topic', e.target.value)}
                                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Sub Materi / Topik Bahasan</label>
                                <input 
                                    type="text" 
                                    placeholder="Contoh: Struktur Teks"
                                    value={formData.subTopic}
                                    onChange={(e) => handleInputChange('subTopic', e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembelajaran</label>
                                <select 
                                    value={formData.method}
                                    onChange={(e) => handleInputChange('method', e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="Ceramah">Ceramah</option>
                                    <option value="Diskusi Kelompok">Diskusi Kelompok</option>
                                    <option value="Presentasi">Presentasi</option>
                                    <option value="Project Based Learning">Project Based Learning</option>
                                    <option value="Demonstrasi">Demonstrasi</option>
                                    <option value="Tanya Jawab">Tanya Jawab</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Catatan & Absensi */}
                    <div className="space-y-4 border-t border-slate-100 pt-4">
                         <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2"><FileText size={16}/> Evaluasi & Absensi</h4>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Catatan / Kejadian Khusus</label>
                            <textarea 
                                placeholder="Contoh: Siswa sangat aktif, namun LCD proyektor bermasalah."
                                value={formData.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                className="w-full border border-slate-300 rounded-lg p-2 h-20 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                            ></textarea>
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Ringkasan Ketidakhadiran (Sakit/Izin/Alpa)</label>
                            <input 
                                type="text" 
                                placeholder="Contoh: Budi (S), Ani (I), Dedi (A)"
                                value={formData.absentSummary}
                                onChange={(e) => handleInputChange('absentSummary', e.target.value)}
                                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                            <p className="text-xs text-slate-400 mt-1">Kosongkan jika semua hadir.</p>
                         </div>
                    </div>

                    {/* Section 4: Foto / Bukti */}
                    <div className="space-y-4 border-t border-slate-100 pt-4">
                        <div className="flex justify-between items-center">
                            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                <Camera size={16}/> Dokumentasi & Bukti Kejadian
                            </h4>
                            <span className="text-xs text-slate-400">Opsional</span>
                        </div>
                        
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                            <p className="text-xs text-slate-500 mb-3 flex items-start gap-2">
                                <AlertTriangle size={14} className="mt-0.5 text-amber-500 shrink-0" />
                                <span>Upload foto kegiatan belajar atau <b>bukti kendala/pelanggaran</b> yang terjadi di kelas sebagai arsip digital.</span>
                            </p>

                            <div className="flex items-center gap-4">
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full md:w-1/2 h-40 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all group bg-white"
                                >
                                    {formData.photo ? (
                                        <div className="relative w-full h-full p-2">
                                            <img src={formData.photo} alt="Preview" className="h-full w-full object-contain rounded" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs rounded backdrop-blur-sm">
                                                <ImageIcon size={16} className="mr-1" /> Ganti Foto
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-sm">
                                                <Camera size={20} />
                                            </div>
                                            <span className="text-sm font-medium text-slate-600">Upload Foto / Bukti</span>
                                            <span className="text-xs text-slate-400 mt-1">Maks. 2MB (JPG/PNG)</span>
                                        </>
                                    )}
                                </div>
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                />
                                
                                {/* Tips List */}
                                <div className="hidden md:block flex-1 space-y-2 text-xs text-slate-500 bg-white p-3 rounded-lg border border-slate-100">
                                    <p className="font-semibold text-slate-700">📸 Contoh Dokumentasi:</p>
                                    <ul className="list-disc list-inside space-y-1 ml-1 text-slate-600">
                                        <li>Suasana diskusi kelompok</li>
                                        <li>Hasil karya siswa di papan tulis</li>
                                        <li><span className="text-amber-600 font-medium">Bukti kerusakan fasilitas</span> (LCD, AC, Kursi)</li>
                                        <li><span className="text-amber-600 font-medium">Pelanggaran siswa</span> (Tidur, Seragam)</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <button 
                        onClick={() => setIsModalOpen(false)} 
                        className="px-6 py-2.5 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition-all"
                    >
                        Batal
                    </button>
                    <button 
                        onClick={handleSave}
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all"
                    >
                        <Save size={18} /> Simpan Jurnal
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default TeachingJournal;
