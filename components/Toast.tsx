
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000); // Auto close after 3 seconds
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto min-w-[300px] max-w-sm w-full bg-white shadow-lg rounded-lg border-l-4 p-4 flex items-start gap-3 animate-in slide-in-from-right fade-in duration-300 ${
              toast.type === 'success' ? 'border-emerald-500' :
              toast.type === 'error' ? 'border-red-500' :
              'border-blue-500'
            }`}
          >
            <div className={`mt-0.5 ${
               toast.type === 'success' ? 'text-emerald-500' :
               toast.type === 'error' ? 'text-red-500' :
               'text-blue-500'
            }`}>
              {toast.type === 'success' && <CheckCircle size={20} />}
              {toast.type === 'error' && <AlertCircle size={20} />}
              {toast.type === 'info' && <Info size={20} />}
            </div>
            <div className="flex-1">
              <h4 className={`font-semibold text-sm ${
                 toast.type === 'success' ? 'text-emerald-800' :
                 toast.type === 'error' ? 'text-red-800' :
                 'text-blue-800'
              }`}>
                {toast.type === 'success' ? 'Berhasil' : toast.type === 'error' ? 'Gagal' : 'Info'}
              </h4>
              <p className="text-sm text-slate-600 mt-0.5">{toast.message}</p>
            </div>
            <button 
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
