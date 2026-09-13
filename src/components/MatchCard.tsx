import React from 'react';
import { Star, Bell, BellRing, Tv, ExternalLink } from 'lucide-react';
import { MatchEvent } from '../types';

interface MatchCardProps {
  match: MatchEvent;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  hasNotification: boolean;
  onToggleNotification: (match: MatchEvent) => void;
  onSelectMatch: (match: MatchEvent) => void;
}

// Function to give distinctive styling to broadcaster badges
function getChannelBadgeClass(channel: string): string {
  const lower = channel.toLowerCase();
  if (lower.includes('cazétv') || lower.includes('cazetv')) {
    return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
  }
  if (lower.includes('espn')) {
    return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
  }
  if (lower.includes('sportv')) {
    return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
  }
  if (lower.includes('globo')) {
    return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
  }
  if (lower.includes('premiere')) {
    return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
  }
  if (lower.includes('disney')) {
    return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
  }
  if (lower.includes('bandsports')) {
    return 'bg-red-500/15 text-red-300 border-red-500/30';
  }
  if (lower.includes('youtube')) {
    return 'bg-red-600/15 text-red-400 border-red-500/30';
  }
  return 'bg-neutral-800 text-neutral-300 border-neutral-700';
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  isFavorite,
  onToggleFavorite,
  hasNotification,
  onToggleNotification,
  onSelectMatch,
}) => {
  // Determine card highlight visual styling based on original broadcast sheet
  let cardBorderColor = 'border-neutral-800 hover:border-neutral-700';
  let cardBgColor = 'bg-neutral-900/90 hover:bg-neutral-850';

  if (match.highlight) {
    if (match.highlightType === 'yellow') {
      cardBorderColor = 'border-amber-500/40 hover:border-amber-500/60';
      cardBgColor = 'bg-gradient-to-r from-amber-950/25 via-neutral-900/90 to-neutral-900/90';
    } else if (match.highlightType === 'pink') {
      cardBorderColor = 'border-pink-500/40 hover:border-pink-500/60';
      cardBgColor = 'bg-gradient-to-r from-pink-950/25 via-neutral-900/90 to-neutral-900/90';
    } else if (match.highlightType === 'blue') {
      cardBorderColor = 'border-blue-500/40 hover:border-blue-500/60';
      cardBgColor = 'bg-gradient-to-r from-blue-950/25 via-neutral-900/90 to-neutral-900/90';
    } else {
      cardBorderColor = 'border-emerald-500/40 hover:border-emerald-500/60';
      cardBgColor = 'bg-neutral-900/95 hover:bg-neutral-850';
    }
  }

  return (
    <div
      id={`match-card-${match.id}`}
      className={`group relative rounded-xl border p-3.5 sm:p-4 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between ${cardBorderColor} ${cardBgColor}`}
    >
      {/* Top Header inside card: Time + Category + Actions */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Exact Time Badge */}
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-black tracking-tight bg-neutral-800 text-emerald-400 border border-neutral-700/80 font-mono shadow-xs">
            {match.time}
          </span>

          {/* Sport / League Badge */}
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-neutral-800/80 text-neutral-300 border border-neutral-700/60">
            {match.leagueOrSport}
          </span>

          {/* Special Context / Stage Badge */}
          {match.highlightBadge && (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${
                match.highlightType === 'yellow'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : match.highlightType === 'pink'
                  ? 'bg-pink-500/20 text-pink-300 border-pink-500/40'
                  : match.highlightType === 'blue'
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}
            >
              {match.highlightBadge}
            </span>
          )}
        </div>

        {/* Favorite & Notification Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleNotification(match);
            }}
            id={`btn-notify-${match.id}`}
            title={hasNotification ? 'Alerta ativado para esta partida! Clique para gerenciar' : 'Definir notificação de início'}
            className={`p-1.5 rounded-lg border transition-colors ${
              hasNotification
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white hover:bg-neutral-750'
            }`}
          >
            {hasNotification ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(match.id);
            }}
            id={`btn-fav-${match.id}`}
            title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            className={`p-1.5 rounded-lg border transition-colors ${
              isFavorite
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 fill-amber-400 hover:bg-amber-500/30'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-amber-400 hover:bg-neutral-750'
            }`}
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Center: Match Title / Confrontation */}
      <div
        onClick={() => onSelectMatch(match)}
        className="cursor-pointer group/title py-1"
      >
        <h3 className="text-base sm:text-lg font-bold text-white group-hover/title:text-emerald-300 transition-colors leading-snug">
          {match.matchTitle}
        </h3>

        {match.scoreOrContext && (
          <p className="text-xs text-neutral-400 mt-0.5 font-medium">
            {match.scoreOrContext}
          </p>
        )}
      </div>

      {/* Bottom: Broadcast Channels & View Details Link */}
      <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Tv className="w-3.5 h-3.5 text-neutral-500" />
          {match.channels.map((channel, idx) => (
            <span
              key={idx}
              className={`px-2 py-0.5 rounded text-xs font-semibold border ${getChannelBadgeClass(channel)}`}
            >
              {channel}
            </span>
          ))}
        </div>

        <button
          onClick={() => onSelectMatch(match)}
          className="text-xs font-medium text-neutral-400 hover:text-emerald-400 flex items-center gap-1 transition-colors ml-auto"
        >
          <span>Detalhes</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
