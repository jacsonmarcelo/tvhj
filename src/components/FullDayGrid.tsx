import React, { useState } from 'react';
import { MatchEvent } from '../types';
import { MatchCard } from './MatchCard';
import { Star, Bell, BellRing, ChevronRight, Sparkles, Clock, Table, Grid } from 'lucide-react';

interface FullDayGridProps {
  matches: MatchEvent[];
  favorites: string[];
  notifications: Record<string, number>;
  onToggleFavorite: (id: string) => void;
  onToggleNotification: (match: MatchEvent) => void;
  onSelectMatch: (match: MatchEvent) => void;
}

type PeriodFilter = 'all' | 'period1' | 'period2' | 'period3';
type LayoutMode = 'table' | 'cards';

export const FullDayGrid: React.FC<FullDayGridProps> = ({
  matches,
  favorites,
  notifications,
  onToggleFavorite,
  onToggleNotification,
  onSelectMatch,
}) => {
  const [activePeriod, setActivePeriod] = useState<PeriodFilter>('all');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('table');

  // Categorize matches into the exact 3 tables from the user's images:
  // Table 1: 01h00 to 10h30 (22 matches)
  // Table 2: 11h00 to 15h00 (21 matches)
  // Table 3: 15h45 to 21h20 (21 matches)
  const table1Matches = matches.filter((m) => m.timeMinutes <= 630);
  const table2Matches = matches.filter((m) => m.timeMinutes >= 660 && m.timeMinutes <= 900);
  const table3Matches = matches.filter((m) => m.timeMinutes >= 945);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const renderTableView = (title: string, subtitle: string, items: MatchEvent[], sectionId: string) => {
    if (items.length === 0) return null;

    return (
      <div id={sectionId} className="mb-8 scroll-mt-32">
        {/* Section Header */}
        <div className="flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded-t-xl px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
              {title}
            </h2>
            <span className="text-xs text-neutral-400 font-medium hidden sm:inline">
              ({subtitle})
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-md bg-neutral-800 text-neutral-300 text-xs font-semibold border border-neutral-700">
            {items.length} confrontos
          </span>
        </div>

        {/* Traditional TV Guide Styled Table */}
        <div className="overflow-x-auto border-x border-b border-neutral-800 rounded-b-xl shadow-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-950 text-neutral-400 text-xs uppercase tracking-wider font-semibold border-b border-neutral-800">
                <th className="py-2.5 px-3 w-20 text-center">Horário</th>
                <th className="py-2.5 px-4 w-48">Modalidade / Liga</th>
                <th className="py-2.5 px-4">Confronto / Evento</th>
                <th className="py-2.5 px-4 w-60">Onde Assistir</th>
                <th className="py-2.5 px-3 w-24 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80 text-sm">
              {items.map((m) => {
                const isFav = favorites.includes(m.id);
                const isNotified = notifications[m.id] !== undefined;

                // Emulate subtle visual distinction similar to original broadcast sheet
                let rowBg = 'bg-neutral-900/60 hover:bg-neutral-850';
                let timeColor = 'text-emerald-400';
                
                if (m.highlight) {
                  if (m.highlightType === 'yellow') {
                    rowBg = 'bg-amber-950/20 hover:bg-amber-950/35 border-l-2 border-l-amber-400';
                    timeColor = 'text-amber-400';
                  } else if (m.highlightType === 'pink') {
                    rowBg = 'bg-rose-950/20 hover:bg-rose-950/35 border-l-2 border-l-rose-400';
                    timeColor = 'text-rose-400';
                  } else if (m.highlightType === 'blue') {
                    rowBg = 'bg-blue-950/20 hover:bg-blue-950/35 border-l-2 border-l-blue-400';
                    timeColor = 'text-blue-400';
                  } else {
                    rowBg = 'bg-emerald-950/20 hover:bg-emerald-950/35 border-l-2 border-l-emerald-400';
                  }
                }

                return (
                  <tr
                    key={m.id}
                    id={`table-row-${m.id}`}
                    onClick={() => onSelectMatch(m)}
                    className={`transition-colors cursor-pointer group ${rowBg}`}
                  >
                    {/* Time Column */}
                    <td className="py-3 px-3 text-center font-mono font-bold text-sm whitespace-nowrap">
                      <span className={timeColor}>{m.time}</span>
                    </td>

                    {/* Sport/League Column */}
                    <td className="py-3 px-4 font-medium text-neutral-300 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate max-w-[170px]">{m.leagueOrSport}</span>
                      </div>
                    </td>

                    {/* Match title & Details Column */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white group-hover:text-emerald-300 transition-colors">
                          {m.matchTitle}
                        </span>
                        {m.highlightBadge && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-neutral-800 text-amber-300 border border-amber-500/30">
                            {m.highlightBadge}
                          </span>
                        )}
                        {m.scoreOrContext && (
                          <span className="text-xs text-neutral-400 font-medium">
                            {m.scoreOrContext}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Broadcasters Column */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {m.channels.map((ch, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded text-xs font-semibold bg-neutral-800 text-neutral-200 border border-neutral-700 whitespace-nowrap"
                          >
                            {ch}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Action buttons (favorite & notify) */}
                    <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onToggleNotification(m)}
                          id={`table-btn-notify-${m.id}`}
                          title={isNotified ? 'Alerta configurado' : 'Definir alerta'}
                          className={`p-1.5 rounded-md border transition-colors ${
                            isNotified
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                              : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
                          }`}
                        >
                          {isNotified ? <BellRing className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => onToggleFavorite(m.id)}
                          id={`table-btn-fav-${m.id}`}
                          title={isFav ? 'Remover dos favoritos' : 'Favoritar'}
                          className={`p-1.5 rounded-md border transition-colors ${
                            isFav
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 fill-amber-400'
                              : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-amber-400'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderCardSection = (title: string, subtitle: string, items: MatchEvent[], sectionId: string) => {
    if (items.length === 0) return null;

    return (
      <div id={sectionId} className="mb-8 scroll-mt-32">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              {title}
            </h2>
            <p className="text-xs text-neutral-400">{subtitle}</p>
          </div>
          <span className="px-2.5 py-1 rounded-md bg-neutral-800 text-neutral-300 text-xs font-semibold border border-neutral-700">
            {items.length} jogos
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {items.map((match) => (
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
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Controller: Quick Jump Bar between the 3 tables & View Switcher */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3 sm:p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-emerald-400" /> Pular para:
          </span>
          <button
            onClick={() => {
              setActivePeriod('all');
              scrollToSection('section-table-1');
            }}
            id="jump-btn-all"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${
              activePeriod === 'all'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:text-white'
            }`}
          >
            Dia Todo (64)
          </button>
          <button
            onClick={() => {
              setActivePeriod('period1');
              scrollToSection('section-table-1');
            }}
            id="jump-btn-p1"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${
              activePeriod === 'period1'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:text-white'
            }`}
          >
            🌅 01h00 - 10h30 (Manhã)
          </button>
          <button
            onClick={() => {
              setActivePeriod('period2');
              scrollToSection('section-table-2');
            }}
            id="jump-btn-p2"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${
              activePeriod === 'period2'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:text-white'
            }`}
          >
            ☀️ 11h00 - 15h00 (Tarde)
          </button>
          <button
            onClick={() => {
              setActivePeriod('period3');
              scrollToSection('section-table-3');
            }}
            id="jump-btn-p3"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${
              activePeriod === 'period3'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:text-white'
            }`}
          >
            🌙 15h45 - 21h20 (Noite)
          </button>
        </div>

        {/* View Layout Switcher (Table vs Cards) */}
        <div className="flex items-center gap-1.5 self-end md:self-auto bg-neutral-950 p-1 rounded-lg border border-neutral-800">
          <button
            onClick={() => setLayoutMode('table')}
            id="layout-toggle-table"
            title="Visualização em Tabela (Guia Clássico)"
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
              layoutMode === 'table'
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Table className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tabela TV</span>
          </button>
          <button
            onClick={() => setLayoutMode('cards')}
            id="layout-toggle-cards"
            title="Visualização em Cards Modernos"
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
              layoutMode === 'cards'
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cards</span>
          </button>
        </div>
      </div>

      {/* Main Sections */}
      {layoutMode === 'table' ? (
        <>
          {(activePeriod === 'all' || activePeriod === 'period1') &&
            renderTableView(
              'Tabela 1: Madrugada & Manhã',
              '01h00 às 10h30 • F1, MotoGP, Premier League, WTT Hugo Calderano',
              table1Matches,
              'section-table-1'
            )}
          {(activePeriod === 'all' || activePeriod === 'period2') &&
            renderTableView(
              'Tabela 2: Tarde',
              '11h00 às 15h00 • Vôlei Brasil x Argentina, Final US Open, Derby Manchester, Judô',
              table2Matches,
              'section-table-2'
            )}
          {(activePeriod === 'all' || activePeriod === 'period3') &&
            renderTableView(
              'Tabela 3: Fim de Tarde & Noite',
              '15h45 às 21h20 • Flamengo x Corinthians, NFL Sunday Night, Clássico-Rei',
              table3Matches,
              'section-table-3'
            )}
        </>
      ) : (
        <>
          {(activePeriod === 'all' || activePeriod === 'period1') &&
            renderCardSection(
              'Tabela 1: Madrugada & Manhã',
              '01h00 às 10h30',
              table1Matches,
              'section-table-1'
            )}
          {(activePeriod === 'all' || activePeriod === 'period2') &&
            renderCardSection(
              'Tabela 2: Tarde',
              '11h00 às 15h00',
              table2Matches,
              'section-table-2'
            )}
          {(activePeriod === 'all' || activePeriod === 'period3') &&
            renderCardSection(
              'Tabela 3: Fim de Tarde & Noite',
              '15h45 às 21h20',
              table3Matches,
              'section-table-3'
            )}
        </>
      )}
    </div>
  );
};
