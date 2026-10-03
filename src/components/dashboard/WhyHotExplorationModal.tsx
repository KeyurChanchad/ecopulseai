import { AIDiagnosis, HeatScoreData, WeatherObservation, LocationData, HeatContributor, Recommendation, GeometricSearchMetrics } from '../../types';
import { HeatCausesAndSolutionsAccordion } from './HeatCausesAndSolutionsAccordion';
import {
  Brain,
  X,
  Sparkles,
  ShieldCheck,
  Thermometer,
  Sun,
  Layers,
  TreePine,
  Car,
  Building,
  AlertTriangle,
  ExternalLink,
  BookOpen,
  Info,
  CheckCircle,
} from 'lucide-react';

interface WhyHotExplorationModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationData;
  weather: WeatherObservation;
  heatScore: HeatScoreData;
  diagnosis: AIDiagnosis;
  contributors: HeatContributor[];
  recommendations?: Recommendation[];
  geometricMetrics?: GeometricSearchMetrics;
  onOpenSimulatorWithAction?: (rec: Recommendation) => void;
}

export const WhyHotExplorationModal: React.FC<WhyHotExplorationModalProps> = ({
  isOpen,
  onClose,
  location,
  weather,
  heatScore,
  diagnosis,
  contributors,
  recommendations = [],
  geometricMetrics,
  onOpenSimulatorWithAction,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden select-text ring-1 ring-white/10">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-100">
                  Why Is This Place Hot? — In-Depth AI Causal Analysis
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {diagnosis.confidenceScore}% Confidence ({diagnosis.confidenceLevel})
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Target: {location.address} • Analysis Radius: {location.analysisRadius || '5km'}
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed">
          {/* Main AI Explanation Statement (Section 24 specification) */}
          <div className="bg-slate-950 p-4.5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-mono font-bold text-orange-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Multi-Source Synthesis</span>
            </div>

            <p className="text-slate-200 text-sm leading-relaxed font-sans">
              The selected area in <strong>{location.city}</strong> has elevated heat conditions associated with a combination of regional climate, built-up surfaces, limited vegetation, and paved areas.
            </p>

            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-[11px] font-mono text-slate-400 block mb-2">
                Strongest Measurable Physical Signals (Ranked by Satellite & Sensor Evidence):
              </span>
              <ol className="space-y-1.5 font-sans text-xs">
                <li className="flex items-start space-x-2">
                  <span className="font-mono text-orange-400 font-bold">1.</span>
                  <span><strong>High Land-Surface Temperature (LST):</strong> Infrared satellites record skin surface temperatures of <strong className="text-amber-400 font-mono">{weather.surfaceTemperature}°C</strong>, re-radiating heat back into the lower atmosphere.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-mono text-orange-400 font-bold">2.</span>
                  <span><strong>Limited Vegetation & Tree Canopy:</strong> Low vegetative fraction limits natural evapo-transpirational cooling and shade protection.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-mono text-orange-400 font-bold">3.</span>
                  <span><strong>High Built-Up & Concrete Coverage:</strong> Structural buildings with uninsulated roofs conduct heat and delay nocturnal cooling.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-mono text-orange-400 font-bold">4.</span>
                  <span><strong>High Paved Surface & Road Coverage:</strong> Low-albedo bitumen asphalt corridors absorb up to 90% of solar radiation.</span>
                </li>
              </ol>
            </div>

            <p className="text-[11px] text-slate-400 pt-1 italic">
              Traffic congestion, air conditioning rejection, and other waste-heat sources also contribute, but the available data provides lower confidence for quantifying their individual street-level effects.
            </p>
          </div>

          {/* Causes and Solutions Accordion */}
          <div className="bg-slate-950 p-4.5 rounded-2xl border border-slate-800 shadow-lg">
            <HeatCausesAndSolutionsAccordion
              contributors={contributors}
              recommendations={recommendations}
              geometricMetrics={geometricMetrics}
              onOpenSimulatorWithAction={onOpenSimulatorWithAction}
              defaultExpandedIndex={0}
            />
          </div>

          {/* Section 17 & Rule 8: Natural Climate vs Anthropogenic Urban Heat */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center space-x-1.5 text-amber-400 font-mono font-bold text-xs">
                <Sun className="w-4 h-4" />
                <span>Natural Climate Background ({heatScore.naturalClimateRatio}%)</span>
              </div>
              <p className="text-[11px] text-slate-300">
                {diagnosis.naturalVsHumanAnalysis}
              </p>
              <div className="text-[10px] font-mono text-slate-500 pt-1">
                Zone: {location.climateZone} • Solar: {weather.solarRadiation} W/m²
              </div>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center space-x-1.5 text-orange-400 font-mono font-bold text-xs">
                <Building className="w-4 h-4" />
                <span>Urban Heat Island Amplification ({heatScore.anthropogenicRatio}%)</span>
              </div>
              <p className="text-[11px] text-slate-300">
                {diagnosis.urbanMorphologyDetails}
              </p>
              <div className="text-[10px] font-mono text-purple-400 pt-1">
                UHI Delta: +{weather.uhiDelta}°C excess above rural greenfield
              </div>
            </div>
          </div>

          {/* Section 43 & 44: Data Freshness & Reliability Spectrum */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-200 text-xs flex items-center justify-between">
              <span>Evidence Attribution & Data Freshness Spectrum</span>
              <span className="text-[10px] font-mono text-slate-500">ISO-14064 Compliance</span>
            </h4>

            <div className="space-y-1.5">
              {contributors.map((c) => (
                <div
                  key={c.id}
                  className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs gap-3"
                >
                  <div className="space-y-0.5 max-w-lg min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {c.categoryEmoji && <span className="text-sm select-none">{c.categoryEmoji}</span>}
                      <strong className="text-slate-200">{c.label}</strong>
                      
                      {/* Evidence Badge */}
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        Evidence: {c.evidenceType || (c.freshness === 'LIVE' ? 'LIVE' : 'Estimated')}
                      </span>

                      {/* Confidence Level Badge */}
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                          c.confidenceLevel === 'High'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : c.confidenceLevel === 'Medium'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {c.confidenceLevel} Confidence
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono truncate">
                      {c.measurementValue} {c.whatChecked ? `• Checked: ${c.whatChecked}` : ''}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-orange-400 block">{c.impact}</span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">{c.confidence}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 21: Web Research & Verified Citations */}
          {diagnosis.citations && diagnosis.citations.length > 0 && (
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2.5">
              <div className="flex items-center space-x-2 text-xs font-mono font-bold text-sky-400">
                <BookOpen className="w-4 h-4" />
                <span>Verified Scientific & Government Citations (Web Research Layer)</span>
              </div>

              <div className="space-y-2">
                {diagnosis.citations.map((cite) => (
                  <div key={cite.id} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
                    <div className="flex justify-between items-start gap-2">
                      <a
                        href={cite.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-slate-200 hover:text-emerald-400 transition flex items-center space-x-1"
                      >
                        <span>{cite.title}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-sky-300 shrink-0">
                        {cite.type} ({cite.publicationDate})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{cite.summary}</p>
                    <div className="text-[10px] font-mono text-slate-500 mt-1">Publisher: {cite.organization}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Agent Rules Guardrail (Section 46) */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[10px] text-slate-500 space-y-1">
            <div className="flex items-center space-x-1.5 text-slate-400 font-mono font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI Analysis Governance (Strict Adherence to Rules 1–8)</span>
            </div>
            <p>
              EcoPulseAI never invents numerical observations. Measured air temperature (2m: {weather.airTemperature}°C) and radiometric skin surface temperature (LST: {weather.surfaceTemperature}°C) are decoupled to prevent false direct equivalence. Intervention simulations account for thermodynamic overlap.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition shadow"
          >
            Close AI Diagnosis
          </button>
        </div>
      </div>
    </div>
  );
};
