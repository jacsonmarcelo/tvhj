import React, { useState } from 'react';
import { MatchEvent } from '../types';
import { MatchCard } from './MatchCard';
import { Clock, Sun, Sunrise, Sunset, Moon } from 'lucide-react';

interface TimelineNavProps {
  matches: MatchEvent[];
  favorites: string[];
  notifications: Record<string, number>;
  onToggleFavorite: (id: string) => void;
  onToggleNotification: (match: MatchEvent) => void;
  onSelectMatch: (match: MatchEvent) => void;
}

export const TimelineNav: React.FC<TimelineNavProps> = ({
  matches,
  favorites,
  notifications,
  onToggleFavorite,
  onToggleNotification,
  onSelectMatch,
}) => {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('all');

  // Group unique hours
  const uniqueTimes: string[] = Array.from(new Set<string>(matches.map((m) => m.time))).sort((a: string, b: string) => {
    const parse = (t: string) => {
      const parts = t.replace('h', ':').split(':');
      return parseInt(parts[0], 10) * 60 + (parts[1] ? parseInt(parts[1], 10) : 0);
    };
    return parse(a) - parse(b);
  });

  const filteredMatches =
    selectedTimeSlot === 'all'
      ? matches
      : matches.filter((m) => m.time === selectedTimeSlot);

  // Group matches by time for timeline display
  const matchesByTime: Record<string, MatchEvent[]> = {};
  filteredMatches.forEach((m) => {
    if (!matchesByTime[m.time]) {
      matchesByTime[m.time] = [];
    }
    matchesByTime[m.time].push(m);
  });

  const getTimeSlotIcon = (time: string) => {
    const hour = parseInt(time.split('h')[0], 10);
    if (hour < 6) return <Moon className="w-3.5 h-3.5 text-indigo-400" />;
    if (hour < 12) return <Sunrise className="w-3.5 h-3.5 text-amber-400" />;
    if (hour < 18) return <Sun className="w-3.5 h-3.5 text-orange-400" />;
    return <Sunset className="w-3.5 h-3.5 text-purple-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Horizontal Time Scrubber / Quick Jump Buttons */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3 sm:p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Filtrar por horário de início:</span>
          </div>
          {selectedTimeSlot !== 'all' && (
            <button
              onClick={() => setSelectedTimeSlot('all')}
              id="timeline-show-all-btn"
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
            >
              Ver todos horários
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedTimeSlot('all')}
            id="slot-all"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors border ${
              selectedTimeSlot === 'all'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:text-white'
            }`}
          >
            Todos ({matches.length})
          </button>

          {uniqueTimes.map((time) => {
            const count = matches.filter((m) => m.time === time).length;
            return (
              <button
                key={time}
                onClick={() => setSelectedTimeSlot(time)}
                id={`slot-${time}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors border flex items-center gap-1.5 ${
                  selectedTimeSlot === time
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                    : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:text-white'
                }`}
              >
                {getTimeSlotIcon(time)}
                <span>{time}</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chronological List of Matches Grouped by Time */}
      <div className="space-y-6">
        {Object.keys(matchesByTime).length === 0 ? (
          <div className="text-center py-12 bg-neutral-900/50 rounded-xl border border-neutral-800">
            <p className="text-neutral-400 text-sm">Nenhuma partida encontrada para este horário.</p>
          </div>
        ) : (
          Object.entries(matchesByTime).map(([time, timeMatches]) => (
            <div key={time} className="relative">
              {/* Timeline Header Badge */}
              <div className="flex items-center gap-3 mb-3 sticky top-28 sm:top-24 z-20 py-1 bg-neutral-950/90 backdrop-blur-sm">
                <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono font-black text-sm sm:text-base shadow-sm">
                  {getTimeSlotIcon(time)}
                  <span>{time}</span>
                </div>
                <div className="h-px bg-neutral-800 flex-1" />
                <span className="text-xs text-neutral-400 font-medium">
                  {timeMatches.length} {timeMatches.length === 1 ? 'confronto' : 'confrontos'}
                </span>
              </div>

              {/* Match Cards for this time */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pl-1 sm:pl-2">
                {timeMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    isFavorite={favorites.includes(match.id)}
                    onToggleFavorite={onToggleFavorite}
                    hasNotification={notifications[match.id] !== undefined}
                    onToggleNotification={onToggleNotification}
                    onSelectMatch={onSelectMatch}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
