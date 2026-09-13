import React from 'react';
import { Search, X, Filter, Flame, Trophy, Tv } from 'lucide-react';
import { SportCategory } from '../types';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedCategory: SportCategory | 'all';
  onCategoryChange: (cat: SportCategory | 'all') => void;
  onlyHighlights: boolean;
  onToggleHighlights: () => void;
  selectedChannel: string | 'all';
  onChannelChange: (ch: string | 'all') => void;
  totalFilteredCount: number;
  totalCount: number;
}

const CATEGORY_OPTIONS: { id: SportCategory | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'Todos os Esportes', icon: '🌐' },
  { id: 'futebol', label: 'Futebol Masc.', icon: '⚽' },
  { id: 'futebol-fem', label: 'Futebol Fem.', icon: '⚽' },
  { id: 'automobilismo', label: 'Auto & Moto', icon: '🏎️' },
  { id: 'nfl', label: 'NFL', icon: '🏈' },
  { id: 'volei', label: 'Vôlei', icon: '🏐' },
  { id: 'tenis', label: 'Tênis', icon: '🎾' },
  { id: 'basquete', label: 'Basquete', icon: '🏀' },
  { id: 'tenis-mesa', label: 'Tênis de Mesa', icon: '🏓' },
  { id: 'futsal', label: 'Futsal', icon: '👟' },
  { id: 'lutas', label: 'Judô & Lutas', icon: '🥋' },
  { id: 'outros', label: 'Outros', icon: '🏆' },
];

const POPULAR_CHANNELS = [
  'all',
  'CazéTV',
  'ESPN',
  'SPORTV',
  'GLOBO',
  'PREMIERE',
  'BANDSPORTS',
  'Disney+',
  'youtube',
];

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onlyHighlights,
  onToggleHighlights,
  selectedChannel,
  onChannelChange,
  totalFilteredCount,
  totalCount,
}) => {
  const isFiltered = searchQuery !== '' || selectedCategory !== 'all' || onlyHighlights || selectedChannel !== 'all';

  const handleResetFilters = () => {
    onSearchChange('');
    onCategoryChange('all');
    if (onlyHighlights) onToggleHighlights();
    onChannelChange('all');
  };

  return (
    <div className="bg-neutral-900/80 border-b border-neutral-800 p-4 sm:p-5">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Main Search Bar and Clear */}
        <div className="relative flex items-center">
          <div className="absolute left-3.5 pointer-events-none text-neutral-400">
            <Search className="w-5 h-5 text-emerald-400" />
          </div>
          <input
            type="text"
            id="search-schedule-input"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por equipe, confronto, modalidade ou canal (ex: Flamengo, CazéTV, Zverev, F1, Vôlei)..."
            className="w-full bg-neutral-950/90 text-white placeholder-neutral-500 rounded-xl pl-11 pr-24 py-3 text-sm sm:text-base border border-neutral-700/80 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              id="clear-search-btn"
              title="Limpar texto da busca"
              className="absolute right-3 p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Filter Pills Row 1: Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-neutral-400 font-medium whitespace-nowrap mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-neutral-400" /> Modalidades:
          </span>
          {CATEGORY_OPTIONS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              id={`filter-cat-${cat.id}`}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 border ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                  : 'bg-neutral-800/80 hover:bg-neutral-750 text-neutral-300 border-neutral-700/80'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Quick Filter Pills Row 2: Highlights and Channel Shortcuts */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-neutral-800/60">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
            <button
              onClick={onToggleHighlights}
              id="filter-highlights-btn"
              className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 border transition-all ${
                onlyHighlights
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                  : 'bg-neutral-800/60 text-neutral-400 border-neutral-750 hover:text-white'
              }`}
            >
              <Flame className={`w-3.5 h-3.5 ${onlyHighlights ? 'text-amber-400' : 'text-neutral-400'}`} />
              <span>Só Destaques & Finais</span>
            </button>

            <div className="h-4 w-px bg-neutral-800 mx-1 hidden sm:block" />

            <span className="text-neutral-500 text-[11px] uppercase tracking-wider font-bold hidden md:inline flex items-center gap-1">
              <Tv className="w-3 h-3" /> Transmissão:
            </span>

            {POPULAR_CHANNELS.map((channel) => (
              <button
                key={channel}
                onClick={() => onChannelChange(channel)}
                id={`filter-channel-${channel.toLowerCase()}`}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-colors border ${
                  selectedChannel === channel
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-neutral-800/60 text-neutral-400 border-neutral-750 hover:text-white'
                }`}
              >
                {channel === 'all' ? 'Todos Canais' : channel}
              </button>
            ))}
          </div>

          {/* Results count & reset */}
          <div className="flex items-center gap-2 text-xs text-neutral-400 ml-auto">
            <span>
              Mostrando <strong className="text-emerald-400">{totalFilteredCount}</strong> de {totalCount} eventos
            </span>
            {isFiltered && (
              <button
                onClick={handleResetFilters}
                id="reset-all-filters-btn"
                className="text-amber-400 hover:text-amber-300 hover:underline font-semibold"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
