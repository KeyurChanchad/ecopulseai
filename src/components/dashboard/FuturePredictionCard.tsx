import React, { useState } from 'react';
import { FutureProjections, ShortTermForecastItem } from '../../types';
import {
  Calendar,
  CloudSun,
  TrendingUp,
  Compass,
  Clock,
  ShieldAlert,
  ArrowUpRight,
  Flame,
} from 'lucide-react';

interface FuturePredictionCardProps {
  projections: FutureProjections;
  locationName: string;
}

export const FuturePredictionCard: React.FC<FuturePredictionCardProps> = ({
  projections,
  locationName,
}) => {
  const [activeTab, setActiveTab] = useState<'short' | 'seasonal' | 'climate'>('short');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-5">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-teal-400" />
            <span>Future Heat Projections & Climate Timeline</span>
          </h3>
          <p className="text-xs text-slate-400">
            Scientifically decoupled multi-horizon forecast: short-term weather, 3-month seasonal outlook, and IPCC CMIP6 scenarios.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-medium">
          <button
            onClick={() => setActiveTab('short')}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === 'short'
                ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            7-Day Weather
          </button>
          <button
            onClick={() => setActiveTab('seasonal')}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === 'seasonal'
                ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            3-Month Seasonal
          </button>
          <button
            onClick={() => setActiveTab('climate')}
            className={`px-3 py-1.5 rounded-md transition ${
              activeTab === 'climate'
                ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            CMIP6 Long-Term
          </button>
        </div>
      </div>

      {/* Heat Timeline Bars (Section 12 requirement: TODAY, 3 MONTHS, 6 MONTHS, 1 YEAR) */}
      <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
            <Flame className="w-4 h-4 text-orange-400" />
            <span>Projected Heat Risk Progression (12-Month Horizon)</span>
          </span>
          <span className="text-[11px] font-mono text-slate-400">Model: EcoPulse Climatology V2</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {projections.timeline.map((point) => (
            <div key={point.period} className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-mono font-bold text-slate-200">{point.period}</span>
                <span className="text-orange-400 font-mono font-semibold">{point.metricLabel}</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden mb-1">
                <div
                  className={`h-full rounded-full ${
                    point.riskScore >= 88
                      ? 'bg-gradient-to-r from-orange-500 to-purple-600'
                      : point.riskScore >= 75
                      ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                      : 'bg-gradient-to-r from-emerald-500 to-amber-500'
                  }`}
                  style={{ width: `${point.fillPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 block">{point.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tab 1: Short Term 7-Day Forecast */}
      {activeTab === 'short' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Synchronized with meteorological station network (IMD / WMO / NOAA)</span>
            <span className="font-mono">Hourly Re-analysis</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {projections.shortTerm.map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex flex-col justify-between text-center transition ${
                  idx === 0
                    ? 'bg-slate-800/90 border-teal-500/50 shadow-md shadow-teal-500/10'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-slate-200">{item.day}</div>
                  <div className="text-[10px] text-slate-400 font-mono mb-2">{item.date}</div>
                  <CloudSun className="w-5 h-5 mx-auto text-amber-400 mb-2" />
                  <div className="text-sm font-mono font-bold text-orange-400">{item.tempMax}°C</div>
                  <div className="text-[10px] font-mono text-slate-400">Min: {item.tempMin}°C</div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800/70">
                  <div className="text-[10px] text-slate-400">Feels Like</div>
                  <div className="text-xs font-mono font-bold text-rose-400">{item.heatIndex}°C</div>
                  <span
                    className={`mt-1 inline-block text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                      item.heatRisk === 'Very High' || item.heatRisk === 'Extreme'
                        ? 'bg-rose-950 text-rose-300'
                        : item.heatRisk === 'High'
                        ? 'bg-orange-950 text-orange-300'
                        : 'bg-amber-950 text-amber-300'
                    }`}
                  >
                    {item.heatRisk}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Seasonal Outlook (Next 3 Months) */}
      {activeTab === 'seasonal' && (
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4.5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <div>
              <h4 className="text-sm font-bold text-slate-200">
                Seasonal Climatology Outlook: {projections.seasonalOutlook.period}
              </h4>
              <p className="text-xs text-slate-400">{projections.seasonalOutlook.baselineClimatology}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-slate-400">ENSO:</span>
              <span className="text-xs font-mono text-teal-400 font-bold bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800">
                {projections.seasonalOutlook.ensoStatus}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 block mb-1">Temperature Anomaly:</span>
              <div className="text-xl font-mono font-bold text-orange-400 flex items-center space-x-1">
                <span>+{projections.seasonalOutlook.temperatureAnomaly}°C</span>
                <span className="text-xs text-slate-400 font-normal">above normal</span>
              </div>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 block mb-1">Ensemble Confidence:</span>
              <div className="text-base font-mono font-bold text-emerald-400">
                {projections.seasonalOutlook.confidence}
              </div>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 block mb-1">Climatological Source:</span>
              <div className="text-xs font-mono text-slate-300">Copernicus C3S Multimodel</div>
            </div>
          </div>

          <div className="text-xs text-slate-300 bg-slate-900/40 p-3 rounded-lg border border-slate-800/60 leading-relaxed">
            <strong className="text-slate-200 block mb-1">Seasonal Anomaly Analysis:</strong>
            {projections.seasonalOutlook.narrative}
          </div>
        </div>
      )}

      {/* Tab 3: Long-Term Climate Projections (CMIP6) */}
      {activeTab === 'climate' && (
        <div className="space-y-3">
          <div className="text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <strong>Scientific Principle:</strong> Multi-decadal projections leverage CMIP6 (Coupled Model Intercomparison Project Phase 6) downscaled global climate simulations for urban grid cells, rather than simple weather extrapolation.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {projections.climateProjections.map((cp) => (
              <div
                key={cp.scenarioCode}
                className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                        cp.scenarioCode === 'SSP1-2.6'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : cp.scenarioCode === 'SSP2-4.5'
                          ? 'bg-amber-950 text-amber-400 border-amber-800'
                          : 'bg-rose-950 text-rose-400 border-rose-800'
                      }`}
                    >
                      {cp.scenarioCode}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{cp.horizonYear} Horizon</span>
                  </div>

                  <h5 className="text-sm font-bold text-slate-200 mb-2">{cp.scenario}</h5>
                  <p className="text-xs text-slate-400 mb-3 leading-relaxed">{cp.description}</p>
                </div>

                <div className="space-y-1.5 pt-3 border-t border-slate-800/80 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mean Temp Rise:</span>
                    <strong className="text-orange-400">+{cp.warmingDeltaC}°C</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Extra Heatwave Days:</span>
                    <strong className="text-rose-400">+{cp.heatwaveDaysDelta} days/yr</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cooling Degree Days:</span>
                    <strong className="text-amber-400">+{cp.coolingDegreeDaysDelta} CDD</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
