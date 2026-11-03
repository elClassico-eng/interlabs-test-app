import { MATCHES_URL } from './config';

// Известные статусы + любая другая строка: сервер может прислать новый статус,
// и приложение не должно из-за этого падать или терять матч.
export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'postponed' | (string & {});

export type Team = {
  id: string;
  name: string;
  city: string;
};

export type Match = {
  id: string;
  startsAt: string | null; // ISO в UTC; null — дата не назначена (перенесённый матч)
  status: MatchStatus;
  minute?: number; // только у live
  home: Team;
  away: Team;
  score: { home: number; away: number } | null; // null — матч не начался
};

type MatchesResponse = {
  round: number;
  matches: Match[];
};

export async function fetchMatches(): Promise<Match[]> {
  const response = await fetch(MATCHES_URL);
  if (!response.ok) {
    throw new Error(`Сервер ответил ${response.status}`);
  }
  const data = (await response.json()) as MatchesResponse;
  if (!Array.isArray(data?.matches)) {
    throw new Error('Неожиданный формат ответа');
  }
  return data.matches;
}

export type MatchFilter = 'all' | 'upcoming' | 'finished';

export const FILTERS: { value: MatchFilter; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'upcoming', label: 'Предстоящие' },
  { value: 'finished', label: 'Завершённые' },
];

// «Предстоящие» = ещё не сыгранные до конца: запланированные, идущие (счёт
// может измениться) и перенесённые (будут сыграны позже).
// Неизвестные статусы попадают только во «Все» — не угадываем, но и не теряем.
const UPCOMING_STATUSES: MatchStatus[] = ['scheduled', 'live', 'postponed'];

export function matchesFilter(match: Match, filter: MatchFilter): boolean {
  switch (filter) {
    case 'all':
      return true;
    case 'upcoming':
      return UPCOMING_STATUSES.includes(match.status);
    case 'finished':
      return match.status === 'finished';
  }
}

export function statusLabel(match: Match): string {
  switch (match.status) {
    case 'scheduled':
      return 'Запланирован';
    case 'live':
      return match.minute != null ? `Идёт · ${match.minute}′` : 'Идёт';
    case 'finished':
      return 'Завершён';
    case 'postponed':
      return 'Перенесён';
    default:
      return 'Статус неизвестен';
  }
}

// Без timeZone в опциях Intl берёт часовой пояс устройства.
export function formatStartsAt(startsAt: string | null): string {
  if (!startsAt) return 'Дата не назначена';
  const date = new Date(startsAt);
  if (Number.isNaN(date.getTime())) return 'Дата не назначена';
  return date.toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// score === null, а не falsy-проверка: иначе счёт 0:0 пропадёт.
export function formatScore(score: Match['score']): string {
  return score === null ? '– : –' : `${score.home} : ${score.away}`;
}
