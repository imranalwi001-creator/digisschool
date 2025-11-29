
import React from 'react';
import { LayoutDashboard, Users, BookOpen, FileText, GraduationCap, LogOut, ClipboardCheck, Book, BookMarked, FolderOpen, MessageSquare, BrainCircuit, Settings, Database, ChevronRight } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
  onLogout: () => void;
  schoolLogo?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, toggleSidebar, onLogout, schoolLogo }) => {
  
  const menuGroups = [
    {
      title: "Overview",
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
      ]
    },
    {
      title: "Akademik",
      items: [
        { id: 'classes', label: 'Kelas & Siswa', icon: <Users size={20} /> },
        { id: 'gradebook', label: 'Buku Nilai', icon: <BookOpen size={20} /> },
        { id: 'attendance', label: 'Absensi', icon: <ClipboardCheck size={20} /> },
        { id: 'journal', label: 'Jurnal Guru', icon: <Book size={20} /> },
      ]
    },
    {
      title: "E-Learning",
      items: [
        { id: 'assignments', label: 'Tugas & Proyek', icon: <FolderOpen size={20} /> },
        { id: 'question_bank', label: 'Bank Soal (CBT)', icon: <BookMarked size={20} /> },
        { id: 'questionnaire', label: 'Minat & Bakat', icon: <BrainCircuit size={20} /> },
        { id: 'forum_admin', label: 'Forum Diskusi', icon: <MessageSquare size={20} /> },
      ]
    },
    {
      title: "Settings",
      items: [
        { id: 'reports', label: 'Laporan & Rapor', icon: <FileText size={20} /> },
        { id: 'school_settings', label: 'Identitas Sekolah', icon: <Settings size={20} /> },
        { id: 'data_manager', label: 'Database', icon: <Database size={20} /> },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleSidebar}
      />
      
      {/* Sidebar Content - Light Theme */}
      <div className={`fixed top-0 left-0 h-full bg-white text-slate-600 w-72 transform transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:h-screen shrink-0 flex flex-col border-r border-slate-200 shadow-xl shadow-slate-200/50 font-sans`}>
        
        {/* Brand Header */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-100">
          {schoolLogo ? (
             <img src={schoolLogo} alt="Logo" className="w-9 h-9 object-contain" />
          ) : (
             <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <GraduationCap size={20} />
             </div>
          )}
          <div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight leading-none">Digisschool</h1>
            <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wide bg-indigo-50 px-1.5 py-0.5 rounded-md">Admin Panel</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8 custom-scrollbar">
          {menuGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              <h3 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-sans">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        if (window.innerWidth < 768) toggleSidebar();
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                        isActive 
                          ? 'bg-indigo-50 text-indigo-700 shadow-sm font-semibold' 
                          : 'hover:bg-slate-50 hover:text-slate-900 text-slate-600 font-medium'
                      }`}
                    >
                      <span className={`flex-shrink-0 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'}`}>
                          {item.icon}
                      </span>
                      <span className="text-sm flex-1 text-left">
                          {item.label}
                      </span>
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Profile Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-200 cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-200">
                IA
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-800 font-bold text-sm truncate group-hover:text-indigo-700 transition-colors">Imran Alwi</p>
              <p className="text-xs text-slate-500 truncate">Administrator</p>
            </div>
            <button 
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Keluar"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
