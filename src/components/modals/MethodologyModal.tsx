import React from 'react';
import {
  Info,
  X,
  BookOpen,
  ShieldCheck,
  Compass,
  Database,
  Flame,
  Scale,
  Brain,
} from 'lucide-react';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100">
                Scientific Methodology & Analytical Governance
              </h2>
              <p className="text-xs text-slate-400">
                Foundational environmental principles, mathematical formulations, and data provenance.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-xs leading-relaxed select-text">
          {/* Section 1: Important Scientific Principle */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
              <Scale className="w-4 h-4" />
              <span>Core Scientific Principle: Separating Natural Climate from Human Activity</span>
            </div>
            <p className="text-slate-300">
              EcoPulseAI does <strong className="text-white">not</strong> assume that high temperature equals human pollution or bad urban planning. A desert location like Dubai, Riyadh, or Phoenix naturally experiences intense solar radiation and high temperatures due to latitude and arid geography.
            </p>
            <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800/80 font-mono text-[11px] text-amber-300">
              Total Heat Pressure = Natural Climate Background + Synoptic Weather + Land Characteristics + Urban Heat Island (UHI) + Direct Anthropogenic Waste Heat
            </div>
          </div>

          {/* Section 2: Important Terminology */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>Key Environmental Terminology</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80">
                <strong className="text-slate-200 block mb-1">1. Air Temperature (2-meter):</strong>
                The actual thermodynamic temperature of the atmosphere measured by shielded weather sensors 2 meters above ground.
              </div>

              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80">
                <strong className="text-slate-200 block mb-1">2. Heat Index (Apparent Heat):</strong>
                Calculated via the NOAA Rothfusz regression equation. Determines how hot weather feels to the human body when relative humidity is factored in (slowing sweat evaporation).
              </div>

              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80">
                <strong className="text-slate-200 block mb-1">3. Land Surface Temperature (LST):</strong>
                The radiometric skin temperature of the Earth's surface (asphalt, concrete roofs, bare soil, vegetation) observed via thermal infrared satellite channels (Landsat-9 Band 10 / Sentinel-3 SLSTR). Often 10°C–20°C hotter than air during peak daylight.
              </div>

              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80">
                <strong className="text-slate-200 block mb-1">4. Urban Heat Island (UHI):</strong>
                The temperature differential between heavily built urban corridors and their surrounding non-urban rural baselines, driven by low albedo, reduced vegetation, and thermal inertia.
              </div>
            </div>
          </div>

          {/* Section 3: EcoPulse Heat Score Model */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Brain className="w-4 h-4 text-emerald-400" />
              <span>EcoPulse Heat Score Formulation</span>
            </h3>
            <p className="text-slate-400">
              The EcoPulse Heat Score (0–100) is an analytical composite index designed to communicate relative heat pressure and mitigation urgency:
            </p>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 leading-normal">
              Score = f(Temperature Baseline, LST Radiation, Tree Canopy Deficit, Impervious Built Fraction, Anthropogenic Heat Flux) - Cooling Sinks (Water / Riparian Corridors)
            </div>
            <p className="text-[11px] text-slate-500 italic">
              * The application clearly documents that this is an analytical estimate for decision support, not an official statutory meteorological measurement.
            </p>
          </div>

          {/* Section 4: Data Sources & Provenance */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Database className="w-4 h-4 text-sky-400" />
              <span>Validated Environmental Datasets</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <strong className="text-slate-200 block">Satellite Remote Sensing:</strong>
                Landsat-8/9 TIRS (30m LST), Sentinel-2 MSI (10m NDVI), Sentinel-3 SLSTR
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <strong className="text-slate-200 block">Atmospheric Weather:</strong>
                World Meteorological Organization (WMO), IMD, NOAA GFS, ECMWF ERA5
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <strong className="text-slate-200 block">Built Geometry & GIS:</strong>
                OpenStreetMap Vector Layers, Municipal Building Footprints, High-Res LIDAR
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <strong className="text-slate-200 block">Climate Model Scenarios:</strong>
                CMIP6 Coupled Model Intercomparison (SSP1-2.6, SSP2-4.5, SSP5-8.5)
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
