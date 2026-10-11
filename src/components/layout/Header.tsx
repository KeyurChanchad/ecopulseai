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
  ArrowLeft,
  Sparkles,
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
  onOpenAiDossier?: () => void;
  selectedCityName: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  onSelectCity,
  onSelectCoords,
  onOpenMethodology,
  onOpenReports,
  onOpenAiDossier,
  selectedCityName,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchActive, setIsMobileSearchActive] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchOverlayRef = useRef<HTMLDivElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
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
      const target = event.target as Node;
      const clickedInsideDesktop = searchContainerRef.current?.contains(target);
      const clickedInsideMobile = mobileSearchOverlayRef.current?.contains(target);
      if (!clickedInsideDesktop && !clickedInsideMobile) {
        setIsSearchOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsSearchOpen(false);
        setIsMobileSearchActive(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSelectSearchResult = (item: GeocodingResult) => {
    onSelectCoords(item.lat, item.lng, item.name, item.displayName);
    setSearchQuery("");
    setIsSearchOpen(false);
    setIsMobileSearchActive(false);
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
    <header className="h-16 bg-slate-900/98 backdrop-blur-md border-b border-slate-800 text-slate-100 flex items-center justify-between px-2.5 sm:px-4 lg:px-6 z-50 relative select-none gap-1.5 sm:gap-3">
      {/* Brand & Platform Identity */}
      <div className="flex items-center space-x-2 shrink-0">
        <div className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 via-slate-800 to-orange-500/20 border border-emerald-500/30 shadow-md shadow-emerald-500/10">
          <Globe2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          <span className="font-extrabold text-sm sm:text-base lg:text-lg tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-orange-400 bg-clip-text text-transparent">
            EcoPulseAI
          </span>
          <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] uppercase font-mono font-bold tracking-wider bg-slate-800 text-emerald-400 rounded border border-slate-700">
            GIS 2.0
          </span>
        </div>
      </div>

      {/* Mobile Full-Width Search Header Overlay (Active when user taps search on mobile < sm) */}
      {isMobileSearchActive && (
        <div
          ref={mobileSearchOverlayRef}
          className="sm:hidden fixed inset-x-0 top-0 h-16 bg-slate-950 border-b border-slate-700/90 px-2 flex items-center gap-1.5 z-[110] animate-in fade-in duration-150 shadow-2xl"
        >
          <button
            onClick={() => {
              setIsMobileSearchActive(false);
              setIsSearchOpen(false);
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
            title="Back to view"
            aria-label="Close search overlay"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
          </button>
          <div className="flex-1 min-w-0 flex items-center bg-slate-900 border border-emerald-500/60 rounded-xl px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-emerald-500/20 shadow-md">
            {isSearching ? (
              <Loader2 className="w-3.5 h-3.5 text-emerald-400 mr-1.5 shrink-0 animate-spin" />
            ) : (
              <Search className="w-3.5 h-3.5 text-emerald-400 mr-1.5 shrink-0" />
            )}
            <input
              ref={mobileSearchInputRef}
              type="text"
              className="bg-transparent text-xs w-full text-slate-100 placeholder-slate-400 focus:outline-none font-medium min-w-0"
              placeholder="Search city, address, coords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim().length > 0) setIsSearchOpen(true);
              }}
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                className="text-slate-400 hover:text-white p-1 text-xs font-bold"
                title="Clear"
              >
                ✕
              </button>
            )}
            <button
              onClick={handleUseCurrentLocation}
              title="Locate via GPS"
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-emerald-400 transition shrink-0"
            >
              <Crosshair className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Global Search Bar Container */}
      <div className="relative flex-1 min-w-0 max-w-xs sm:max-w-sm lg:max-w-md mx-1 sm:mx-2" ref={searchContainerRef}>
        {/* Mobile Trigger Button (When Not in Full-Width Search Mode) */}
        <button
          onClick={() => {
            setIsMobileSearchActive(true);
            if (searchQuery.trim().length > 0) setIsSearchOpen(true);
            setTimeout(() => mobileSearchInputRef.current?.focus(), 60);
          }}
          className="sm:hidden flex items-center bg-slate-950 border border-slate-700/80 hover:border-slate-500 rounded-xl px-2.5 py-1.5 text-slate-400 text-xs w-full min-w-0 shadow-sm transition"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
          <span className="truncate text-slate-300 text-xs font-medium">
            {searchQuery || "Search city..."}
          </span>
        </button>

        {/* Desktop Inline Search Bar (Hidden on Mobile < sm) */}
        <div className="hidden sm:flex items-center bg-slate-950 border border-slate-700/80 hover:border-slate-500 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 transition-all shadow-md">
          {isSearching ? (
            <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 mr-1.5 sm:mr-2 shrink-0 animate-spin" />
          ) : (
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 mr-1.5 sm:mr-2 shrink-0" />
          )}
          <input
            type="text"
            className="bg-transparent text-xs sm:text-sm w-full text-slate-100 placeholder-slate-400 focus:outline-none font-medium min-w-0"
            placeholder="Search city, village, address, coords..."
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
              className="text-slate-400 hover:text-white p-1 mr-0.5 text-xs font-bold"
              title="Clear search"
            >
              ✕
            </button>
          )}
          <button
            onClick={handleUseCurrentLocation}
            title="Locate via GPS"
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-emerald-400 transition shrink-0"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 100% Solid Opaque Search Results Dropdown / Modal (Fixed to Viewport on Mobile, Never Overflows) */}
        {isSearchOpen && (
          <div className="fixed sm:absolute left-2 sm:left-auto right-2 sm:right-0 top-16 sm:top-full mt-1.5 sm:mt-2 w-auto sm:w-[440px] md:w-[500px] max-w-[calc(100vw-1rem)] sm:max-w-none bg-slate-950 border-2 border-slate-700 rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] overflow-hidden z-[120] max-h-[70vh] sm:max-h-[440px] overflow-y-auto ring-1 ring-white/10 select-text">
            {/* Header bar */}
            <div className="px-3 sm:px-4 py-2 border-b border-slate-800 text-xs font-mono font-bold text-slate-200 flex items-center justify-between bg-slate-900">
              <span className="flex items-center space-x-1.5 sm:space-x-2 text-emerald-400 uppercase tracking-wider text-[10px]">
                <Globe2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Global Locations</span>
              </span>
              <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                {isSearching
                  ? "Searching..."
                  : `${searchResults.length} found`}
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
                      className="w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-900 hover:bg-slate-850 transition-colors flex items-center justify-between group gap-2"
                    >
                      <div className="flex items-start space-x-2.5 sm:space-x-3 overflow-hidden min-w-0 flex-1">
                        <div className="p-1.5 rounded-lg bg-slate-800 text-emerald-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-300 transition-colors shrink-0 mt-0.5 border border-slate-700">
                          {isVillage ? (
                            <TreePine className="w-3.5 h-3.5 text-emerald-400" />
                          ) : isStreet ? (
                            <Navigation className="w-3.5 h-3.5 text-orange-400" />
                          ) : isCoord ? (
                            <Compass className="w-3.5 h-3.5 text-cyan-400" />
                          ) : (
                            <Building2 className="w-3.5 h-3.5 text-blue-400" />
                          )}
                        </div>
                        <div className="overflow-hidden min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center space-x-1.5 min-w-0">
                            <span className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                              {item.name}
                            </span>
                            <span
                              className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border shrink-0 ${
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
                          <p className="text-[10px] sm:text-[11px] text-slate-400 leading-snug truncate">
                            {item.displayName}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <span className="text-[9px] sm:text-[10px] font-mono font-semibold text-emerald-400 block bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                          {item.lat.toFixed(2)}°, {item.lng.toFixed(2)}°
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

      {/* Main Navigation: 3 Core Modes (Clean, Readable & Spacious) */}
      <nav className="hidden lg:flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shadow-inner shrink-0">
        <button
          onClick={() => onTabChange("map")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
            currentTab === "map"
              ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/25"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Globe2 className="w-3.5 h-3.5" />
          <span>Global Map</span>
        </button>

        <button
          onClick={() => onTabChange("dashboard")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
            currentTab === "dashboard"
              ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/25"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
          title="AI Weather & Heat Analysis (ChatGPT / Gemini Structure)"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Heat Analysis</span>
        </button>

        <button
          onClick={() => onTabChange("simulator")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
            currentTab === "simulator"
              ? "bg-orange-500 text-slate-950 font-bold shadow-md shadow-orange-500/25"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Simulator</span>
        </button>

        <button
          onClick={() => onTabChange("timeline")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
            currentTab === "timeline"
              ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/25"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
          title="Climate Projections & Timeline"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Timeline</span>
        </button>
      </nav>

      {/* Right Controls: Streamlined & Clutter-Free */}
      <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">

        {/* PDF Report Export Button */}
        <button
          onClick={() => onOpenReports()}
          className="hidden sm:flex px-2.5 py-1.5 rounded-xl border border-slate-700/80 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 hover:text-white items-center space-x-1.5 transition shadow-sm"
          title="Export Heat Dossier & Mitigation Report"
        >
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden md:inline">Report</span>
          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-900 text-slate-300 border border-slate-700">
            PDF
          </span>
        </button>

        {/* Scientific Methodology */}
        <button
          onClick={onOpenMethodology}
          className="hidden md:flex p-2 rounded-xl border border-slate-700/80 bg-slate-900/90 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition shadow-sm items-center space-x-1"
          title="Scientific Principles & Methodology Documentation"
        >
          <Info className="w-3.5 h-3.5 text-teal-400" />
          <span className="hidden xl:inline text-xs">Methodology</span>
        </button>

        {/* Live Backend Telemetry Pill */}
        <div
          className="flex items-center space-x-1.5 px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono shadow-inner shrink-0"
          title={isBackendConnected ? `Connected to Node.js backend port 5001 (${aiEngine || 'Active Engine'})` : 'Backend server disconnected'}
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
          <span className={isBackendConnected ? "text-emerald-400 font-bold hidden sm:inline" : "text-amber-400 font-bold hidden sm:inline"}>
            {isBackendConnected ? "5001" : "Offline"}
          </span>
        </div>

        {/* Mobile Navigation Menu Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 hover:text-white transition shrink-0"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? (
            <CloseIcon className="w-4 h-4" />
          ) : (
            <Menu className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Mobile Drawer Navigation Menu (Works on Mobile & Tablets < lg) */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 lg:hidden bg-slate-950 border-b border-slate-700/80 p-4 shadow-[0_25px_60px_rgba(0,0,0,0.95)] z-[100] flex flex-col gap-2 animate-in slide-in-from-top-2 duration-200 max-h-[calc(100vh-4rem)] overflow-y-auto ring-1 ring-white/10">
          <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-0.5">
            Navigation Modes
          </div>
          <button
            onClick={() => {
              onTabChange("map");
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition border ${
              currentTab === "map"
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                : "bg-slate-900/90 text-slate-300 border-slate-800/80 hover:bg-slate-850"
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
            className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition border ${
              currentTab === "dashboard"
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                : "bg-slate-900/90 text-slate-300 border-slate-800/80 hover:bg-slate-850"
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>AI Heat Analysis</span>
          </button>

          <button
            onClick={() => {
              onTabChange("simulator");
              setIsMobileMenuOpen(false);
            }}
            className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition border ${
              currentTab === "simulator"
                ? "bg-orange-500/20 text-orange-300 border-orange-500/50"
                : "bg-slate-900/90 text-slate-300 border-slate-800/80 hover:bg-slate-850"
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
            className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition border ${
              currentTab === "timeline"
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
                : "bg-slate-900/90 text-slate-300 border-slate-800/80 hover:bg-slate-850"
            }`}
          >
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Future Projections</span>
          </button>

          <div className="pt-2 border-t border-slate-800 flex flex-col gap-1.5">

            <button
              onClick={() => {
                onOpenReports();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-900/90 border border-slate-800/80 hover:bg-slate-850 transition"
            >
              <FileText className="w-4 h-4 text-slate-400" />
              <span>Generate PDF Heat Dossier</span>
            </button>

            <button
              onClick={() => {
                onOpenMethodology();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-teal-300 bg-slate-900/90 border border-slate-800/80 hover:bg-slate-850 transition"
            >
              <Info className="w-4 h-4 text-teal-400" />
              <span>Scientific Principles & Methodology</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Status: {isBackendConnected ? "Backend Connected (Port 5001)" : "Backend Disconnected"}</span>
            <span className="text-slate-500">v2.0.0</span>
          </div>
        </div>
      )}
    </header>
  );
};
