import React, { useState } from 'react';
import { Recommendation } from '../../types';
import {
  Sparkles,
  TreePine,
  Shield,
  Layers,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  TrendingDown,
  Target,
  Compass,
} from 'lucide-react';

interface RecommendationsCardProps {
  recommendations: Recommendation[];
  onOpenSimulatorWithAction?: (rec: Recommendation) => void;
}

export const RecommendationsCard: React.FC<RecommendationsCardProps> = ({
  recommendations,
  onOpenSimulatorWithAction,
}) => {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Immediate' | 'Short-Term' | 'Strategic Long-Term'>('All');

  const filteredRecs = recommendations.filter((r) => {
    if (activeFilter === 'All') return true;
    return r.feasibility === activeFilter;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
      {/* Header & Principle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span>Heat Reduction Recommendation Engine</span>
          </h3>
          <p className="text-xs text-slate-400">
            Actionable urban interventions structured across Why, Where, What, and Expected Effect.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-medium">
          {(['All', 'Immediate', 'Short-Term', 'Strategic Long-Term'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-2.5 py-1 rounded-md transition ${
                activeFilter === filter
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="space-y-4">
        {filteredRecs.map((rec) => (
          <div
            key={rec.id}
            className="bg-slate-950/80 border border-slate-800/90 hover:border-emerald-500/50 rounded-xl p-4.5 transition-all shadow-md hover:shadow-emerald-500/5"
          >
            {/* Priority Banner */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/70 pb-2.5 mb-3">
              <div className="flex items-center space-x-2.5">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center border border-emerald-500/40">
                  #{rec.priority}
                </span>
                <span className="font-bold text-sm text-slate-100">{rec.title}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {rec.factor}
                </span>
              </div>

              <div className="flex items-center space-x-2 text-xs font-mono">
                <span className="text-slate-400">Feasibility:</span>
                <span className="text-emerald-400 font-semibold">{rec.feasibility}</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">Model Conf:</span>
                <span
                  className={`font-semibold ${
                    rec.confidence === 'High' ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {rec.confidence}
                </span>
              </div>
            </div>

            {/* Structured 4 Pillars: Why? Where? What? Expected Effect */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs mb-3">
              {/* 1. WHY? */}
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/70">
                <div className="flex items-center space-x-1.5 text-rose-400 font-mono font-semibold text-[11px] mb-1">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>1. Why this action?</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">{rec.why}</p>
              </div>

              {/* 2. WHERE? */}
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/70">
                <div className="flex items-center space-x-1.5 text-sky-400 font-mono font-semibold text-[11px] mb-1">
                  <Compass className="w-3.5 h-3.5" />
                  <span>2. Where to deploy?</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">{rec.where}</p>
              </div>

              {/* 3. WHAT? */}
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/70">
                <div className="flex items-center space-x-1.5 text-amber-400 font-mono font-semibold text-[11px] mb-1">
                  <Target className="w-3.5 h-3.5" />
                  <span>3. What intervention?</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">{rec.what}</p>
              </div>

              {/* 4. EXPECTED EFFECT */}
              <div className="bg-emerald-950/20 p-3 rounded-lg border border-emerald-800/40">
                <div className="flex items-center space-x-1.5 text-emerald-400 font-mono font-semibold text-[11px] mb-1">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>4. Expected Effect</span>
                </div>
                <p className="text-emerald-200/90 leading-relaxed text-[11px] mb-1.5">{rec.expectedEffect}</p>
                <div className="text-[10px] font-mono text-emerald-400/80 bg-slate-950/80 px-2 py-1 rounded">
                  Surface: <strong className="text-emerald-300">-{rec.tempDropSurfaceRange[0]}°C to -{rec.tempDropSurfaceRange[1]}°C</strong>
                  <br />
                  Ambient: <strong className="text-emerald-300">-{rec.tempDropAmbientRange[0]}°C to -{rec.tempDropAmbientRange[1]}°C</strong>
                </div>
              </div>
            </div>

            {/* Co-Benefits Tag Strip */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-[11px]">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-slate-400 font-mono text-[10px]">Co-benefits:</span>
                {rec.coBenefits.map((cb, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] border border-slate-700/60"
                  >
                    ✓ {cb}
                  </span>
                ))}
              </div>

              {onOpenSimulatorWithAction && (
                <button
                  onClick={() => onOpenSimulatorWithAction(rec)}
                  className="px-2.5 py-1 rounded text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 flex items-center space-x-1 transition"
                >
                  <span>Simulate in Urban Engine</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
