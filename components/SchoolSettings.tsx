
import React, { useState, useRef } from 'react';
import { SchoolProfile } from '../types';
import { Save, Camera, Building, Mail, Globe, User, Hash, Image as ImageIcon } from 'lucide-react';
import { useToast } from './Toast';

interface SchoolSettingsProps {
  profile: SchoolProfile;
  onSave: (profile: SchoolProfile) => void;
}

const SchoolSettings: React.FC<SchoolSettingsProps> = ({ profile, onSave }) => {
  const [formData, setFormData] = useState<SchoolProfile>(profile);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleChange = (field: keyof SchoolProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast("Ukuran logo terlalu besar. Maksimal 2MB.", 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('logoUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    showToast('Pengaturan sekolah berhasil disimpan', 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">Pengaturan Sekolah</h2>
        <p className="text-slate-500">Sesuaikan identitas sekolah, logo, dan data kepala sekolah.</p>
      </header>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-8">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Logo Sekolah</h3>
            
            <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative w-40 h-40 bg-white border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all group overflow-hidden"
            >
                {formData.logoUrl ? (
                    <img src={formData.logoUrl} alt="Logo Sekolah" className="w-full h-full object-contain p-2" />
                ) : (
                    <div className="flex flex-col items-center text-slate-400 group-hover:text-indigo-500">
                        <ImageIcon size={40} />
                        <span className="text-xs mt-2 font-medium">Upload Logo</span>
                    </div>
                )}
                
                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium">
                    <Camera size={24} />
                </div>
            </div>
            
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleLogoUpload} 
            />
            <p className="text-xs text-slate-400 mt-3">Format: PNG, JPG (Transparan disarankan). Maks 2MB.</p>
        </div>

        {/* Identity Section */}
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-700 border-b border-slate-100 pb-2">Identitas Sekolah</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nama Sekolah</label>
                    <div className="relative">
                        <Building className="absolute left-3 top-2.5 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Nama Sekolah Resmi"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Alamat Lengkap</label>
                    <input 
                        type="text" 
                        value={formData.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Alamat Sekolah"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-2.5 text-slate-400" size={18} />
                        <input 
                            type="email" 
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="email@sekolah.sch.id"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
                    <div className="relative">
                        <Globe className="absolute left-3 top-2.5 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            value={formData.website}
                            onChange={(e) => handleChange('website', e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="www.sekolah.sch.id"
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* Headmaster Section */}
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-700 border-b border-slate-100 pb-2">Kepala Sekolah</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nama Kepala Sekolah</label>
                    <div className="relative">
                        <User className="absolute left-3 top-2.5 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            value={formData.headmaster}
                            onChange={(e) => handleChange('headmaster', e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Nama Lengkap dengan Gelar"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">NIP Kepala Sekolah</label>
                    <div className="relative">
                        <Hash className="absolute left-3 top-2.5 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            value={formData.headmasterNip}
                            onChange={(e) => handleChange('headmasterNip', e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="NIP / NIY"
                        />
                    </div>
                </div>
            </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button 
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
            >
                <Save size={18} /> Simpan Perubahan
            </button>
        </div>

      </form>
    </div>
  );
};

export default SchoolSettings;
