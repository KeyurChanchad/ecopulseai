import React, { useState } from 'react';
import { HeatContributor, Recommendation, GeometricSearchMetrics } from '../../types';
import {
  ChevronDown,
  Flame,
  Sparkles,
  SlidersHorizontal,
  ArrowRight,
  Sun,
  Building,
  Car,
  TreePine,
  Search,
  CheckCircle2,
  Cpu,
  Compass,
  Box,
  Zap,
  Eye,
  Maximize2,
} from 'lucide-react';

interface HeatCausesAndSolutionsAccordionProps {
  contributors: HeatContributor[];
  recommendations: Recommendation[];
  geometricMetrics?: GeometricSearchMetrics;
  onOpenSimulatorWithAction?: (rec: Recommendation) => void;
  defaultExpandedIndex?: number;
}

export const HeatCausesAndSolutionsAccordion: React.FC<HeatCausesAndSolutionsAccordionProps> = ({
  contributors,
  recommendations,
  geometricMetrics,
  onOpenSimulatorWithAction,
  defaultExpandedIndex = 0,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(defaultExpandedIndex);

  const toggleAccordion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  // Helper to match a contributor with the most appropriate recommendation
  const getPairedRecommendation = (contributor: HeatContributor, index: number): Recommendation | undefined => {
    if (contributor.pairedSolution) {
      return {
        id: `rec-paired-${contributor.id}`,
        priority: index + 1,
        factor: contributor.factor,
        title: contributor.pairedSolution.title,
        why: contributor.evidence,
        where: 'High exposure zones within analysis perimeter',
        what: contributor.pairedSolution.action,
        expectedEffect: contributor.pairedSolution.expectedEffect,
        tempDropSurfaceRange: contributor.pairedSolution.tempDropSurfaceRange,
        tempDropAmbientRange: contributor.pairedSolution.tempDropAmbientRange,
        confidence: contributor.confidenceLevel,
        coBenefits: contributor.pairedSolution.coBenefits || ['Thermal comfort enhancement', 'Localized cooling'],
        feasibility: contributor.pairedSolution.feasibility || 'Immediate',
        costCategory: contributor.pairedSolution.costCategory || 'Medium',
      };
    }

    const factorLower = contributor.factor.toLowerCase();
    const labelLower = contributor.label.toLowerCase();

    const match = recommendations.find((r) => {
      const rFactor = r.factor.toLowerCase();
      const rTitle = r.title.toLowerCase();
      return (
        rFactor.includes(factorLower) ||
        factorLower.includes(rFactor) ||
        rTitle.includes(factorLower) ||
        labelLower.includes(rFactor)
      );
    });

    if (match) return match;
    return recommendations[index % recommendations.length];
  };

  const getEvidenceBadge = (evidenceType?: string) => {
    const type = evidenceType || 'LIVE';
    switch (type) {
      case 'LIVE':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700/80 flex items-center space-x-1 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>LIVE</span>
          </span>
        );
      case 'Satellite':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-sky-950/80 text-sky-300 border border-sky-700/80 flex items-center space-x-1 shrink-0">
            <span>🛰️</span>
            <span>Satellite</span>
          </span>
        );
      case 'GIS':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-700/80 flex items-center space-x-1 shrink-0">
            <span>🗺️</span>
            <span>GIS</span>
          </span>
        );
      case 'Traffic data':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-amber-950/80 text-amber-300 border border-amber-700/80 flex items-center space-x-1 shrink-0">
            <span>🚗</span>
            <span>Traffic data</span>
          </span>
        );
      case 'GIS + Web':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-purple-950/80 text-purple-300 border border-purple-700/80 flex items-center space-x-1 shrink-0">
            <span>🌐</span>
            <span>GIS + Web</span>
          </span>
        );
      case 'Satellite + LIVE':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-teal-950/80 text-teal-300 border border-teal-700/80 flex items-center space-x-1 shrink-0">
            <span>📡</span>
            <span>Satellite + LIVE</span>
          </span>
        );
      case 'Estimated':
      default:
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-slate-800 text-slate-300 border border-slate-700 flex items-center space-x-1 shrink-0">
            <span>📐</span>
            <span>Estimated</span>
          </span>
        );
    }
  };

  const getConfidenceBadge = (level: string) => {
    switch (level) {
      case 'High':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            High Confidence
          </span>
        );
      case 'Medium':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            Medium Confidence
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-slate-800 text-slate-400 border border-slate-700">
            Low Confidence
          </span>
        );
    }
  };

  const getCategoryIcon = (category: string, emoji?: string) => {
    if (emoji) {
      return <span className="text-base leading-none select-none">{emoji}</span>;
    }
    switch (category) {
      case 'built_environment':
        return <Building className="w-4 h-4 text-orange-400" />;
      case 'anthropogenic':
        return <Car className="w-4 h-4 text-rose-400" />;
      case 'natural_climate':
        return <Sun className="w-4 h-4 text-amber-400" />;
      case 'cooling_sink':
        return <TreePine className="w-4 h-4 text-emerald-400" />;
      default:
        return <Flame className="w-4 h-4 text-red-400" />;
    }
  };

  return (
    <div className="space-y-4 select-text">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <span>Why Is This Place Hot? — Spatial Geometric Analysis</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Evaluated based on exact location coordinates and search radius area geometry
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 font-semibold flex items-center space-x-1">
            <Cpu className="w-3 h-3 text-emerald-400" />
            <span>{contributors.length} Microclimate Drivers Discovered</span>
          </span>
        </div>
      </div>

      {/* Live Geometric Search Area Summary Bar */}
      {geometricMetrics && (
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 sm:p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
            <div className="flex items-center space-x-2">
              <Compass className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-mono font-bold text-slate-200">
                Spatial Geometric Domain: Radius {geometricMetrics.radiusMeters.toLocaleString()}m ({geometricMetrics.totalAreaKm2} km²)
              </span>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-sky-950/80 text-sky-300 border border-sky-800/80 font-bold">
              {geometricMetrics.spatialScale}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Solar Radiant Load */}
            <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl space-y-0.5">
              <span className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
                <span>Solar Radiant Load</span>
                <Sun className="w-3 h-3 text-amber-400" />
              </span>
              <strong className="text-sm font-mono text-amber-300 block">
                {geometricMetrics.energyBudget.totalSolarPowerMW} MW
              </strong>
              <span className="text-[9px] text-slate-500 font-mono block">
                Absorbed: {geometricMetrics.energyBudget.absorbedSolarPowerMW} MW
              </span>
            </div>

            {/* Thermal Storage Flux */}
            <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl space-y-0.5">
              <span className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
                <span>Thermal Storage Flux</span>
                <Flame className="w-3 h-3 text-orange-400" />
              </span>
              <strong className="text-sm font-mono text-orange-400 block">
                {geometricMetrics.energyBudget.thermalStorageFluxMW} MW
              </strong>
              <span className="text-[9px] text-slate-500 font-mono block">
                Masonry &amp; Bitumen mass
              </span>
            </div>

            {/* Canopy Deficit */}
            <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl space-y-0.5">
              <span className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
                <span>Tree Canopy Deficit</span>
                <TreePine className="w-3 h-3 text-rose-400" />
              </span>
              <strong className="text-sm font-mono text-rose-400 block">
                {Math.round(geometricMetrics.footprints.canopyDeficitM2 / 1000)}k m²
              </strong>
              <span className="text-[9px] text-slate-500 font-mono block">
                -{geometricMetrics.energyBudget.latentHeatDeficitMW} MW latent cooling
              </span>
            </div>

            {/* Sky View Factor */}
            <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl space-y-0.5">
              <span className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
                <span>Sky View Factor (SVF)</span>
                <Building className="w-3 h-3 text-purple-400" />
              </span>
              <strong className="text-sm font-mono text-purple-300 block">
                {geometricMetrics.canyonMorphology.skyViewFactorSVF}
              </strong>
              <span className="text-[9px] text-slate-500 font-mono block">
                {Math.round((1 - geometricMetrics.canyonMorphology.skyViewFactorSVF) * 100)}% radiation trapped
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Accordion Item List */}
      <div className="space-y-2.5">
        {contributors.map((cause, idx) => {
          const isExpanded = expandedIndex === idx;
          const solution = getPairedRecommendation(cause, idx);

          return (
            <div
              key={cause.id || idx}
              className={`rounded-2xl transition-all duration-200 border ${
                isExpanded
                  ? 'bg-slate-950 border-emerald-500/50 shadow-xl shadow-emerald-500/5 ring-1 ring-emerald-500/20'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              {/* Accordion Header Button */}
              <button
                type="button"
                onClick={() => toggleAccordion(idx)}
                className="w-full p-3.5 sm:p-4 flex items-center justify-between text-left transition-colors cursor-pointer gap-3"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="p-2 rounded-xl bg-slate-800/90 border border-slate-700/80 shrink-0 flex items-center justify-center w-9 h-9">
                    {getCategoryIcon(cause.category, cause.categoryEmoji)}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-500">#{idx + 1}</span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                        {cause.label}
                      </h4>
                      {/* Evidence Badge */}
                      {getEvidenceBadge(cause.evidenceType)}
                      {/* Confidence Badge */}
                      {getConfidenceBadge(cause.confidenceLevel)}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                      {cause.possibleReason ? (
                        <span className="text-slate-300 truncate max-w-sm sm:max-w-md">
                          Reason: <strong>{cause.possibleReason}</strong>
                        </span>
                      ) : (
                        <span>
                          Impact: <strong className="font-mono text-slate-200">{cause.measurementValue}</strong>
                        </span>
                      )}
                      {cause.whatChecked && (
                        <>
                          <span className="text-slate-600 hidden sm:inline">•</span>
                          <span className="text-sky-400 hidden sm:inline truncate max-w-xs">
                            Checked: <strong>{cause.whatChecked}</strong>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  {/* Contribution Score Pill */}
                  <div className="text-right">
                    <span className="text-xs sm:text-sm font-mono font-black text-orange-400 block">
                      {cause.impactPercent}%
                    </span>
                    <span className="text-[9px] font-mono uppercase text-slate-500 block">
                      Heat Share
                    </span>
                  </div>

                  {/* Expand Chevron */}
                  <div
                    className={`p-1.5 rounded-xl border border-slate-700/80 bg-slate-800 transition-transform duration-200 ${
                      isExpanded
                        ? 'rotate-180 bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'text-slate-400'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </button>

              {/* Progress bar inside accordion header */}
              <div className="px-4 pb-2">
                <div className="w-full h-1.5 rounded-full bg-slate-800/80 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500"
                    style={{ width: `${Math.min(100, cause.impactPercent * 2.5)}%` }}
                  ></div>
                </div>
              </div>

              {/* Expandable Accordion Body */}
              {isExpanded && (
                <div className="p-4 pt-2 border-t border-slate-800/80 space-y-4 text-xs">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* LEFT PANEL: The Cause (Why it is hot) */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <span className="font-bold text-orange-400 flex items-center space-x-1.5">
                          <Flame className="w-3.5 h-3.5" />
                          <span>The Physical Cause (Root Driver)</span>
                        </span>
                        <div className="flex items-center space-x-1.5">
                          {getEvidenceBadge(cause.evidenceType)}
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-950/60 text-orange-300 border border-orange-800/60 font-bold">
                            {cause.impact}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2.5 text-slate-300">
                        {cause.possibleReason && (
                          <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                            <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                              Possible Reason:
                            </span>
                            <p className="mt-0.5 text-xs text-amber-200 font-medium leading-relaxed">
                              {cause.possibleReason}
                            </p>
                          </div>
                        )}

                        {cause.geometricContribution && (
                          <div className="bg-slate-950/70 p-2.5 rounded-lg border border-sky-900/40 text-sky-200 space-y-1">
                            <span className="text-[10px] font-mono uppercase text-sky-400 block font-semibold flex items-center space-x-1">
                              <Box className="w-3 h-3" />
                              <span>Live Geometric Radius Footprint:</span>
                            </span>
                            <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                              <span>Scale: <strong>{cause.geometricContribution.scaleContext}</strong></span>
                              {cause.geometricContribution.affectedAreaM2 && (
                                <span>• Footprint: <strong>{cause.geometricContribution.affectedAreaM2.toLocaleString()} m²</strong></span>
                              )}
                              {cause.geometricContribution.affectedLinearKm && (
                                <span>• Network: <strong>~{cause.geometricContribution.affectedLinearKm} km</strong></span>
                              )}
                              {cause.geometricContribution.energyImpactMW && (
                                <span>• Thermal Flux: <strong className="text-orange-400">{cause.geometricContribution.energyImpactMW} MW</strong></span>
                              )}
                            </div>
                          </div>
                        )}

                        {cause.whatChecked && (
                          <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                            <span className="text-[10px] font-mono uppercase text-sky-400 block font-semibold flex items-center space-x-1">
                              <Search className="w-3 h-3" />
                              <span>What AI Checked:</span>
                            </span>
                            <p className="mt-0.5 text-xs text-sky-200 font-medium">
                              {cause.whatChecked}
                            </p>
                          </div>
                        )}

                        <div>
                          <span className="text-[10px] font-mono uppercase text-slate-500 block font-semibold">
                            Evidence &amp; Physical Mechanism:
                          </span>
                          <p className="mt-1 text-xs text-slate-200 leading-relaxed font-sans">
                            {cause.evidence}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                          <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                            <span className="text-[9px] text-slate-500 block">Thermal Contribution</span>
                            <span className="text-orange-400 font-bold truncate block">{cause.measurementValue}</span>
                          </div>
                          <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                            <span className="text-[9px] text-slate-500 block">Calibration Confidence</span>
                            <span className="text-emerald-400 font-bold truncate block">{cause.confidence}% ({cause.confidenceLevel})</span>
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-400 italic bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
                          <strong>Mitigation Focus:</strong> {cause.mitigationOpportunity}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT PANEL: The Solution (How to reduce it) */}
                    <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-3.5 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <span className="font-bold text-emerald-400 flex items-center space-x-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Actionable Heat Reduction Solution</span>
                        </span>
                        {solution && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-bold">
                            Priority #{solution.priority}
                          </span>
                        )}
                      </div>

                      {solution ? (
                        <div className="space-y-3 text-slate-300">
                          <div>
                            <h5 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              <span>{solution.title}</span>
                            </h5>
                            <p className="mt-1 text-xs text-slate-300 leading-relaxed font-sans">
                              {solution.what}
                            </p>
                          </div>

                          {/* Cooling Impact Delta Grid */}
                          <div className="grid grid-cols-2 gap-2 text-center font-mono">
                            <div className="bg-emerald-950/30 border border-emerald-800/40 p-2 rounded-lg">
                              <span className="text-[9px] text-emerald-400 uppercase block">Surface Cooling</span>
                              <strong className="text-emerald-300 text-sm">
                                -{solution.tempDropSurfaceRange[0]}°C to -{solution.tempDropSurfaceRange[1]}°C
                              </strong>
                            </div>
                            <div className="bg-teal-950/30 border border-teal-800/40 p-2 rounded-lg">
                              <span className="text-[9px] text-teal-400 uppercase block">Ambient Cooling</span>
                              <strong className="text-teal-300 text-sm">
                                -{solution.tempDropAmbientRange[0]}°C to -{solution.tempDropAmbientRange[1]}°C
                              </strong>
                            </div>
                          </div>

                          {/* Feasibility & Co-Benefits */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] text-slate-400">
                              <span>Implementation Feasibility:</span>
                              <span className="font-mono text-emerald-400 font-bold">{solution.feasibility}</span>
                            </div>

                            {solution.coBenefits && solution.coBenefits.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                <span className="text-[10px] text-slate-500 font-mono">Co-Benefits:</span>
                                {solution.coBenefits.slice(0, 3).map((benefit, bIdx) => (
                                  <span
                                    key={bIdx}
                                    className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-300 border border-slate-700"
                                  >
                                    {benefit}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {onOpenSimulatorWithAction && (
                            <button
                              type="button"
                              onClick={() => onOpenSimulatorWithAction(solution)}
                              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 text-slate-950 font-bold text-xs hover:brightness-110 shadow-lg shadow-emerald-500/20 transition flex items-center justify-center space-x-1.5 cursor-pointer mt-2"
                            >
                              <SlidersHorizontal className="w-3.5 h-3.5" />
                              <span>Simulate Solution in Scenario Engine</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="text-slate-400 italic p-3 text-center">
                          Select this driver to generate custom algorithmic engineering solutions.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
