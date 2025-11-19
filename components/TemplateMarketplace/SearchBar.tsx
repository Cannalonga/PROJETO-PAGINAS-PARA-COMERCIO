import React, { useState, useCallback } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onCategoryChange: (category: string) => void;
  onMinRatingChange: (rating: number) => void;
  isLoading?: boolean;
}

const CATEGORIES = [
  { value: '', label: 'Todas as categorias' },
  { value: 'LOJA', label: '🏪 Loja' },
  { value: 'RESTAURANTE', label: '🍽️ Restaurante' },
  { value: 'SERVICOS', label: '🛠️ Serviços' },
  { value: 'CONSULTORIO', label: '👨‍⚕️ Consultório' },
  { value: 'SALON', label: '💇 Salão' },
  { value: 'GENERIC', label: '📄 Genérico' },
];

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onCategoryChange,
  onMinRatingChange,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minRating, setMinRating] = useState(0);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);
      onSearch(value);
    },
    [onSearch]
  );

  const handleCategoryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      setSelectedCategory(value);
      onCategoryChange(value);
    },
    [onCategoryChange]
  );

  const handleRatingChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = parseInt(e.target.value, 10);
      setMinRating(value);
      onMinRatingChange(value);
    },
    [onMinRatingChange]
  );

  return (
    <div className="search-bar bg-white border-b border-gray-200 p-6 sticky top-0 z-10">
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="🔍 Buscar templates..."
            value={searchQuery}
            onChange={handleSearchChange}
            disabled={isLoading}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none disabled:bg-gray-100 text-sm"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* Rating Filter */}
          <select
            value={minRating}
            onChange={handleRatingChange}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none disabled:bg-gray-100 text-sm"
          >
            <option value={0}>⭐ Qualquer classificação</option>
            <option value={2}>⭐⭐ 2+ estrelas</option>
            <option value={3}>⭐⭐⭐ 3+ estrelas</option>
            <option value={4}>⭐⭐⭐⭐ 4+ estrelas</option>
            <option value={5}>⭐⭐⭐⭐⭐ 5 estrelas</option>
          </select>
        </div>

        {/* Active Filters Display */}
        {(searchQuery || selectedCategory || minRating > 0) && (
          <div className="flex flex-wrap gap-2 pt-2">
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                Busca: {searchQuery}
              </span>
            )}
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                Categoria: {CATEGORIES.find((c) => c.value === selectedCategory)?.label}
              </span>
            )}
            {minRating > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full">
                Min {minRating}⭐
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
