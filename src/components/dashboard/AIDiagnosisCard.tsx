import React, { useState } from 'react';
import { AIDiagnosis, HeatLevel } from '../../types';
import {
  Sparkles,
  ShieldCheck,
  Brain,
  SunMedium,
  Building2,
  AlertTriangle,
  FileCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface AIDiagnosisCardProps {
  diagnosis: AIDiagnosis;
  heatLevel: HeatLevel;
  locationName: string;
  airTemp: number;
  surfaceTemp: number;
}

export const AIDiagnosisCard: React.FC<AIDiagnosisCardProps> = ({
  diagnosis,
  heatLevel,
  locationName,
  airTemp,
  surfaceTemp,
}) => {
  const [showEvidence, setShowEvidence] = useState(false);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-xl p-5 shadow-xl relative overflow-hidden">
      {/* Background Accent glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-slate-100">
                AI Environmental Diagnosis: <span className="text-emerald-400">Why is this location hot?</span>
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                Confidence: {diagnosis.confidenceScore}%
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Multi-source causal attribution synthesizing thermal satellite bands, microclimate physics, and urban morphology.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowEvidence(!showEvidence)}
          className="text-xs font-mono text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 flex items-center space-x-1.5 transition self-start sm:self-auto"
        >
          <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>{showEvidence ? 'Hide Datasets' : 'Inspect Evidence'}</span>
          {showEvidence ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Primary Narrative Summary */}
      <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 mb-4 text-sm text-slate-200 leading-relaxed font-sans">
        <p className="mb-2">
          {diagnosis.summary}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-800/70">
          <div className="flex items-start space-x-2 text-xs text-slate-300">
            <SunMedium className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200 block mb-0.5">Natural Climate & Geography:</strong>
              {diagnosis.naturalVsHumanAnalysis}
            </div>
          </div>
          <div className="flex items-start space-x-2 text-xs text-slate-300">
            <Building2 className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200 block mb-0.5">Urban Morphology & Surface Heat:</strong>
              {diagnosis.urbanMorphologyDetails}
            </div>
          </div>
        </div>
      </div>

      {/* Human Health & Thermal Risk Section */}
      <div className="flex items-center space-x-3 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs text-amber-200 mb-3">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <div>
          <span className="font-bold text-amber-300">Thermal Comfort & Vulnerability Risk: </span>
          <span>{diagnosis.thermalRiskAssessment}</span>
        </div>
      </div>

      {/* Collapsible Evidence Datasets Panel */}
      {showEvidence && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 mt-3 space-y-2 text-xs">
          <div className="font-mono text-[11px] text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Validated Datasets & Sensor Sources Used</span>
          </div>
          <ul className="space-y-1">
            {diagnosis.keyDatasets.map((ds, idx) => (
              <li key={idx} className="flex items-center space-x-2 text-slate-300 font-mono text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>{ds}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Transparency & AI Guardrail Disclaimer */}
      <div className="text-[10px] text-slate-500 italic mt-3 pt-2 border-t border-slate-800/80">
        * {diagnosis.disclaimer}
      </div>
    </div>
  );
};
