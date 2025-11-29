
import React, { useState, useEffect } from 'react';
import { ForumTopic, ForumReply } from '../types';
import { loadForumTopics, saveForumTopics } from '../services/storageService';
import { MessageSquare, ArrowLeft, Search, ThumbsUp, MessageCircle, Clock, Plus, User, Send, Filter } from 'lucide-react';

interface ForumPageProps {
  onBack: () => void;
}

const ForumPage: React.FC<ForumPageProps> = ({ onBack }) => {
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [view, setView] = useState<'list' | 'detail' | 'create'>('list');
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  // Form States
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Kurikulum');
  const [authorName, setAuthorName] = useState('');
  const [authorRole, setAuthorRole] = useState('Guru');
  
  // Reply State
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    setTopics(loadForumTopics());
  }, []);

  const handleCreateTopic = () => {
    if (!newTitle || !newContent || !authorName) return;

    const newTopic: ForumTopic = {
        id: `t${Date.now()}`,
        title: newTitle,
        content: newContent,
        author: authorName,
        role: authorRole,
        category: newCategory,
        createdAt: new Date().toISOString(),
        likes: 0,
        replies: [],
        avatarColor: 'bg-indigo-100 text-indigo-600'
    };

    const updatedTopics = [newTopic, ...topics];
    setTopics(updatedTopics);
    saveForumTopics(updatedTopics);
    setView('list');
    setNewTitle('');
    setNewContent('');
  };

  const handleReply = () => {
      if (!selectedTopic || !replyContent || !authorName) return;

      const reply: ForumReply = {
          id: `r${Date.now()}`,
          topicId: selectedTopic.id,
          content: replyContent,
          author: authorName,
          role: authorRole,
          createdAt: new Date().toISOString()
      };

      const updatedTopics = topics.map(t => {
          if (t.id === selectedTopic.id) {
              return { ...t, replies: [...t.replies, reply] };
          }
          return t;
      });

      setTopics(updatedTopics);
      saveForumTopics(updatedTopics);
      setSelectedTopic(updatedTopics.find(t => t.id === selectedTopic.id) || null);
      setReplyContent('');
  };

  const handleLike = (topicId: string) => {
      const updatedTopics = topics.map(t => {
          if (t.id === topicId) {
              return { ...t, likes: t.likes + 1 };
          }
          return t;
      });
      setTopics(updatedTopics);
      saveForumTopics(updatedTopics);
      
      if (selectedTopic && selectedTopic.id === topicId) {
          setSelectedTopic(updatedTopics.find(t => t.id === topicId) || null);
      }
  };

  const filteredTopics = topics.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'Semua' || t.category === selectedCategory;
      return matchesSearch && matchesCategory;
  });

  const categories = ['Semua', 'Kurikulum', 'Pedagogik', 'Administrasi', 'Teknis', 'Lainnya'];

  const getTimeAgo = (dateStr: string) => {
      const diff = Date.now() - new Date(dateStr).getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours < 1) return 'Baru saja';
      if (hours < 24) return `${hours} jam lalu`;
      const days = Math.floor(hours / 24);
      return `${days} hari lalu`;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
            <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <MessageSquare className="text-indigo-600" /> Forum Guru
                    </h1>
                </div>
                {view === 'list' && (
                    <button 
                        onClick={() => setView('create')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 shadow-sm"
                    >
                        <Plus size={18} /> Buat Topik
                    </button>
                )}
            </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-8">
            
            {/* VIEW: LIST */}
            {view === 'list' && (
                <div className="space-y-6">
                    {/* Search & Filter */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 text-slate-400" size={20} />
                            <input 
                                type="text" 
                                placeholder="Cari topik diskusi..."
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                                        selectedCategory === cat 
                                        ? 'bg-indigo-600 text-white' 
                                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Topics List */}
                    <div className="space-y-4">
                        {filteredTopics.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">
                                Topik tidak ditemukan. Jadilah yang pertama memulai diskusi!
                            </div>
                        ) : (
                            filteredTopics.map(topic => (
                                <div 
                                    key={topic.id}
                                    onClick={() => { setSelectedTopic(topic); setView('detail'); }}
                                    className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-md transition-all cursor-pointer group"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex gap-2">
                                            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full uppercase">
                                                {topic.category}
                                            </span>
                                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                                <Clock size={12} /> {getTimeAgo(topic.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
                                        {topic.title}
                                    </h3>
                                    <p className="text-slate-600 text-sm line-clamp-2 mb-4">
                                        {topic.content}
                                    </p>

                                    <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${topic.avatarColor || 'bg-slate-200 text-slate-600'}`}>
                                                {topic.author.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-700">{topic.author}</p>
                                                <p className="text-xs text-slate-500">{topic.role}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 text-slate-500 text-sm">
                                            <div className="flex items-center gap-1">
                                                <MessageCircle size={16} /> {topic.replies.length}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <ThumbsUp size={16} /> {topic.likes}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* VIEW: DETAIL */}
            {view === 'detail' && selectedTopic && (
                <div className="max-w-4xl mx-auto animate-in slide-in-from-right duration-300">
                    <button onClick={() => setView('list')} className="text-slate-500 hover:text-indigo-600 flex items-center gap-2 mb-6">
                        <ArrowLeft size={18} /> Kembali ke Daftar
                    </button>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                        <div className="p-8">
                             <div className="flex gap-3 mb-4">
                                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full uppercase">
                                    {selectedTopic.category}
                                </span>
                                <span className="text-xs text-slate-400 flex items-center gap-1 pt-1">
                                    <Clock size={12} /> {getTimeAgo(selectedTopic.createdAt)}
                                </span>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">{selectedTopic.title}</h2>
                            
                            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${selectedTopic.avatarColor || 'bg-slate-200'}`}>
                                    {selectedTopic.author.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800">{selectedTopic.author}</p>
                                    <p className="text-sm text-slate-500">{selectedTopic.role}</p>
                                </div>
                            </div>

                            <div className="prose max-w-none text-slate-700 mb-8 whitespace-pre-wrap">
                                {selectedTopic.content}
                            </div>

                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => handleLike(selectedTopic.id)}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-lg transition-colors font-medium border border-slate-200"
                                >
                                    <ThumbsUp size={18} /> {selectedTopic.likes} Suka
                                </button>
                                <div className="flex items-center gap-2 px-4 py-2 text-slate-500">
                                    <MessageCircle size={18} /> {selectedTopic.replies.length} Balasan
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Replies Section */}
                    <div className="space-y-6">
                        <h3 className="font-bold text-slate-800 text-lg">Komentar & Balasan</h3>
                        
                        {selectedTopic.replies.map(reply => (
                            <div key={reply.id} className="bg-white p-6 rounded-xl border border-slate-200">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-500">
                                            {reply.author.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-slate-800">{reply.author}</p>
                                            <p className="text-xs text-slate-500">{reply.role}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-slate-400">{getTimeAgo(reply.createdAt)}</span>
                                </div>
                                <p className="text-slate-600 text-sm ml-11">{reply.content}</p>
                            </div>
                        ))}

                        {/* Reply Form */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg shadow-indigo-50/50">
                            <h4 className="font-bold text-sm text-slate-700 mb-4">Tulis Balasan</h4>
                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 text-slate-400" size={16}/>
                                    <input 
                                        type="text" 
                                        placeholder="Nama Anda"
                                        className="w-full pl-9 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={authorName}
                                        onChange={e => setAuthorName(e.target.value)}
                                    />
                                </div>
                                <select 
                                    className="w-full py-2 px-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                    value={authorRole}
                                    onChange={e => setAuthorRole(e.target.value)}
                                >
                                    <option value="Guru">Guru</option>
                                    <option value="Wali Kelas">Wali Kelas</option>
                                    <option value="Kepala Sekolah">Kepala Sekolah</option>
                                </select>
                            </div>
                            <textarea 
                                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none mb-3"
                                placeholder="Ketikan balasan Anda disini..."
                                value={replyContent}
                                onChange={e => setReplyContent(e.target.value)}
                            ></textarea>
                            <div className="flex justify-end">
                                <button 
                                    onClick={handleReply}
                                    disabled={!replyContent || !authorName}
                                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                                >
                                    <Send size={16} /> Kirim Balasan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* VIEW: CREATE */}
            {view === 'create' && (
                <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl border border-slate-200 shadow-sm animate-in slide-in-from-bottom-4">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">Buat Topik Diskusi Baru</h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Judul Topik</label>
                            <input 
                                type="text" 
                                placeholder="Contoh: Metode pengajaran kreatif..."
                                className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                            />
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                                <select 
                                    className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                    value={newCategory}
                                    onChange={e => setNewCategory(e.target.value)}
                                >
                                    {categories.filter(c => c !== 'Semua').map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Penulis</label>
                                <input 
                                    type="text" 
                                    placeholder="Nama Anda"
                                    className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={authorName}
                                    onChange={e => setAuthorName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Isi Diskusi</label>
                            <textarea 
                                className="w-full border border-slate-300 rounded-lg p-3 h-40 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                placeholder="Jelaskan pertanyaan atau topik diskusi Anda secara detail..."
                                value={newContent}
                                onChange={e => setNewContent(e.target.value)}
                            ></textarea>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-slate-100">
                            <button 
                                onClick={() => setView('list')}
                                className="flex-1 py-3 border border-slate-300 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                            >
                                Batal
                            </button>
                            <button 
                                onClick={handleCreateTopic}
                                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                            >
                                Posting Diskusi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    </div>
  );
};

export default ForumPage;
