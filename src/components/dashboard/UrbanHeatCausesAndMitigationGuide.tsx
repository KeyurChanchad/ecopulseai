import React, { useState } from 'react';
import {
  MAJOR_URBAN_HEAT_CAUSES,
  OVERLOOKED_HEAT_CAUSES,
  SOLUTION_PRIORITIES,
  MEASUREMENT_METRICS,
  MajorUrbanHeatCause,
} from '../../data/urbanHeatCausesData';
import {
  Flame,
  TreePine,
  Building,
  Car,
  Factory,
  Server,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Thermometer,
  Sun,
  Activity,
  SlidersHorizontal,
  ExternalLink,
  ChevronRight,
  TrendingDown,
  Gauge,
  HelpCircle,
  Award,
} from 'lucide-react';
import { Recommendation } from '../../types';

interface UrbanHeatCausesAndMitigationGuideProps {
  onOpenSimulatorWithAction?: (rec: Recommendation) => void;
  cityName?: string;
  className?: string;
}

export const UrbanHeatCausesAndMitigationGuide: React.FC<UrbanHeatCausesAndMitigationGuideProps> = ({
  onOpenSimulatorWithAction,
  cityName = 'this city',
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'causes' | 'overlooked' | 'priorities' | 'measurement'>('causes');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expandedCauseId, setExpandedCauseId] = useState<string | null>(null);

  const filteredCauses =
    categoryFilter === 'all'
      ? MAJOR_URBAN_HEAT_CAUSES
      : MAJOR_URBAN_HEAT_CAUSES.filter((c) => c.category === categoryFilter);

  const getCauseIcon = (iconName: string) => {
    switch (iconName) {
      case 'Car':
        return <Car className="w-4 h-4 text-orange-400" />;
      case 'Building':
        return <Building className="w-4 h-4 text-amber-400" />;
      case 'Activity':
        return <Activity className="w-4 h-4 text-rose-400" />;
      case 'Factory':
        return <Factory className="w-4 h-4 text-purple-400" />;
      case 'TreePine':
        return <TreePine className="w-4 h-4 text-emerald-400" />;
      case 'Layers':
        return <Layers className="w-4 h-4 text-sky-400" />;
      case 'Server':
        return <Server className="w-4 h-4 text-cyan-400" />;
      default:
        return <Flame className="w-4 h-4 text-orange-400" />;
    }
  };

  const handleSimulate = (cause: MajorUrbanHeatCause) => {
    if (!onOpenSimulatorWithAction) return;
    const simRec: Recommendation = {
      id: `guide-rec-${cause.id}`,
      priority: cause.number,
      factor: cause.title,
      title: cause.solutions[0],
      why: cause.mechanism,
      where: 'Key exposure corridors across the urban footprint',
      what: cause.solutions.join(' • '),
      expectedEffect: cause.potentialImpact,
      tempDropSurfaceRange: [6.0, 18.0],
      tempDropAmbientRange: [0.8, 2.2],
      confidence: 'High',
      coBenefits: ['Thermal comfort enhancement', 'Localized cooling', 'Air quality improvement'],
      feasibility: 'Immediate',
      costCategory: 'Medium',
    };
    onOpenSimulatorWithAction(simRec);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 1. Header Banner & Critical Scientific Distinction */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
                <Flame className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Major Causes of City Heat &amp; How to Reduce Them
                </h3>
                <p className="text-xs text-slate-400">
                  Comprehensive Environmental Guidance aligned with US EPA Urban Heat Island Guidelines &amp; IPCC Assessment Reports.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-xl text-[11px] font-mono text-emerald-400">
              <img
                src="https://www.google.com/s2/favicons?domain=https://www.epa.gov&sz=32"
                alt="US EPA"
                className="w-3.5 h-3.5 rounded"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="font-bold">US EPA Verified Framework</span>
            </div>
          </div>

          {/* Scientific Distinction Callout */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-amber-500/30 text-xs space-y-1.5">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-[11px] font-mono uppercase tracking-wider">
              <Info className="w-4 h-4 shrink-0" />
              <span>An Important Physical Distinction: Air Temperature vs. Radiant Sensation</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px] sm:text-xs">
              Some factors raise the <strong>actual outdoor air temperature</strong> (sensible heat from combustion, industrial plumes, and trapped nocturnal radiation), while others mainly make people feel hotter by dramatically increasing <strong>radiant heat</strong> (hot asphalt and dark roofs radiating infrared energy), reducing tree shade, or restricting natural street ventilation.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Interactive Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('causes')}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            activeTab === 'causes'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>1. Major Causes of Urban Heat (7)</span>
        </button>

        <button
          onClick={() => setActiveTab('overlooked')}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            activeTab === 'overlooked'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>2. Overlooked Causes Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('priorities')}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            activeTab === 'priorities'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>3. Which Solutions First?</span>
        </button>

        <button
          onClick={() => setActiveTab('measurement')}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
            activeTab === 'measurement'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
          }`}
        >
          <Gauge className="w-3.5 h-3.5" />
          <span>4. How to Measure Success</span>
        </button>
      </div>

      {/* 3. TAB 1: 7 Major Causes with Real Images & Solutions */}
      {activeTab === 'causes' && (
        <div className="space-y-4">
          {/* Category Filter Chips */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {[
              { id: 'all', label: 'All 7 Causes' },
              { id: 'surfaces', label: 'Roads & Asphalt' },
              { id: 'buildings', label: 'Roofs & Buildings' },
              { id: 'transport', label: 'Traffic & Population' },
              { id: 'industry', label: 'Industry & Power' },
              { id: 'nature', label: 'Canopy & Vegetation' },
              { id: 'morphology', label: 'Dense Canyons' },
              { id: 'compute', label: 'Data Centers' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id)}
                className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap text-[11px] font-medium border ${
                  categoryFilter === tab.id
                    ? 'bg-slate-800 text-emerald-400 border-emerald-500/50 font-bold'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCauses.map((cause) => {
              const isExpanded = expandedCauseId === cause.id;

              return (
                <div
                  key={cause.id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-xl transition-all flex flex-col justify-between group"
                >
                  {/* Image & Header */}
                  <div>
                    <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                      <img
                        src={cause.imageUrl}
                        alt={cause.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLElement;
                          target.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                      <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-950/90 text-emerald-400 font-mono font-bold text-xs border border-emerald-500/40 shadow-lg">
                          #{cause.number}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-slate-950/90 text-slate-300 font-mono text-[10px] font-semibold border border-slate-700/80 shadow-lg">
                          {cause.tag}
                        </span>
                      </div>

                      <div className="absolute bottom-2.5 left-3 right-3">
                        <h4 className="text-sm sm:text-base font-extrabold text-white drop-shadow-md flex items-center space-x-2">
                          <span>{cause.title}</span>
                        </h4>
                        <p className="text-[10px] text-slate-300 italic line-clamp-1 mt-0.5 opacity-90">
                          {cause.imageCaption}
                        </p>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-4 space-y-3">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold mb-1">
                          The Heating Mechanism:
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans">
                          {cause.mechanism}
                        </p>
                      </div>

                      {/* Solutions List */}
                      <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
                        <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-bold flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Actionable Solutions:</span>
                        </span>
                        <ul className="space-y-1">
                          {cause.solutions.map((sol, sIdx) => (
                            <li key={sIdx} className="text-xs text-slate-300 flex items-start space-x-2">
                              <span className="text-emerald-400 font-bold">•</span>
                              <span className="leading-snug">{sol}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Potential Impact Box */}
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-emerald-900/40 text-[11px] text-emerald-300 space-y-0.5">
                        <strong className="font-mono text-[10px] text-emerald-400 uppercase tracking-wider block">
                          Potential Impact:
                        </strong>
                        <p className="text-slate-300 text-xs leading-relaxed font-sans">
                          {cause.potentialImpact}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Simulator Action */}
                  <div className="px-4 py-3 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">
                      Effect: <strong className="text-slate-300">{cause.temperatureEffect}</strong>
                    </span>
                    {onOpenSimulatorWithAction && (
                      <button
                        onClick={() => handleSimulate(cause)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-bold flex items-center space-x-1 transition shadow-sm"
                        title="Model this heat reduction in scenario simulator"
                      >
                        <SlidersHorizontal className="w-3 h-3 text-emerald-400" />
                        <span>Simulate in {cityName}</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. TAB 2: Overlooked Causes Matrix */}
      {activeTab === 'overlooked' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>Other Important Causes People Often Overlook</span>
            </h4>
            <p className="text-xs text-slate-400">
              Beyond roads and roofs, secondary mechanisms compound urban heat stress and trap thermal energy across neighbourhoods.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/90 shadow-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-mono uppercase text-slate-400">
                  <th className="py-3 px-4 font-bold">Cause</th>
                  <th className="py-3 px-4 font-bold">Why It Increases Heat</th>
                  <th className="py-3 px-4 font-bold">What To Do (Interventions)</th>
                  <th className="py-3 px-3 font-bold text-right">Domain</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {OVERLOOKED_HEAT_CAUSES.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50 transition">
                    <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      <span>{item.cause}</span>
                    </td>
                    <td className="py-3.5 px-4 leading-relaxed max-w-sm">
                      {item.whyIncreasesHeat}
                    </td>
                    <td className="py-3.5 px-4 leading-relaxed max-w-md text-emerald-300/90">
                      {item.whatToDo}
                    </td>
                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
                        {item.category}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. TAB 3: Implementation Priority Ladder */}
      {activeTab === 'priorities' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Which Solutions Should a City Implement First?</span>
            </h4>
            <p className="text-xs text-slate-400">
              The priority depends on whether the municipal goal is reducing air temperature, lowering surface temperature, or protecting vulnerable residents from deadly thermal stress.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SOLUTION_PRIORITIES.map((priority) => (
              <div
                key={priority.tier}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 space-y-3 shadow-xl relative overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      Tier #{priority.tier}
                    </span>
                    <h5 className="text-sm font-bold text-white pt-1">{priority.title}</h5>
                    <p className="text-xs text-emerald-400 font-semibold">{priority.subtitle}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {priority.description}
                </p>

                <div className="pt-2 border-t border-slate-800 text-xs space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                    Target Deployment Zones:
                  </span>
                  <p className="text-slate-300 italic text-[11px]">{priority.targetAreas}</p>
                </div>

                <div className="pt-1.5 space-y-1 text-xs">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block">
                    Key Actions:
                  </span>
                  <ul className="space-y-1">
                    {priority.keyActions.map((act, aIdx) => (
                      <li key={aIdx} className="text-slate-300 flex items-start space-x-1.5 text-[11px]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* US EPA Consensus Banner */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center space-x-3">
              <img
                src="https://www.google.com/s2/favicons?domain=https://www.epa.gov&sz=32"
                alt="US EPA"
                className="w-5 h-5 rounded"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div>
                <strong className="text-xs font-bold text-white block">
                  US EPA Integrated Mitigation Guidance
                </strong>
                <p className="text-[11px] text-slate-400">
                  The US EPA recommends combining reflective roofs, vegetation, and permeable cool pavements rather than relying on one intervention alone. Multi-layered interventions deliver non-linear cooling synergies.
                </p>
              </div>
            </div>
            <a
              href="https://www.epa.gov/heatislands"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 text-slate-200 text-xs font-mono font-bold flex items-center space-x-1 transition shrink-0"
            >
              <span>EPA Heat Islands</span>
              <ExternalLink className="w-3 h-3 text-emerald-400" />
            </a>
          </div>
        </div>
      )}

      {/* 6. TAB 4: Verification & Measurement Science */}
      {activeTab === 'measurement' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2">
              <Gauge className="w-4 h-4 text-sky-400" />
              <span>How to Measure Whether the Solutions Work</span>
            </h4>
            <p className="text-xs text-slate-400">
              For cities such as Ahmedabad, establish an empirical baseline before implementing changes, then compare similar weather conditions over multi-year seasonal cycles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {MEASUREMENT_METRICS.map((m, idx) => (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-2.5 shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                    <span className="font-bold text-xs text-white">{m.metric}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-emerald-400 border border-emerald-800/60 font-bold">
                      {m.unit}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {m.methodology}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-[11px] space-y-1">
                  <div className="text-slate-400 font-mono text-[10px]">
                    Sensors: <strong className="text-slate-200">{m.instrumentation}</strong>
                  </div>
                  <div className="text-emerald-400/90 text-[11px]">
                    {m.whyCritical}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Central Scientific Decoupling Rule */}
          <div className="p-4.5 rounded-2xl bg-gradient-to-br from-rose-950/40 via-slate-950 to-slate-950 border border-rose-500/40 text-xs space-y-2">
            <div className="flex items-center space-x-2 text-rose-400 font-bold font-mono uppercase text-[11px]">
              <ShieldCheck className="w-4 h-4 text-rose-400" />
              <span>Core Scientific Rule: Surface Temperature ≠ Outdoor Air Temperature</span>
            </div>
            <p className="text-slate-200 leading-relaxed font-sans text-xs">
              <strong>Do not treat a 15°C reduction in a roof's surface temperature as a 15°C reduction in outdoor air temperature.</strong> Those are fundamentally different thermodynamic regimes. Roof coatings reflect solar energy before it conducts into building thermal mass; outdoor air temperature changes are moderated by regional wind currents, planetary boundary layer dynamics, and massive volumes of atmospheric air flushing through the city.
            </p>
            <div className="pt-2 border-t border-rose-900/40 text-[11px] font-mono text-slate-400">
              The central thesis: A cooler city must absorb less solar heat, retain less nocturnal heat, release less mechanical waste heat, restore vegetative cover, and cut greenhouse gas emissions.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
