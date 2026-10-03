import React, { useState, useRef, useEffect } from "react";
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
  Server,
  Wifi,
  WifiOff,
  Menu,
  X as CloseIcon,
} from "lucide-react";
import {
  searchGlobalPlaces,
  GeocodingResult,
} from "../../services/geocodingService";
import { useConnectionStatus } from "../../services/connectionManager";

interface HeaderProps {
  currentTab: "map" | "dashboard" | "simulator" | "timeline" | "reports";
  onTabChange: (
    tab: "map" | "dashboard" | "simulator" | "timeline" | "reports",
  ) => void;
  onSelectCity: (cityId: string) => void;
  onSelectCoords: (
    lat: number,
    lng: number,
    placeName?: string,
    fullAddress?: string,
  ) => void;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { isOnline, isBackendConnected, aiEngine } = useConnectionStatus();

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
        if (err.name !== "AbortError") {
          console.error("Search geocoding error:", err);
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
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSearchResult = (item: GeocodingResult) => {
    onSelectCoords(item.lat, item.lng, item.name, item.displayName);
    setSearchQuery("");
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
            "Unable to access current location.\n\nPlease:\n• Enable browser location permission\nOR\n• Search your location manually.",
          );
        },
        { timeout: 8000 },
      );
    } else {
      alert("Geolocation is not supported by your browser.");
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
                setSearchQuery("");
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
                {isSearching
                  ? "Searching worldwide..."
                  : `${searchResults.length} places found`}
              </span>
            </div>

            {searchResults.length === 0 && !isSearching ? (
              <div className="p-6 text-center text-xs text-slate-300 bg-slate-950">
                No location match found for &quot;
                <strong className="text-white">{searchQuery}</strong>&quot;.
                <br />
                Try typing a city, village, landmark, or coordinates (e.g.{" "}
                <span className="text-emerald-400 font-mono font-bold">
                  23.0225, 72.5714
                </span>
                ).
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80 bg-slate-950">
                {searchResults.map((item) => {
                  const isVillage = item.type === "Village";
                  const isStreet = item.type === "Street";
                  const isCoord = item.type === "Coordinate";

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
                                  ? "bg-emerald-950 text-emerald-300 border-emerald-700"
                                  : isStreet
                                    ? "bg-orange-950 text-orange-300 border-orange-700"
                                    : isCoord
                                      ? "bg-cyan-950 text-cyan-300 border-cyan-700"
                                      : "bg-blue-950 text-blue-300 border-blue-700"
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

      {/* Main Navigation Mode Tabs - Redesigned UI/UX Max Pro Segmented Control */}
      <nav className="hidden md:flex items-center space-x-1.5 bg-slate-950/90 backdrop-blur-xl p-1.5 rounded-2xl border border-slate-800/90 shadow-[inset_0_1px_4px_rgba(0,0,0,0.7)] ring-1 ring-white/5">
        <button
          onClick={() => onTabChange("map")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all duration-200 ${
            currentTab === "map"
              ? "bg-gradient-to-r from-emerald-500/25 via-teal-500/20 to-emerald-500/25 text-emerald-300 border border-emerald-500/50 shadow-[0_0_16px_rgba(16,185,129,0.25)] font-bold"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Globe2
            className={`w-3.5 h-3.5 ${currentTab === "map" ? "text-emerald-400 animate-pulse" : "text-slate-400"}`}
          />
          <span>Global Map</span>
          <span className="hidden xl:inline w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        </button>

        <button
          onClick={() => onTabChange("dashboard")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all duration-200 ${
            currentTab === "dashboard"
              ? "bg-gradient-to-r from-teal-500/25 via-cyan-500/20 to-teal-500/25 text-teal-300 border border-teal-500/50 shadow-[0_0_16px_rgba(20,184,166,0.25)] font-bold"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Activity
            className={`w-3.5 h-3.5 ${currentTab === "dashboard" ? "text-teal-400" : "text-slate-400"}`}
          />
          <span>Location Intelligence</span>
          <span className="hidden xl:inline text-[9px] font-mono px-1.5 py-0.2 rounded bg-teal-950 text-teal-400 border border-teal-800 font-bold">
            AI
          </span>
        </button>

        <button
          onClick={() => onTabChange("simulator")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all duration-200 ${
            currentTab === "simulator"
              ? "bg-gradient-to-r from-orange-500/25 via-amber-500/20 to-orange-500/25 text-orange-300 border border-orange-500/50 shadow-[0_0_16px_rgba(249,115,22,0.25)] font-bold"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <SlidersHorizontal
            className={`w-3.5 h-3.5 ${currentTab === "simulator" ? "text-orange-400" : "text-slate-400"}`}
          />
          <span>Simulator</span>
          <span className="hidden xl:inline text-[9px] font-mono px-1.5 py-0.2 rounded bg-orange-950 text-orange-400 border border-orange-800 font-bold">
            Sim
          </span>
        </button>

        <button
          onClick={() => onTabChange("timeline")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all duration-200 ${
            currentTab === "timeline"
              ? "bg-gradient-to-r from-cyan-500/25 via-blue-500/20 to-cyan-500/25 text-cyan-300 border border-cyan-500/50 shadow-[0_0_16px_rgba(6,182,212,0.25)] font-bold"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Clock
            className={`w-3.5 h-3.5 ${currentTab === "timeline" ? "text-cyan-400" : "text-slate-400"}`}
          />
          <span>Future 2050</span>
          <span className="hidden xl:inline text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold">
            SSP
          </span>
        </button>

        <button
          onClick={() => onOpenReports()}
          className="px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all duration-200"
          title="Export Heat Dossier & Mitigation Report"
        >
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden xl:inline">Report</span>
          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
            PDF
          </span>
        </button>
      </nav>

      {/* Right Controls & Settings */}
      <div className="flex items-center space-x-2 sm:space-x-2.5 shrink-0">
        {/* Backend Telemetry Status Badge */}
        <div
          className="hidden xl:flex items-center space-x-2 px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono shadow-inner"
          title={isBackendConnected ? `Connected to port 5001 (${aiEngine || 'Active Engine'})` : 'Backend disconnected on port 5001'}
        >
          <span className="relative flex h-2 w-2">
            {isBackendConnected ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </>
            ) : (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
              </>
            )}
          </span>
          <span className={isBackendConnected ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
            {isBackendConnected ? "Backend: 5001" : "AI Offline"}
          </span>
        </div>

        {onOpenApiSettings && (
          <button
            onClick={onOpenApiSettings}
            className="hidden sm:flex px-3 py-2 rounded-xl border border-slate-700/80 bg-slate-900/90 hover:bg-slate-850 hover:border-slate-600 text-xs font-semibold text-slate-300 hover:text-white items-center space-x-1.5 transition-all shadow-sm"
            title="Configure custom Google Maps or CARTO API keys"
          >
            <Key className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden lg:inline">API Keys</span>
          </button>
        )}

        <button
          onClick={onOpenMethodology}
          className="hidden sm:flex px-3 py-2 rounded-xl border border-slate-700/80 bg-slate-900/90 hover:bg-slate-850 hover:border-slate-600 text-xs font-semibold text-slate-300 hover:text-white items-center space-x-1.5 transition-all shadow-sm"
          title="Scientific Principles & Methodology Documentation"
        >
          <Info className="w-3.5 h-3.5 text-teal-400" />
          <span className="hidden md:inline">Methodology</span>
        </button>

        {/* Mobile Navigation Menu Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 hover:text-white transition"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? (
            <CloseIcon className="w-4 h-4" />
          ) : (
            <Menu className="w-4 h-4" />
          )}
        </button>

        <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 shadow-inner">
          <MapPin className="w-3 h-3 text-orange-400 shrink-0" />
          <span className="text-slate-400 font-sans hidden 2xl:inline">Active Target:</span>
          <span className="font-bold text-white truncate max-w-[130px]">{selectedCityName}</span>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 md:hidden bg-slate-950/95 border-b border-slate-800 backdrop-blur-2xl p-4 shadow-2xl z-50 flex flex-col gap-2 animate-in slide-in-from-top-2 duration-200">
          <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
            Navigation Modes
          </div>
          <button
            onClick={() => {
              onTabChange("map");
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
              currentTab === "map"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "text-slate-300 hover:bg-slate-900"
            }`}
          >
            <Globe2 className="w-4 h-4 text-emerald-400" />
            <span>Global Heat Map</span>
          </button>

          <button
            onClick={() => {
              onTabChange("dashboard");
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
              currentTab === "dashboard"
                ? "bg-teal-500/20 text-teal-300 border border-teal-500/40"
                : "text-slate-300 hover:bg-slate-900"
            }`}
          >
            <Activity className="w-4 h-4 text-teal-400" />
            <span>Location Intelligence & AI Causes</span>
          </button>

          <button
            onClick={() => {
              onTabChange("simulator");
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
              currentTab === "simulator"
                ? "bg-orange-500/20 text-orange-300 border border-orange-500/40"
                : "text-slate-300 hover:bg-slate-900"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-orange-400" />
            <span>Intervention Simulator</span>
          </button>

          <button
            onClick={() => {
              onTabChange("timeline");
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
              currentTab === "timeline"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-slate-300 hover:bg-slate-900"
            }`}
          >
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Future Projections (2050)</span>
          </button>

          <button
            onClick={() => {
              onOpenReports();
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-900 transition"
          >
            <FileText className="w-4 h-4 text-slate-400" />
            <span>Generate PDF Report</span>
          </button>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                onOpenMethodology();
                setIsMobileMenuOpen(false);
              }}
              className="text-xs text-teal-400 hover:underline flex items-center gap-1.5"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Scientific Methodology</span>
            </button>
            <span className="text-[11px] font-mono text-slate-500">v2.0.0</span>
          </div>
        </div>
      )}
    </header>
  );
};
