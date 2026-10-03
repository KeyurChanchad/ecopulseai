import React, { useState } from 'react';
import { FullLocationProfile } from '../../services/locationService';
import { HeatContributorsCard } from './HeatContributorsCard';
import { AIDiagnosisCard } from './AIDiagnosisCard';
import { RecommendationsCard } from './RecommendationsCard';
import { FuturePredictionCard } from './FuturePredictionCard';
import { EnvironmentalDomainsCard } from './EnvironmentalDomainsCard';
import { HeatCausesAndSolutionsAccordion } from './HeatCausesAndSolutionsAccordion';
import { Recommendation, AnalysisRadius } from '../../types';
import {
  MapPin,
  Thermometer,
  Flame,
  Wind,
  Droplets,
  Sun,
  Shield,
  Activity,
  Layers,
  Sparkles,
  ExternalLink,
  Compass,
  Brain,
  Network,
} from 'lucide-react';
import { getHeatCategoryColor } from '../../services/heatModel';

interface LocationDashboardProps {
  profile: FullLocationProfile;
  onOpenSimulatorWithAction: (rec: Recommendation) => void;
  onOpenReport: () => void;
  onOpenWhyHotModal?: () => void;
  onOpenEvidenceGraph?: () => void;
  activeJobId?: string;
  onChangeRadius?: (radius: AnalysisRadius) => void;
}

export const LocationDashboard: React.FC<LocationDashboardProps> = ({
  profile,
  onOpenSimulatorWithAction,
  onOpenReport,
  onOpenWhyHotModal,
  onOpenEvidenceGraph,
  activeJobId,
  onChangeRadius,
}) => {
  const { location, weather, heatScore, contributors, recommendations, diagnosis, projections, domains } = profile;
  const heatColor = getHeatCategoryColor(heatScore.category);

  const [activeTab, setActiveTab] = useState<
    'all' | 'accordion' | 'domains' | 'diagnosis' | 'contributors' | 'recommendations' | 'forecast'
  >('all');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 select-text">
      {/* Location Top Header & Breadcrumb */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>
                {location.country} {location.state ? `> ${location.state}` : ''} &gt; {location.city}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">Zone: {location.climateZone}</span>
              {activeJobId && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 border border-slate-700 text-emerald-400">
                    Job: {activeJobId}
                  </span>
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              {location.name}
            </h1>
            <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>Coordinates: <strong className="font-mono text-slate-300">{location.latitude.toFixed(4)}° N, {location.longitude.toFixed(4)}° E</strong></span>
              <span>Elevation: <strong className="font-mono text-slate-300">{location.elevationMeters}m</strong></span>
              <span>Timezone: <strong className="font-mono text-slate-300">{location.timezone}</strong></span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Analysis Radius Selector (Section 42) */}
            {onChangeRadius && (
              <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
                <span className="text-[10px] text-slate-500 uppercase px-1.5 flex items-center space-x-1">
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

            {/* Section 24: Dedicated "Why is this place hot?" AI Button */}
            {onOpenWhyHotModal && (
              <button
                onClick={onOpenWhyHotModal}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-orange-950/40 transition"
              >
                <Brain className="w-4 h-4" />
                <span>Why is this place hot?</span>
              </button>
            )}

            {/* Section 14: Evidence Knowledge Graph Button */}
            {onOpenEvidenceGraph && (
              <button
                onClick={onOpenEvidenceGraph}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white flex items-center space-x-1.5 transition shadow"
              >
                <Network className="w-3.5 h-3.5 text-orange-400" />
                <span>Evidence Graph</span>
              </button>
            )}

            <button
              onClick={onOpenReport}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white flex items-center space-x-1.5 transition shadow"
            >
              <span>Export Dossier</span>
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          </div>
        </div>

        {/* Primary Environmental Telemetry Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
          {/* 1. EcoPulse Heat Score */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 flex flex-col justify-between">
            <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Heat Score</span>
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: heatColor.hex }}
              />
            </div>
            <div className="my-1">
              <div className="text-2xl font-black font-mono" style={{ color: heatColor.hex }}>
                {heatScore.score}
                <span className="text-xs text-slate-500 font-normal">/100</span>
              </div>
              <span
                className="inline-block text-[10px] font-mono font-bold px-1.5 py-0.2 rounded"
                style={{ backgroundColor: `${heatColor.hex}22`, color: heatColor.hex }}
              >
                {heatScore.category}
              </span>
            </div>
            <span className="text-[9px] text-slate-500 leading-tight">Proprietary analytical index</span>
          </div>

          {/* 2. Measured Air Temp */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 flex flex-col justify-between">
            <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Air Temperature</span>
              <Thermometer className="w-3.5 h-3.5 text-orange-400" />
            </div>
            <div className="my-1">
              <div className="text-2xl font-black font-mono text-orange-400">
                {weather.airTemperature}°C
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {((weather.airTemperature * 9) / 5 + 32).toFixed(1)}°F
              </div>
            </div>
            <span className="text-[9px] text-slate-500">2-meter station sensor</span>
          </div>

          {/* 3. Heat Index (Feels Like) */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 flex flex-col justify-between">
            <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Heat Index</span>
              <Flame className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="my-1">
              <div className="text-2xl font-black font-mono text-rose-400">
                {weather.feelsLike}°C
              </div>
              <div className="text-[10px] text-slate-400 font-mono">Apparent thermal stress</div>
            </div>
            <span className="text-[9px] text-slate-500">Humidity + air temp</span>
          </div>

          {/* 4. Land Surface Temp (LST) */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 flex flex-col justify-between">
            <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Surface (LST)</span>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="my-1">
              <div className="text-2xl font-black font-mono text-amber-400">
                {weather.surfaceTemperature}°C
              </div>
              <div className="text-[10px] text-slate-400 font-mono">Skin infrared radiation</div>
            </div>
            <span className="text-[9px] text-slate-500">Landsat-9 / Sentinel-3</span>
          </div>

          {/* 5. UHI Delta */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 flex flex-col justify-between">
            <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>UHI Island Excess</span>
              <Activity className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="my-1">
              <div className="text-2xl font-black font-mono text-purple-400">
                +{weather.uhiDelta}°C
              </div>
              <div className="text-[10px] text-slate-400 font-mono">vs rural greenfield</div>
            </div>
            <span className="text-[9px] text-slate-500">Urban heat anomaly</span>
          </div>

          {/* 6. Environmental Matrix */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 flex flex-col justify-between">
            <div className="text-[11px] font-mono text-slate-400">Atmosphere</div>
            <div className="space-y-0.5 text-[11px] font-mono mt-1">
              <div className="flex justify-between text-slate-300">
                <span>Humidity:</span> <strong>{weather.humidity}%</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Wind:</span> <strong>{weather.windSpeed} km/h</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Solar:</span> <strong>{weather.solarRadiation} W/m²</strong>
              </div>
            </div>
            <div className="text-[9px] font-mono text-emerald-400 pt-0.5">AQI: {weather.aqi}</div>
          </div>
        </div>

        {/* Analytical Disclaimer Banner */}
        <div className="mt-4 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60 text-[11px] text-slate-400 flex items-center space-x-2">
          <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>
            <strong>Transparency Notice:</strong> The EcoPulse Heat Score is an analytical decision-support estimate combining satellite thermal data, land cover geometry, and weather station feeds. It is not an official meteorological measurement.
          </span>
        </div>
      </div>

      {/* Quick Section Jump Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {(
          [
            { id: 'all', label: 'All Modules' },
            { id: 'accordion', label: '🔥 Causes & Solutions (Accordion)' },
            { id: 'domains', label: 'Environmental Domains (LST, NDVI, Roads)' },
            { id: 'diagnosis', label: 'AI Diagnosis ("Why is it hot?")' },
            { id: 'contributors', label: 'Heat Contributors' },
            { id: 'recommendations', label: 'Mitigation Actions' },
            { id: 'forecast', label: 'Future Projections' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === tab.id
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Primary Highlight: Causes & Solutions Accordion */}
      {(activeTab === 'all' || activeTab === 'accordion') && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <HeatCausesAndSolutionsAccordion
            contributors={contributors}
            recommendations={recommendations}
            geometricMetrics={profile.geometricMetrics}
            onOpenSimulatorWithAction={onOpenSimulatorWithAction}
            defaultExpandedIndex={0}
          />
        </div>
      )}

      {/* 0. Environmental Domains Card (Sections 8-16) */}
      {(activeTab === 'all' || activeTab === 'domains') && domains && (
        <EnvironmentalDomainsCard
          domains={domains}
          weather={weather}
          location={location}
        />
      )}

      {/* 1. AI Diagnosis Card */}
      {(activeTab === 'all' || activeTab === 'diagnosis') && (
        <AIDiagnosisCard
          diagnosis={diagnosis}
          heatLevel={heatScore.category}
          locationName={location.name}
          airTemp={weather.airTemperature}
          surfaceTemp={weather.surfaceTemperature}
        />
      )}

      {/* 2. Heat Contributors Breakdown */}
      {(activeTab === 'all' || activeTab === 'contributors') && (
        <HeatContributorsCard
          contributors={contributors}
          anthropogenicRatio={heatScore.anthropogenicRatio}
          naturalClimateRatio={heatScore.naturalClimateRatio}
        />
      )}

      {/* 3. Heat Reduction Recommendations */}
      {(activeTab === 'all' || activeTab === 'recommendations') && (
        <RecommendationsCard
          recommendations={recommendations}
          onOpenSimulatorWithAction={onOpenSimulatorWithAction}
        />
      )}

      {/* 4. Future Projections & Timeline */}
      {(activeTab === 'all' || activeTab === 'forecast') && (
        <FuturePredictionCard projections={projections} locationName={location.name} />
      )}
    </div>
  );
};
