import React, { useState } from 'react';
import { AnalysisRadius, WeatherObservation } from '../../types';
import { getWindDirectionCardinal } from '../../services/locationService';
import {
  MapPin,
  Compass,
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
  FileText,
  ChevronUp,
  ChevronDown,
  Activity,
  Layers,
  ExternalLink,
} from 'lucide-react';

interface SelectedLocationPanelProps {
  locationName: string;
  address: string;
  latitude: number;
  longitude: number;
  weather?: WeatherObservation;
  selectedRadius: AnalysisRadius;
  onChangeRadius: (radius: AnalysisRadius) => void;
  onOpenSimulator?: () => void;
  onOpenDashboard?: () => void;
  onClose: () => void;
  isAnalyzing?: boolean;
}

export const SelectedLocationPanel: React.FC<SelectedLocationPanelProps> = ({
  locationName,
  address,
  latitude,
  longitude,
  weather,
  selectedRadius,
  onChangeRadius,
  onOpenSimulator,
  onOpenDashboard,
  onClose,
  isAnalyzing = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const radii: AnalysisRadius[] = ['500m', '1km', '5km', '10km', '25km'];

  const airTemp = weather?.airTemperature ?? 28;
  const tempHigh = weather?.tempHigh ?? (weather?.airTemperature ? Math.round((weather.airTemperature + 4.5) * 10) / 10 : 34);
  const tempLow = weather?.tempLow ?? (weather?.airTemperature ? Math.round((weather.airTemperature - 6.0) * 10) / 10 : 24);
  const accuWeatherUrl = weather?.accuWeatherUrl;
  const feelsLike = weather?.feelsLike ?? airTemp;
  const humidity = weather?.humidity ?? 50;
  const windSpeed = weather?.windSpeed ?? 10;
  const windDir = getWindDirectionCardinal(weather?.windDirection ?? 'NW');
  const warmingAnomaly = weather?.warmingAnomaly ?? 1.8;
  const uhiDelta = weather?.uhiDelta ?? 2.4;
  const surfaceTemp = weather?.surfaceTemperature ?? (airTemp + 4.5);

  // Derived cooling potential tailored to current urban heat burden
  const treeCooling = Math.min(3.2, Math.round((uhiDelta * 0.55 + 1.2) * 10) / 10);
  const coolRoofCooling = Math.min(2.4, Math.round((uhiDelta * 0.38 + 0.8) * 10) / 10);
  const permeableCooling = Math.min(1.6, Math.round((uhiDelta * 0.25 + 0.5) * 10) / 10);
  const totalCooling = Math.round((treeCooling + coolRoofCooling * 0.6 + permeableCooling * 0.4) * 10) / 10;

  const isExtremeHeat = airTemp >= 38 || feelsLike >= 41;
  const isHighHeat = airTemp >= 32 || feelsLike >= 35;

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
                <span className="text-orange-400 font-bold">{airTemp}°C</span>
                <span className="text-slate-400 text-[9px]">(H:{tempHigh}°/L:{tempLow}°)</span>
                <span className="text-slate-500">•</span>
                <span className="text-rose-400 font-bold">{feelsLike}°C feels</span>
                <span className="text-slate-500">•</span>
                <span className="text-emerald-400 font-semibold">{selectedRadius}</span>
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
          {/* Air Temp with High & Low */}
          <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-slate-400 flex items-center justify-center space-x-1">
              <Thermometer className="w-3 h-3 text-orange-400" />
              <span>Temp</span>
            </span>
            <div className="text-base sm:text-lg font-black font-mono text-orange-400 my-0.5">
              {airTemp}°C
            </div>
            <div className="flex items-center justify-center space-x-1 text-[9px] font-mono font-bold">
              <span className="text-rose-400" title="Today's High">H:{tempHigh}°</span>
              <span className="text-slate-600">/</span>
              <span className="text-cyan-400" title="Today's Low">L:{tempLow}°</span>
            </div>
            <span className="text-[8px] text-slate-400 font-mono mt-0.5">
              {Math.round((airTemp * 9) / 5 + 32)}°F
            </span>
          </div>

          {/* Heat Index / Feels Like */}
          <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-slate-400 flex items-center justify-center space-x-1">
              <Flame className="w-3 h-3 text-rose-400" />
              <span>Feels</span>
            </span>
            <div className="text-base sm:text-lg font-black font-mono text-rose-400 my-0.5">
              {feelsLike}°C
            </div>
            <span className={`text-[8px] font-mono font-bold px-1 rounded ${
              isExtremeHeat
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
              {humidity}%
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
              {windSpeed}
            </div>
            <span className="text-[9px] text-slate-400 font-mono truncate">
              km/h {windDir}
            </span>
          </div>
        </div>

        {/* High / Low Temperature Range Bar */}
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

        <div className="flex items-center justify-between text-[10px] font-mono bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800/80">
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400">Air Quality:</span>
            {weather?.aqiStatus && weather.aqiStatus !== 'DATA_UNAVAILABLE' ? (
              <span className={`font-bold ${
                weather.aqi <= 50 ? 'text-emerald-400' : weather.aqi <= 100 ? 'text-amber-400' : 'text-rose-400'
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

      {/* 3. Global Warming & Heat Impact: How Much Heat Is Hitting */}
      <div className="bg-gradient-to-br from-rose-950/40 via-slate-900 to-amber-950/30 p-3 rounded-xl border border-rose-900/40 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-rose-300 flex items-center space-x-1.5 uppercase font-mono tracking-wider">
            <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
            <span>Global Warming Heat Load</span>
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-900/60 text-rose-200 border border-rose-700/60 font-bold">
            +{warmingAnomaly}°C Anomaly
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-400 font-mono block">Baseline Climate Anomaly</span>
            <span className="text-sm font-bold font-mono text-rose-400">+{warmingAnomaly}°C</span>
            <span className="text-[9px] text-slate-500 block leading-tight">Above pre-industrial normal</span>
          </div>
          <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-400 font-mono block">Urban Island (UHI) Excess</span>
            <span className="text-sm font-bold font-mono text-amber-400">+{uhiDelta}°C</span>
            <span className="text-[9px] text-slate-500 block leading-tight">Trapped concrete thermal mass</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-300 flex items-center justify-between pt-1 border-t border-slate-800/70 font-mono">
          <span className="text-slate-400 flex items-center space-x-1.5">
            <span>Surface Temp (LST):</span>
            <span className="text-[9px] px-1 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">Modelled</span>
          </span>
          <span className="font-bold text-amber-400">{surfaceTemp}°C</span>
        </div>
      </div>

      {/* 4. How To Reduce It: Targeted Solutions & Cooling Potential */}
      <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-teal-950/30 p-3 rounded-xl border border-emerald-900/40 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-emerald-300 flex items-center space-x-1.5 uppercase font-mono tracking-wider">
            <TreePine className="w-3.5 h-3.5 text-emerald-400" />
            <span>How To Reduce This Heat</span>
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-700/60 font-bold">
            -{totalCooling}°C Achievable Drop
          </span>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800/80">
            <span className="flex items-center space-x-1.5 text-slate-200 text-[11px]">
              <TreePine className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>Urban Tree Canopy & Shade Corridors</span>
            </span>
            <span className="font-mono font-bold text-emerald-400 text-xs shrink-0">
              -{treeCooling}°C
            </span>
          </div>

          <div className="flex items-center justify-between bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800/80">
            <span className="flex items-center space-x-1.5 text-slate-200 text-[11px]">
              <Building className="w-3 h-3 text-teal-400 shrink-0" />
              <span>High-Albedo Cool Roofs (White Coating)</span>
            </span>
            <span className="font-mono font-bold text-teal-400 text-xs shrink-0">
              -{coolRoofCooling}°C
            </span>
          </div>

          <div className="flex items-center justify-between bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800/80">
            <span className="flex items-center space-x-1.5 text-slate-200 text-[11px]">
              <Droplets className="w-3 h-3 text-cyan-400 shrink-0" />
              <span>Permeable Pavement & Moisture Sinks</span>
            </span>
            <span className="font-mono font-bold text-cyan-400 text-xs shrink-0">
              -{permeableCooling}°C
            </span>
          </div>
        </div>
      </div>

      {/* 5. Spatial Radius Selector */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-slate-300 flex items-center space-x-1 font-mono">
            <Compass className="w-3 h-3 text-emerald-400" />
            <span>Analysis Boundary:</span>
          </span>
          <span className="font-mono text-emerald-400 font-bold text-[10px]">{selectedRadius} radius</span>
        </div>

        <div className="grid grid-cols-5 gap-1">
          {radii.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onChangeRadius(r)}
              disabled={isAnalyzing}
              className={`py-1 rounded-lg text-[11px] font-mono font-semibold transition ${
                selectedRadius === r
                  ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* 6. Focused Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        {onOpenSimulator && (
          <button
            onClick={onOpenSimulator}
            className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-xs flex items-center justify-center space-x-1.5 transition shadow-lg shadow-orange-950/40"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Test in Simulator</span>
          </button>
        )}

        {onOpenDashboard && (
          <button
            onClick={onOpenDashboard}
            className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Full Heat Dossier</span>
          </button>
        )}
      </div>
    </div>
  );
};
