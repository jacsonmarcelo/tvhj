export type SportCategory =
  | 'futebol'
  | 'futebol-fem'
  | 'automobilismo'
  | 'nfl'
  | 'volei'
  | 'basquete'
  | 'tenis'
  | 'tenis-mesa'
  | 'futsal'
  | 'lutas'
  | 'outros';

export type DayPeriod = 'madrugada' | 'manha' | 'tarde' | 'noite';

export interface MatchEvent {
  id: string;
  time: string; // "17h30"
  timeMinutes: number; // e.g., 17 * 60 + 30 = 1050
  leagueOrSport: string; // e.g. "Brasileirão", "Fórmula 1", "NFL"
  category: SportCategory;
  matchTitle: string; // e.g. "Flamengo x Corinthians"
  team1?: string;
  team2?: string;
  stage?: string; // "Final", "SF", "QF", "OF", "Final (ida)"
  channels: string[]; // ["GLOBO", "PREMIERE", "youtube GETV"]
  highlight?: boolean; // Highlighted match in original broadcast guide
  highlightType?: 'yellow' | 'pink' | 'blue' | 'orange' | 'green';
  highlightBadge?: string; // "Final Grand Slam", "Clássico", "Destaque Brasil", etc.
  scoreOrContext?: string; // e.g. "(2x0)", "(0x0)", "(13h30 final Alison dos Santos)"
  period: DayPeriod;
}

export interface NotificationPreference {
  eventId: string;
  minutesBefore: number; // 0 (on start), 5, 15, 30
  enabled: boolean;
  scheduledTime: number; // timestamp
}

export type ViewMode = 'timeline' | 'grid' | 'sports' | 'favorites';

export interface FilterState {
  searchQuery: string;
  selectedCategory: SportCategory | 'all';
  selectedPeriod: DayPeriod | 'all';
  onlyHighlights: boolean;
  selectedChannel: string | 'all';
}
