import { useRef, useEffect } from 'react';
import { Search, X, MapPin, Loader2 } from 'lucide-react';
import { useLocationSearch } from '../hooks/useLocationSearch.js';

export default function CitySearch({ onSelect }) {
  const {
    query,
    setQuery,
    locations,
    loading,
    isOpen,
    setIsOpen,
    handleSelect,
    handleClear,
  } = useLocationSearch();

  const wrapperRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  const onLocationClick = (location) => {
    handleSelect(location);
    onSelect(location);
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-lg">
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={20}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a city or town..."
          className="w-full pl-12 pr-12 py-3.5 bg-white rounded-xl border border-slate-200 shadow-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     text-slate-800 placeholder:text-slate-400 text-base"
          aria-label="Search for a city"
          aria-expanded={isOpen}
          role="combobox"
          aria-autocomplete="list"
        />
        {loading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 animate-spin" size={20} />
        )}
        {!loading && query && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label="Clear search"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {isOpen && locations.length > 0 && (
        <ul
          className="absolute z-20 w-full mt-2 bg-white rounded-xl border border-slate-200 shadow-lg
                     max-h-72 overflow-y-auto"
          role="listbox"
        >
          {locations.map((location, index) => (
            <li key={`${location.latitude}-${location.longitude}-${index}`}>
              <button
                onClick={() => onLocationClick(location)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-blue-50 transition-colors
                           text-left first:rounded-t-xl last:rounded-b-xl"
                role="option"
              >
                <MapPin size={16} className="text-slate-400 shrink-0" />
                <div>
                  <span className="font-medium text-slate-800">{location.name}</span>
                  {(location.admin1 || location.country) && (
                    <span className="text-slate-500 text-sm ml-1">
                      {[location.admin1, location.country].filter(Boolean).join(', ')}
                    </span>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {isOpen && !loading && query.length >= 2 && locations.length === 0 && (
        <div className="absolute z-20 w-full mt-2 bg-white rounded-xl border border-slate-200 shadow-lg px-4 py-6 text-center">
          <p className="text-slate-500">No locations found for "{query}"</p>
        </div>
      )}
    </div>
  );
}
