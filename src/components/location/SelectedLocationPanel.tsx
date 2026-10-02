import React, { useState } from 'react';
import { AnalysisRadius } from '../../types';
import {
  MapPin,
  Compass,
  Layers,
  Sparkles,
  ArrowRight,
  X,
  Satellite,
  Thermometer,
  TreePine,
  Building,
  Car,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

interface SelectedLocationPanelProps {
  locationName: string;
  address: string;
  latitude: number;
  longitude: number;
  selectedRadius: AnalysisRadius;
  onChangeRadius: (radius: AnalysisRadius) => void;
  onAnalyze: () => void;
  onClose: () => void;
  isAnalyzing?: boolean;
}

export const SelectedLocationPanel: React.FC<SelectedLocationPanelProps> = ({
  locationName,
  address,
  latitude,
  longitude,
  selectedRadius,
  onChangeRadius,
  onAnalyze,
  onClose,
  isAnalyzing = false,
}) => {
  const radii: AnalysisRadius[] = ['500m', '1km', '5km', '10km', '25km'];

  return (
    <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl p-5 shadow-2xl w-full max-w-md select-text transition-all animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
              Selected Location Target
            </span>
            <h3 className="text-base font-bold text-slate-100 truncate max-w-[260px]">
              {locationName}
            </h3>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Address & Coordinates */}
      <div className="space-y-3 mb-4 text-xs">
        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1.5">
          <div className="text-[11px] text-slate-300 font-medium leading-relaxed">
            {address}
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1.5 border-t border-slate-800/80">
            <span>Latitude: <strong className="text-slate-200">{latitude.toFixed(4)}°</strong></span>
            <span>Longitude: <strong className="text-slate-200">{longitude.toFixed(4)}°</strong></span>
          </div>
        </div>

        {/* Section 42: Analysis Radius Selection */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200 flex items-center space-x-1.5">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>Spatial Analysis Radius</span>
            </span>
            <span className="font-mono text-emerald-400 font-bold">{selectedRadius}</span>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {radii.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => onChangeRadius(r)}
                disabled={isAnalyzing}
                className={`py-1.5 rounded-lg text-xs font-mono font-semibold transition ${
                  selectedRadius === r
                    ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 shadow-sm'
                    : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <span className="text-[10px] text-slate-500 block leading-tight">
            Radius controls urban aggregation: 500m (street microclimate) to 25km (regional basin).
          </span>
        </div>
      </div>

      {/* Analysis Stepper / Loading Animation when Analyzing */}
      {isAnalyzing ? (
        <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/40 space-y-2.5 mb-2">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-mono font-bold">
            <span className="flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Multi-Source Data Ingestion...</span>
            </span>
            <span>Live Sync</span>
          </div>

          <div className="space-y-1.5 text-[11px] font-mono text-slate-400">
            <div className="flex items-center space-x-2 text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Weather & Atmospheric Sensors (LIVE)</span>
            </div>
            <div className="flex items-center space-x-2 text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Landsat-9 / Sentinel-3 Thermal LST (Skin Temp)</span>
            </div>
            <div className="flex items-center space-x-2 text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sentinel-2 Vegetation NDVI & Canopy Deficit</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>Road & Building Morphology (OpenStreetMap)</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-500">
              <span className="w-3.5 h-3.5 rounded-full border border-slate-700 flex items-center justify-center text-[9px]">•</span>
              <span>AI Causal Diagnosis & Solutions Synthesis</span>
            </div>
          </div>
        </div>
      ) : (
        /* Action Button */
        <button
          onClick={onAnalyze}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition shadow-lg shadow-emerald-900/30"
        >
          <Sparkles className="w-4 h-4" />
          <span>Analyze This Location</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
