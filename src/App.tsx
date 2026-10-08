import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/layout/Header';
import { HeatMap } from './components/map/HeatMap';
import { LocationDashboard } from './components/dashboard/LocationDashboard';
import { ScenarioSimulator } from './components/simulator/ScenarioSimulator';
import { FuturePredictionCard } from './components/dashboard/FuturePredictionCard';
import { LayerControlPanel } from './components/layers/LayerControlPanel';
import { ReportModal } from './components/reports/ReportModal';
import { MethodologyModal } from './components/modals/MethodologyModal';
import { ApiSettingsModal } from './components/modals/ApiSettingsModal';
import { SelectedLocationPanel } from './components/location/SelectedLocationPanel';
import { WhyHotExplorationModal } from './components/dashboard/WhyHotExplorationModal';
import { AnalysisProgressModal } from './components/jobs/AnalysisProgressModal';
import { EvidenceGraphModal } from './components/evidence/EvidenceGraphModal';
import { ConnectivityAlertBanner } from './components/common/ConnectivityAlertBanner';
import { INITIAL_MAP_LAYERS } from './config/mapLayers';
import {
  fetchLiveHotspots,
  createDynamicPlaceholderProfile,
  reverseGeocode,
  FullLocationProfile,
} from './services/locationService';
import { runLocationAnalysisOrchestrator } from './services/agents/orchestrator';
import {
  MapLayerConfig,
  CityHotspot,
  Recommendation,
  ScenarioSimulationParams,
  AnalysisRadius,
  AnalysisJob,
  EvidenceKnowledgeGraph,
} from './types';
import {
  Layers,
  Flame,
  Globe2,
  SlidersHorizontal,
  FileText,
  Activity,
  ChevronRight,
  TrendingUp,
  MapPin,
  Sparkles,
  Compass,
  Brain,
  Network,
  Cpu,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { getHeatCategoryColor } from './services/heatModel';

function getCountryEmoji(country: string): string {
  switch (country.toLowerCase()) {
    case 'kuwait': return '🇰🇼';
    case 'pakistan': return '🇵🇰';
    case 'united states': return '🇺🇸';
    case 'qatar': return '🇶🇦';
    case 'saudi arabia': return '🇸🇦';
    case 'united arab emirates': return '🇦🇪';
    case 'india': return '🇮🇳';
    case 'egypt': return '🇪🇬';
    case 'spain': return '🇪🇸';
    case 'greece': return '🇬🇷';
    case 'italy': return '🇮🇹';
    case 'south korea': return '🇰🇷';
    case 'japan': return '🇯🇵';
    case 'china': return '🇨🇳';
    case 'thailand': return '🇹🇭';
    case 'singapore': return '🇸🇬';
    case 'indonesia': return '🇮🇩';
    case 'australia': return '🇦🇺';
    case 'brazil': return '🇧🇷';
    case 'mexico': return '🇲🇽';
    case 'united kingdom': return '🇬🇧';
    case 'france': return '🇫🇷';
    default: return '📍';
  }
}

export const App: React.FC = () => {
  // Navigation & View State
  const [currentTab, setCurrentTab] = useState<'map' | 'dashboard' | 'simulator' | 'timeline' | 'reports'>('map');

  // Active Selected Location Profile & Analysis Radius
  const INITIAL_COORDS = { lat: 23.0225, lng: 72.5714 };
  const [hotspots, setHotspots] = useState<CityHotspot[]>([]);
  const [profile, setProfile] = useState<FullLocationProfile>(() =>
    createDynamicPlaceholderProfile(INITIAL_COORDS.lat, INITIAL_COORDS.lng, '5km', undefined, 'Ahmedabad', 'India')
  );
  const [selectedRadius, setSelectedRadius] = useState<AnalysisRadius>('5km');
  const [isTargetPanelOpen, setIsTargetPanelOpen] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGlobalOverview, setIsGlobalOverview] = useState(true);
  const [popularCityFilter, setPopularCityFilter] = useState<
    'hottest' | 'all' | 'extreme' | 'veryHigh' | 'mideast' | 'asia' | 'americas' | 'europe'
  >('hottest');
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ lat: number; lng: number }>(INITIAL_COORDS);

  // Fetch real-time planetary observation hubs from Open-Meteo via backend
  useEffect(() => {
    fetchLiveHotspots().then((data) => {
      if (data && data.length > 0) {
        setHotspots(data);
      }
    });
  }, []);

  // Filtered and Sorted Popular Cities for World Hotspots Deck (from dynamic live data)
  const filteredPopularCities = useMemo(() => {
    const list = [...hotspots];
    switch (popularCityFilter) {
      case 'hottest':
        return list.sort((a, b) => b.airTemp - a.airTemp);
      case 'extreme':
        return list.filter((c) => c.category === 'Extreme').sort((a, b) => b.airTemp - a.airTemp);
      case 'veryHigh':
        return list.filter((c) => c.category === 'Very High').sort((a, b) => b.airTemp - a.airTemp);
      case 'mideast':
        return list.filter((c) =>
          ['Kuwait', 'Pakistan', 'Qatar', 'Saudi Arabia', 'United Arab Emirates', 'Egypt'].includes(c.country)
        ).sort((a, b) => b.airTemp - a.airTemp);
      case 'asia':
        return list.filter((c) =>
          ['India', 'Japan', 'China', 'Thailand', 'Singapore', 'Indonesia', 'Australia', 'South Korea'].includes(c.country)
        ).sort((a, b) => b.airTemp - a.airTemp);
      case 'americas':
        return list.filter((c) =>
          ['United States', 'Mexico', 'Brazil', 'Canada'].includes(c.country)
        ).sort((a, b) => b.airTemp - a.airTemp);
      case 'europe':
        return list.filter((c) =>
          ['Spain', 'Greece', 'Italy', 'United Kingdom', 'France'].includes(c.country)
        ).sort((a, b) => b.airTemp - a.airTemp);
      case 'all':
      default:
        return list.sort((a, b) => b.airTemp - a.airTemp);
    }
  }, [hotspots, popularCityFilter]);

  // Dynamic Analysis Job State (Section 34 & 35)
  const [currentJob, setCurrentJob] = useState<AnalysisJob | null>(null);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isEvidenceGraphOpen, setIsEvidenceGraphOpen] = useState(false);
  const [evidenceGraph, setEvidenceGraph] = useState<EvidenceKnowledgeGraph | null>(null);

  // GIS Map Layers
  const [layers, setLayers] = useState<MapLayerConfig[]>(INITIAL_MAP_LAYERS);
  const [isLayerPanelOpen, setIsLayerPanelOpen] = useState(false);

  // Modals
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isApiSettingsOpen, setIsApiSettingsOpen] = useState(false);
  const [isWhyHotModalOpen, setIsWhyHotModalOpen] = useState(false);
  const [keyRefreshCounter, setKeyRefreshCounter] = useState(0);

  // Simulator Initial Preload
  const [simulatorParams, setSimulatorParams] = useState<Partial<ScenarioSimulationParams>>({});
  const [analysisError, setAnalysisError] = useState<{ title: string; message: string } | null>(null);

  // Dynamic Orchestration Trigger (Sections 2, 34, 35, 42)
  const triggerDynamicInvestigation = async (
    lat: number,
    lng: number,
    locName: string,
    cityName: string,
    countryName: string,
    radius: AnalysisRadius = selectedRadius
  ) => {
    setAnalysisError(null);
    setIsProgressModalOpen(true);
    setIsAnalyzing(true);

    try {
      const outcome = await runLocationAnalysisOrchestrator({
        latitude: lat,
        longitude: lng,
        locationName: locName,
        city: cityName,
        country: countryName,
        radius,
        onProgress: (job) => {
          setCurrentJob({ ...job });
        },
      });

      setCurrentJob(outcome.job);
      setProfile(outcome.profile);
      if (outcome.job.evidenceGraph) {
        setEvidenceGraph(outcome.job.evidenceGraph);
      }
    } catch (err: any) {
      console.error('Dynamic analysis investigation error:', err);
      setIsProgressModalOpen(false);
      const msg = err.message || 'An error occurred during analysis.';
      if (msg.includes('OFFLINE_ERROR') || (typeof navigator !== 'undefined' && !navigator.onLine)) {
        setAnalysisError({
          title: 'No Internet Connection',
          message: 'EcoPulseAI cannot fetch live atmospheric telemetry and satellite data while offline. Please connect to the internet to analyze this location.',
        });
      } else if (msg.includes('BACKEND_OFFLINE_ERROR') || msg.includes('Failed to fetch')) {
        setAnalysisError({
          title: 'Node.js Backend Server Offline',
          message: 'The EcoPulseAI Express + AI backend is not running on port 5001. Please run "npm run dev" in your terminal to start the full-stack system.',
        });
      } else {
        setAnalysisError({
          title: 'Analysis Error',
          message: msg,
        });
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResetToGlobal = () => {
    setIsGlobalOverview(true);
  };

  // Handlers
  const handleSelectCity = (cityId: string, radius = selectedRadius) => {
    setIsGlobalOverview(false);
    setIsTargetPanelOpen(true);
    const city = hotspots.find((c) => c.id === cityId);
    if (city) {
      setSelectedCoordinates({ lat: city.lat, lng: city.lng });
      triggerDynamicInvestigation(city.lat, city.lng, city.name, city.name, city.country, radius);
    }
  };

  const handleSelectCoords = async (
    lat: number,
    lng: number,
    placeName?: string,
    fullAddress?: string,
    radius = selectedRadius
  ) => {
    setIsGlobalOverview(false);
    setSelectedCoordinates({ lat, lng });
    setIsTargetPanelOpen(true);

    let newProfile = createDynamicPlaceholderProfile(lat, lng, radius, fullAddress, placeName);
    setProfile(newProfile);

    let resolvedCity = placeName || newProfile.location.city;
    let resolvedCountry = newProfile.location.country;
    let resolvedName = placeName || newProfile.location.name;

    // Reverse geocode via OpenStreetMap Nominatim if address wasn't passed directly
    if (!fullAddress) {
      try {
        const geo = await reverseGeocode(lat, lng);
        if (geo.address && geo.address !== 'Selected Geographic Point') {
          resolvedCity = geo.city !== 'Selected Region' ? geo.city : resolvedCity;
          resolvedCountry = geo.country || resolvedCountry;
          resolvedName = geo.city !== 'Selected Region' ? geo.city : resolvedName;
          newProfile = {
            ...newProfile,
            location: {
              ...newProfile.location,
              name: resolvedName,
              address: geo.address,
              city: resolvedCity,
              country: resolvedCountry,
            },
          };
          setProfile(newProfile);
        }
      } catch {
        // Graceful fallback
      }
    }

    // Launch multi-agent investigation workflow
    triggerDynamicInvestigation(lat, lng, resolvedName, resolvedCity, resolvedCountry, radius);
  };

  const handleRadiusChange = (radius: AnalysisRadius) => {
    setSelectedRadius(radius);
    triggerDynamicInvestigation(
      selectedCoordinates.lat,
      selectedCoordinates.lng,
      profile.location.name,
      profile.location.city,
      profile.location.country,
      radius
    );
  };

  const handleToggleLayer = (layerId: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === layerId ? { ...l, active: !l.active } : l))
    );
  };

  const handleChangeLayerOpacity = (layerId: string, opacity: number) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === layerId ? { ...l, opacity } : l))
    );
  };

  const handleOpenSimulatorWithAction = (rec: Recommendation) => {
    if (rec.factor.includes('Tree')) {
      setSimulatorParams({ treesToPlant: 20000 });
    } else if (rec.factor.includes('Roof')) {
      setSimulatorParams({ coolRoofsPercent: 40 });
    } else if (rec.factor.includes('Pavement') || rec.factor.includes('Road')) {
      setSimulatorParams({ coolPavementPercent: 45 });
    } else if (rec.factor.includes('Traffic')) {
      setSimulatorParams({ trafficReductionPercent: 25 });
    }
    setCurrentTab('simulator');
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Top Application Header */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onSelectCity={handleSelectCity}
        onSelectCoords={handleSelectCoords}
        onOpenMethodology={() => setIsMethodologyOpen(true)}
        onOpenReports={() => setIsReportOpen(true)}
        onOpenApiSettings={() => setIsApiSettingsOpen(true)}
        selectedCityName={profile.location.city}
      />

      {/* Real-time Connectivity & Backend Health Alert Banner */}
      <ConnectivityAlertBanner />

      {/* Main Workspace Area */}
      <main className="flex-1 relative overflow-hidden flex">
        {/* TAB 1: Global Map & GIS View */}
        {currentTab === 'map' && (
          <div className="relative w-full h-full flex flex-col">
            <div className="flex-1 relative">
              <HeatMap
                key={`heatmap-${keyRefreshCounter}`}
                cities={hotspots}
                selectedCityId={profile.location.id}
                selectedCoordinates={selectedCoordinates}
                activeLayers={layers}
                scenarioZones={profile.scenarioZones}
                analysisRadius={selectedRadius}
                isGlobalOverview={isGlobalOverview}
                onResetToGlobal={handleResetToGlobal}
                onSelectCity={handleSelectCity}
                onMapClick={handleSelectCoords}
                onToggleLayer={handleToggleLayer}
                onOpenApiSettings={() => setIsApiSettingsOpen(true)}
              />

              {/* Floating Top Left Panel: Global Command Overview OR Selected Location Intelligence */}
              {isGlobalOverview ? (
                <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-20 w-[calc(100%-1rem)] sm:w-80 md:w-96 max-w-sm max-h-[60vh] sm:max-h-none overflow-y-auto sm:overflow-visible no-scrollbar">
                  <div className="bg-slate-950/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-4 text-slate-100 ring-1 ring-white/10">
                    <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-400/40 flex items-center justify-center shadow-lg shadow-orange-500/10">
                          <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
                        </div>
                        <div>
                          <h3 className="font-black text-sm text-white tracking-tight">Global Heat Command</h3>
                          <p className="text-[10px] text-slate-400">Earth Thermal Surveillance Deck</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                        <span>32 Megacities</span>
                      </span>
                    </div>

                    {/* Top Planetary Records */}
                    <div className="space-y-1.5 mb-3">
                      <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Planetary Heat Records</div>
                      <div className="grid grid-cols-3 gap-1.5 text-center">
                        <button
                          onClick={() => handleSelectCity('kuwaitcity')}
                          className="bg-slate-900/90 hover:bg-slate-800 border border-red-500/30 p-2 rounded-xl text-left transition group"
                        >
                          <span className="text-[9px] text-red-400 font-bold block">🥇 Hottest</span>
                          <span className="text-xs font-bold text-white block truncate">Kuwait City</span>
                          <span className="font-mono font-black text-orange-400 text-xs">47.6°C</span>
                        </button>
                        <button
                          onClick={() => handleSelectCity('jacobabad')}
                          className="bg-slate-900/90 hover:bg-slate-800 border border-rose-500/30 p-2 rounded-xl text-left transition group"
                        >
                          <span className="text-[9px] text-rose-400 font-bold block">🥈 Heat Stress</span>
                          <span className="text-xs font-bold text-white block truncate">Jacobabad</span>
                          <span className="font-mono font-black text-rose-400 text-xs">52.4°C</span>
                        </button>
                        <button
                          onClick={() => handleSelectCity('phoenix')}
                          className="bg-slate-900/90 hover:bg-slate-800 border border-amber-500/30 p-2 rounded-xl text-left transition group"
                        >
                          <span className="text-[9px] text-amber-400 font-bold block">🥉 Sonoran Hub</span>
                          <span className="text-xs font-bold text-white block truncate">Phoenix</span>
                          <span className="font-mono font-black text-amber-400 text-xs">44.5°C</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 mb-3 text-xs text-slate-300 leading-relaxed">
                      <p className="flex items-center space-x-1.5 text-emerald-400 font-bold text-[11px] mb-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Interactive Global Bubbles</span>
                      </p>
                      Click any pulsating thermal bubble on the world map or select a popular city below to inspect microclimates down to street level.
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleSelectCity('dubai')}
                        className="flex-1 py-1.5 px-2 text-center font-bold text-[11px] rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20 transition flex items-center justify-center space-x-1"
                      >
                        <span>Dubai 🇦🇪 (43.8°)</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleSelectCity('delhi')}
                        className="flex-1 py-1.5 px-2 text-center font-bold text-[11px] rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-700 transition flex items-center justify-center space-x-1"
                      >
                        <span>Delhi 🇮🇳 (41.2°)</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : isTargetPanelOpen ? (
                <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-20 w-[calc(100%-1rem)] sm:w-80 md:w-96 max-w-sm max-h-[60vh] sm:max-h-none overflow-y-auto sm:overflow-visible no-scrollbar space-y-2">
                  <button
                    onClick={handleResetToGlobal}
                    className="w-full py-1.5 px-3 rounded-xl bg-slate-950/95 hover:bg-slate-900 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center justify-center space-x-1.5 transition shadow-xl"
                  >
                    <Globe2 className="w-3.5 h-3.5" />
                    <span>← Return to World Map Overview</span>
                  </button>
                  <SelectedLocationPanel
                    locationName={profile.location.name}
                    address={
                      profile.location.address ||
                      `${profile.location.latitude.toFixed(4)}, ${profile.location.longitude.toFixed(4)}`
                    }
                    latitude={profile.location.latitude}
                    longitude={profile.location.longitude}
                    selectedRadius={selectedRadius}
                    onChangeRadius={handleRadiusChange}
                    onAnalyze={() =>
                      triggerDynamicInvestigation(
                        profile.location.latitude,
                        profile.location.longitude,
                        profile.location.name,
                        profile.location.city,
                        profile.location.country,
                        selectedRadius
                      )
                    }
                    onClose={() => setIsTargetPanelOpen(false)}
                    isAnalyzing={isAnalyzing}
                  />
                </div>
              ) : (
                <div className="absolute top-4 left-4 z-20 flex flex-col space-y-2">
                  <button
                    onClick={handleResetToGlobal}
                    className="bg-slate-900/90 backdrop-blur border border-slate-700 px-3 py-2 rounded-xl shadow-2xl flex items-center space-x-2 text-xs font-semibold text-emerald-400 hover:bg-slate-800 transition"
                  >
                    <Globe2 className="w-4 h-4" />
                    <span>World Map</span>
                  </button>
                  <button
                    onClick={() => setIsTargetPanelOpen(true)}
                    className="bg-slate-900/90 backdrop-blur border border-slate-700 px-3 py-2 rounded-xl shadow-2xl flex items-center space-x-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition"
                  >
                    <Compass className="w-4 h-4 text-emerald-400" />
                    <span>Location Target ({selectedRadius})</span>
                  </button>
                </div>
              )}

              {/* Floating Layer Drawer Toggle (Right Side) */}
              <button
                onClick={() => setIsLayerPanelOpen(!isLayerPanelOpen)}
                className="absolute bottom-36 sm:bottom-auto sm:top-4 right-4 z-20 bg-slate-900/90 backdrop-blur border border-slate-700 px-3 py-2 rounded-xl shadow-2xl flex items-center space-x-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition"
              >
                <Layers className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">GIS Layer Manager</span>
              </button>

              {/* Floating Active Target Card (Top Right) - Only shown when inspecting a city */}
              {!isGlobalOverview && (
                <div className="absolute top-16 right-4 z-20 bg-slate-900/90 backdrop-blur border border-slate-800 p-3.5 rounded-xl shadow-2xl max-w-xs text-xs space-y-2 hidden md:block">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-bold text-slate-200">{profile.location.city}</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                      Score: {profile.heatScore.score}/100
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div>Air Temp: <strong className="text-orange-400">{profile.weather.airTemperature}°C</strong></div>
                    <div>Feels Like: <strong className="text-rose-400">{profile.weather.feelsLike}°C</strong></div>
                    <div>Surface LST: <strong className="text-amber-400">{profile.weather.surfaceTemperature}°C</strong></div>
                    <div>UHI Delta: <strong className="text-purple-400">+{profile.weather.uhiDelta}°C</strong></div>
                  </div>
                  <div className="flex items-center space-x-1.5 pt-1">
                    <button
                      onClick={() =>
                        triggerDynamicInvestigation(
                          profile.location.latitude,
                          profile.location.longitude,
                          profile.location.name,
                          profile.location.city,
                          profile.location.country,
                          selectedRadius
                        )
                      }
                      className="flex-1 py-1.5 px-2 text-center font-bold text-[11px] rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 transition flex items-center justify-center space-x-1"
                      title="Launch Dynamic Investigation Job"
                    >
                      <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Investigate</span>
                    </button>
                    <button
                      onClick={() => setIsWhyHotModalOpen(true)}
                      className="flex-1 py-1.5 px-2 text-center font-bold text-[11px] rounded-lg bg-orange-600/30 hover:bg-orange-600/50 border border-orange-500/40 text-orange-300 transition flex items-center justify-center space-x-1"
                    >
                      <Brain className="w-3.5 h-3.5 text-orange-400" />
                      <span>Why Hot?</span>
                    </button>
                    <button
                      onClick={() => setCurrentTab('dashboard')}
                      className="flex-1 py-1.5 px-2 text-center font-semibold text-[11px] rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition flex items-center justify-center space-x-1"
                    >
                      <span>Dashboard</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom UI/UX Max Pro World Hotspots Command Deck */}
            <div className="bg-slate-950/98 backdrop-blur-xl border-t border-slate-800/90 px-4 py-2.5 shrink-0 z-20 space-y-2 select-none shadow-[0_-15px_30px_rgba(0,0,0,0.7)]">
              {/* Deck Header & Filter Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2 shrink-0">
                  <div className="p-1 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    <Flame className="w-3.5 h-3.5 animate-pulse" />
                  </div>
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    World Popular Cities &amp; Heat Hotspots:
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-semibold">
                    {filteredPopularCities.length} cities
                  </span>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center space-x-1 overflow-x-auto text-[11px] font-medium">
                  {[
                    { id: 'hottest', label: '🔥 Hottest First' },
                    { id: 'all', label: 'All (32)' },
                    { id: 'mideast', label: '🌍 Middle East & Africa' },
                    { id: 'asia', label: '🌏 Asia-Pacific' },
                    { id: 'americas', label: '🌎 Americas' },
                    { id: 'europe', label: '🏰 Europe' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setPopularCityFilter(tab.id as any)}
                      className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap ${
                        popularCityFilter === tab.id
                          ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}

                  <button
                    onClick={handleResetToGlobal}
                    title="Reset map view to the whole globe"
                    className={`ml-2 px-2.5 py-1 rounded-lg flex items-center space-x-1 transition border ${
                      isGlobalOverview
                        ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 font-bold'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Globe2 className="w-3 h-3" />
                    <span>World View</span>
                  </button>
                </div>
              </div>

              {/* Horizontal City Cards Carousel */}
              <div className="flex items-center space-x-2.5 overflow-x-auto pb-1 pt-0.5">
                {filteredPopularCities.length === 0 ? (
                  <div className="flex items-center space-x-2.5 py-2 px-3 text-xs font-mono text-emerald-400 bg-slate-900/60 rounded-xl border border-slate-800">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Connecting to live Open-Meteo atmospheric surveillance network...</span>
                  </div>
                ) : (
                  filteredPopularCities.map((city, idx) => {
                  const isSelected = !isGlobalOverview && city.id === profile.location.id;
                  const colors = getHeatCategoryColor(city.category);
                  const flag = getCountryEmoji(city.country);

                  return (
                    <button
                      key={city.id}
                      onClick={() => handleSelectCity(city.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center space-x-2.5 shrink-0 transition-all border group ${
                        isSelected
                          ? 'bg-slate-900 border-emerald-400 shadow-lg shadow-emerald-500/20 scale-102 ring-1 ring-emerald-400'
                          : 'bg-slate-900/90 border-slate-800 hover:border-slate-600 hover:bg-slate-850 hover:scale-102'
                      }`}
                    >
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        #{idx + 1}
                      </span>
                      <span className="text-base">{flag}</span>
                      <div className="text-left">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-slate-100 font-bold group-hover:text-emerald-300 transition-colors">
                            {city.name}
                          </span>
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: colors.hex }}
                          ></span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono flex items-center space-x-1">
                          <span>{city.country}</span>
                        </div>
                      </div>

                      <div className="text-right pl-1 border-l border-slate-800">
                        <span className="font-mono font-black text-orange-400 text-xs block">
                          {city.airTemp}°C
                        </span>
                        <span className="text-[9px] font-mono text-rose-400 block">
                          {city.heatIndex}° FL
                        </span>
                      </div>
                    </button>
                  );
                }))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Location Dashboard */}
        {currentTab === 'dashboard' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <LocationDashboard
              profile={profile}
              onOpenSimulatorWithAction={handleOpenSimulatorWithAction}
              onOpenReport={() => setIsReportOpen(true)}
              onOpenWhyHotModal={() => setIsWhyHotModalOpen(true)}
              onOpenEvidenceGraph={() => setIsEvidenceGraphOpen(true)}
              activeJobId={currentJob?.jobId}
              onChangeRadius={handleRadiusChange}
            />
          </div>
        )}

        {/* TAB 3: Scenario Simulator */}
        {currentTab === 'simulator' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <ScenarioSimulator
              location={profile.location}
              baseHeatScore={profile.heatScore.score}
              baseSurfaceTemp={profile.weather.surfaceTemperature}
              baseAirTemp={profile.weather.airTemperature}
              initialParams={simulatorParams}
            />
          </div>
        )}

        {/* TAB 4: Future Timeline & Climate Projections */}
        {currentTab === 'timeline' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
            <div className="mb-4">
              <span className="text-xs font-mono text-teal-400">HORIZON ENGINE</span>
              <h2 className="text-2xl font-black text-slate-100">
                Future Heat Prediction for {profile.location.name}
              </h2>
            </div>
            <FuturePredictionCard
              projections={profile.projections}
              locationName={profile.location.name}
            />
          </div>
        )}

        {/* GIS Multi-Layer Control Panel */}
        <LayerControlPanel
          isOpen={isLayerPanelOpen}
          onClose={() => setIsLayerPanelOpen(false)}
          layers={layers}
          onToggleLayer={handleToggleLayer}
          onChangeOpacity={handleChangeLayerOpacity}
        />
      </main>

      {/* Intelligence Reports Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        profile={profile}
        hotspots={hotspots}
      />

      {/* Scientific Methodology Modal */}
      <MethodologyModal
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
      />

      {/* API Keys & Tile Settings Modal */}
      <ApiSettingsModal
        isOpen={isApiSettingsOpen}
        onClose={() => setIsApiSettingsOpen(false)}
        onKeysUpdated={() => setKeyRefreshCounter((c) => c + 1)}
      />

      {/* Phase 2: Why Is This Place Hot? Causal Analysis Modal */}
      <WhyHotExplorationModal
        isOpen={isWhyHotModalOpen}
        onClose={() => setIsWhyHotModalOpen(false)}
        location={profile.location}
        weather={profile.weather}
        heatScore={profile.heatScore}
        diagnosis={profile.diagnosis}
        contributors={profile.contributors}
        recommendations={profile.recommendations}
        geometricMetrics={profile.geometricMetrics}
        industryIntelligence={profile.industryIntelligence}
        dataCenterIntelligence={profile.dataCenterIntelligence}
        structuredRecommendations={profile.structuredRecommendations}
        onOpenSimulatorWithAction={handleOpenSimulatorWithAction}
      />

      {/* Phase 3: Dynamic Analysis Progress Modal (Section 34 & 35) */}
      <AnalysisProgressModal
        job={currentJob}
        isOpen={isProgressModalOpen}
        onClose={() => setIsProgressModalOpen(false)}
        onViewResults={() => {
          setIsProgressModalOpen(false);
          setCurrentTab('dashboard');
        }}
      />

      {/* Phase 3: Evidence Knowledge Graph Modal (Section 14 & 15) */}
      <EvidenceGraphModal
        isOpen={isEvidenceGraphOpen}
        onClose={() => setIsEvidenceGraphOpen(false)}
        graph={evidenceGraph}
        locationName={profile.location.name}
      />

      {/* Connectivity & Backend Offline Alert Modal */}
      {analysisError && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-rose-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 ring-1 ring-rose-500/20">
            <div className="flex items-start space-x-3.5">
              <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white tracking-tight">{analysisError.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{analysisError.message}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 flex items-center justify-between">
              <span>npm run dev</span>
              <span className="text-[10px] text-slate-400 font-sans">Run in terminal</span>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setAnalysisError(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  setAnalysisError(null);
                  triggerDynamicInvestigation(
                    profile.location.latitude,
                    profile.location.longitude,
                    profile.location.name,
                    profile.location.city,
                    profile.location.country,
                    selectedRadius
                  );
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20"
              >
                Retry Analysis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
