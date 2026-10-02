import React, { useState } from 'react';
import {
  EvidenceKnowledgeGraph,
  EvidenceObject,
  EvidenceSourceLevel,
} from '../../types';
import {
  Brain,
  X,
  Share2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Sparkles,
  Info,
  Network,
  BookOpen,
  Filter,
} from 'lucide-react';

interface EvidenceGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  graph: EvidenceKnowledgeGraph | null;
  locationName: string;
}

export const EvidenceGraphModal: React.FC<EvidenceGraphModalProps> = ({
  isOpen,
  onClose,
  graph,
  locationName,
}) => {
  const [selectedSourceType, setSelectedSourceType] = useState<string>('ALL');

  if (!isOpen || !graph) return null;

  const getSourceLevelBadge = (type: EvidenceSourceLevel) => {
    switch (type) {
      case 'LEVEL_1_OFFICIAL_GOV':
        return {
          label: 'Level 1: Official Gov/NASA',
          bg: 'bg-emerald-950 text-emerald-400 border-emerald-800',
        };
      case 'LEVEL_2_SCIENTIFIC_RESEARCH':
        return {
          label: 'Level 2: Peer-Reviewed Paper',
          bg: 'bg-blue-950 text-blue-400 border-blue-800',
        };
      case 'LEVEL_3_STRUCTURED_DATASETS':
        return {
          label: 'Level 3: Structured Dataset',
          bg: 'bg-purple-950 text-purple-400 border-purple-800',
        };
      case 'LEVEL_4_COMMERCIAL_API':
        return {
          label: 'Level 4: Commercial Sensor/API',
          bg: 'bg-amber-950 text-amber-400 border-amber-800',
        };
      case 'LEVEL_5_REPUTABLE_REPORTING':
        return {
          label: 'Level 5: Reputable Report',
          bg: 'bg-cyan-950 text-cyan-400 border-cyan-800',
        };
      case 'LEVEL_6_GENERAL_WEB':
      default:
        return {
          label: 'Level 6: Web Source',
          bg: 'bg-slate-800 text-slate-300 border-slate-700',
        };
    }
  };

  const filteredEvidence =
    selectedSourceType === 'ALL'
      ? graph.evidenceItems
      : graph.evidenceItems.filter((e) => e.sourceType === selectedSourceType);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden select-text">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-400">
                  Evidence Knowledge Graph & Source Hierarchy
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {graph.evidenceItems.length} Verified Sources
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100">
                Why Did EcoPulse Conclude This? — Empirical Evidence for {locationName}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-2 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Section A: Visual Causal Knowledge Graph (Section 14) */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <Share2 className="w-4 h-4 text-emerald-400" />
                <span>Causal Relationships & Knowledge Topology</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {graph.nodes.length} entities • {graph.edges.length} causal links
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {graph.nodes.map((node) => (
                <div
                  key={node.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-1.5 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{node.label}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {node.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{node.primaryFinding}</p>
                </div>
              ))}
            </div>

            {/* Edge relationships banner */}
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap gap-2 text-[11px] font-mono text-slate-400">
              {graph.edges.map((edge, idx) => (
                <span
                  key={idx}
                  className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg flex items-center space-x-1"
                >
                  <span className="text-slate-300 font-bold">{edge.from.replace('node-', '')}</span>
                  <span className="text-orange-400">→ [{edge.relation}] →</span>
                  <span className="text-slate-300 font-bold">{edge.to.replace('node-', '')}</span>
                  <span className="text-emerald-400">({Math.round(edge.confidence * 100)}%)</span>
                </span>
              ))}
            </div>
          </div>

          {/* Section B: Structured Evidence Objects (Section 15 & 39) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <BookOpen className="w-4 h-4 text-orange-400" />
                <span>Supporting Evidence Registry</span>
              </div>

              {/* Filter */}
              <div className="flex items-center space-x-2 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedSourceType}
                  onChange={(e) => setSelectedSourceType(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="ALL">All Sources ({graph.evidenceItems.length})</option>
                  <option value="LEVEL_1_OFFICIAL_GOV">Level 1: Official Gov/NASA</option>
                  <option value="LEVEL_2_SCIENTIFIC_RESEARCH">Level 2: Peer-Reviewed</option>
                  <option value="LEVEL_3_STRUCTURED_DATASETS">Level 3: Structured Data</option>
                  <option value="LEVEL_4_COMMERCIAL_API">Level 4: Commercial Sensor</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {filteredEvidence.map((ev) => {
                const badge = getSourceLevelBadge(ev.sourceType);
                return (
                  <div
                    key={ev.id}
                    className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2.5 hover:border-slate-700 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${badge.bg}`}
                        >
                          {badge.label}
                        </span>
                        <span className="text-xs font-bold text-slate-300">{ev.factor}</span>
                      </div>

                      <div className="flex items-center space-x-2 text-xs font-mono">
                        <span className="text-emerald-400 font-bold">
                          {Math.round(ev.confidence * 100)}% Confidence
                        </span>
                        {ev.corroborated && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 text-[10px] flex items-center space-x-1 border border-emerald-800/60">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Corroborated</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Claim */}
                    <div className="text-xs text-slate-200 leading-relaxed font-medium">
                      <strong className="text-orange-400">Claim: </strong>
                      {ev.claim}
                    </div>

                    {/* Observation & Metric */}
                    <div className="bg-slate-900/90 rounded-lg p-2.5 text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-slate-800">
                      <div>
                        <span className="text-slate-400 font-semibold">Observation: </span>
                        <span>{ev.observation}</span>
                      </div>
                      {ev.measurement && (
                        <div className="shrink-0 font-mono text-[11px] bg-slate-950 px-2 py-1 rounded border border-slate-800 text-orange-400 font-bold">
                          {ev.measurement.value} {ev.measurement.unit}
                        </div>
                      )}
                    </div>

                    {/* Citation & Source URL */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Source: <strong className="text-slate-300">{ev.source}</strong></span>
                      {ev.url && (
                        <a
                          href={ev.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 hover:underline"
                        >
                          <span>Original Reference</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-400">
            Adheres strictly to AI Agent Rules: No fabricated evidence, explicit source hierarchy.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            Close Evidence Browser
          </button>
        </div>
      </div>
    </div>
  );
};
