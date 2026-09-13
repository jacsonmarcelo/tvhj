import React, { useState } from 'react';
import { MatchEvent, SportCategory } from '../types';
import { MatchCard } from './MatchCard';
import { CATEGORY_LABELS } from '../data/sportsSchedule';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface SportCategoryViewProps {
  matches: MatchEvent[];
  favorites: string[];
  notifications: Record<string, number>;
  onToggleFavorite: (id: string) => void;
  onToggleNotification: (match: MatchEvent) => void;
  onSelectMatch: (match: MatchEvent) => void;
}

export const SportCategoryView: React.FC<SportCategoryViewProps> = ({
  matches,
  favorites,
  notifications,
  onToggleFavorite,
  onToggleNotification,
  onSelectMatch,
}) => {
  // Group matches by category
  const matchesByCategory: Partial<Record<SportCategory, MatchEvent[]>> = {};
  
  // Define custom ordering of categories for optimal sports TV viewing experience
  const categoryOrder: SportCategory[] = [
    'futebol',
    'automobilismo',
    'nfl',
    'futebol-fem',
    'volei',
    'tenis',
    'basquete',
    'tenis-mesa',
    'futsal',
    'lutas',
    'outros',
  ];

  categoryOrder.forEach((cat) => {
    const list = matches.filter((m) => m.category === cat);
    if (list.length > 0) {
      matchesByCategory[cat] = list;
    }
  });

  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  const collapseAll = () => {
    const next: Record<string, boolean> = {};
    categoryOrder.forEach((cat) => {
      next[cat] = true;
    });
    setCollapsedCategories(next);
  };

  const expandAll = () => {
    setCollapsedCategories({});
  };

  return (
    <div className="space-y-6">
      {/* Category Overview Bar */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-neutral-400 font-semibold">
          <span>Modalidades com transmissão hoje ({Object.keys(matchesByCategory).length}):</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            id="btn-expand-all-categories"
            className="text-xs px-2.5 py-1 rounded bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700"
          >
            Expandir todos
          </button>
          <button
            onClick={collapseAll}
            id="btn-collapse-all-categories"
            className="text-xs px-2.5 py-1 rounded bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700"
          >
            Recolher todos
          </button>
        </div>
      </div>

      {/* Category Sections */}
      <div className="space-y-6">
        {categoryOrder.map((catKey) => {
          const categoryMatches = matchesByCategory[catKey];
          if (!categoryMatches || categoryMatches.length === 0) return null;

          const meta = CATEGORY_LABELS[catKey];
          const isCollapsed = collapsedCategories[catKey];

          return (
            <div
              key={catKey}
              id={`cat-section-${catKey}`}
              className="bg-neutral-900/50 border border-neutral-800/90 rounded-xl overflow-hidden shadow-sm"
            >
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(catKey)}
                id={`cat-header-${catKey}`}
                className="w-full px-4 py-3.5 bg-neutral-900 hover:bg-neutral-850 flex items-center justify-between transition-colors border-b border-neutral-800/80 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{meta.icon}</span>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                      {meta.name}
                    </h2>
                    <span className="text-xs text-neutral-400">
                      {categoryMatches.length} {categoryMatches.length === 1 ? 'evento programado' : 'eventos programados'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-neutral-800 text-neutral-300 text-xs font-semibold border border-neutral-700">
                    {categoryMatches.length}
                  </span>
                  {isCollapsed ? (
                    <ChevronDown className="w-5 h-5 text-neutral-400" />
                  ) : (
                    <ChevronUp className="w-5 h-5 text-neutral-400" />
                  )}
                </div>
              </button>

              {/* Cards Grid */}
              {!isCollapsed && (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {categoryMatches.map((match) => (
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
