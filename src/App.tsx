import React, { useState, useEffect } from 'react';
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
import {
  GLOBAL_CITIES,
  INITIAL_MAP_LAYERS,
  AHMEDABAD_PROFILE,
} from './data/mockData';
import {
  getLocationProfile,
  getProfileForCoordinates,
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
} from 'lucide-react';
import { getHeatCategoryColor } from './services/heatModel';

export const App: React.FC = () => {
  // Navigation & View State
  const [currentTab, setCurrentTab] = useState<'map' | 'dashboard' | 'simulator' | 'timeline' | 'reports'>('map');

  // Active Selected Location Profile & Analysis Radius
  const [profile, setProfile] = useState<FullLocationProfile>(AHMEDABAD_PROFILE);
  const [selectedRadius, setSelectedRadius] = useState<AnalysisRadius>('5km');
  const [isTargetPanelOpen, setIsTargetPanelOpen] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ lat: number; lng: number }>({
    lat: AHMEDABAD_PROFILE.location.latitude,
    lng: AHMEDABAD_PROFILE.location.longitude,
  });

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

  // Dynamic Orchestration Trigger (Sections 2, 34, 35, 42)
  const triggerDynamicInvestigation = async (
    lat: number,
    lng: number,
    locName: string,
    cityName: string,
    countryName: string,
    radius: AnalysisRadius = selectedRadius
  ) => {
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
    } catch (err) {
      console.error('Dynamic analysis investigation error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handlers
  const handleSelectCity = (cityId: string, radius = selectedRadius) => {
    setIsTargetPanelOpen(true);
    const city = GLOBAL_CITIES.find((c) => c.id === cityId);
    if (city) {
      setSelectedCoordinates({ lat: city.lat, lng: city.lng });
      triggerDynamicInvestigation(city.lat, city.lng, city.name, city.name, city.country, radius);
    } else {
      const newProfile = getLocationProfile(cityId, radius);
      setProfile(newProfile);
      setSelectedCoordinates({
        lat: newProfile.location.latitude,
        lng: newProfile.location.longitude,
      });
      triggerDynamicInvestigation(
        newProfile.location.latitude,
        newProfile.location.longitude,
        newProfile.location.name,
        newProfile.location.city,
        newProfile.location.country,
        radius
      );
    }
  };

  const handleSelectCoords = async (
    lat: number,
    lng: number,
    placeName?: string,
    fullAddress?: string,
    radius = selectedRadius
  ) => {
    setSelectedCoordinates({ lat, lng });
    setIsTargetPanelOpen(true);

    // Initial instant computation so UI immediately responds
    let newProfile = getProfileForCoordinates(lat, lng, radius, fullAddress);
    if (placeName) {
      newProfile.location.name = placeName;
    }
    if (fullAddress) {
      newProfile.location.address = fullAddress;
    }
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

      {/* Main Workspace Area */}
      <main className="flex-1 relative overflow-hidden flex">
        {/* TAB 1: Global Map & GIS View */}
        {currentTab === 'map' && (
          <div className="relative w-full h-full flex flex-col">
            <div className="flex-1 relative">
              <HeatMap
                key={`heatmap-${keyRefreshCounter}`}
                cities={GLOBAL_CITIES}
                selectedCityId={profile.location.id}
                selectedCoordinates={selectedCoordinates}
                activeLayers={layers}
                scenarioZones={profile.scenarioZones}
                analysisRadius={selectedRadius}
                onSelectCity={handleSelectCity}
                onMapClick={handleSelectCoords}
                onToggleLayer={handleToggleLayer}
                onOpenApiSettings={() => setIsApiSettingsOpen(true)}
              />

              {/* Floating Selected Location Intelligence Panel (Top Left) */}
              {isTargetPanelOpen ? (
                <div className="absolute top-4 left-4 z-20 max-w-sm w-full">
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
                <button
                  onClick={() => setIsTargetPanelOpen(true)}
                  className="absolute top-4 left-4 z-20 bg-slate-900/90 backdrop-blur border border-slate-700 px-3 py-2 rounded-xl shadow-2xl flex items-center space-x-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition"
                >
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <span>Location Target ({selectedRadius})</span>
                </button>
              )}

              {/* Floating Layer Drawer Toggle (Right Side) */}
              <button
                onClick={() => setIsLayerPanelOpen(!isLayerPanelOpen)}
                className="absolute top-4 right-4 z-20 bg-slate-900/90 backdrop-blur border border-slate-700 px-3 py-2 rounded-xl shadow-2xl flex items-center space-x-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition"
              >
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>GIS Layer Manager</span>
              </button>

              {/* Floating Active Target Card (Top Right) */}
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
            </div>

            {/* Bottom Quick-City Hotspots Drawer */}
            <div className="h-16 bg-slate-900/95 backdrop-blur border-t border-slate-800 px-4 flex items-center space-x-3 overflow-x-auto shrink-0 z-20">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center space-x-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span>Global Hotspots:</span>
              </span>

              <div className="flex items-center space-x-2">
                {GLOBAL_CITIES.map((city) => {
                  const isSelected = city.id === profile.location.id;
                  const colors = getHeatCategoryColor(city.category);

                  return (
                    <button
                      key={city.id}
                      onClick={() => handleSelectCity(city.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-2 shrink-0 transition border ${
                        isSelected
                          ? 'bg-slate-800 border-emerald-500/80 shadow-md shadow-emerald-500/10'
                          : 'bg-slate-950/70 border-slate-800 hover:bg-slate-800/60'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.hex }}></span>
                      <span className="text-slate-200">{city.name}</span>
                      <span className="font-mono font-bold text-orange-400 text-[11px]">{city.airTemp}°</span>
                      <span
                        className="text-[9px] font-mono px-1 py-0.2 rounded"
                        style={{ backgroundColor: `${colors.hex}22`, color: colors.hex }}
                      >
                        {city.category}
                      </span>
                    </button>
                  );
                })}
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
    </div>
  );
};
