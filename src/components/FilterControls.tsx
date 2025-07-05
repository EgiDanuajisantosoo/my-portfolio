import React from 'react';

type FilterControlsProps = {
  filter: 'tracks' | 'artists';
  setFilter: (filter: 'tracks' | 'artists') => void;
  timeRange: 'short_term' | 'medium_term' | 'long_term';
  setTimeRange: (timeRange: 'short_term' | 'medium_term' | 'long_term') => void;
  limit: number;
  setLimit: (limit: number) => void;
  setData: (data: null) => void;
};

export default function FilterControls({
  filter,
  setFilter,
  timeRange,
  setTimeRange,
  limit,
  setLimit,
  setData,
}: FilterControlsProps) {
  const baseButtonClass =
    'px-4 py-2 rounded-full font-semibold transition-colors';

  return (
    <div
      className="my-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6 w-full flex-wrap 
                 md:static md:bg-transparent 
                 sticky top-0 z-50 bg-neutral-900 p-4 border-b border-neutral-700 shadow-md md:shadow-none"
    >
      {/* === FILTER TIPE === */}

      {/* Mobile Dropdown */}
      <div className="flex flex-col gap-2 w-full md:hidden">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'tracks' | 'artists')}
          className="rounded bg-neutral-700 text-white p-2 border border-neutral-600"
        >
          <option value="tracks">Top Tracks</option>
          <option value="artists">Top Artists</option>
        </select>
      </div>

      {/* Desktop Buttons */}
      <div className="hidden md:flex flex-wrap gap-3">
        <button
          onClick={() => setFilter('tracks')}
          className={`${baseButtonClass} ${filter === 'tracks'
            ? 'bg-green-500 text-white'
            : 'bg-neutral-600 text-white hover:bg-neutral-500'
            }`}
        >
          Top Tracks
        </button>
        <button
          onClick={() => setFilter('artists')}
          className={`${baseButtonClass} ${filter === 'artists'
            ? 'bg-green-500 text-white'
            : 'bg-neutral-600 text-white hover:bg-neutral-500'
            }`}
        >
          Top Artists
        </button>
      </div>

      {/* === FILTER RENTANG WAKTU === */}

      {/* Mobile Dropdown */}
      <div className="flex flex-col gap-2 w-full md:hidden">
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="rounded bg-neutral-700 text-white p-2 border border-neutral-600"
        >
          <option value="short_term">4 Minggu</option>
          <option value="medium_term">6 Bulan</option>
          <option value="long_term">Selamanya</option>
        </select>
      </div>

      {/* Desktop Buttons */}
      <div className="hidden md:flex flex-wrap items-center gap-3">
        <button
          onClick={() => setTimeRange('short_term')}
          className={`${baseButtonClass} ${timeRange === 'short_term'
            ? 'bg-green-500 text-white'
            : 'bg-neutral-600 text-white hover:bg-neutral-500'
            }`}
        >
          4 Minggu
        </button>
        <button
          onClick={() => setTimeRange('medium_term')}
          className={`${baseButtonClass} ${timeRange === 'medium_term'
            ? 'bg-green-500 text-white'
            : 'bg-neutral-600 text-white hover:bg-neutral-500'
            }`}
        >
          6 Bulan
        </button>
        <button
          onClick={() => setTimeRange('long_term')}
          className={`${baseButtonClass} ${timeRange === 'long_term'
            ? 'bg-green-500 text-white'
            : 'bg-neutral-600 text-white hover:bg-neutral-500'
            }`}
        >
          Selamanya
        </button>
      </div>

      {/* === LIMIT === */}
      <div className="flex items-center gap-3">
        <label htmlFor="limit-input" className="text-sm text-neutral-400">
          Jumlah:
        </label>
        <input
          id="limit-input"
          type="number"
          value={limit === 0 ? '' : limit}
          onChange={(e) => {
            const num = Number(e.target.value);
            setLimit(num > 50 ? 50 : num);
          }}
          className="w-20 rounded border border-neutral-600 bg-neutral-700 p-2 text-center text-white"
          min="1"
          max="50"
        />
      </div>
    </div>
  );
}
