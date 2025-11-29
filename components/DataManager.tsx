
import React, { useRef } from 'react';
import { getAllDataForBackup, restoreDataFromBackup } from '../services/storageService';
import { Download, Upload, AlertTriangle, Database, FileJson, CheckCircle } from 'lucide-react';
import { useToast } from './Toast';

const DataManager: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleDownloadBackup = () => {
    const data = getAllDataForBackup();
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `digisschool_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast("Backup data berhasil didownload", 'success');
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm("⚠️ PERINGATAN: Tindakan ini akan menimpa seluruh data yang ada saat ini dengan data dari file backup. Pastikan Anda yakin!")) {
        // Reset input value to allow selecting same file again if needed
        if(fileInputRef.current) fileInputRef.current.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const jsonString = event.target?.result as string;
            const data = JSON.parse(jsonString);
            
            const success = restoreDataFromBackup(data);
            
            if (success) {
                showToast("Data berhasil dipulihkan! Halaman akan dimuat ulang...", 'success');
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                showToast("Gagal memulihkan data. Format file tidak sesuai standar Digisschool.", 'error');
            }
        } catch (error) {
            console.error(error);
            showToast("Gagal membaca file backup. Pastikan file adalah JSON valid.", 'error');
        } finally {
            // Reset input so the same file can be selected again if retry is needed
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">Manajemen Data & Backup</h2>
        <p className="text-slate-500">Amankan data sekolah Anda dengan melakukan backup berkala.</p>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
          {/* Backup Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col items-center text-center hover:border-indigo-300 transition-colors">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-6">
                  <Download size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Backup Data (Download)</h3>
              <p className="text-slate-600 mb-8 text-sm leading-relaxed">
                  Unduh seluruh data (Kelas, Siswa, Nilai, Absensi, Pengaturan) ke dalam satu file aman (.json). Simpan file ini di komputer Anda sebagai cadangan permanen.
              </p>
              <button 
                  onClick={handleDownloadBackup}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all"
              >
                  <FileJson size={20} /> Download Backup
              </button>
          </div>

          {/* Restore Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col items-center text-center hover:border-amber-300 transition-colors">
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mb-6">
                  <Upload size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Restore Data (Upload)</h3>
              <p className="text-slate-600 mb-8 text-sm leading-relaxed">
                  Kembalikan data sekolah dari file backup yang pernah Anda unduh sebelumnya. <br/>
                  <span className="text-amber-600 font-bold">Peringatan: Data saat ini akan tertimpa.</span>
              </p>
              
              <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:border-amber-500 hover:text-amber-600 flex items-center justify-center gap-2 transition-all"
              >
                  <Database size={20} /> Pilih File Backup
              </button>
              <input 
                  type="file" 
                  ref={fileInputRef}
                  accept=".json"
                  className="hidden"
                  onChange={handleRestoreBackup}
              />
          </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex gap-4 items-start">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
              <CheckCircle size={24} />
          </div>
          <div>
              <h4 className="font-bold text-blue-800 text-lg mb-1">Tips Keamanan Data</h4>
              <ul className="list-disc list-inside text-blue-700 text-sm space-y-1">
                  <li>Lakukan backup data secara rutin (misal: setiap minggu atau setelah ujian selesai).</li>
                  <li>Simpan file backup di tempat aman (Google Drive, Flashdisk, atau Harddisk Eksternal).</li>
                  <li>Jika Anda berganti laptop/komputer, cukup gunakan fitur "Restore Data" untuk memindahkan semua data sekolah Anda.</li>
              </ul>
          </div>
      </div>
    </div>
  );
};

export default DataManager;
