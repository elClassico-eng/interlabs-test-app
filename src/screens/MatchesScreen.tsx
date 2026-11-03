import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { MatchCard } from '../components/MatchCard';
import { UpdatedAgo } from '../components/UpdatedAgo';
import { useFavorites } from '../hooks/useFavorites';
import { fetchMatches, FILTERS, Match, MatchFilter, matchesFilter } from '../matches';

// Экран «Матчи тура» — задание в README.md, часть 1.
export function MatchesScreen() {
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [filter, setFilter] = useState<MatchFilter>('all');
  const { favorites, isFavorite, toggle } = useFavorites();

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

  const visibleMatches = (matches ?? []).filter((match) => matchesFilter(match, filter));
  const emptyText =
    matches?.length === 0 ? 'В этом туре пока нет матчей' : 'Нет матчей в этой категории';

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

      <View style={styles.filters}>
        {FILTERS.map(({ value, label }) => {
          const selected = value === filter;
          return (
            <Pressable
              key={value}
              onPress={() => setFilter(value)}
              style={[styles.chip, selected && styles.chipSelected]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={visibleMatches}
        // FlatList перерисовывает строки только при смене data;
        // extraData говорит ему, что строки зависят и от избранного.
        extraData={favorites}
        keyExtractor={(match) => match.id}
        renderItem={({ item }) => (
          <MatchCard
            match={item}
            favorite={isFavorite(item.id)}
            onToggleFavorite={() => toggle(item.id)}
          />
        )}
        refreshing={refreshing}
        onRefresh={refresh}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={[styles.muted, styles.empty]}>{emptyText}</Text>}
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
  filters: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  chipSelected: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  chipText: {
    color: '#374151',
  },
  chipTextSelected: {
    color: '#fff',
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
