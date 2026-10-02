import React, { useState, useRef, useEffect } from 'react';
import {
  Globe2,
  Search,
  Crosshair,
  FileText,
  SlidersHorizontal,
  Layers,
  Activity,
  Info,
  Clock,
  Flame,
  Check,
  AlertTriangle,
  MapPin,
  Key,
  Building2,
  TreePine,
  Compass,
  Loader2,
  Navigation,
} from 'lucide-react';
import { searchGlobalPlaces, GeocodingResult } from '../../services/geocodingService';

interface HeaderProps {
  currentTab: 'map' | 'dashboard' | 'simulator' | 'timeline' | 'reports';
  onTabChange: (tab: 'map' | 'dashboard' | 'simulator' | 'timeline' | 'reports') => void;
  onSelectCity: (cityId: string) => void;
  onSelectCoords: (lat: number, lng: number, placeName?: string, fullAddress?: string) => void;
  onOpenMethodology: () => void;
  onOpenReports: () => void;
  onOpenApiSettings?: () => void;
  selectedCityName: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  onSelectCity,
  onSelectCoords,
  onOpenMethodology,
  onOpenReports,
  onOpenApiSettings,
  selectedCityName,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounced live geocoding across villages, towns, cities worldwide
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults([]);
      setIsSearchOpen(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setIsSearchOpen(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const timer = setTimeout(async () => {
      try {
        const results = await searchGlobalPlaces(trimmed, controller.signal);
        setSearchResults(results);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Search geocoding error:', err);
        }
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  // Click outside to close search
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSearchResult = (item: GeocodingResult) => {
    onSelectCoords(item.lat, item.lng, item.name, item.displayName);
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const [isLocating, setIsLocating] = useState(false);

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          onSelectCoords(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          setIsLocating(false);
          alert(
            'Unable to access current location.\n\nPlease:\n• Enable browser location permission\nOR\n• Search your location manually.'
          );
        },
        { timeout: 8000 }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 text-slate-100 flex items-center justify-between px-4 z-50 relative select-none">
      {/* Brand & Platform Identity */}
      <div className="flex items-center space-x-3 shrink-0">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 via-slate-800 to-orange-500/20 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
          <Globe2 className="w-5 h-5 text-emerald-400" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
          </span>
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-orange-400 bg-clip-text text-transparent">
              EcoPulseAI
            </span>
            <span className="px-1.5 py-0.5 text-[10px] uppercase font-mono font-bold tracking-wider bg-slate-800 text-emerald-400 rounded border border-slate-700">
              GIS 2.0
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-none">
            Global Heat Monitoring & Reduction Intelligence
          </p>
        </div>
      </div>

      {/* Global Search Bar (with Cities, Addresses, and Coordinate parsing) */}
      <div className="relative w-80 md:w-96" ref={searchContainerRef}>
        <div className="flex items-center bg-slate-950 border border-slate-700 hover:border-slate-500 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 rounded-xl px-3 py-2 transition-all shadow-md">
          {isSearching ? (
            <Loader2 className="w-4 h-4 text-emerald-400 mr-2 shrink-0 animate-spin" />
          ) : (
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          )}
          <input
            type="text"
            className="bg-transparent text-sm w-full text-slate-100 placeholder-slate-400 focus:outline-none font-medium"
            placeholder="Search village, city, address, or coords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchQuery.trim().length > 0) setIsSearchOpen(true);
            }}
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
                setIsSearchOpen(false);
              }}
              className="text-slate-400 hover:text-white p-1 mr-1 text-sm font-bold"
              title="Clear search"
            >
              ✕
            </button>
          )}
          <button
            onClick={handleUseCurrentLocation}
            title="Locate via GPS"
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-emerald-400 transition"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 100% Solid Opaque Search Results Dropdown (No Transparency / Bleed-Through) */}
        {isSearchOpen && (
          <div className="absolute left-0 top-full mt-2 w-[340px] sm:w-[480px] md:w-[540px] bg-slate-950 border-2 border-slate-700 rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] overflow-hidden z-[9999] max-h-[480px] overflow-y-auto ring-1 ring-white/10 select-text">
            {/* Header bar */}
            <div className="px-4 py-2.5 border-b border-slate-800 text-xs font-mono font-bold text-slate-200 flex items-center justify-between bg-slate-900">
              <span className="flex items-center space-x-2 text-emerald-400 uppercase tracking-wider text-[11px]">
                <Globe2 className="w-4 h-4" />
                <span>Global Locations & Hotspots</span>
              </span>
              <span className="text-[11px] text-slate-400 font-semibold">
                {isSearching ? 'Searching worldwide...' : `${searchResults.length} places found`}
              </span>
            </div>

            {searchResults.length === 0 && !isSearching ? (
              <div className="p-6 text-center text-xs text-slate-300 bg-slate-950">
                No location match found for &quot;<strong className="text-white">{searchQuery}</strong>&quot;.<br />
                Try typing a city, village, landmark, or coordinates (e.g.{' '}
                <span className="text-emerald-400 font-mono font-bold">23.0225, 72.5714</span>).
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80 bg-slate-950">
                {searchResults.map((item) => {
                  const isVillage = item.type === 'Village';
                  const isStreet = item.type === 'Street';
                  const isCoord = item.type === 'Coordinate';

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectSearchResult(item)}
                      className="w-full text-left px-4 py-3 bg-slate-900 hover:bg-slate-800/90 transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-start space-x-3 overflow-hidden mr-3">
                        <div className="p-2 rounded-xl bg-slate-800 text-emerald-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-300 transition-colors shrink-0 mt-0.5 border border-slate-700">
                          {isVillage ? (
                            <TreePine className="w-4 h-4 text-emerald-400" />
                          ) : isStreet ? (
                            <Navigation className="w-4 h-4 text-orange-400" />
                          ) : isCoord ? (
                            <Compass className="w-4 h-4 text-cyan-400" />
                          ) : (
                            <Building2 className="w-4 h-4 text-blue-400" />
                          )}
                        </div>
                        <div className="overflow-hidden space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                              {item.name}
                            </span>
                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border shrink-0 ${
                                isVillage
                                  ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                                  : isStreet
                                  ? 'bg-orange-950 text-orange-300 border-orange-700'
                                  : isCoord
                                  ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                                  : 'bg-blue-950 text-blue-300 border-blue-700'
                              }`}
                            >
                              {item.type}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-snug line-clamp-2">
                            {item.displayName}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 text-right pl-2">
                        <span className="text-[11px] font-mono font-semibold text-emerald-400 block bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                          {item.lat.toFixed(4)}°, {item.lng.toFixed(4)}°
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Navigation Mode Tabs */}
      <nav className="hidden lg:flex items-center space-x-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => onTabChange('map')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition ${
            currentTab === 'map'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Global Map</span>
        </button>

        <button
          onClick={() => onTabChange('dashboard')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition ${
            currentTab === 'dashboard'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Location Intelligence</span>
        </button>

        <button
          onClick={() => onTabChange('simulator')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition ${
            currentTab === 'simulator'
              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Scenario Simulator</span>
        </button>

        <button
          onClick={() => onTabChange('timeline')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition ${
            currentTab === 'timeline'
              ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Future Projections</span>
        </button>

        <button
          onClick={() => onOpenReports()}
          className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Reports</span>
        </button>
      </nav>

      {/* Right Controls & Settings */}
      <div className="flex items-center space-x-2 shrink-0">
        {onOpenApiSettings && (
          <button
            onClick={onOpenApiSettings}
            className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800/70 hover:bg-slate-700 text-xs text-slate-300 hover:text-white flex items-center space-x-1.5 transition"
            title="API Keys & Tile Providers (No key required by default)"
          >
            <Key className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">API Keys</span>
          </button>
        )}

        <button
          onClick={onOpenMethodology}
          className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800/70 hover:bg-slate-700 text-xs text-slate-300 hover:text-white flex items-center space-x-1.5 transition"
          title="Scientific Principles & Methodology"
        >
          <Info className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Science & Methodology</span>
        </button>

        <div className="hidden xl:flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Target: {selectedCityName}</span>
        </div>
      </div>
    </header>
  );
};
