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
import { MapLayerConfig, CityHotspot, Recommendation, ScenarioSimulationParams, AnalysisRadius } from './types';
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

  // Handlers
  const handleSelectCity = (cityId: string, radius = selectedRadius) => {
    setIsAnalyzing(true);
    setIsTargetPanelOpen(true);
    const newProfile = getLocationProfile(cityId, radius);
    setProfile(newProfile);
    setSelectedCoordinates({
      lat: newProfile.location.latitude,
      lng: newProfile.location.longitude,
    });
    setTimeout(() => setIsAnalyzing(false), 250);
  };

  const handleSelectCoords = async (lat: number, lng: number, radius = selectedRadius) => {
    setSelectedCoordinates({ lat, lng });
    setIsTargetPanelOpen(true);
    setIsAnalyzing(true);

    // Initial instant computation so UI immediately responds
    let newProfile = getProfileForCoordinates(lat, lng, radius);
    setProfile(newProfile);

    // Reverse geocode via OpenStreetMap Nominatim for accurate physical street/city address
    try {
      const geo = await reverseGeocode(lat, lng);
      if (geo.address && geo.address !== 'Selected Geographic Point') {
        newProfile = {
          ...newProfile,
          location: {
            ...newProfile.location,
            name: geo.city !== 'Selected Region' ? geo.city : newProfile.location.name,
            address: geo.address,
            city: geo.city,
            country: geo.country,
          },
        };
        setProfile(newProfile);
      }
    } catch {
      // Graceful fallback already handled by getProfileForCoordinates
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRadiusChange = (radius: AnalysisRadius) => {
    setSelectedRadius(radius);
    setIsAnalyzing(true);
    if (profile.location.id && !profile.location.id.startsWith('custom-')) {
      const newProfile = getLocationProfile(profile.location.id, radius);
      setProfile(newProfile);
    } else {
      const newProfile = getProfileForCoordinates(
        profile.location.latitude,
        profile.location.longitude,
        radius,
        profile.location.address
      );
      setProfile(newProfile);
    }
    setTimeout(() => setIsAnalyzing(false), 300);
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
                    onAnalyze={() => handleRadiusChange(selectedRadius)}
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
                    onClick={() => setIsWhyHotModalOpen(true)}
                    className="flex-1 py-1.5 px-2 text-center font-bold text-xs rounded-lg bg-orange-600/30 hover:bg-orange-600/50 border border-orange-500/40 text-orange-300 transition flex items-center justify-center space-x-1"
                  >
                    <Brain className="w-3.5 h-3.5 text-orange-400" />
                    <span>Why Hot?</span>
                  </button>
                  <button
                    onClick={() => setCurrentTab('dashboard')}
                    className="flex-1 py-1.5 px-2 text-center font-semibold text-xs rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 transition flex items-center justify-center space-x-1"
                  >
                    <span>Dashboard</span>
                    <ChevronRight className="w-3.5 h-3.5" />
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
    </div>
  );
};
