import { StyleSheet, Text, View } from 'react-native';
import { formatScore, formatStartsAt, Match, statusLabel } from '../matches';

type Props = {
  match: Match;
};

export function MatchCard({ match }: Props) {
  const isLive = match.status === 'live';

  return (
    <View style={styles.card}>
      <View style={styles.meta}>
        <Text style={styles.date}>{formatStartsAt(match.startsAt)}</Text>
        <Text style={[styles.status, isLive && styles.live]}>{statusLabel(match)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.team, styles.home]} numberOfLines={2}>
          {match.home.name}
        </Text>
        <Text style={styles.score}>{formatScore(match.score)}</Text>
        <Text style={[styles.team, styles.away]} numberOfLines={2}>
          {match.away.name}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 8,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  date: {
    fontSize: 13,
    color: '#6b7280',
  },
  status: {
    fontSize: 13,
    color: '#374151',
  },
  live: {
    color: '#ef3124',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  team: {
    flex: 1,
    fontSize: 16,
  },
  home: {
    textAlign: 'right',
  },
  away: {
    textAlign: 'left',
  },
  score: {
    minWidth: 56,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
  },
});
