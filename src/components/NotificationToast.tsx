import React from 'react';
import { BellRing, X, ExternalLink } from 'lucide-react';
import { MatchEvent } from '../types';

export interface ToastMessage {
  id: string;
  title: string;
  body: string;
  match?: MatchEvent;
}

interface NotificationToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
  onSelectMatch?: (match: MatchEvent) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  toasts,
  onDismiss,
  onSelectMatch,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-neutral-900/95 border-2 border-emerald-500/60 rounded-xl p-3.5 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300 flex items-start gap-3 text-white"
        >
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
            <BellRing className="w-5 h-5 animate-bounce" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              {toast.title}
            </h4>
            <p className="text-sm font-semibold text-neutral-100 mt-0.5">
              {toast.body}
            </p>
            {toast.match && onSelectMatch && (
              <button
                onClick={() => {
                  onSelectMatch(toast.match!);
                  onDismiss(toast.id);
                }}
                className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-emerald-300 hover:text-emerald-200 underline"
              >
                <span>Ver canais de transmissão</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            title="Fechar aviso"
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
