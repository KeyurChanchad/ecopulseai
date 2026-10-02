import React, { useState } from 'react';
import {
  HeatContributor,
} from '../../types';
import {
  AlertCircle,
  HelpCircle,
  Database,
  Sliders,
  CheckCircle2,
  Sparkles,
  ArrowDownCircle,
  Flame,
  Info,
} from 'lucide-react';

interface HeatContributorsCardProps {
  contributors: HeatContributor[];
  anthropogenicRatio: number;
  naturalClimateRatio: number;
}

export const HeatContributorsCard: React.FC<HeatContributorsCardProps> = ({
  contributors,
  anthropogenicRatio,
  naturalClimateRatio,
}) => {
  const [selectedContributor, setSelectedContributor] = useState<HeatContributor | null>(
    contributors[0] || null
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col space-y-5">
      {/* Header & Distinction Principle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <Flame className="w-5 h-5 text-orange-400" />
            <span>Heat Contributors Breakdown</span>
          </h3>
          <p className="text-xs text-slate-400">
            Rigorous attribution separating measured environmental datasets from AI-inferred models.
          </p>
        </div>

        {/* Natural vs Anthropogenic Split Pill */}
        <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono">
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-orange-400"></span>
            <span className="text-slate-300">Human/Built: <strong className="text-orange-400">{anthropogenicRatio}%</strong></span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span className="text-slate-300">Natural Climate: <strong className="text-amber-400">{naturalClimateRatio}%</strong></span>
          </div>
        </div>
      </div>

      {/* Main Contributors Table / List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-2 pb-1 border-b border-slate-800/60 uppercase">
            <span>Factor</span>
            <div className="flex items-center space-x-8">
              <span>Type / Confidence</span>
              <span>Impact</span>
            </div>
          </div>

          {contributors.map((c) => {
            const isSelected = selectedContributor?.id === c.id;
            const isNegative = c.impact === 'Reducing';

            return (
              <div
                key={c.id}
                onClick={() => setSelectedContributor(c)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/90 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-slate-200">{c.label}</span>
                    {/* Measured vs AI-Inferred Badge */}
                    {c.isMeasured ? (
                      <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>Measured</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>AI Estimated</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-[11px] font-mono text-slate-400">
                      Conf: <strong className={c.confidence >= 80 ? 'text-emerald-400' : c.confidence >= 50 ? 'text-amber-400' : 'text-slate-400'}>{c.confidence}%</strong>
                    </span>

                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded font-mono ${
                        isNegative
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                          : c.impact === 'High'
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                          : 'bg-amber-950/80 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {isNegative ? 'Cooling (-)' : c.impact}
                    </span>
                  </div>
                </div>

                {/* Contribution Visual Bar */}
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden flex">
                  {isNegative ? (
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${Math.abs(c.impactPercent) * 4}%` }}
                    />
                  ) : (
                    <div
                      className={`h-full rounded-full ${
                        c.impact === 'High'
                          ? 'bg-gradient-to-r from-orange-500 to-rose-500'
                          : 'bg-gradient-to-r from-amber-500 to-orange-400'
                      }`}
                      style={{ width: `${Math.min(100, c.impactPercent * 3.5)}%` }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Contributor Deep Dive Panel */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          {selectedContributor ? (
            <div className="space-y-4">
              <div className="border-b border-slate-800/80 pb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider">
                    Contributor Diagnostic
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Category: {selectedContributor.category.replace('_', ' ')}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-100">{selectedContributor.factor}</h4>
              </div>

              {/* Underlying Measured Evidence */}
              <div>
                <span className="text-[11px] font-mono text-slate-400 block mb-1 flex items-center space-x-1">
                  <Database className="w-3 h-3 text-slate-400" />
                  <span>Validated Evidence & Sensor Findings:</span>
                </span>
                <p className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/70 leading-relaxed">
                  {selectedContributor.evidence}
                </p>
              </div>

              {/* Data Source Provenance */}
              <div>
                <span className="text-[11px] font-mono text-slate-400 block mb-1">
                  Data Source & Resolution:
                </span>
                <div className="text-xs text-slate-400 bg-slate-900/50 p-2 rounded border border-slate-800/50 flex items-center justify-between">
                  <span className="font-mono text-slate-300">{selectedContributor.dataSource}</span>
                  <span className="font-mono text-emerald-400 shrink-0 ml-2 font-bold">{selectedContributor.confidence}% Conf.</span>
                </div>
              </div>

              {/* Mitigation Strategy */}
              <div>
                <span className="text-[11px] font-mono text-emerald-400 block mb-1 flex items-center space-x-1">
                  <ArrowDownCircle className="w-3 h-3 text-emerald-400" />
                  <span>Mitigation Opportunity:</span>
                </span>
                <p className="text-xs text-emerald-300/90 bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-800/40 leading-relaxed">
                  {selectedContributor.mitigationOpportunity}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              Select a heat contributor from the list to view provenance and mitigation potential.
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-slate-800/70 text-[10px] text-slate-500 flex items-center space-x-1.5">
            <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>
              Factors labeled 'AI Estimated' are calculated from surrogate datasets (traffic/grid loads) when direct street sensor feeds are unavailable.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
