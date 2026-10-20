import React, { useState } from 'react';
import { WeatherObservation } from '../../types';
import { getWindDirectionCardinal } from '../../services/locationService';
import {
  classifyLocationClimate,
  getTailoredCausalDrivers,
  getTailoredSolutions,
} from '../../services/climateCausalEngine';
import {
  MapPin,
  Sparkles,
  ArrowRight,
  X,
  Thermometer,
  Flame,
  Droplets,
  Wind,
  TrendingUp,
  ShieldAlert,
  TreePine,
  Building,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  Activity,
  Layers,
  ExternalLink,
  CheckCircle2,
  Lightbulb,
  ShieldCheck,
} from 'lucide-react';

interface SelectedLocationPanelProps {
  locationName: string;
  address: string;
  latitude: number;
  longitude: number;
  weather?: WeatherObservation;
  onOpenSimulator?: () => void;
  onOpenDashboard?: () => void;
  onOpenAiDossier?: () => void;
  onClose: () => void;
  isAnalyzing?: boolean;
}

export const SelectedLocationPanel: React.FC<SelectedLocationPanelProps> = ({
  locationName,
  address,
  latitude,
  longitude,
  weather,
  onOpenSimulator,
  onOpenDashboard,
  onOpenAiDossier,
  onClose,
  isAnalyzing = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'reasons' | 'solutions'>('reasons');
  const [expandedReasonId, setExpandedReasonId] = useState<number | null>(1);

  const isWeatherLoaded = weather && weather.weatherDataType !== 'DATA_UNAVAILABLE' && typeof weather.airTemperature === 'number';
  const airTemp = weather?.airTemperature;
  const tempHigh = weather?.tempHigh;
  const tempLow = weather?.tempLow;
  const accuWeatherUrl = weather?.accuWeatherUrl;
  const feelsLike = weather?.feelsLike ?? airTemp;
  const humidity = weather?.humidity;
  const windSpeed = weather?.windSpeed;
  const windDir = getWindDirectionCardinal(weather?.windDirection ?? 'NW');
  const warmingAnomaly = weather?.warmingAnomaly ?? 1.2;
  const uhiDelta = weather?.uhiDelta ?? 2.0;
  const surfaceTemp = weather?.surfaceTemperature;

  // Derived cooling potential tailored to current urban heat burden
  const treeCooling = Math.min(3.2, Math.round((uhiDelta * 0.55 + 1.2) * 10) / 10);
  const coolRoofCooling = Math.min(2.4, Math.round((uhiDelta * 0.38 + 0.8) * 10) / 10);
  const permeableCooling = Math.min(1.6, Math.round((uhiDelta * 0.25 + 0.5) * 10) / 10);
  const totalCooling = Math.round((treeCooling + coolRoofCooling * 0.6 + permeableCooling * 0.4) * 10) / 10;

  const isExtremeHeat = (airTemp ?? 0) >= 38 || (feelsLike ?? 0) >= 41;
  const isHighHeat = (airTemp ?? 0) >= 32 || (feelsLike ?? 0) >= 35;

  if (isCollapsed) {
    return (
      <div className="bg-slate-950/98 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-2.5 sm:p-3 shadow-2xl w-full max-w-md ring-1 ring-white/10 animate-in fade-in duration-150">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-white truncate">{locationName}</h4>
              <div className="flex items-center space-x-1.5 text-[10px] font-mono">
                {isWeatherLoaded ? (
                  <>
                    <span className="text-orange-400 font-bold">{airTemp}°C</span>
                    {tempHigh !== undefined && tempLow !== undefined && (
                      <span className="text-slate-400 text-[9px]">(H:{tempHigh}°/L:{tempLow}°)</span>
                    )}
                    <span className="text-slate-500">•</span>
                    <span className="text-rose-400 font-bold">{feelsLike}°C feels</span>
                  </>
                ) : (
                  <span className="text-slate-400">Loading live weather...</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1 shrink-0">
            {onOpenSimulator && (
              <button
                onClick={onOpenSimulator}
                className="px-2 py-1 rounded-lg bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-[11px] flex items-center space-x-1 transition shadow-sm"
                title="Test Heat Reduction Levers"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Reduce</span>
              </button>
            )}
            <button
              onClick={() => setIsCollapsed(false)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Expand Details"
            >
              <ChevronDown className="w-4 h-4 text-emerald-400" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Close Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Dynamically resolve climate profile, place-specific causes and solutions
  const resolvedWeather: WeatherObservation =
    weather && typeof weather.airTemperature === 'number'
      ? weather
      : ({
          airTemperature: 28,
          feelsLike: 29,
          surfaceTemperature: 33,
          humidity: 50,
          windSpeed: 12,
          windDirection: 'NW',
          solarRadiation: 650,
          uvIndex: 7,
          cloudCover: 15,
          pressureHpa: 1013,
          uhiDelta: 2.1,
          aqi: 45,
          aqiStatus: 'Good',
          timestamp: new Date().toISOString(),
        } as WeatherObservation);

  const climateProfile = classifyLocationClimate(latitude, longitude, locationName, address, resolvedWeather);
  const causalDrivers = getTailoredCausalDrivers(locationName, address, latitude, longitude, resolvedWeather);
  const tailoredSolutions = getTailoredSolutions(locationName, address, latitude, longitude, resolvedWeather);

  return (
    <div className="bg-slate-950/98 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-3.5 sm:p-4 shadow-2xl w-full max-w-md select-text transition-all animate-in fade-in zoom-in-95 duration-200 ring-1 ring-white/10 max-h-[82vh] overflow-y-auto no-scrollbar space-y-3.5">
      {/* 1. Header: Location & Live Status */}
      <div className="flex items-start justify-between border-b border-slate-800/90 pb-2.5">
        <div className="flex items-start space-x-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 shrink-0 mt-0.5">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                Live Heat Surveillance
              </span>
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-white truncate leading-tight mt-0.5">
              {locationName}
            </h3>
            <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
              {latitude.toFixed(2)}°N, {longitude.toFixed(2)}°E • {address}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1 shrink-0 ml-1">
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Collapse / Minimize to map"
          >
            <ChevronUp className="w-4 h-4 text-emerald-400" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Close Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Measured Live Weather: 4 Key Parameters */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] flex items-center space-x-1.5">
            <span>Atmospheric Reality</span>
            {weather?.weatherProvider && (
              <span className="text-[9px] text-emerald-400 font-semibold normal-case">
                ({weather.weatherProvider})
              </span>
            )}
          </span>
          {accuWeatherUrl ? (
            <a
              href={accuWeatherUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] text-amber-400 hover:text-amber-300 font-bold underline flex items-center space-x-0.5 transition"
              title="View live radar & station observations on AccuWeather"
            >
              <span>AccuWeather Verified</span>
              <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
            </a>
          ) : (
            <span className="text-[9px] text-emerald-400 font-medium">ECMWF / GFS Live</span>
          )}
        </div>

        <div className="grid grid-cols-4 gap-1.5 text-center">
          {/* Air Temp */}
          <div
            className="bg-slate-900/90 p-2 rounded-xl border border-slate-800 flex flex-col justify-between"
            title={`Air Temperature: ${airTemp !== undefined ? `${airTemp}°C` : 'Loading'} (High: ${tempHigh ?? 'N/A'}°C, Low: ${tempLow ?? 'N/A'}°C)`}
          >
            <span className="text-[10px] font-mono text-slate-400 flex items-center justify-center space-x-1">
              <Thermometer className="w-3 h-3 text-orange-400" />
              <span>Temp</span>
            </span>
            <div className="text-base sm:text-lg font-black font-mono text-orange-400 my-0.5">
              {airTemp !== undefined ? `${airTemp}°C` : '--'}
            </div>
            <span className="text-[9px] text-slate-400 font-mono">
              {airTemp !== undefined ? `${Math.round((airTemp * 9) / 5 + 32)}°F` : '--'}
            </span>
          </div>

          {/* Heat Index / Feels Like */}
          <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-slate-400 flex items-center justify-center space-x-1">
              <Flame className="w-3 h-3 text-rose-400" />
              <span>Feels</span>
            </span>
            <div className="text-base sm:text-lg font-black font-mono text-rose-400 my-0.5">
              {feelsLike !== undefined ? `${feelsLike}°C` : '--'}
            </div>
            <span className={`text-[8px] font-mono font-bold px-1 rounded ${isExtremeHeat
                ? 'bg-rose-950 text-rose-300'
                : isHighHeat
                  ? 'bg-orange-950 text-orange-300'
                  : 'bg-emerald-950 text-emerald-300'
              }`}>
              {isExtremeHeat ? 'Dangerous' : isHighHeat ? 'High Stress' : 'Moderate'}
            </span>
          </div>

          {/* Humidity */}
          <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-slate-400 flex items-center justify-center space-x-1">
              <Droplets className="w-3 h-3 text-cyan-400" />
              <span>Humidity</span>
            </span>
            <div className="text-base sm:text-lg font-black font-mono text-cyan-300 my-0.5">
              {humidity !== undefined ? `${humidity}%` : '--'}
            </div>
            <span className="text-[9px] text-slate-400 font-mono">Relative</span>
          </div>

          {/* Wind */}
          <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-slate-400 flex items-center justify-center space-x-1">
              <Wind className="w-3 h-3 text-teal-400" />
              <span>Wind</span>
            </span>
            <div className="text-base sm:text-lg font-black font-mono text-teal-300 my-0.5">
              {windSpeed !== undefined ? windSpeed : '--'}
            </div>
            <span className="text-[9px] text-slate-400 font-mono truncate">
              {windSpeed !== undefined ? `km/h ${windDir}` : '--'}
            </span>
          </div>
        </div>

        {/* High / Low Temperature Range Bar */}
        {tempLow !== undefined && tempHigh !== undefined ? (
          <div className="bg-slate-900/90 px-2.5 py-1.5 rounded-xl border border-slate-800/80 flex items-center justify-between text-[11px] font-mono shadow-sm">
            <div className="flex items-center space-x-1">
              <span className="text-cyan-400 font-bold">Low:</span>
              <span className="text-white font-extrabold">{tempLow}°C</span>
              <span className="text-slate-500 text-[9px]">({Math.round((tempLow * 9) / 5 + 32)}°F)</span>
            </div>
            <div className="flex-1 mx-2.5 flex items-center">
              <div className="w-full bg-slate-800 h-1.5 rounded-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-amber-400 to-rose-500 rounded-full" />
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-rose-400 font-bold">High:</span>
              <span className="text-white font-extrabold">{tempHigh}°C</span>
              <span className="text-slate-500 text-[9px]">({Math.round((tempHigh * 9) / 5 + 32)}°F)</span>
            </div>
          </div>
        ) : null}

        <div className="flex items-center justify-between text-[10px] font-mono bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800/80">
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400">Air Quality:</span>
            {weather?.aqiStatus && weather.aqiStatus !== 'DATA_UNAVAILABLE' ? (
              <span className={`font-bold ${weather.aqi <= 50 ? 'text-emerald-400' : weather.aqi <= 100 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                {weather.aqi} US AQI ({weather.aqiStatus})
              </span>
            ) : (
              <span className="text-slate-500 italic">Unavailable</span>
            )}
          </div>
          <span className="text-slate-500 text-[9px]">{weather?.isRealTime ? 'Live Observation' : 'Synoptic Feed'}</span>
        </div>
      </div>

      {/* Dynamic Heating Reasons & Solutions Card */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-3 shadow-lg space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30 shrink-0">
              <Flame className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                <span>Why Is {locationName} Hot?</span>
              </h4>
              <p className="text-[10px] text-slate-400 truncate">
                Zone: <span className="text-amber-300 font-semibold">{climateProfile.zoneName}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Toggle Tabs */}
        <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setActiveSubTab('reasons')}
            className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center space-x-1.5 transition ${
              activeSubTab === 'reasons'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Flame className="w-3 h-3 text-rose-400" />
            <span>Top Reasons ({causalDrivers.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('solutions')}
            className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center space-x-1.5 transition ${
              activeSubTab === 'solutions'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <TreePine className="w-3 h-3 text-emerald-400" />
            <span>Proven Solutions ({tailoredSolutions.solutionsTable.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeSubTab === 'reasons' ? (
          <div className="space-y-2">
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Based on local weather, geography, and urban layout, here are the physical reasons heating up {locationName}:
            </p>
            <div className="space-y-2">
              {causalDrivers.map((driver) => {
                const isExpanded = expandedReasonId === driver.id;
                return (
                  <div
                    key={driver.id}
                    className="bg-slate-950/70 border border-slate-800 rounded-xl overflow-hidden transition-all hover:border-slate-700"
                  >
                    <button
                      onClick={() => setExpandedReasonId(isExpanded ? null : driver.id)}
                      className="w-full text-left p-2.5 flex items-start justify-between gap-2"
                    >
                      <div className="flex items-start space-x-2 min-w-0">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-mono font-bold flex items-center justify-center mt-0.5">
                          {driver.id}
                        </span>
                        <div className="min-w-0">
                          <span className="text-[9px] font-semibold tracking-wider text-rose-400 uppercase font-mono block">
                            {driver.category}
                          </span>
                          <h5 className="text-[11px] font-bold text-slate-100 leading-snug">
                            {driver.title}
                          </h5>
                        </div>
                      </div>
                      <div className="shrink-0 text-slate-500 pt-1">
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-2.5 pb-2.5 pt-0 border-t border-slate-800/80 mt-1 space-y-2 text-[10px]">
                        <p className="text-slate-300 leading-relaxed pt-1.5">
                          {driver.explanation}
                        </p>
                        <div className="bg-emerald-950/40 border border-emerald-800/50 rounded-lg p-2 space-y-1">
                          <div className="flex items-center space-x-1 text-emerald-400 font-bold text-[10px]">
                            <Lightbulb className="w-3 h-3 text-emerald-300" />
                            <span>Proven Solution:</span>
                          </div>
                          <p className="text-emerald-100/90 text-[10px] leading-relaxed">
                            {driver.reductionStrategy}
                          </p>
                          <div className="pt-1 flex items-center">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              📉 {driver.quantifiedImpactC}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {/* Priority Summary */}
            <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-2.5 space-y-1.5 text-[10px]">
              <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Priority Actions for {locationName}</span>
              </div>
              <div className="space-y-1 text-slate-300">
                <div>
                  <span className="text-white font-bold">🏙️ City-wide air: </span>
                  <span className="text-slate-300">{tailoredSolutions.prioritization.cityWideAirTemp.recommendation}</span>
                </div>
                <div>
                  <span className="text-white font-bold">🚶 Street comfort: </span>
                  <span className="text-slate-300">{tailoredSolutions.prioritization.streetComfort.recommendation}</span>
                </div>
                <div>
                  <span className="text-white font-bold">🛡️ Long-term: </span>
                  <span className="text-slate-300">{tailoredSolutions.prioritization.longTermWarming.recommendation}</span>
                </div>
              </div>
            </div>

            {/* Solutions List */}
            <div className="space-y-2">
              {tailoredSolutions.solutionsTable.map((sol, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-2.5 space-y-1.5 hover:border-slate-700 transition"
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <h5 className="text-[11px] font-bold text-slate-100 flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{sol.solution}</span>
                    </h5>
                    <span className="shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                      {sol.estimatedEffect.split(';')[0]}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-relaxed pl-5">
                    {sol.whatItMeans}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        {onOpenDashboard && (
          <button
            onClick={onOpenDashboard}
            className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center justify-center space-x-1.5 transition shadow-lg shadow-emerald-950/50 border border-emerald-400/30"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-emerald-200" />
            <span>AI Heat Analysis</span>
          </button>
        )}

        {onOpenSimulator && (
          <button
            onClick={onOpenSimulator}
            className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-xs flex items-center justify-center space-x-1.5 transition shadow-lg shadow-orange-950/40"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Test in Simulator</span>
          </button>
        )}
      </div>
    </div>
  );
};
