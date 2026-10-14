import React, { useState } from 'react';
import {
  WeatherObservation,
  NormalizedDailyForecast,
  NormalizedHourlyForecast,
} from '../../types';
import {
  formatTemp,
  formatTempRange,
  formatWind,
  formatUV,
  formatTimeLocal,
} from '../../services/weatherApi';
import {
  Sun,
  Moon,
  Cloud,
  CloudSun,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  CloudSnow,
  CloudFog,
  Wind,
  Droplets,
  Thermometer,
  Flame,
  Activity,
  Compass,
  Sunrise,
  Sunset,
  Umbrella,
  ShieldAlert,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Clock,
  RefreshCw,
} from 'lucide-react';

interface ForecastAndEnvironmentalWidgetProps {
  weather: WeatherObservation;
  locationName: string;
  countryName: string;
  latitude: number;
  longitude: number;
  onOpenCompare?: () => void;
}

export const ForecastAndEnvironmentalWidget: React.FC<ForecastAndEnvironmentalWidgetProps> = ({
  weather,
  locationName,
  countryName,
  latitude,
  longitude,
  onOpenCompare,
}) => {
  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const [activeTab, setActiveTab] = useState<'hourly' | 'daily' | 'airQuality'>('hourly');

  const airTemp = weather.airTemperature;
  const feelsLike = weather.feelsLike;
  const tempHigh = weather.tempHigh;
  const tempLow = weather.tempLow;
  const humidity = weather.humidity;
  const windSpeed = weather.windSpeed;
  const windDir = weather.windDirection;
  const windGusts = weather.windGusts;
  const precipProb = weather.precipitationProbability;
  const uv = formatUV(weather.uvIndex);
  const condition = weather.condition || 'Clear sky';
  const aqi = weather.aqi;
  const aqiStatus = weather.aqiStatus;
  const timezone = weather.timezone || 'UTC';

  const hourly = weather.hourlyForecasts || [];
  const daily = weather.dailyForecasts || [];

  // Weather Icon resolver
  const renderWeatherIcon = (iconName?: string, className = 'w-5 h-5') => {
    switch (iconName) {
      case 'Sun': return <Sun className={`${className} text-amber-400`} />;
      case 'Moon': return <Moon className={`${className} text-cyan-200`} />;
      case 'CloudSun': return <CloudSun className={`${className} text-amber-300`} />;
      case 'Cloud': return <Cloud className={`${className} text-slate-300`} />;
      case 'CloudDrizzle': return <CloudDrizzle className={`${className} text-cyan-400`} />;
      case 'CloudRain':
      case 'CloudRainWind': return <CloudRain className={`${className} text-blue-400`} />;
      case 'CloudLightning': return <CloudLightning className={`${className} text-purple-400`} />;
      case 'CloudSnow': return <CloudSnow className={`${className} text-indigo-200`} />;
      case 'CloudFog': return <CloudFog className={`${className} text-slate-400`} />;
      default: return <Sun className={`${className} text-amber-400`} />;
    }
  };

  const getDayName = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const todayStr = new Date().toISOString().split('T')[0];
      if (dateStr === todayStr) return 'Today';
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6 select-text">
      {/* Top Bar: Title, Local Timezone, Unit Toggle & Comparison Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center space-x-2">
              <span>Live Meteorological Telemetry & Forecasts</span>
            </h2>
            <span className="text-[10px] font-mono uppercase bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
              Verified Data
            </span>
            {weather.isStale && (
              <span className="text-[10px] font-mono uppercase bg-amber-500/15 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-bold">
                Cached Stale
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Local timezone: <strong className="text-slate-300">{timezone}</strong> · Source:{' '}
            <strong className="text-emerald-400">{weather.weatherProvider || 'Open-Meteo GFS/ECMWF'}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {/* Unit Toggle °C / °F */}
          <div className="flex bg-slate-950 p-0.5 rounded-xl border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setUnit('C')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                unit === 'C'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              °C
            </button>
            <button
              onClick={() => setUnit('F')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                unit === 'F'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              °F
            </button>
          </div>

          {/* Side-by-side compare button */}
          {onOpenCompare && (
            <button
              onClick={onOpenCompare}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold font-mono flex items-center space-x-1.5 transition shadow"
              title="Compare Open-Meteo with WeatherAPI.com"
            >
              <Layers className="w-3.5 h-3.5 text-teal-400" />
              <span>Compare Providers</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Weather Card: Human-Readable Natural Presentation */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-5 rounded-2xl border border-slate-800/90 shadow-2xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Left: Big Temperature & Condition */}
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 uppercase tracking-wider">
            <span>{locationName}</span>
            <span>•</span>
            <span>Current</span>
          </div>

          <div className="flex items-baseline space-x-3">
            <span className="text-4xl sm:text-5xl font-black font-mono text-white tracking-tight">
              {formatTemp(airTemp, unit)}
            </span>
            <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
              {renderWeatherIcon(weather.weatherIcon, 'w-7 h-7')}
            </div>
          </div>

          <div className="text-base font-bold text-slate-200 flex items-center space-x-2">
            <span>{condition}</span>
          </div>

          <div className="text-xs font-mono text-slate-400 space-y-0.5">
            <div>
              Feels like <strong className="text-rose-400">{formatTemp(feelsLike, unit)}</strong>
            </div>
            {tempLow !== undefined && tempHigh !== undefined && (
              <div className="text-emerald-400 font-semibold">
                {formatTempRange(tempLow, tempHigh, unit)}
              </div>
            )}
          </div>
        </div>

        {/* Center: Key Consumer Metrics (Wind, Humidity, Rain chance, UV) */}
        <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Wind */}
          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] font-mono text-slate-400 flex items-center space-x-1">
              <Wind className="w-3.5 h-3.5 text-teal-400" />
              <span>Wind</span>
            </span>
            <div className="text-base sm:text-lg font-black font-mono text-teal-300 mt-1">
              {formatWind(windSpeed, windDir)}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {windGusts ? `Gusts ${Math.round(windGusts)} km/h` : '10m Surface'}
            </span>
          </div>

          {/* Humidity */}
          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] font-mono text-slate-400 flex items-center space-x-1">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              <span>Humidity</span>
            </span>
            <div className="text-base sm:text-lg font-black font-mono text-cyan-300 mt-1">
              {humidity !== undefined ? `${humidity}%` : 'N/A'}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {humidity > 60 ? 'Moist / Humid' : 'Dry air'}
            </span>
          </div>

          {/* Rain chance */}
          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] font-mono text-slate-400 flex items-center space-x-1">
              <Umbrella className="w-3.5 h-3.5 text-blue-400" />
              <span>Rain chance</span>
            </span>
            <div className="text-base sm:text-lg font-black font-mono text-blue-300 mt-1">
              {precipProb !== undefined && precipProb !== null ? `${precipProb}%` : '0%'}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {weather.precipitationMm ? `${weather.precipitationMm} mm/h` : 'Precipitation'}
            </span>
          </div>

          {/* UV Index */}
          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[11px] font-mono text-slate-400 flex items-center space-x-1">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>UV index</span>
            </span>
            <div className="text-base sm:text-lg font-black font-mono text-amber-300 mt-1">
              {uv.text}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {uv.category}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs: 24h Hourly Forecast vs 7-Day Forecast vs Air Quality Pollutants */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('hourly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
              activeTab === 'hourly'
                ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            24-Hour Forecast
          </button>
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
              activeTab === 'daily'
                ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            7-Day Forecast
          </button>
          <button
            onClick={() => setActiveTab('airQuality')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
              activeTab === 'airQuality'
                ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Air Quality & Pollutants
          </button>
        </div>

        {/* Tab 1: 24-Hour Hourly Strip */}
        {activeTab === 'hourly' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Hourly Progression ({timezone})</span>
              <span>Scroll horizontally →</span>
            </div>
            {hourly.length > 0 ? (
              <div className="flex space-x-3 overflow-x-auto pb-3 pt-1 no-scrollbar">
                {hourly.slice(0, 24).map((h, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80 min-w-[85px] sm:min-w-[95px] text-center shrink-0 space-y-2 shadow"
                  >
                    <span className="text-[11px] font-mono text-slate-400">
                      {formatTimeLocal(h.timestamp, timezone)}
                    </span>
                    <div>
                      {renderWeatherIcon(h.icon, 'w-5 h-5')}
                    </div>
                    <span className="text-sm font-black font-mono text-white">
                      {formatTemp(h.temperature, unit)}
                    </span>
                    <div className="text-[10px] font-mono text-blue-400 flex items-center space-x-0.5">
                      <Umbrella className="w-2.5 h-2.5" />
                      <span>{h.precipitationProbability ?? 0}%</span>
                    </div>
                    <span className="text-[9px] font-mono text-teal-400">
                      {Math.round(h.windSpeed ?? 0)} km/h
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-950 rounded-xl border border-slate-800">
                Hourly forecast data is compiling from Open-Meteo GFS.
              </div>
            )}
          </div>
        )}

        {/* Tab 2: 7-Day Forecast */}
        {activeTab === 'daily' && (
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {daily.map((d, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between space-y-2 shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {getDayName(d.date)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {d.date}
                      </span>
                    </div>
                    <div>{renderWeatherIcon(d.icon, 'w-5 h-5')}</div>
                  </div>

                  <div className="text-xs text-slate-300 font-semibold truncate">
                    {d.condition}
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-slate-800/80">
                    <span className="text-rose-400 font-bold">
                      H: {formatTemp(d.temperatureMax, unit)}
                    </span>
                    <span className="text-cyan-400 font-bold">
                      L: {formatTemp(d.temperatureMin, unit)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="flex items-center space-x-1 text-blue-400">
                      <Umbrella className="w-3 h-3" />
                      <span>{d.precipitationProbability ?? 0}%</span>
                    </span>
                    {d.sunrise && d.sunset && (
                      <span className="text-amber-400/80 flex items-center space-x-1">
                        <Sunrise className="w-3 h-3" />
                        <span>{formatTimeLocal(d.sunrise, timezone)}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Air Quality & Pollutants */}
        {activeTab === 'airQuality' && (
          <div className="bg-slate-950 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-white">
                    Atmospheric Chemistry & Air Pollution
                  </h3>
                  <span className="text-[10px] font-mono bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                    {weather.aqiScale || 'US AQI (0-500)'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Source: Copernicus Atmosphere Monitoring Service (Copernicus CAMS Model)
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono text-slate-400">Overall:</span>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  aqi <= 50 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                  aqi <= 100 ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                  'bg-rose-950 text-rose-300 border border-rose-800'
                }`}>
                  AQI {aqi} · {aqiStatus}
                </span>
              </div>
            </div>

            {/* Pollutants Grid (µg/m³) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono block">PM2.5 (Fine)</span>
                <div className="text-base font-black font-mono text-white mt-1">
                  {weather.pm25 !== undefined ? `${weather.pm25} µg/m³` : 'N/A'}
                </div>
                <span className="text-[9px] text-slate-500 font-mono">Combustion particles</span>
              </div>

              <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono block">PM10 (Coarse)</span>
                <div className="text-base font-black font-mono text-white mt-1">
                  {weather.pm10 !== undefined ? `${weather.pm10} µg/m³` : 'N/A'}
                </div>
                <span className="text-[9px] text-slate-500 font-mono">Dust & road residue</span>
              </div>

              <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono block">NO₂ (Nitrogen Dioxide)</span>
                <div className="text-base font-black font-mono text-white mt-1">
                  {weather.nitrogenDioxide !== undefined ? `${weather.nitrogenDioxide} µg/m³` : 'N/A'}
                </div>
                <span className="text-[9px] text-slate-500 font-mono">Vehicle emissions</span>
              </div>

              <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono block">O₃ (Ozone)</span>
                <div className="text-base font-black font-mono text-white mt-1">
                  {weather.ozone !== undefined ? `${weather.ozone} µg/m³` : 'N/A'}
                </div>
                <span className="text-[9px] text-slate-500 font-mono">Photochemical smog</span>
              </div>

              <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono block">SO₂ (Sulphur Dioxide)</span>
                <div className="text-base font-black font-mono text-white mt-1">
                  {weather.sulphurDioxide !== undefined ? `${weather.sulphurDioxide} µg/m³` : 'N/A'}
                </div>
                <span className="text-[9px] text-slate-500 font-mono">Industrial refining</span>
              </div>

              <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono block">CO (Carbon Monoxide)</span>
                <div className="text-base font-black font-mono text-white mt-1">
                  {weather.carbonMonoxide !== undefined ? `${weather.carbonMonoxide} µg/m³` : 'N/A'}
                </div>
                <span className="text-[9px] text-slate-500 font-mono">Incomplete burning</span>
              </div>
            </div>

            <div className="p-3 bg-slate-900 rounded-lg text-xs font-mono text-slate-400 border border-slate-800/80 leading-relaxed">
              <strong className="text-slate-200">Provenance & Scientific Disclosure:</strong> Air quality readings are generated by the Copernicus Atmosphere Monitoring Service (CAMS) global atmospheric dispersion model. Pollutant concentrations are in µg/m³. Modelled concentrations may differ from hyper-local curbside sensor monitors during stagnation events.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
