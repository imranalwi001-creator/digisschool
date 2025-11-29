
import React, { useState } from 'react';
import { GraduationCap, BarChart2, CheckCircle, FileText, ArrowRight, ShieldCheck, Zap, MessageCircle, User, ThumbsUp, MessageSquare, Clock } from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
  onNavigateToForum: () => void;
  onStudentAccess: (type: 'exam' | 'assignment' | 'questionnaire', id: string, nis: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, onNavigateToForum, onStudentAccess }) => {
  const [accessCode, setAccessCode] = useState('');
  const [nis, setNis] = useState('');

  const handleStudentSubmit = () => {
      if (!accessCode || !nis) {
          alert("Mohon isi Kode Akses dan NIS.");
          return;
      }
      // Determine type based on prefix (ex, as, qz)
      if (accessCode.startsWith('ex')) {
          onStudentAccess('exam', accessCode, nis);
      } else if (accessCode.startsWith('as')) {
          onStudentAccess('assignment', accessCode, nis);
      } else if (accessCode.startsWith('qz')) {
          onStudentAccess('questionnaire', accessCode, nis);
      } else {
          alert("Kode akses tidak dikenali. Pastikan kode benar (ex..., as..., qz...).");
      }
  };

  // Existing mock data for display
  const forumTopics = [
    {
      id: 1,
      title: "Strategi Penerapan Projek P5 dalam Kurikulum Merdeka",
      author: "Bu Ani S.Pd",
      role: "Guru Senior",
      category: "Kurikulum",
      replies: 42,
      likes: 156,
      time: "2 jam yang lalu",
      avatarColor: "bg-pink-100 text-pink-600"
    },
    {
      id: 2,
      title: "Cara efektif mengatasi siswa yang kurang motivasi pasca pandemi?",
      author: "Pak Budi",
      role: "Wali Kelas",
      category: "Pedagogik",
      replies: 89,
      likes: 342,
      time: "5 jam yang lalu",
      avatarColor: "bg-blue-100 text-blue-600"
    },
    {
      id: 3,
      title: "Sharing Rubrik Penilaian Keterampilan Abad 21",
      author: "Dinda Pratiwi",
      role: "Admin Sekolah",
      category: "Administrasi",
      replies: 24,
      likes: 98,
      time: "1 hari yang lalu",
      avatarColor: "bg-emerald-100 text-emerald-600"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-indigo-600 to-blue-600 text-white p-2 rounded-lg">
                <GraduationCap size={24} />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-blue-600">
                Digisschool
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
                <a href="#features" className="hover:text-indigo-600 transition-colors">Fitur</a>
                <button onClick={onNavigateToForum} className="hover:text-indigo-600 transition-colors">Forum</button>
                <a href="#" className="hover:text-indigo-600 transition-colors">Bantuan</a>
            </div>

            <button 
              onClick={onLoginClick}
              className="px-5 py-2 bg-slate-900 text-white rounded-full font-medium text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
            >
              Masuk Dashboard
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-20 right-10 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Platform Pendidikan Masa Depan
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
            Manajemen Sekolah <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Lebih Cerdas & Terintegrasi</span>
          </h1>
          
          <p className="mt-4 text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Digisschool membantu sekolah mengelola nilai, absensi, ujian online, dan pelaporan otomatis dengan teknologi terkini.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={onLoginClick}
              className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2"
            >
              Mulai Sekarang <ArrowRight size={20} />
            </button>
            <a href="#features" className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center">
              Pelajari Fitur
            </a>
          </div>

          {/* Student Portal Access */}
          <div className="mt-12 max-w-md mx-auto bg-white/80 backdrop-blur rounded-2xl p-6 border border-indigo-100 shadow-xl shadow-indigo-100/50">
             <p className="text-slate-500 font-bold mb-4 uppercase text-xs tracking-wider">Akses Portal Siswa</p>
             <div className="space-y-3">
                 <input 
                    type="text" 
                    placeholder="Kode Ujian / Tugas / Kuesioner" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-center bg-white" 
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                 />
                 <input 
                    type="text" 
                    placeholder="Nomor Induk Siswa (NIS)" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-center bg-white" 
                    value={nis}
                    onChange={(e) => setNis(e.target.value)}
                 />
                 <button 
                    onClick={handleStudentSubmit}
                    className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-700 transition-colors"
                 >
                    Mulai Mengerjakan
                 </button>
             </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
               <p className="text-3xl font-bold text-indigo-600">50+</p>
               <p className="text-sm text-slate-500 font-medium">Sekolah Mitra</p>
            </div>
            <div>
               <p className="text-3xl font-bold text-indigo-600">10k+</p>
               <p className="text-sm text-slate-500 font-medium">Siswa Terdata</p>
            </div>
             <div>
               <p className="text-3xl font-bold text-indigo-600">100%</p>
               <p className="text-sm text-slate-500 font-medium">Aman & Terenkripsi</p>
            </div>
             <div>
               <p className="text-3xl font-bold text-indigo-600">24/7</p>
               <p className="text-sm text-slate-500 font-medium">Akses Online</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Fitur Unggulan</h2>
            <p className="text-slate-500 mt-2">Semua yang Anda butuhkan untuk manajemen sekolah modern.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <BarChart2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Analisis Data Cerdas</h3>
              <p className="text-slate-600 leading-relaxed">
                Dapatkan wawasan mendalam tentang performa siswa. Analisis kekuatan dan kelemahan secara otomatis.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                <CheckCircle size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Buku Nilai Digital</h3>
              <p className="text-slate-600 leading-relaxed">
                Input nilai PH, PTS, PAS dengan mudah. Penghitungan bobot dan nilai akhir dilakukan secara otomatis.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
                <FileText size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">E-Rapor Otomatis</h3>
              <p className="text-slate-600 leading-relaxed">
                Cetak rapor semester dan laporan analisis kompetensi dalam format PDF yang rapi dan standar pendidikan.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 transition-transform">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Bank Soal & CBT</h3>
              <p className="text-slate-600 leading-relaxed">
                Buat ujian online (Pilihan Ganda/Esai), generate QR Code, dan nilai otomatis masuk ke buku nilai.
              </p>
            </div>

            {/* Feature 5 */}
             <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Absensi & Jurnal</h3>
              <p className="text-slate-600 leading-relaxed">
                Pantau kehadiran siswa dan catat jurnal harian mengajar lengkap dengan dokumentasi foto.
              </p>
            </div>

             {/* Feature 6 */}
             <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all group flex flex-col justify-center items-center text-center">
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Tugas & Proyek</h3>
              <p className="text-slate-600 mb-6">Kelola pengumpulan tugas dan berikan feedback digital secara langsung.</p>
              <button onClick={onLoginClick} className="px-6 py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors w-full">
                  Login Admin
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Forum Community Section */}
      <section id="forum" className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                <div className="max-w-2xl">
                    <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <MessageCircle className="text-indigo-600" size={32} />
                        Forum Diskusi Guru
                    </h2>
                    <p className="text-slate-500 mt-4 text-lg">
                        Bergabunglah dengan komunitas pendidik untuk berbagi praktik baik, solusi mengajar, dan diskusi seputar perkembangan kurikulum.
                    </p>
                </div>
                <button 
                    onClick={onNavigateToForum}
                    className="px-6 py-3 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition-colors flex items-center gap-2 shrink-0"
                >
                    <MessageSquare size={18} /> Masuk ke Forum
                </button>
            </div>

            <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
                {forumTopics.map((topic) => (
                    <div 
                        key={topic.id} 
                        onClick={onNavigateToForum}
                        className="border border-slate-200 rounded-2xl p-6 hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer bg-slate-50/50 group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 uppercase tracking-wide">
                                {topic.category}
                            </span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                <Clock size={12} /> {topic.time}
                            </span>
                        </div>
                        
                        <h3 className="text-lg font-bold text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">
                            {topic.title}
                        </h3>

                        <div className="flex items-center gap-3 mb-6">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${topic.avatarColor}`}>
                                {topic.author.charAt(0)}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-700">{topic.author}</p>
                                <p className="text-xs text-slate-500">{topic.role}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                            <div className="flex gap-4 text-slate-500 text-sm">
                                <span className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
                                    <MessageSquare size={16} /> {topic.replies}
                                </span>
                                <span className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
                                    <ThumbsUp size={16} /> {topic.likes}
                                </span>
                            </div>
                            <span className="text-indigo-600 font-bold text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                Baca <ArrowRight size={14} />
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 text-center">
                <button onClick={onNavigateToForum} className="text-slate-500 font-medium hover:text-indigo-600 transition-colors flex items-center justify-center gap-2 mx-auto">
                    Lihat Seluruh Diskusi <ArrowRight size={16} />
                </button>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
             <GraduationCap className="text-indigo-400" size={24} />
             <span className="font-bold text-xl">Digisschool</span>
          </div>
          <p className="text-slate-400 text-sm">© 2024 Digisschool Technology. Hak Cipta Dilindungi.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
