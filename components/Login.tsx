
import React, { useState } from 'react';
import { GraduationCap, Lock, User, Eye, EyeOff, ArrowLeft } from 'lucide-react';

interface LoginProps {
  onLogin: (status: boolean) => void;
  onBack?: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate network delay for better UX
    setTimeout(() => {
      if (username === 'imranalwi' && password === 'bissmillah') {
        onLogin(true);
      } else {
        setError('Username atau password salah. Silakan coba lagi.');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-20 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-20 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100 z-10">
        
        {onBack && (
            <button 
                onClick={onBack}
                className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 transition-colors"
                title="Kembali"
            >
                <ArrowLeft size={24} />
            </button>
        )}

        <div className="flex flex-col items-center mb-8 mt-2">
           <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200 flex items-center justify-center mb-4 transform rotate-3">
              <GraduationCap size={36} />
           </div>
           <h1 className="text-2xl font-bold text-slate-800">Digisschool</h1>
           <p className="text-slate-500 text-sm mt-1">Platform Manajemen Sekolah</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
            <div className="relative group">
              <User className="absolute left-3 top-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-slate-50 focus:bg-white"
                placeholder="Masukkan username Anda"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
              <input 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-slate-50 focus:bg-white"
                placeholder="Masukkan password"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center justify-center gap-2 font-medium animate-shake">
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-200 transform active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Memproses...' : 'Masuk Dashboard'}
          </button>
        </form>
        
        <div className="mt-8 text-center border-t border-slate-100 pt-6">
           <p className="text-xs text-slate-400">
             &copy; 2024 Digisschool Admin Panel. <br/>Akses terbatas untuk Administrator.
           </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
