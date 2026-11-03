import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

type Props = {
  // Момент последней успешной загрузки данных.
  since: Date;
};

// Подпись «Обновлено N сек назад».
export function UpdatedAgo({ since }: Props) {
  // Храним текущее время, а секунды вычисляем из since — так подпись
  // автоматически сбрасывается, когда приходит новый since.
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // max(0, …): сразу после обновления now может быть чуть меньше since.
  const seconds = Math.max(0, Math.floor((now - since.getTime()) / 1000));

  return <Text style={styles.text}>Обновлено {formatAgo(seconds)} назад</Text>;
}

// 45 → «45 сек», 155 → «2 мин 35 сек», 120 → «2 мин»
export function formatAgo(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds} сек`;
  return seconds === 0 ? `${minutes} мин` : `${minutes} мин ${seconds} сек`;
}

const styles = StyleSheet.create({
  text: {
    fontSize: 13,
    color: '#6b7280',
  },
});
