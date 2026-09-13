import React from 'react';
import { MatchEvent } from '../types';
import { X, Star, Bell, BellRing, Tv, ExternalLink, ChevronLeft, ChevronRight, Share2, Check, Clock } from 'lucide-react';
import { CATEGORY_LABELS } from '../data/sportsSchedule';

interface MatchDetailsModalProps {
  match: MatchEvent | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  notificationMinutes: number | undefined;
  onSetNotification: (match: MatchEvent, minutesBefore: number) => void;
  onRemoveNotification: (matchId: string) => void;
  onNextMatch?: () => void;
  onPrevMatch?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export const MatchDetailsModal: React.FC<MatchDetailsModalProps> = ({
  match,
  onClose,
  isFavorite,
  onToggleFavorite,
  notificationMinutes,
  onSetNotification,
  onRemoveNotification,
  onNextMatch,
  onPrevMatch,
  hasNext,
  hasPrev,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!match) return null;

  const categoryMeta = CATEGORY_LABELS[match.category] || { name: match.leagueOrSport, icon: '🏆' };

  const handleCopy = () => {
    const text = `🏆 ${match.matchTitle}\n⏰ Horário: ${match.time} (13/09/2026)\n🏅 Competição: ${match.leagueOrSport}\n📺 Transmissão: ${match.channels.join(', ')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getChannelSearchUrl = (channel: string) => {
    const query = encodeURIComponent(`${channel} ao vivo ${match.matchTitle}`);
    if (channel.toLowerCase().includes('youtube') || channel.toLowerCase().includes('cazé') || channel.toLowerCase().includes('goat')) {
      return `https://www.youtube.com/results?search_query=${query}`;
    }
    return `https://www.google.com/search?q=${query}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-neutral-900 border border-neutral-700/80 rounded-2xl p-5 sm:p-6 shadow-2xl overflow-hidden flex flex-col justify-between max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        id="match-details-modal"
      >
        {/* Top bar with category icon, close button */}
        <div className="flex items-center justify-between gap-2 border-b border-neutral-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">{categoryMeta.icon}</span>
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-400">
              {match.leagueOrSport}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Previous match */}
            {hasPrev && onPrevMatch && (
              <button
                onClick={onPrevMatch}
                title="Confronto anterior"
                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            {/* Next match */}
            {hasNext && onNextMatch && (
              <button
                onClick={onNextMatch}
                title="Próximo confronto"
                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {/* Close button */}
            <button
              onClick={onClose}
              id="btn-close-modal"
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-4">
          {/* Time & Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-lg bg-neutral-800 text-emerald-400 font-mono font-black text-lg border border-neutral-700">
              {match.time}
            </span>
            <span className="text-xs text-neutral-400 font-medium">
              Domingo, 13/09/2026
            </span>
            {match.highlightBadge && (
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {match.highlightBadge}
              </span>
            )}
            {match.stage && (
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700">
                {match.stage}
              </span>
            )}
          </div>

          {/* Confrontation Headline */}
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight font-['Cabinet_Grotesk']">
              {match.matchTitle}
            </h2>
            {match.scoreOrContext && (
              <p className="text-sm text-neutral-400 mt-1">
                {match.scoreOrContext}
              </p>
            )}
          </div>

          {/* Channels & Where to watch section */}
          <div className="bg-neutral-950/70 border border-neutral-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-400">
              <Tv className="w-4 h-4 text-emerald-400" />
              <span>Canais e Transmissão:</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap pt-1">
              {match.channels.map((channel, i) => (
                <a
                  key={i}
                  href={getChannelSearchUrl(channel)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Buscar transmissão no ${channel}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-100 text-xs font-semibold border border-neutral-700 hover:border-emerald-500/50 transition-colors"
                >
                  <span>{channel}</span>
                  <ExternalLink className="w-3 h-3 text-neutral-400" />
                </a>
              ))}
            </div>
          </div>

          {/* Notification / Reminder Controls */}
          <div className="bg-neutral-950/70 border border-neutral-800 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-400">
                <Bell className="w-4 h-4 text-emerald-400" />
                <span>Notificação de Início:</span>
              </div>
              {notificationMinutes !== undefined && (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <BellRing className="w-3.5 h-3.5" />
                  Alerta programado
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
              <button
                onClick={() => onSetNotification(match, 0)}
                id="btn-alert-0min"
                className={`py-1.5 px-2 rounded-lg font-semibold border transition-all ${
                  notificationMinutes === 0
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                    : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-750'
                }`}
              >
                Na hora (0m)
              </button>
              <button
                onClick={() => onSetNotification(match, 5)}
                id="btn-alert-5min"
                className={`py-1.5 px-2 rounded-lg font-semibold border transition-all ${
                  notificationMinutes === 5
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                    : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-750'
                }`}
              >
                5 min antes
              </button>
              <button
                onClick={() => onSetNotification(match, 15)}
                id="btn-alert-15min"
                className={`py-1.5 px-2 rounded-lg font-semibold border transition-all ${
                  notificationMinutes === 15
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                    : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-750'
                }`}
              >
                15 min antes
              </button>
              <button
                onClick={() => onSetNotification(match, 30)}
                id="btn-alert-30min"
                className={`py-1.5 px-2 rounded-lg font-semibold border transition-all ${
                  notificationMinutes === 30
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                    : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-750'
                }`}
              >
                30 min antes
              </button>
            </div>

            {notificationMinutes !== undefined && (
              <button
                onClick={() => onRemoveNotification(match.id)}
                id="btn-cancel-alert"
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold hover:underline"
              >
                Desativar alerta deste confronto
              </button>
            )}
          </div>
        </div>

        {/* Footer Actions: Favorite & Share */}
        <div className="pt-4 mt-5 border-t border-neutral-800 flex items-center justify-between gap-3">
          <button
            onClick={() => onToggleFavorite(match.id)}
            id="modal-btn-fav"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
              isFavorite
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-750'
            }`}
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>{isFavorite ? 'Salvo em Favoritos' : 'Salvar em Favoritos'}</span>
          </button>

          <button
            onClick={handleCopy}
            id="modal-btn-share"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 border border-neutral-700 text-xs sm:text-sm font-semibold transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Compartilhar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
