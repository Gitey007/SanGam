import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function ErrorMessage({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="flex items-center justify-between p-4 mb-4 text-rose-300 bg-rose-950/50 border border-rose-800/60 rounded-xl text-sm">
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-rose-400 hover:text-rose-200 transition font-bold text-lg leading-none ml-3"
        >
          &times;
        </button>
      )}
    </div>
  );
}
