import React from 'react';
import { X, Sparkles } from 'lucide-react';
import { WeatherObservation } from '../../types';
import { AiWeatherHeatDossierView } from './AiWeatherHeatDossierView';

interface AiWeatherHeatDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationName: string;
  country: string;
  latitude: number;
  longitude: number;
  weather: WeatherObservation;
}

export const AiWeatherHeatDossierModal: React.FC<AiWeatherHeatDossierModalProps> = ({
  isOpen,
  onClose,
  locationName,
  country,
  latitude,
  longitude,
  weather,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Top Header Bar */}
        <div className="p-4 bg-slate-950/95 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/30 to-teal-500/20 text-emerald-400 border border-emerald-500/40">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center space-x-2">
                <span>{locationName} AI Weather & Heat Analysis</span>
                <span className="text-[10px] font-mono uppercase bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Full Dossier
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                {country} ({latitude.toFixed(3)}°N, {longitude.toFixed(3)}°E)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close dossier"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <AiWeatherHeatDossierView
            locationName={locationName}
            country={country}
            latitude={latitude}
            longitude={longitude}
            weather={weather}
            showCardWrapper={false}
          />
        </div>
      </div>
    </div>
  );
};
