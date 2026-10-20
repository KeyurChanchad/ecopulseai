import React from 'react';
import { FullLocationProfile } from '../../services/locationService';
import { AiWeatherHeatDossierView } from '../dossier/AiWeatherHeatDossierView';
import { Recommendation } from '../../types';
import { MapPin, SlidersHorizontal } from 'lucide-react';
import { getHeatCategoryColor } from '../../services/heatModel';

interface LocationDashboardProps {
  profile: FullLocationProfile;
  onOpenSimulatorWithAction: (rec: Recommendation) => void;
  onOpenWhyHotModal?: () => void;
  onOpenEvidenceGraph?: () => void;
  onOpenAiDossier?: () => void;
  activeJobId?: string;
}

export const LocationDashboard: React.FC<LocationDashboardProps> = ({
  profile,
  onOpenSimulatorWithAction,
}) => {
  const { location, weather, heatScore } = profile;
  const heatColor = getHeatCategoryColor(heatScore.category);

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
                <span>Live Verified</span>
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
              <span>
                Coordinates:{' '}
                <strong className="text-slate-300">
                  {location.latitude.toFixed(4)}° N, {location.longitude.toFixed(4)}° E
                </strong>
              </span>
              <span>
                Elevation: <strong className="text-slate-300">{location.elevationMeters}m</strong>
              </span>
              <span>
                Timezone: <strong className="text-slate-300">{location.timezone}</strong>
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={() => onOpenSimulatorWithAction(profile.recommendations[0])}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-xs flex items-center space-x-2 shadow-lg shadow-orange-950/40 transition"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Open in Simulator</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main AI Weather & Heat Analysis Dossier */}
      <AiWeatherHeatDossierView
        locationName={location.name}
        country={location.country}
        latitude={location.latitude}
        longitude={location.longitude}
        weather={weather}
        onOpenSimulator={() => onOpenSimulatorWithAction(profile.recommendations[0])}
        showCardWrapper={true}
      />
    </div>
  );
};
