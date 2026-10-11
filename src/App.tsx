import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/layout/Header';
import { HeatMap } from './components/map/HeatMap';
import { LocationDashboard } from './components/dashboard/LocationDashboard';
import { ScenarioSimulator } from './components/simulator/ScenarioSimulator';
import { FuturePredictionCard } from './components/dashboard/FuturePredictionCard';
import { LayerControlPanel } from './components/layers/LayerControlPanel';
import { ReportModal } from './components/reports/ReportModal';
import { MethodologyModal } from './components/modals/MethodologyModal';
import { SelectedLocationPanel } from './components/location/SelectedLocationPanel';
import { WhyHotExplorationModal } from './components/dashboard/WhyHotExplorationModal';
import { AnalysisProgressModal } from './components/jobs/AnalysisProgressModal';
import { EvidenceGraphModal } from './components/evidence/EvidenceGraphModal';
import { ConnectivityAlertBanner } from './components/common/ConnectivityAlertBanner';
import { AiWeatherHeatDossierModal } from './components/dossier/AiWeatherHeatDossierModal';
import { INITIAL_MAP_LAYERS } from './config/mapLayers';
import {
  fetchLiveHotspots,
  fetchAccurateLiveWeather,
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
  ChevronDown,
  ChevronUp,
  Clock,
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
  const [isCommandPanelCollapsed, setIsCommandPanelCollapsed] = useState(false);
  const [isHotspotsDeckCollapsed, setIsHotspotsDeckCollapsed] = useState(false);

  // Fetch real-time planetary observation hubs and initial location weather from Open-Meteo
  useEffect(() => {
    fetchLiveHotspots().then((data) => {
      if (data && data.length > 0) {
        setHotspots(data);
      }
    });

    fetchAccurateLiveWeather(INITIAL_COORDS.lat, INITIAL_COORDS.lng).then((liveWeather) => {
      setProfile((prev) => {
        if (
          Math.abs(prev.location.latitude - INITIAL_COORDS.lat) > 0.01 ||
          Math.abs(prev.location.longitude - INITIAL_COORDS.lng) > 0.01
        ) {
          return prev;
        }
        return {
          ...prev,
          weather: {
            ...prev.weather,
            ...liveWeather,
          },
        };
      });
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
  const [isAiDossierOpen, setIsAiDossierOpen] = useState(false);
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
    radius: AnalysisRadius = selectedRadius,
    showModal = false
  ) => {
    setAnalysisError(null);
    if (showModal) {
      setIsProgressModalOpen(true);
    }
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
      setProfile((prev) => ({
        ...outcome.profile,
        // Preserve live Open-Meteo accurate measurements if server returned placeholders
        weather: {
          ...outcome.profile.weather,
          airTemperature: outcome.profile.weather.airTemperature || prev.weather.airTemperature,
          feelsLike: outcome.profile.weather.feelsLike || prev.weather.feelsLike,
          humidity: outcome.profile.weather.humidity || prev.weather.humidity,
          windSpeed: outcome.profile.weather.windSpeed || prev.weather.windSpeed,
          warmingAnomaly: outcome.profile.weather.warmingAnomaly || prev.weather.warmingAnomaly,
        },
      }));
      if (outcome.job.evidenceGraph) {
        setEvidenceGraph(outcome.job.evidenceGraph);
      }
    } catch (err: any) {
      console.warn('Dynamic analysis investigation notice:', err.message);
      setIsProgressModalOpen(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResetToGlobal = () => {
    setIsGlobalOverview(true);
  };

  // Handlers
  const handleSelectCity = async (cityId: string, radius = selectedRadius) => {
    setIsGlobalOverview(false);
    setIsTargetPanelOpen(true);
    let city = hotspots.find((c) => c.id === cityId);
    if (!city) {
      const fallbackHubs = [
        { id: 'kuwaitcity', name: 'Kuwait City', country: 'Kuwait', lat: 29.3759, lng: 47.9774 },
        { id: 'jacobabad', name: 'Jacobabad', country: 'Pakistan', lat: 28.2810, lng: 68.4388 },
        { id: 'phoenix', name: 'Phoenix', country: 'United States', lat: 33.4484, lng: -112.0740 },
        { id: 'dubai', name: 'Dubai', country: 'United Arab Emirates', lat: 25.2048, lng: 55.2708 },
      ];
      city = fallbackHubs.find((c) => c.id === cityId) as any;
    }
    if (city) {
      setSelectedCoordinates({ lat: city.lat, lng: city.lng });
      // 1. Immediately fetch accurate live Open-Meteo weather
      const liveWeather = await fetchAccurateLiveWeather(city.lat, city.lng);
      const newProfile = createDynamicPlaceholderProfile(city.lat, city.lng, radius, undefined, city.name, city.country, liveWeather);
      setProfile(newProfile);
      // 2. Background investigation without intrusive modal
      triggerDynamicInvestigation(city.lat, city.lng, city.name, city.name, city.country, radius, false);
    }
  };

  // URL search parameter deep linking (e.g. ?city=kuwaitcity or ?lat=29.3759&lng=47.9774)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cityParam = params.get('city');
    const latParam = params.get('lat');
    const lngParam = params.get('lng');
    const nameParam = params.get('name');

    if (cityParam) {
      handleSelectCity(cityParam);
    } else if (latParam && lngParam) {
      const parsedLat = parseFloat(latParam);
      const parsedLng = parseFloat(lngParam);
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        handleSelectCoords(parsedLat, parsedLng, nameParam || undefined);
      }
    }
  }, [hotspots]);

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

    // 1. Immediately fetch accurate live Open-Meteo weather for this exact point
    const liveWeather = await fetchAccurateLiveWeather(lat, lng);

    let newProfile = createDynamicPlaceholderProfile(lat, lng, radius, fullAddress, placeName, undefined, liveWeather);
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

    // Launch background investigation WITHOUT blocking popup modal
    triggerDynamicInvestigation(lat, lng, resolvedName, resolvedCity, resolvedCountry, radius, false);
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
        onOpenAiDossier={() => setIsAiDossierOpen(true)}
        selectedCityName={profile.location.city}
      />

      {/* Real-time Connectivity & Backend Health Alert Banner */}
      <ConnectivityAlertBanner />

      {/* Main Workspace Area */}
      <main className="flex-1 relative overflow-hidden flex pb-14 lg:pb-0">
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
              />

              {/* Floating Top Left Panel: Global Command Overview OR Selected Location Intelligence */}
              {isGlobalOverview ? (
                <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-20 w-[calc(100%-1rem)] sm:w-80 md:w-96 max-w-sm max-h-[60vh] sm:max-h-none overflow-y-auto sm:overflow-visible no-scrollbar">
                  {isCommandPanelCollapsed ? (
                    <div className="bg-slate-950/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-2.5 sm:p-3 text-slate-100 flex items-center justify-between ring-1 ring-white/10 animate-in fade-in duration-150">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-lg bg-orange-500/20 border border-orange-400/40 flex items-center justify-center">
                          <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-white">Global Heat Command</h4>
                          <span className="text-[10px] text-emerald-400 font-mono font-semibold">32 Monitored Cities</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsCommandPanelCollapsed(false)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1 border border-slate-700 transition"
                        title="Expand Global Heat Command Panel"
                      >
                        <span>Expand</span>
                        <ChevronDown className="w-3.5 h-3.5 text-emerald-400" />
                      </button>
                    </div>
                  ) : (
                    <div className="bg-slate-950/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-3.5 sm:p-4 text-slate-100 ring-1 ring-white/10">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-orange-500/20 border border-orange-400/40 flex items-center justify-center shadow-lg shadow-orange-500/10 shrink-0">
                            <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400 animate-pulse" />
                          </div>
                          <div>
                            <h3 className="font-black text-xs sm:text-sm text-white tracking-tight">Global Heat Command</h3>
                            <p className="text-[9px] sm:text-[10px] text-slate-400">Earth Thermal Surveillance Deck</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1.5 shrink-0">
                          <span className="text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold flex items-center space-x-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                            <span>32 Cities</span>
                          </span>
                          <button
                            onClick={() => setIsCommandPanelCollapsed(true)}
                            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            title="Collapse / Minimize to map"
                          >
                            <ChevronUp className="w-4 h-4 text-emerald-400" />
                          </button>
                        </div>
                      </div>

                      {/* Top Planetary Records with Live Telemetry */}
                      {(() => {
                        const kuwaitLive = hotspots.find((h) => h.id === 'kuwaitcity');
                        const jacobLive = hotspots.find((h) => h.id === 'jacobabad');
                        const phoenixLive = hotspots.find((h) => h.id === 'phoenix');

                        return (
                          <div className="space-y-1.5 mb-2.5">
                            <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                              <span>Global Heat Hubs</span>
                              <span className="text-emerald-400 font-bold flex items-center space-x-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                <span>Live Telemetry</span>
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-1.5 text-center">
                              <button
                                onClick={() => handleSelectCity('kuwaitcity')}
                                className="bg-slate-900/90 hover:bg-slate-800 border border-red-500/30 p-1.5 sm:p-2 rounded-xl text-left transition group"
                              >
                                <span className="text-[8px] sm:text-[9px] text-red-400 font-bold block">Hyper-Arid</span>
                                <span className="text-[11px] sm:text-xs font-bold text-white block truncate">Kuwait City</span>
                                <div className="flex items-baseline space-x-1">
                                  <span className="font-mono font-black text-orange-400 text-xs sm:text-sm">
                                    {kuwaitLive ? `${kuwaitLive.airTemp}°C` : '38.0°C'}
                                  </span>
                                  <span className="text-[8px] font-mono text-slate-400">Live</span>
                                </div>
                              </button>
                              <button
                                onClick={() => handleSelectCity('jacobabad')}
                                className="bg-slate-900/90 hover:bg-slate-800 border border-rose-500/30 p-1.5 sm:p-2 rounded-xl text-left transition group"
                              >
                                <span className="text-[8px] sm:text-[9px] text-rose-400 font-bold block">Heat Stress</span>
                                <span className="text-[11px] sm:text-xs font-bold text-white block truncate">Jacobabad</span>
                                <div className="flex items-baseline space-x-1">
                                  <span className="font-mono font-black text-rose-400 text-xs sm:text-sm">
                                    {jacobLive ? `${jacobLive.airTemp}°C` : '33.5°C'}
                                  </span>
                                  <span className="text-[8px] font-mono text-slate-400">Live</span>
                                </div>
                              </button>
                              <button
                                onClick={() => handleSelectCity('phoenix')}
                                className="bg-slate-900/90 hover:bg-slate-800 border border-amber-500/30 p-1.5 sm:p-2 rounded-xl text-left transition group"
                              >
                                <span className="text-[8px] sm:text-[9px] text-amber-400 font-bold block">Sonoran Hub</span>
                                <span className="text-[11px] sm:text-xs font-bold text-white block truncate">Phoenix</span>
                                <div className="flex items-baseline space-x-1">
                                  <span className="font-mono font-black text-amber-400 text-xs sm:text-sm">
                                    {phoenixLive ? `${phoenixLive.airTemp}°C` : '30.0°C'}
                                  </span>
                                  <span className="text-[8px] font-mono text-slate-400">Live</span>
                                </div>
                              </button>
                            </div>
                          </div>
                        );
                      })()}

                      <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 mb-2.5 text-[11px] sm:text-xs text-slate-300 leading-relaxed hidden sm:block">
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
                  )}
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
                    weather={profile.weather}
                    selectedRadius={selectedRadius}
                    onChangeRadius={handleRadiusChange}
                    onOpenSimulator={() => setCurrentTab('simulator')}
                    onOpenDashboard={() => setCurrentTab('dashboard')}
                    onOpenAiDossier={() => setIsAiDossierOpen(true)}
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
                className="absolute top-16 sm:top-4 right-3 sm:right-4 z-20 bg-slate-900/90 backdrop-blur border border-slate-700 p-2 sm:px-3 sm:py-2 rounded-xl shadow-2xl flex items-center space-x-1.5 sm:space-x-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition"
                title="Open GIS Layer Manager"
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
                    <div>
                      Air Temp: <strong className="text-orange-400">{profile.weather.airTemperature}°C</strong>{' '}
                      <span className="text-[9px] text-slate-400 font-normal">
                        (H:{profile.weather.tempHigh ?? Math.round((profile.weather.airTemperature + 4.5) * 10) / 10}°/L:{profile.weather.tempLow ?? Math.round((profile.weather.airTemperature - 6.0) * 10) / 10}°)
                      </span>
                    </div>
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
            {isHotspotsDeckCollapsed ? (
              <div className="bg-slate-950/98 backdrop-blur-xl border-t border-slate-800/90 px-3 sm:px-4 py-2 shrink-0 z-20 select-none shadow-[0_-15px_30px_rgba(0,0,0,0.7)] flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    <Flame className="w-3.5 h-3.5 animate-pulse" />
                  </div>
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    World Hotspots:
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-semibold">
                    {filteredPopularCities.length} cities
                  </span>
                </div>
                <button
                  onClick={() => setIsHotspotsDeckCollapsed(false)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold flex items-center space-x-1 border border-slate-700 transition"
                >
                  <span>Expand Deck</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="bg-slate-950/98 backdrop-blur-xl border-t border-slate-800/90 px-3 sm:px-4 py-2 sm:py-2.5 shrink-0 z-20 space-y-2 select-none shadow-[0_-15px_30px_rgba(0,0,0,0.7)]">
                {/* Deck Header & Filter Tabs */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2 shrink-0">
                    <div className="p-1 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
                      <Flame className="w-3.5 h-3.5 animate-pulse" />
                    </div>
                    <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                      World Popular Cities &amp; Hotspots:
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-semibold">
                      {filteredPopularCities.length} cities
                    </span>
                  </div>

                  {/* Filter Pills & Controls */}
                  <div className="flex items-center space-x-1 overflow-x-auto text-[11px] font-medium no-scrollbar">
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
                      className={`ml-1 px-2.5 py-1 rounded-lg flex items-center space-x-1 transition border shrink-0 ${
                        isGlobalOverview
                          ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 font-bold'
                          : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Globe2 className="w-3 h-3" />
                      <span className="hidden sm:inline">World View</span>
                    </button>

                    <button
                      onClick={() => setIsHotspotsDeckCollapsed(true)}
                      title="Minimize hotspots deck"
                      className="p-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0 ml-1"
                    >
                      <ChevronDown className="w-3.5 h-3.5 text-emerald-400" />
                    </button>
                  </div>
                </div>

                {/* Horizontal City Cards Carousel */}
                <div className="flex items-center space-x-2 sm:space-x-2.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
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
                        className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-medium flex items-center space-x-2 sm:space-x-2.5 shrink-0 transition-all border group ${
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
            )}
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
              onOpenAiDossier={() => setIsAiDossierOpen(true)}
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

      {/* AI Weather & Heat Analysis Dossier Modal (ChatGPT/Gemini Structure) */}
      <AiWeatherHeatDossierModal
        isOpen={isAiDossierOpen}
        onClose={() => setIsAiDossierOpen(false)}
        locationName={profile.location.name}
        country={profile.location.country}
        latitude={profile.location.latitude}
        longitude={profile.location.longitude}
        weather={profile.weather}
      />

      {/* Scientific Methodology Modal */}
      <MethodologyModal
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
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

      {/* Mobile Bottom Navigation Bar (Visible on mobile/tablet < lg) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 py-1.5 px-3 flex items-center justify-around shadow-[0_-10px_25px_rgba(0,0,0,0.8)]">
        <button
          onClick={() => setCurrentTab('map')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
            currentTab === 'map'
              ? 'text-emerald-400 font-bold bg-emerald-500/15 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe2 className="w-4 h-4" />
          <span className="text-[10px] mt-0.5 font-medium">Map</span>
        </button>
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
            currentTab === 'dashboard'
              ? 'text-teal-400 font-bold bg-teal-500/15 border border-teal-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span className="text-[10px] mt-0.5 font-medium">Intelligence</span>
        </button>
        <button
          onClick={() => setCurrentTab('simulator')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
            currentTab === 'simulator'
              ? 'text-orange-400 font-bold bg-orange-500/15 border border-orange-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="text-[10px] mt-0.5 font-medium">Simulator</span>
        </button>
        <button
          onClick={() => setCurrentTab('timeline')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
            currentTab === 'timeline'
              ? 'text-cyan-400 font-bold bg-cyan-500/15 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span className="text-[10px] mt-0.5 font-medium">Timeline</span>
        </button>
      </nav>
    </div>
  );
};
