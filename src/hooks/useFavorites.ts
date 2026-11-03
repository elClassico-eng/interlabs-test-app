import { useState } from 'react';

// Избранные матчи (по id). Хранятся только в памяти, пока открыто приложение.
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  const isFavorite = (id: string) => favorites.includes(id);

  // Новый массив вместо мутации: React сравнивает стейт по ссылке (Object.is),
  // и мутированный массив не вызывает ре-рендер.
  const toggle = (id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  };

  return { favorites, isFavorite, toggle };
}
