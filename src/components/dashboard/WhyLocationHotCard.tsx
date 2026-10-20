import React, { useState } from 'react';
import { WeatherObservation } from '../../types';
import {
  classifyLocationClimate,
  getTailoredCausalDrivers,
  getTailoredSolutions,
} from '../../services/climateCausalEngine';
import {
  Flame,
  TreePine,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface WhyLocationHotCardProps {
  locationName: string;
  country?: string;
  latitude: number;
  longitude: number;
  weather?: WeatherObservation;
  address?: string;
  initialTab?: 'reasons' | 'solutions';
  className?: string;
}

export const WhyLocationHotCard: React.FC<WhyLocationHotCardProps> = ({
  locationName,
  country = '',
  latitude,
  longitude,
  weather,
  address = '',
  initialTab = 'reasons',
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'reasons' | 'solutions'>(initialTab);
  const [expandedReasonId, setExpandedReasonId] = useState<number | null>(1);

  // Dynamically resolve weather baseline & climate engine profile
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

  const locString = address || country || locationName;
  const climateProfile = classifyLocationClimate(latitude, longitude, locationName, locString, resolvedWeather);
  const causalDrivers = getTailoredCausalDrivers(locationName, locString, latitude, longitude, resolvedWeather);
  const tailoredSolutions = getTailoredSolutions(locationName, locString, latitude, longitude, resolvedWeather);

  return (
    <div className={`bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-xl space-y-3.5 select-text ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm sm:text-base font-extrabold text-white truncate flex items-center gap-1.5">
              <span>Why Is {locationName} Hot?</span>
            </h4>
            <p className="text-xs text-slate-400 truncate mt-0.5">
              Zone: <span className="text-amber-300 font-semibold">{climateProfile.zoneName}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Toggle Tabs */}
      <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800/80">
        <button
          onClick={() => setActiveTab('reasons')}
          className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition ${
            activeTab === 'reasons'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-rose-400" />
          <span>Top Reasons ({causalDrivers.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('solutions')}
          className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition ${
            activeTab === 'solutions'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <TreePine className="w-3.5 h-3.5 text-emerald-400" />
          <span>Proven Solutions ({tailoredSolutions.solutionsTable.length})</span>
        </button>
      </div>

      {/* Tab 1: Heating Reasons */}
      {activeTab === 'reasons' ? (
        <div className="space-y-2.5">
          <p className="text-xs text-slate-300 leading-relaxed">
            Based on local weather, geography, and urban layout, here are the physical reasons heating up {locationName}:
          </p>
          <div className="space-y-2.5">
            {causalDrivers.map((driver) => {
              const isExpanded = expandedReasonId === driver.id;
              return (
                <div
                  key={driver.id}
                  className="bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden transition-all hover:border-slate-700 shadow-sm"
                >
                  <button
                    onClick={() => setExpandedReasonId(isExpanded ? null : driver.id)}
                    className="w-full text-left p-3 flex items-start justify-between gap-2.5"
                  >
                    <div className="flex items-start space-x-2.5 min-w-0">
                      <span className="shrink-0 w-6 h-6 rounded-full bg-rose-950 text-rose-300 border border-rose-800 text-xs font-mono font-bold flex items-center justify-center mt-0.5">
                        {driver.id}
                      </span>
                      <div className="min-w-0">
                        <span className="text-[10px] font-semibold tracking-wider text-rose-400 uppercase font-mono block mb-0.5">
                          {driver.category}
                        </span>
                        <h5 className="text-xs sm:text-sm font-bold text-slate-100 leading-snug">
                          {driver.title}
                        </h5>
                      </div>
                    </div>
                    <div className="shrink-0 text-slate-500 pt-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-emerald-400" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-3 pb-3 pt-0 border-t border-slate-800/80 mt-1 space-y-2.5 text-xs">
                      <p className="text-slate-300 leading-relaxed pt-2">
                        {driver.explanation}
                      </p>
                      <div className="bg-emerald-950/40 border border-emerald-800/50 rounded-xl p-3 space-y-1.5">
                        <div className="flex items-center space-x-1.5 text-emerald-400 font-bold text-xs">
                          <Lightbulb className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Proven Solution:</span>
                        </div>
                        <p className="text-emerald-100/90 text-xs leading-relaxed">
                          {driver.reductionStrategy}
                        </p>
                        <div className="pt-1 flex items-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
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
        /* Tab 2: Proven Solutions */
        <div className="space-y-3">
          {/* Priority Summary */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Priority Actions for {locationName}</span>
            </div>
            <div className="space-y-1.5 text-slate-300">
              <div className="flex items-start space-x-1.5">
                <span className="text-white font-bold shrink-0">🏙️ City-wide air:</span>
                <span className="text-slate-300">{tailoredSolutions.prioritization.cityWideAirTemp.recommendation}</span>
              </div>
              <div className="flex items-start space-x-1.5">
                <span className="text-white font-bold shrink-0">🚶 Street comfort:</span>
                <span className="text-slate-300">{tailoredSolutions.prioritization.streetComfort.recommendation}</span>
              </div>
              <div className="flex items-start space-x-1.5">
                <span className="text-white font-bold shrink-0">🛡️ Long-term:</span>
                <span className="text-slate-300">{tailoredSolutions.prioritization.longTermWarming.recommendation}</span>
              </div>
            </div>
          </div>

          {/* Solutions Cards */}
          <div className="space-y-2.5">
            {tailoredSolutions.solutionsTable.map((sol, idx) => (
              <div
                key={idx}
                className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 sm:p-3.5 space-y-1.5 hover:border-slate-700 transition shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <h5 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
                    <span>{sol.solution}</span>
                  </h5>
                  <span className="self-start sm:self-auto shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                    {sol.estimatedEffect.split(';')[0]}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-6">
                  {sol.whatItMeans}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
