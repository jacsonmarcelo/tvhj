import React, { useState, useEffect, useMemo } from 'react';
import { MatchEvent, SportCategory, ViewMode } from './types';
import { SPORTS_SCHEDULE } from './data/sportsSchedule';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { FullDayGrid } from './components/FullDayGrid';
import { TimelineNav } from './components/TimelineNav';
import { SportCategoryView } from './components/SportCategoryView';
import { FavoritesView } from './components/FavoritesView';
import { MatchDetailsModal } from './components/MatchDetailsModal';
import { NotificationToast, ToastMessage } from './components/NotificationToast';
import { playSportNotificationChime, sendSystemNotification } from './utils/notifications';

const FAVORITES_STORAGE_KEY = 'agenda_esportiva_favorites_13092026';
const NOTIFICATIONS_STORAGE_KEY = 'agenda_esportiva_notifications_13092026';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SportCategory | 'all'>('all');
  const [onlyHighlights, setOnlyHighlights] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<string | 'all'>('all');

  // Stored state: Favorites & Notification preferences
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : ['evt-56', 'evt-26', 'evt-19']; // Default favorites: Fla x Flu/Corinthians, Vôlei Brasil x Arg, F1
    } catch {
      return ['evt-56', 'evt-26', 'evt-19'];
    }
  });

  const [notifications, setNotifications] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : { 'evt-56': 15, 'evt-26': 0 };
    } catch {
      return { 'evt-56': 15, 'evt-26': 0 };
    }
  });

  // Modal selection state
  const [selectedMatch, setSelectedMatch] = useState<MatchEvent | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync favorites with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // Ignore quota errors
    }
  }, [favorites]);

  // Sync notifications with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    } catch {
      // Ignore quota errors
    }
  }, [notifications]);

  // Toast auto-dismiss after 6 seconds
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 6000);
    return () => clearTimeout(timer);
  }, [toasts]);

  const addToast = (title: string, body: string, match?: MatchEvent) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, title, body, match }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Filtered matches logic
  const filteredMatches = useMemo(() => {
    return SPORTS_SCHEDULE.filter((match) => {
      // Search query filter (matches team names, title, league, channel, context)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const inTitle = match.matchTitle.toLowerCase().includes(query);
        const inSport = match.leagueOrSport.toLowerCase().includes(query);
        const inChannels = match.channels.some((ch) => ch.toLowerCase().includes(query));
        const inContext = match.scoreOrContext ? match.scoreOrContext.toLowerCase().includes(query) : false;
        const inBadge = match.highlightBadge ? match.highlightBadge.toLowerCase().includes(query) : false;

        if (!inTitle && !inSport && !inChannels && !inContext && !inBadge) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'all' && match.category !== selectedCategory) {
        return false;
      }

      // Highlights filter
      if (onlyHighlights && !match.highlight) {
        return false;
      }

      // Channel filter
      if (selectedChannel !== 'all') {
        const hasChannel = match.channels.some((ch) =>
          ch.toLowerCase().includes(selectedChannel.toLowerCase())
        );
        if (!hasChannel) return false;
      }

      return true;
    });
  }, [searchQuery, selectedCategory, onlyHighlights, selectedChannel]);

  // Favorite matches object list
  const favoriteMatches = useMemo(() => {
    return SPORTS_SCHEDULE.filter((m) => favorites.includes(m.id));
  }, [favorites]);

  // Handlers
  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(id);
      const match = SPORTS_SCHEDULE.find((m) => m.id === id);
      if (exists) {
        return prev.filter((item) => item !== id);
      } else {
        if (match) {
          addToast('Favorito Adicionado', `${match.matchTitle} (${match.time}) salvo na sua lista de favoritos!`, match);
        }
        return [...prev, id];
      }
    });
  };

  const handleSetNotification = (match: MatchEvent, minutesBefore: number) => {
    playSportNotificationChime();
    setNotifications((prev) => ({
      ...prev,
      [match.id]: minutesBefore,
    }));

    const label = minutesBefore === 0 ? 'no início' : `${minutesBefore} minutos antes`;
    const body = `Você será avisado ${label} de ${match.matchTitle} (${match.time} no ${match.channels[0]})`;

    sendSystemNotification(`🔔 Lembrete Programado: ${match.matchTitle}`, body);
    addToast(`Alerta Ativado (${match.time})`, body, match);
  };

  const handleRemoveNotification = (matchId: string) => {
    setNotifications((prev) => {
      const next = { ...prev };
      delete next[matchId];
      return next;
    });
    const match = SPORTS_SCHEDULE.find((m) => m.id === matchId);
    addToast('Alerta Desativado', `Notificação cancelada para ${match?.matchTitle || 'a partida'}.`);
  };

  const handleToggleNotification = (match: MatchEvent) => {
    if (notifications[match.id] !== undefined) {
      handleRemoveNotification(match.id);
    } else {
      handleSetNotification(match, 15); // Default: 15 min antes
    }
  };

  const handleEnableAllNotifications = () => {
    playSportNotificationChime();
    const updated = { ...notifications };
    favoriteMatches.forEach((m) => {
      if (updated[m.id] === undefined) {
        updated[m.id] = 15;
      }
    });
    setNotifications(updated);
    addToast(
      'Alertas Ativados em Massa',
      `Notificações programadas para todos os ${favoriteMatches.length} confrontos favoritos!`
    );
  };

  const handleClearAllFavorites = () => {
    if (window.confirm('Deseja realmente remover todos os seus horários favoritos?')) {
      setFavorites([]);
      addToast('Favoritos Limpos', 'Sua lista de jogos favoritos foi esvaziada.');
    }
  };

  const handleTriggerTestNotification = () => {
    playSportNotificationChime();
    const sample = SPORTS_SCHEDULE.find((m) => m.id === 'evt-56') || SPORTS_SCHEDULE[0];
    sendSystemNotification(
      `⚽ Jogo Começando: ${sample.matchTitle}`,
      `Transmissão ao vivo agora em ${sample.channels.join(', ')}!`
    );
    addToast(
      '⚽ Teste de Notificação',
      `Aviso sonoro ativado para ${sample.matchTitle} (${sample.time})!`,
      sample
    );
  };

  // Fluid navigation inside modal
  const currentMatchIndex = selectedMatch
    ? filteredMatches.findIndex((m) => m.id === selectedMatch.id)
    : -1;

  const handleNextMatch = () => {
    if (currentMatchIndex >= 0 && currentMatchIndex < filteredMatches.length - 1) {
      setSelectedMatch(filteredMatches[currentMatchIndex + 1]);
    }
  };

  const handlePrevMatch = () => {
    if (currentMatchIndex > 0) {
      setSelectedMatch(filteredMatches[currentMatchIndex - 1]);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Application Header */}
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        favoritesCount={favorites.length}
        activeRemindersCount={Object.keys(notifications).length}
        onTriggerTestNotification={handleTriggerTestNotification}
      />

      {/* Global Search & Filter Bar */}
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onlyHighlights={onlyHighlights}
        onToggleHighlights={() => setOnlyHighlights(!onlyHighlights)}
        selectedChannel={selectedChannel}
        onChannelChange={setSelectedChannel}
        totalFilteredCount={filteredMatches.length}
        totalCount={SPORTS_SCHEDULE.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentView === 'grid' && (
          <FullDayGrid
            matches={filteredMatches}
            favorites={favorites}
            notifications={notifications}
            onToggleFavorite={handleToggleFavorite}
            onToggleNotification={handleToggleNotification}
            onSelectMatch={setSelectedMatch}
          />
        )}

        {currentView === 'timeline' && (
          <TimelineNav
            matches={filteredMatches}
            favorites={favorites}
            notifications={notifications}
            onToggleFavorite={handleToggleFavorite}
            onToggleNotification={handleToggleNotification}
            onSelectMatch={setSelectedMatch}
          />
        )}

        {currentView === 'sports' && (
          <SportCategoryView
            matches={filteredMatches}
            favorites={favorites}
            notifications={notifications}
            onToggleFavorite={handleToggleFavorite}
            onToggleNotification={handleToggleNotification}
            onSelectMatch={setSelectedMatch}
          />
        )}

        {currentView === 'favorites' && (
          <FavoritesView
            favoriteMatches={favoriteMatches}
            notifications={notifications}
            onToggleFavorite={handleToggleFavorite}
            onToggleNotification={handleToggleNotification}
            onSelectMatch={setSelectedMatch}
            onClearAllFavorites={handleClearAllFavorites}
            onEnableAllNotifications={handleEnableAllNotifications}
            onExploreSchedule={() => setCurrentView('grid')}
          />
        )}
      </main>

      {/* Footer info bar */}
      <footer className="mt-auto border-t border-neutral-850 bg-neutral-950 py-6 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Agenda Esportiva na TV • Grade de Domingo, 13 de Setembro de 2026</span>
          <span>Fonte: @ESPORTESNATV • 64 confrontos e transmissões catalogadas</span>
        </div>
      </footer>

      {/* Match Details & Navigation Modal */}
      {selectedMatch && (
        <MatchDetailsModal
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
          isFavorite={favorites.includes(selectedMatch.id)}
          onToggleFavorite={handleToggleFavorite}
          notificationMinutes={notifications[selectedMatch.id]}
          onSetNotification={handleSetNotification}
          onRemoveNotification={handleRemoveNotification}
          onNextMatch={handleNextMatch}
          onPrevMatch={handlePrevMatch}
          hasNext={currentMatchIndex < filteredMatches.length - 1}
          hasPrev={currentMatchIndex > 0}
        />
      )}

      {/* Floating Notification Toasts */}
      <NotificationToast
        toasts={toasts}
        onDismiss={removeToast}
        onSelectMatch={setSelectedMatch}
      />
    </div>
  );
}
