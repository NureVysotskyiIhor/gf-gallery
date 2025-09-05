// src/components/ui/toast.tsx
import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info, Heart } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'favorite';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
}

let toastState: ToastState = { toasts: [] };
const listeners = new Set<() => void>();

const notify = () => {
  listeners.forEach(listener => listener());
};

export const toast = {
  success: (title: string, description?: string, duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    toastState.toasts.push({ id, type: 'success', title, description, duration });
    notify();
    setTimeout(() => {
      toastState.toasts = toastState.toasts.filter(t => t.id !== id);
      notify();
    }, duration);
  },
  
  error: (title: string, description?: string, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    toastState.toasts.push({ id, type: 'error', title, description, duration });
    notify();
    setTimeout(() => {
      toastState.toasts = toastState.toasts.filter(t => t.id !== id);
      notify();
    }, duration);
  },
  
  info: (title: string, description?: string, duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    toastState.toasts.push({ id, type: 'info', title, description, duration });
    notify();
    setTimeout(() => {
      toastState.toasts = toastState.toasts.filter(t => t.id !== id);
      notify();
    }, duration);
  },
  
  favorite: (title: string, description?: string, duration = 2500) => {
    const id = Math.random().toString(36).substring(2, 9);
    toastState.toasts.push({ id, type: 'favorite', title, description, duration });
    notify();
    setTimeout(() => {
      toastState.toasts = toastState.toasts.filter(t => t.id !== id);
      notify();
    }, duration);
  },
  
  dismiss: (id: string) => {
    toastState.toasts = toastState.toasts.filter(t => t.id !== id);
    notify();
  }
};

const getToastIcon = (type: ToastType) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case 'error':
      return <AlertTriangle className="w-5 h-5 text-red-600" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    case 'info':
      return <Info className="w-5 h-5 text-blue-600" />;
    case 'favorite':
      return <Heart className="w-5 h-5 text-pink-600 fill-current" />;
  }
};

const getToastStyles = (type: ToastType) => {
  switch (type) {
    case 'success':
      return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20';
    case 'error':
      return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
    case 'warning':
      return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20';
    case 'info':
      return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
    case 'favorite':
      return 'border-pink-200 bg-pink-50 dark:border-pink-800 dark:bg-pink-900/20';
  }
};

function ToastItem({ toast: toastItem }: { toast: Toast }) {
  return (
    <div className={`
      flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm
      transform transition-all duration-300 ease-out
      animate-in slide-in-from-right-full
      ${getToastStyles(toastItem.type)}
    `}>
      <div className="flex-shrink-0 mt-0.5">
        {getToastIcon(toastItem.type)}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {toastItem.title}
        </h4>
        {toastItem.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {toastItem.description}
          </p>
        )}
      </div>
      
      <button
        onClick={() => toast.dismiss(toastItem.id)}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const updateToasts = () => {
      setToasts([...toastState.toasts]);
    };
    
    listeners.add(updateToasts);
    updateToasts();
    
    return () => {
      listeners.delete(updateToasts);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
      {toasts.map((toastItem) => (
        <ToastItem key={toastItem.id} toast={toastItem} />
      ))}
    </div>
  );
}

export {ToastContainer}