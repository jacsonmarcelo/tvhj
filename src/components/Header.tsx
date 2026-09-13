import React, { useState } from 'react';
import { Bell, BellRing, Calendar, Star, LayoutGrid, Clock, Trophy, Volume2, UploadCloud } from 'lucide-react';
import { ViewMode } from '../types';
import { playSportNotificationChime, requestBrowserNotificationPermission } from '../utils/notifications';

interface HeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  favoritesCount: number;
  activeRemindersCount: number;
  onTriggerTestNotification: () => void;
  onOpenAdminModal: () => void;
  currentDateTitle: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  favoritesCount,
  activeRemindersCount,
  onTriggerTestNotification,
  onOpenAdminModal,
  currentDateTitle,
}) => {
  const [browserNotificationAllowed, setBrowserNotificationAllowed] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );

  const handleEnableNotifications = async () => {
    const granted = await requestBrowserNotificationPermission();
    setBrowserNotificationAllowed(granted);
    playSportNotificationChime();
    onTriggerTestNotification();
  };

  return (
    <header className="sticky top-0 z-40 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800/80 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar: branding and action controls */}
        <div className="py-3 sm:py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-neutral-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-black shadow-md shadow-emerald-500/20 text-lg">
              TV
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-['Cabinet_Grotesk']">
                  AGENDA ESPORTIVA NA TV
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  AO VIVO
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-400">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold text-neutral-200">{currentDateTitle}</span>
                <span className="hidden sm:inline text-neutral-600">•</span>
                <span className="hidden sm:inline text-neutral-400">Grade completa de transmissões esportivas</span>
              </div>
            </div>
          </div>

          {/* Right Action buttons: Admin Upload, Notifications & Sound */}
          <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
            <button
              onClick={onOpenAdminModal}
              id="header-admin-upload-btn"
              title="Fazer upload de novas fotos de tabelas para atualizar a programação"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-neutral-800 hover:bg-neutral-750 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400 shadow-sm transition-all group"
            >
              <UploadCloud className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Atualizar Grade (Fotos)</span>
            </button>

            <button
              onClick={handleEnableNotifications}
              id="header-notification-btn"
              title={browserNotificationAllowed ? 'Notificações ativadas! Clique para testar aviso sonoro' : 'Ativar notificações do navegador'}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                browserNotificationAllowed
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/50'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
              }`}
            >
              {browserNotificationAllowed ? (
                <>
                  <BellRing className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="hidden sm:inline">Notificações: Ativas</span>
                  <span className="sm:hidden">Alertas On</span>
                  {activeRemindersCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-500 text-neutral-950 text-[11px] font-bold">
                      {activeRemindersCount}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4 text-amber-400" />
                  <span>Ativar Notificações</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                playSportNotificationChime();
                onTriggerTestNotification();
              }}
              id="header-sound-test-btn"
              title="Testar aviso sonoro de início de partida"
              className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-colors"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 py-2 overflow-x-auto no-scrollbar" aria-label="Navegação de visualizações">
          <button
            onClick={() => onViewChange('grid')}
            id="tab-view-grid"
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              currentView === 'grid'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Grade do Dia Todo</span>
          </button>

          <button
            onClick={() => onViewChange('timeline')}
            id="tab-view-timeline"
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              currentView === 'timeline'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Por Horário</span>
          </button>

          <button
            onClick={() => onViewChange('sports')}
            id="tab-view-sports"
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              currentView === 'sports'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Por Modalidade</span>
          </button>

          <button
            onClick={() => onViewChange('favorites')}
            id="tab-view-favorites"
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              currentView === 'favorites'
                ? 'bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <Star className={`w-4 h-4 ${favoritesCount > 0 ? 'text-amber-400 fill-amber-400' : ''}`} />
            <span>Meus Favoritos</span>
            {favoritesCount > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
                currentView === 'favorites' ? 'bg-neutral-900 text-amber-300' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {favoritesCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};
