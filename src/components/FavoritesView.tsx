import React, { useState } from 'react';
import { MatchEvent } from '../types';
import { MatchCard } from './MatchCard';
import { Star, BellRing, Copy, Check, Trash2, Calendar, Share2 } from 'lucide-react';

interface FavoritesViewProps {
  favoriteMatches: MatchEvent[];
  notifications: Record<string, number>;
  onToggleFavorite: (id: string) => void;
  onToggleNotification: (match: MatchEvent) => void;
  onSelectMatch: (match: MatchEvent) => void;
  onClearAllFavorites: () => void;
  onEnableAllNotifications: () => void;
  onExploreSchedule: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favoriteMatches,
  notifications,
  onToggleFavorite,
  onToggleNotification,
  onSelectMatch,
  onClearAllFavorites,
  onEnableAllNotifications,
  onExploreSchedule,
}) => {
  const [copied, setCopied] = useState(false);

  // Sort favorites chronologically by time
  const sortedFavorites = [...favoriteMatches].sort((a, b) => a.timeMinutes - b.timeMinutes);

  const handleCopySchedule = () => {
    if (sortedFavorites.length === 0) return;

    const lines = [
      '🏆 *MINHA AGENDA ESPORTIVA - DOMINGO (13/09/2026)* 🏆',
      '',
      ...sortedFavorites.map((m) => {
        return `⏰ *${m.time}* - ${m.matchTitle} (${m.leagueOrSport})\n📺 Transmissão: ${m.channels.join(', ')}`;
      }),
      '',
      'Programação salva no Agenda Esportiva na TV.',
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (sortedFavorites.length === 0) {
    return (
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-md">
        <div className="w-16 h-16 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-amber-400">
          <Star className="w-8 h-8 fill-amber-400/30" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2 font-['Cabinet_Grotesk']">
          Nenhum horário salvo ainda
        </h2>
        <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
          Navegue pela grade de domingo (13/09/2026) e clique na estrelinha ⭐ em qualquer confronto para salvar seus jogos favoritos aqui.
        </p>
        <button
          onClick={onExploreSchedule}
          id="btn-explore-schedule-empty"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors shadow-md shadow-emerald-600/30"
        >
          <Calendar className="w-4 h-4" />
          <span>Explorar Grade Completa do Dia</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Controls Bar for Favorites */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Star className="w-5 h-5 fill-amber-400" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              Seus Horários Favoritos
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {sortedFavorites.length}
              </span>
            </h2>
            <p className="text-xs text-neutral-400">
              Confrontos selecionados para acompanhar no domingo, 13/09/2026
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onEnableAllNotifications}
            id="btn-notify-all-favorites"
            title="Ativar alertas de início para todos os jogos favoritos"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/50 text-xs font-semibold transition-colors"
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>Ativar Alerta em Todos</span>
          </button>

          <button
            onClick={handleCopySchedule}
            id="btn-copy-favorites"
            title="Copiar programação dos favoritos formatada para WhatsApp"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-200 border border-neutral-700 hover:text-white hover:bg-neutral-750 text-xs font-semibold transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Compartilhar Grade</span>
              </>
            )}
          </button>

          <button
            onClick={onClearAllFavorites}
            id="btn-clear-favorites"
            title="Limpar todos os favoritos"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/40 text-rose-300 border border-rose-500/30 hover:bg-rose-900/50 text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Limpar Tudo</span>
          </button>
        </div>
      </div>

      {/* Grid of Saved Matches */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {sortedFavorites.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            isFavorite={true}
            onToggleFavorite={onToggleFavorite}
            hasNotification={notifications[match.id] !== undefined}
            onToggleNotification={onToggleNotification}
            onSelectMatch={onSelectMatch}
          />
        ))}
      </div>
    </div>
  );
};
