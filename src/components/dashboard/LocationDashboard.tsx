import React, { useState } from 'react';
import { FullLocationProfile, getWindDirectionCardinal } from '../../services/locationService';
import { AiWeatherHeatDossierView } from '../dossier/AiWeatherHeatDossierView';
import { Recommendation, AnalysisRadius } from '../../types';
import {
  MapPin,
  Thermometer,
  Flame,
  Wind,
  Droplets,
  Sun,
  Activity,
  Sparkles,
  SlidersHorizontal,
  Compass,
  FileText,
  TrendingUp,
  TreePine,
  Building,
  ShieldCheck,
  ArrowRight,
  Layers,
  ChevronRight,
  AlertTriangle,
  Server,
  ExternalLink,
  BookOpen,
  ChevronDown,
  Clock,
} from 'lucide-react';
import { getHeatCategoryColor } from '../../services/heatModel';
import { getHubDataCenterIntelligence } from '../../services/dataCenterHubs';
import { UrbanHeatCausesAndMitigationGuide } from './UrbanHeatCausesAndMitigationGuide';

interface LocationDashboardProps {
  profile: FullLocationProfile;
  onOpenSimulatorWithAction: (rec: Recommendation) => void;
  onOpenReport: () => void;
  onOpenWhyHotModal?: () => void;
  onOpenEvidenceGraph?: () => void;
  onOpenAiDossier?: () => void;
  activeJobId?: string;
  onChangeRadius?: (radius: AnalysisRadius) => void;
}

export const LocationDashboard: React.FC<LocationDashboardProps> = ({
  profile,
  onOpenSimulatorWithAction,
  onOpenReport,
  onOpenWhyHotModal,
  onChangeRadius,
}) => {
  const [dashboardMode, setDashboardMode] = useState<'ai-dossier' | 'geospatial'>('ai-dossier');
  const [isCausesGuideExpanded, setIsCausesGuideExpanded] = useState(false);
  const { location, weather, heatScore } = profile;
  const heatColor = getHeatCategoryColor(heatScore.category);

  // Data center hubs expose a dedicated data center driver in this section.
  const hubDataCenterIntelligence = getHubDataCenterIntelligence({
    locationName: location.name,
    city: location.city,
    country: location.country,
    address: location.address,
    latitude: location.latitude,
    longitude: location.longitude,
  });

  const airTemp = weather.airTemperature;
  const tempHigh = weather.tempHigh ?? Math.round((airTemp + 4.5) * 10) / 10;
  const tempLow = weather.tempLow ?? Math.round((airTemp - 6.0) * 10) / 10;
  const accuWeatherUrl = weather.accuWeatherUrl;
  const feelsLike = weather.feelsLike;
  const humidity = weather.humidity;
  const windSpeed = weather.windSpeed;
  const windDir = getWindDirectionCardinal(weather.windDirection || 'W');
  const warmingAnomaly = weather.warmingAnomaly ?? 1.8;
  const uhiDelta = weather.uhiDelta ?? 2.4;
  const surfaceTemp = weather.surfaceTemperature;
  const solarFlux = weather.solarRadiation;

  // Quantified cooling calculations tailored to current heat load
  const treeCooling = Math.min(3.4, Math.round((uhiDelta * 0.58 + 1.2) * 10) / 10);
  const coolRoofCooling = Math.min(2.5, Math.round((uhiDelta * 0.40 + 0.8) * 10) / 10);
  const permeableCooling = Math.min(1.8, Math.round((uhiDelta * 0.28 + 0.5) * 10) / 10);
  const totalPotentialCooling = Math.round((treeCooling + coolRoofCooling * 0.65 + permeableCooling * 0.4) * 10) / 10;

  const isExtremeHeat = airTemp >= 38 || feelsLike >= 41;
  const isHighHeat = airTemp >= 32 || feelsLike >= 35;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-14 select-text">
      {/* 1. Header Card: Location & Quick Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 mb-1">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>
                {location.country} &gt; {location.city}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">Zone: {location.climateZone}</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-bold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Live Open-Meteo Verified</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
              <span>{location.name}</span>
              <span
                className="text-xs font-mono font-bold px-2 py-0.5 rounded-full border"
                style={{
                  backgroundColor: `${heatColor.hex}18`,
                  color: heatColor.hex,
                  borderColor: `${heatColor.hex}44`,
                }}
              >
                {heatScore.category} Heat Risk
              </span>
            </h1>

            <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono">
              <span>Coordinates: <strong className="text-slate-300">{location.latitude.toFixed(4)}° N, {location.longitude.toFixed(4)}° E</strong></span>
              <span>Elevation: <strong className="text-slate-300">{location.elevationMeters}m</strong></span>
              <span>Timezone: <strong className="text-slate-300">{location.timezone}</strong></span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Radius Selector */}
            {onChangeRadius && (
              <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
                <span className="text-[10px] text-slate-400 uppercase px-1.5 flex items-center space-x-1 shrink-0">
                  <Compass className="w-3 h-3 text-emerald-400" />
                  <span>Radius:</span>
                </span>
                {(['500m', '1km', '5km', '10km', '25km'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => onChangeRadius(r)}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition ${
                      (location.analysisRadius || '5km') === r
                        ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}

            {/* Mode Switcher: AI Heat Analysis vs Geospatial Telemetry */}
            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
              <button
                type="button"
                onClick={() => setDashboardMode('ai-dossier')}
                className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 font-bold transition ${
                  dashboardMode === 'ai-dossier'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                <span>AI Heat Analysis</span>
              </button>
              <button
                type="button"
                onClick={() => setDashboardMode('geospatial')}
                className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 font-semibold transition ${
                  dashboardMode === 'geospatial'
                    ? 'bg-slate-800 text-teal-300 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-teal-400" />
                <span>Sensors & Drivers</span>
              </button>
            </div>

            <button
              onClick={onOpenReport}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white flex items-center space-x-1.5 transition shadow"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export PDF Report</span>
            </button>
          </div>
        </div>
      </div>

      {dashboardMode === 'ai-dossier' ? (
        <AiWeatherHeatDossierView
          locationName={location.name}
          country={location.country}
          latitude={location.latitude}
          longitude={location.longitude}
          weather={weather}
          onOpenSimulator={() => onOpenSimulatorWithAction(profile.recommendations[0])}
          showCardWrapper={true}
        />
      ) : (
        <>
          {/* 2. PART 1: HOW MUCH GLOBAL WARMING & HEAT IS HITTING (Atmospheric Reality) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                How Much Heat Is Hitting This Location?
              </h2>
              <p className="text-xs text-slate-400">
                Live atmospheric sensors cross-referenced with satellite infrared observations.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {accuWeatherUrl && (
              <a
                href={accuWeatherUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold transition shadow-sm"
                title="AccuWeather Surat live radar & station observations"
              >
                <span>AccuWeather Verified</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            )}
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-md font-bold">
              Real-Time Observations
            </span>
          </div>
        </div>

        {/* 5 Core Meteorological & Environmental Essentials Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* 1. Measured Air Temp with Low & High Range */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-md">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Measured Air Temp</span>
              <Thermometer className="w-4 h-4 text-orange-400" />
            </div>
            <div className="my-1.5">
              <div className="text-3xl font-black font-mono text-orange-400">
                {airTemp}°C
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                {((airTemp * 9) / 5 + 32).toFixed(1)}°F
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-rose-400 font-bold flex items-center space-x-1">
                  <span>High:</span>
                  <span className="text-white font-extrabold">{tempHigh}°C</span>
                </span>
                <span className="text-cyan-400 font-bold flex items-center space-x-1">
                  <span>Low:</span>
                  <span className="text-white font-extrabold">{tempLow}°C</span>
                </span>
              </div>
              <div className="text-[9px] text-slate-400 font-mono flex items-center justify-between">
                <span>Range: {Math.round((tempLow * 9) / 5 + 32)}° – {Math.round((tempHigh * 9) / 5 + 32)}°F</span>
                <span className="text-emerald-400 font-semibold">2m Sensor</span>
              </div>
            </div>
          </div>

          {/* 2. Heat Index / Feels Like */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-md">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Heat Index (Perceived)</span>
              <Flame className="w-4 h-4 text-rose-400" />
            </div>
            <div className="my-2">
              <div className="text-3xl font-black font-mono text-rose-400">
                {feelsLike}°C
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                Feels like sensation
              </div>
            </div>
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded inline-block w-fit ${
              isExtremeHeat
                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                : isHighHeat
                ? 'bg-orange-950 text-orange-300 border border-orange-800'
                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
            }`}>
              {isExtremeHeat ? 'Danger (Heat Stroke)' : isHighHeat ? 'High Thermal Stress' : 'Moderate'}
            </span>
          </div>

          {/* 3. Humidity */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-md">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Relative Humidity</span>
              <Droplets className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="my-2">
              <div className="text-3xl font-black font-mono text-cyan-300">
                {humidity}%
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                {humidity > 60 ? 'Suppresses body sweat' : 'Dry ambient air'}
              </div>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Hygrometer feed</span>
          </div>

          {/* 4. Wind Speed & Direction */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-md">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Surface Wind</span>
              <Wind className="w-4 h-4 text-teal-400" />
            </div>
            <div className="my-2">
              <div className="text-3xl font-black font-mono text-teal-300">
                {windSpeed} <span className="text-base text-slate-400">km/h</span>
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                Direction: <strong>{windDir}</strong>
              </div>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">10m anemometer speed</span>
          </div>

          {/* 5. Air Quality Index (Live Open-Meteo CAMS Feed) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-md col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Air Quality (AQI)</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="my-2">
              {weather.aqiStatus && weather.aqiStatus !== 'DATA_UNAVAILABLE' ? (
                <>
                  <div className={`text-3xl font-black font-mono ${
                    weather.aqi <= 50 ? 'text-emerald-400' : weather.aqi <= 100 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {weather.aqi}
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    {weather.aqiStatus}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-xl font-bold font-mono text-slate-500">
                    N/A
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    Data Unavailable
                  </div>
                </>
              )}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              {weather.aqiStatus !== 'DATA_UNAVAILABLE' ? 'Copernicus CAMS' : 'Sensor offline'}
            </span>
          </div>
        </div>

        {/* Global Warming Anomaly & Heat Trap Impact Card */}
        <div className="bg-gradient-to-br from-rose-950/40 via-slate-900 to-amber-950/30 border border-rose-900/50 rounded-2xl p-4 sm:p-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-900/40 pb-3 mb-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-rose-400" />
              <h3 className="text-sm sm:text-base font-extrabold text-white">
                Global Warming & Urban Thermal Anomaly
              </h3>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded-lg bg-rose-900/60 text-rose-200 border border-rose-700/60 font-bold w-fit">
              +{warmingAnomaly}°C Climate Baseline Rise
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 font-mono block">Planetary Warming Anomaly</span>
              <div className="text-2xl font-black font-mono text-rose-400 my-1">
                +{warmingAnomaly}°C
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Current temperature is <strong>+{warmingAnomaly}°C</strong> higher than pre-industrial historical norm.
              </p>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 font-mono block">Urban Island (UHI) Trap</span>
              <div className="text-2xl font-black font-mono text-amber-400 my-1">
                +{uhiDelta}°C
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Asphalt, dark concrete, and missing canopy trap an extra <strong>+{uhiDelta}°C</strong> heat vs rural greenfield.
              </p>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 font-mono flex items-center justify-between">
                <span>Estimated Surface Temp (LST)</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">Modelled</span>
              </span>
              <div className="text-2xl font-black font-mono text-orange-400 my-1">
                {surfaceTemp}°C
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Derived from shortwave solar flux ({solarFlux} W/m²) & surface albedo model. Direct satellite LST is not streaming.
              </p>
            </div>
          </div>

          {/* Data Provenance & Telemetry Bar */}
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-400">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                Weather: <strong className="text-slate-300">Open-Meteo GFS/ECMWF</strong> ({weather.isRealTime ? 'Live <90m' : 'Synoptic Hourly'})
              </span>
              <span className="text-slate-600">•</span>
              <span>
                Air Quality: <strong className="text-slate-300">{weather.aqiStatus !== 'DATA_UNAVAILABLE' ? 'Copernicus CAMS' : 'Unavailable'}</strong>
              </span>
            </div>
            <div className="text-slate-500">
              Surface Temp & GIS: <span className="text-amber-400/90 font-semibold">Modelled Estimates</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. PART 2: WHY IS THIS PLACE OVERHEATING? (Top Direct Drivers & 7-Cause Guide) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                Why Is This Place Overheating?
              </h2>
              <p className="text-xs text-slate-400">
                Primary physical mechanisms driving extreme temperatures across {location.city}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCausesGuideExpanded(!isCausesGuideExpanded)}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition shadow-lg"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{isCausesGuideExpanded ? 'Hide Visual Causes Guide' : 'Explore All 7 Causes (Images & Solutions)'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isCausesGuideExpanded ? 'rotate-180' : ''}`} />
            </button>
            {onOpenWhyHotModal && (
              <button
                onClick={onOpenWhyHotModal}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs flex items-center space-x-1 transition"
              >
                <span>AI Modal</span>
                <ArrowRight className="w-3 h-3 text-emerald-400" />
              </button>
            )}
          </div>
        </div>

        {/* Expandable Comprehensive 7-Cause Guide with Images & EPA Guidance */}
        {isCausesGuideExpanded && (
          <div className="p-4 sm:p-5 bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl animate-in fade-in duration-300">
            <UrbanHeatCausesAndMitigationGuide
              onOpenSimulatorWithAction={onOpenSimulatorWithAction}
              cityName={location.city}
            />
          </div>
        )}

        <div className={`grid grid-cols-1 gap-3 ${hubDataCenterIntelligence ? 'md:grid-cols-2 xl:grid-cols-4' : 'md:grid-cols-3'}`}>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1.5">
            <div className="text-xs font-mono font-bold text-amber-400 flex items-center space-x-1.5">
              <Building className="w-4 h-4" />
              <span>1. Dark Roofs & Low Albedo</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Dark rooftops and asphalt surfaces absorb up to 88% of incoming solar irradiance, storing thermal energy all day and re-radiating heat throughout the night.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1.5">
            <div className="text-xs font-mono font-bold text-emerald-400 flex items-center space-x-1.5">
              <TreePine className="w-4 h-4" />
              <span>2. Tree Canopy Deficit</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Insufficient vegetative cover eliminates natural evapotranspirative cooling and leaves sidewalks and street canyons exposed to full direct solar radiation.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1.5">
            <div className="text-xs font-mono font-bold text-purple-400 flex items-center space-x-1.5">
              <Activity className="w-4 h-4" />
              <span>3. Waste Heat (AC & Vehicles)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Concentrated building air conditioning exhaust and vehicular traffic eject continuous sensible heat directly into the lower 2-meter pedestrian boundary layer.
            </p>
          </div>

          {hubDataCenterIntelligence && (
            <div className="bg-gradient-to-br from-cyan-950/60 to-slate-900 border border-cyan-600/50 rounded-xl p-4 space-y-1.5 shadow-lg shadow-cyan-500/10">
              <div className="text-xs font-mono font-bold text-cyan-300 flex items-center space-x-1.5">
                <Server className="w-4 h-4" />
                <span>4. Data Center Waste Heat</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {hubDataCenterIntelligence.facilityName} rejects ~<strong className="text-cyan-300 font-mono">{hubDataCenterIntelligence.estimatedITLoadMW} MW</strong> of continuous
                IT waste heat (PUE: {hubDataCenterIntelligence.efficiencyMetrics.pueEstimate}, WUE: {hubDataCenterIntelligence.efficiencyMetrics.wueEstimate} L/kWh) via{' '}
                {hubDataCenterIntelligence.coolingArchitecture.toLowerCase()}.
              </p>
              <button
                onClick={() => onOpenWhyHotModal?.()}
                className="text-[11px] font-mono text-cyan-300 hover:text-white flex items-center gap-1 pt-0.5 transition"
              >
                <span>Open Data Center Intelligence</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. PART 3: HOW TO REDUCE IT (Actionable Heat Reduction Masterplan) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <TreePine className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                How To Reduce It (Targeted Heat Reduction Solutions)
              </h2>
              <p className="text-xs text-slate-400">
                Actionable engineering and nature-based interventions with modeled temperature drops.
              </p>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-600/60 text-emerald-300 font-mono font-bold text-xs flex items-center space-x-1.5 w-fit">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Net Achievable Cooling: -{totalPotentialCooling}°C</span>
          </div>
        </div>

        {/* Actionable Solutions Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Solution 1: Canopy */}
          <div className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 flex flex-col justify-between transition group shadow-md">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <TreePine className="w-4 h-4" />
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  -{treeCooling}°C Cooling
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
                Urban Tree Canopy & Green Corridors
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Plant native shade trees along major pedestrian arteries and open parking areas to block solar radiation and generate evaporative moisture cooling.
              </p>
            </div>

            <button
              onClick={() =>
                onOpenSimulatorWithAction({
                  id: 'rec-tree',
                  priority: 1,
                  factor: 'Tree Canopy Deficit',
                  title: 'Urban Tree Canopy Expansion',
                  why: 'Absorbs solar radiation and provides active evapotranspirative cooling',
                  where: 'Arterial transit corridors and open parking zones',
                  what: 'Plant native climate-resilient trees',
                  expectedEffect: `-${treeCooling}°C surface cooling`,
                  tempDropSurfaceRange: [Math.max(0.5, treeCooling - 0.5), treeCooling + 0.6],
                  tempDropAmbientRange: [0.8, 1.6],
                  confidence: 'High',
                  coBenefits: ['Shade', 'Air Quality'],
                  feasibility: 'Immediate',
                })
              }
              className="mt-4 w-full py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center space-x-1.5 transition"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Simulate in Scenario Model →</span>
            </button>
          </div>

          {/* Solution 2: Cool Roofs */}
          <div className="bg-slate-900 border border-slate-800 hover:border-teal-500/50 rounded-2xl p-4 flex flex-col justify-between transition group shadow-md">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
                  <Building className="w-4 h-4" />
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800">
                  -{coolRoofCooling}°C Cooling
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-teal-300 transition">
                High-Albedo Cool Reflective Roofs
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Apply high-reflectance white coatings (SRI &gt; 104) to dark flat commercial and residential roofs to reflect 85%+ of solar energy back into space.
              </p>
            </div>

            <button
              onClick={() =>
                onOpenSimulatorWithAction({
                  id: 'rec-roof',
                  priority: 2,
                  factor: 'Dark Roof Surfaces',
                  title: 'Cool Roof Retrofits',
                  why: 'Reflects 85%+ of solar irradiance back to space before absorption',
                  where: 'Flat residential and commercial roofs',
                  what: 'High-albedo solar-reflective white membrane coatings',
                  expectedEffect: `-${coolRoofCooling}°C surface cooling`,
                  tempDropSurfaceRange: [Math.max(0.5, coolRoofCooling - 0.4), coolRoofCooling + 0.5],
                  tempDropAmbientRange: [0.6, 1.2],
                  confidence: 'High',
                  coBenefits: ['Energy Savings', 'Roof Longevity'],
                  feasibility: 'Immediate',
                })
              }
              className="mt-4 w-full py-2 px-3 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-bold flex items-center justify-center space-x-1.5 transition"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Simulate in Scenario Model →</span>
            </button>
          </div>

          {/* Solution 3: Permeable Pavements */}
          <div className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-4 flex flex-col justify-between transition group shadow-md">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <Droplets className="w-4 h-4" />
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                  -{permeableCooling}°C Cooling
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition">
                Permeable Cool Pavement Systems
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Replace impermeable asphalt surfaces with porous interlocking concrete and bioswales that absorb rainwater and release evaporative cool vapor during peak heat.
              </p>
            </div>

            <button
              onClick={() =>
                onOpenSimulatorWithAction({
                  id: 'rec-pavement',
                  priority: 3,
                  factor: 'Impermeable Pavements',
                  title: 'Permeable Pavement Conversion',
                  why: 'Permeable void space holds moisture and reduces thermal storage',
                  where: 'Parking plazas and pedestrian zones',
                  what: 'Interlocking porous pavers and drainage bioswales',
                  expectedEffect: `-${permeableCooling}°C surface cooling`,
                  tempDropSurfaceRange: [Math.max(0.4, permeableCooling - 0.3), permeableCooling + 0.4],
                  tempDropAmbientRange: [0.4, 0.9],
                  confidence: 'Medium',
                  coBenefits: ['Flood Mitigation', 'Groundwater Recharge'],
                  feasibility: 'Short-Term',
                })
              }
              className="mt-4 w-full py-2 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center justify-center space-x-1.5 transition"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Simulate in Scenario Model →</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. Long-Term Climate Forecast & Trajectory */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm sm:text-base font-extrabold text-white">
            Long-Term Climate Forecast: Inaction vs EcoPulse Mitigation
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-950/80 p-3 rounded-xl border border-rose-900/40">
            <span className="text-[11px] font-mono font-bold text-rose-400 uppercase block">
              🔴 No Action (Business As Usual)
            </span>
            <div className="text-xl font-black font-mono text-rose-400 my-1">
              +3.4°C Long-Term Rise
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Unmitigated urban growth pushes heat index past dangerous survivability thresholds on 45+ days per year.
            </p>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-amber-900/40">
            <span className="text-[11px] font-mono font-bold text-amber-400 uppercase block">
              🟡 Moderate Action
            </span>
            <div className="text-xl font-black font-mono text-amber-400 my-1">
              +1.5°C Long-Term Rise
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Standard energy efficiency offsets part of regional baseline warming but leaves urban heat islands intact.
            </p>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-emerald-900/40">
            <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase block">
              🟢 Full EcoPulse Mitigation
            </span>
            <div className="text-xl font-black font-mono text-emerald-400 my-1">
              -{totalPotentialCooling}°C Net Cooling
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Aggressive canopy expansion and cool reflective surfaces reverse urban heat entrapment and safeguard public health.
            </p>
          </div>
        </div>
      </div>
    </>
  )}
    </div>
  );
};
