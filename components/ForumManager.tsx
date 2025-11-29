
import React, { useState, useEffect } from 'react';
import { ForumTopic } from '../types';
import { loadForumTopics, saveForumTopics } from '../services/storageService';
import { Search, Trash2, Pin, MessageCircle, Eye, X, ThumbsUp, AlertCircle, PinOff } from 'lucide-react';
import { useToast } from './Toast';

const ForumManager: React.FC = () => {
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    setTopics(loadForumTopics());
  }, []);

  const handleDeleteTopic = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus topik diskusi ini? Semua balasan akan ikut terhapus.")) {
      const updatedTopics = topics.filter(t => t.id !== id);
      setTopics(updatedTopics);
      saveForumTopics(updatedTopics);
      if (selectedTopic?.id === id) setSelectedTopic(null);
      showToast('Topik diskusi berhasil dihapus', 'info');
    }
  };

  const handlePinTopic = (id: string) => {
    const updatedTopics = topics.map(t => {
      if (t.id === id) {
        return { ...t, isPinned: !t.isPinned };
      }
      return t;
    });
    // Sort pinned to top
    updatedTopics.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
    
    setTopics(updatedTopics);
    saveForumTopics(updatedTopics);
    
    const pinned = updatedTopics.find(t => t.id === id)?.isPinned;
    showToast(pinned ? 'Topik berhasil disematkan' : 'Pin topik dilepas', 'success');
  };

  const handleDeleteReply = (topicId: string, replyId: string) => {
    if (confirm("Hapus komentar ini?")) {
      const updatedTopics = topics.map(t => {
        if (t.id === topicId) {
          return { ...t, replies: t.replies.filter(r => r.id !== replyId) };
        }
        return t;
      });
      setTopics(updatedTopics);
      saveForumTopics(updatedTopics);
      
      // Update modal view
      if (selectedTopic && selectedTopic.id === topicId) {
        setSelectedTopic(updatedTopics.find(t => t.id === topicId) || null);
      }
      showToast('Komentar berhasil dihapus', 'info');
    }
  };

  const filteredTopics = topics.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto h-full flex flex-col">
       <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Manajemen Forum Diskusi</h2>
           <p className="text-slate-500">Moderasi konten, sematkan topik penting, dan kelola komunitas sekolah.</p>
        </div>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center gap-4">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Cari topik atau penulis..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div className="text-sm text-slate-500 font-medium">
                Total Topik: {topics.length}
            </div>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1">
            <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-sm uppercase font-semibold sticky top-0 z-10">
                    <tr>
                        <th className="p-4 border-b">Topik Diskusi</th>
                        <th className="p-4 border-b">Penulis</th>
                        <th className="p-4 border-b">Kategori</th>
                        <th className="p-4 border-b text-center">Stats</th>
                        <th className="p-4 border-b text-right">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredTopics.length === 0 ? (
                        <tr><td colSpan={5} className="p-8 text-center text-slate-400">Tidak ada topik diskusi ditemukan.</td></tr>
                    ) : (
                        filteredTopics.map(topic => (
                            <tr key={topic.id} className={`hover:bg-slate-50 transition-colors ${topic.isPinned ? 'bg-indigo-50/30' : ''}`}>
                                <td className="p-4">
                                    <div className="flex items-start gap-2">
                                        {topic.isPinned && <Pin size={14} className="text-indigo-600 mt-1 shrink-0 fill-current" />}
                                        <div>
                                            <p className="font-bold text-slate-800 line-clamp-1">{topic.title}</p>
                                            <p className="text-slate-500 text-xs line-clamp-1 mt-0.5">{topic.content}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${topic.avatarColor || 'bg-slate-200'}`}>
                                            {topic.author.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-700">{topic.author}</p>
                                            <p className="text-xs text-slate-400">{topic.role}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className="px-2 py-1 rounded text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                        {topic.category}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <div className="flex items-center justify-center gap-3 text-slate-500 text-xs">
                                        <span className="flex items-center gap-1" title="Likes"><ThumbsUp size={14}/> {topic.likes}</span>
                                        <span className="flex items-center gap-1" title="Balasan"><MessageCircle size={14}/> {topic.replies.length}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button 
                                            onClick={() => handlePinTopic(topic.id)}
                                            className={`p-2 rounded-lg transition-colors ${topic.isPinned ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                            title={topic.isPinned ? "Lepaskan Pin" : "Sematkan Topik"}
                                        >
                                            {topic.isPinned ? <PinOff size={16} /> : <Pin size={16} />}
                                        </button>
                                        <button 
                                            onClick={() => setSelectedTopic(topic)}
                                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                            title="Lihat Detail & Moderasi Komentar"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteTopic(topic.id)}
                                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                            title="Hapus Topik"
                                        >
                                            <Trash2 size={16} />
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

      {/* Detail Modal (For moderating replies) */}
      {selectedTopic && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col animate-in zoom-in-95">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <AlertCircle size={18} className="text-indigo-600"/> Moderasi Diskusi
                    </h3>
                    <button onClick={() => setSelectedTopic(null)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-6">
                        <h4 className="font-bold text-indigo-900 text-lg mb-2">{selectedTopic.title}</h4>
                        <p className="text-indigo-800 text-sm whitespace-pre-wrap">{selectedTopic.content}</p>
                        <div className="mt-3 pt-3 border-t border-indigo-200/50 flex gap-4 text-xs text-indigo-600 font-medium">
                            <span>Oleh: {selectedTopic.author}</span>
                            <span>{new Date(selectedTopic.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <MessageCircle size={16} /> {selectedTopic.replies.length} Balasan
                    </h4>

                    <div className="space-y-3">
                        {selectedTopic.replies.length === 0 ? (
                            <p className="text-slate-400 text-sm italic">Belum ada balasan pada topik ini.</p>
                        ) : (
                            selectedTopic.replies.map(reply => (
                                <div key={reply.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                                                {reply.author.charAt(0)}
                                            </div>
                                            <div>
                                                <span className="font-bold text-sm text-slate-700">{reply.author}</span>
                                                <span className="text-xs text-slate-500 ml-2">({reply.role})</span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteReply(selectedTopic.id, reply.id)}
                                            className="text-slate-300 hover:text-red-600 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Hapus Komentar Ini"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <p className="text-sm text-slate-600 ml-8">{reply.content}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ForumManager;
