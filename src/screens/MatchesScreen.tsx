import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { MatchCard } from '../components/MatchCard';
import { UpdatedAgo } from '../components/UpdatedAgo';
import { fetchMatches, Match } from '../matches';

// Экран «Матчи тура» — задание в README.md, часть 1.
export function MatchesScreen() {
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const load = useCallback(async (mode: 'initial' | 'refresh') => {
    if (mode === 'refresh') setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      setMatches(await fetchMatches());
      setUpdatedAt(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load('initial');
  }, [load]);

  const refresh = () => load('refresh');

  // Первая загрузка: данных ещё нет.
  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Ошибка и показать нечего — полноэкранное сообщение.
  if (error && !matches) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorTitle}>Не удалось загрузить матчи</Text>
        <Text style={styles.muted}>{error}</Text>
        <Pressable style={styles.button} onPress={() => load('initial')}>
          <Text style={styles.buttonText}>Повторить</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Матчи тура</Text>
        <Pressable style={styles.button} onPress={refresh} disabled={refreshing}>
          <Text style={styles.buttonText}>{refreshing ? 'Обновляем…' : 'Обновить'}</Text>
        </Pressable>
      </View>
      {updatedAt && <UpdatedAgo since={updatedAt} />}
      {/* Ошибка при обновлении: старые данные оставляем на экране. */}
      {error && <Text style={styles.inlineError}>Не удалось обновить: {error}</Text>}

      <FlatList
        data={matches ?? []}
        keyExtractor={(match) => match.id}
        renderItem={({ item }) => <MatchCard match={item} />}
        refreshing={refreshing}
        onRefresh={refresh}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={[styles.muted, styles.empty]}>В этом туре пока нет матчей</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 8,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  list: {
    gap: 8,
    paddingVertical: 8,
  },
  muted: {
    color: '#6b7280',
  },
  empty: {
    textAlign: 'center',
    marginTop: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  inlineError: {
    color: '#b91c1c',
  },
  button: {
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#111827',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
