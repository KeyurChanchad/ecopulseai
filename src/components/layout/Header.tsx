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
} from 'lucide-react';
import { CityHotspot } from '../../types';
import { searchLocations } from '../../services/locationService';

interface HeaderProps {
  currentTab: 'map' | 'dashboard' | 'simulator' | 'timeline' | 'reports';
  onTabChange: (tab: 'map' | 'dashboard' | 'simulator' | 'timeline' | 'reports') => void;
  onSelectCity: (cityId: string) => void;
  onSelectCoords: (lat: number, lng: number) => void;
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
  const [searchResults, setSearchResults] = useState<CityHotspot[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      setSearchResults(searchLocations(searchQuery));
      setIsSearchOpen(true);
    } else {
      setSearchResults([]);
      setIsSearchOpen(false);
    }
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

  const handleSelectSearchResult = (city: CityHotspot) => {
    if (city.id.startsWith('custom-')) {
      onSelectCoords(city.lat, city.lng);
    } else {
      onSelectCity(city.id);
    }
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          onSelectCoords(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          // If denied, fallback to Ahmedabad
          onSelectCity('ahmedabad');
        }
      );
    } else {
      onSelectCity('ahmedabad');
    }
  };

  return (
    <header className="h-16 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-slate-100 flex items-center justify-between px-4 z-40 relative select-none">
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
        <div className="flex items-center bg-slate-950/80 border border-slate-700/80 hover:border-slate-600 focus-within:border-emerald-500/80 rounded-lg px-3 py-1.5 transition-all shadow-inner">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            className="bg-transparent text-sm w-full text-slate-100 placeholder-slate-500 focus:outline-none"
            placeholder="Search city, address, or coords (e.g. 23.02, 72.57)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchQuery.trim().length > 0) setIsSearchOpen(true);
            }}
          />
          <button
            onClick={handleUseCurrentLocation}
            title="Locate via GPS"
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-emerald-400 transition"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Search Results Dropdown */}
        {isSearchOpen && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto">
            <div className="p-2 border-b border-slate-800 text-[11px] uppercase tracking-wider font-mono text-slate-400 flex items-center justify-between">
              <span>Matching Hotspots & Locations</span>
              <span className="text-[10px] text-slate-500">{searchResults.length} results</span>
            </div>
            {searchResults.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No location match found. Try entering coordinate pairs e.g. <span className="text-emerald-400 font-mono">23.0225, 72.5714</span>.
              </div>
            ) : (
              searchResults.map((city) => (
                <button
                  key={city.id}
                  onClick={() => handleSelectSearchResult(city)}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-slate-800/80 transition flex items-center justify-between border-b border-slate-800/50 last:border-b-0"
                >
                  <div className="flex items-center space-x-2.5">
                    <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-slate-200">{city.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {city.state ? `${city.state}, ` : ''}{city.country} • {city.climateZone}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1.5 justify-end">
                      <span className="text-xs font-mono font-bold text-orange-400">{city.airTemp}°C</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                          city.category === 'Extreme'
                            ? 'bg-purple-900/40 text-purple-300'
                            : city.category === 'Very High'
                            ? 'bg-rose-900/40 text-rose-300'
                            : city.category === 'High'
                            ? 'bg-orange-900/40 text-orange-300'
                            : 'bg-amber-900/40 text-amber-300'
                        }`}
                      >
                        {city.category}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">Score: {city.heatScore}/100</div>
                  </div>
                </button>
              ))
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
