import React, { useState, useMemo } from 'react';
import {
  ScenarioSimulationParams,
  ScenarioSimulationResult,
  HeatLevel,
  LocationData,
  Recommendation,
} from '../../types';
import { simulateHeatReduction, getHeatCategoryColor } from '../../services/heatModel';
import {
  SlidersHorizontal,
  TreePine,
  Home,
  Car,
  Route,
  Sun,
  TrendingDown,
  RotateCcw,
  Zap,
  Leaf,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Info,
  ArrowRight,
} from 'lucide-react';

interface ScenarioSimulatorProps {
  location: LocationData;
  baseHeatScore: number;
  baseSurfaceTemp: number;
  baseAirTemp: number;
  initialParams?: Partial<ScenarioSimulationParams>;
}

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({
  location,
  baseHeatScore,
  baseSurfaceTemp,
  baseAirTemp,
  initialParams,
}) => {
  const [params, setParams] = useState<ScenarioSimulationParams>({
    treesToPlant: initialParams?.treesToPlant ?? 10000,
    coolRoofsPercent: initialParams?.coolRoofsPercent ?? 20,
    trafficReductionPercent: initialParams?.trafficReductionPercent ?? 15,
    coolPavementPercent: initialParams?.coolPavementPercent ?? 25,
    shadedCorridorsKm: initialParams?.shadedCorridorsKm ?? 8,
  });

  // Calculate real-time simulated results
  const result: ScenarioSimulationResult = useMemo(() => {
    return simulateHeatReduction(baseHeatScore, baseSurfaceTemp, baseAirTemp, params);
  }, [baseHeatScore, baseSurfaceTemp, baseAirTemp, params]);

  const beforeColor = getHeatCategoryColor(result.heatRiskCategoryBefore);
  const afterColor = getHeatCategoryColor(result.heatRiskCategoryAfter);

  const applyPreset = (presetName: string) => {
    switch (presetName) {
      case 'greening':
        setParams({
          treesToPlant: 25000,
          coolRoofsPercent: 30,
          trafficReductionPercent: 15,
          coolPavementPercent: 20,
          shadedCorridorsKm: 15,
        });
        break;
      case 'coolSurfaces':
        setParams({
          treesToPlant: 8000,
          coolRoofsPercent: 65,
          trafficReductionPercent: 10,
          coolPavementPercent: 60,
          shadedCorridorsKm: 5,
        });
        break;
      case 'mobility':
        setParams({
          treesToPlant: 12000,
          coolRoofsPercent: 15,
          trafficReductionPercent: 35,
          coolPavementPercent: 30,
          shadedCorridorsKm: 18,
        });
        break;
      case 'fullHAP':
        setParams({
          treesToPlant: 35000,
          coolRoofsPercent: 50,
          trafficReductionPercent: 25,
          coolPavementPercent: 45,
          shadedCorridorsKm: 20,
        });
        break;
      default:
        setParams({
          treesToPlant: 0,
          coolRoofsPercent: 0,
          trafficReductionPercent: 0,
          coolPavementPercent: 0,
          shadedCorridorsKm: 0,
        });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 select-text">
      {/* Simulator Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-orange-400 mb-1">
              <SlidersHorizontal className="w-4 h-4" />
              <span>URBAN HEAT MITIGATION ENGINE</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">Target: {location.name}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Interactive Scenario Simulator
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Model microclimate cooling outcomes before allocating municipal capital. Calibrated against empirical urban surface energy balance models (Oke & Akbari physics).
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => applyPreset('reset')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-slate-300 flex items-center space-x-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Baseline</span>
            </button>
          </div>
        </div>

        {/* Quick Presets Strip */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Load Proven Masterplan Presets:</span>
          <button
            onClick={() => applyPreset('greening')}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition"
          >
            🌳 Aggressive Urban Forestry (+25k trees)
          </button>
          <button
            onClick={() => applyPreset('coolSurfaces')}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 transition"
          >
            🏢 High-Albedo Cool Roofs & Pavements (65%)
          </button>
          <button
            onClick={() => applyPreset('mobility')}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition"
          >
            🚗 Sustainable Transit & Anti-Idling
          </button>
          <button
            onClick={() => applyPreset('fullHAP')}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition"
          >
            ⚡ Full Heat Action Plan 2030 (Max Intervention)
          </button>
        </div>
      </div>

      {/* Simulator Core Layout: Sliders (Left) & Real-Time Impact Dashboard (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Panel */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-3">
            <SlidersHorizontal className="w-5 h-5 text-orange-400" />
            <span>Intervention Variables & Policy Levers</span>
          </h3>

          {/* Slider 1: Tree Planting */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center space-x-2">
                <TreePine className="w-4 h-4 text-emerald-400" />
                <span>1. Additional Native Trees Planted</span>
              </span>
              <span className="font-mono text-emerald-400 font-bold text-sm">
                +{params.treesToPlant.toLocaleString()} trees
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50000"
              step="1000"
              value={params.treesToPlant}
              onChange={(e) => setParams({ ...params, treesToPlant: parseInt(e.target.value) })}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>0 (Baseline)</span>
              <span>15,000 (Target)</span>
              <span>50,000 (City-Wide)</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Adds living shade and evapo-transpirational cooling across road corridors and public school grounds.
            </p>
          </div>

          {/* Slider 2: Cool Reflective Roofs */}
          <div className="space-y-2 pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center space-x-2">
                <Home className="w-4 h-4 text-sky-400" />
                <span>2. Suitable Roofs Converted to Cool / Reflective</span>
              </span>
              <span className="font-mono text-sky-400 font-bold text-sm">
                {params.coolRoofsPercent}% of roofs
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={params.coolRoofsPercent}
              onChange={(e) => setParams({ ...params, coolRoofsPercent: parseInt(e.target.value) })}
              className="w-full accent-sky-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>0%</span>
              <span>25% (Phase 1)</span>
              <span>50%</span>
              <span>100% (Complete)</span>
            </div>
            <p className="text-[11px] text-slate-400">
              High Solar Reflectance Index (SRI &gt; 78) coatings reflect sunlight back into space, preventing building heat absorption.
            </p>
          </div>

          {/* Slider 3: Traffic Reduction */}
          <div className="space-y-2 pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center space-x-2">
                <Car className="w-4 h-4 text-amber-400" />
                <span>3. Peak Vehicular Traffic & Idling Reduction</span>
              </span>
              <span className="font-mono text-amber-400 font-bold text-sm">
                -{params.trafficReductionPercent}% flow cut
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={params.trafficReductionPercent}
              onChange={(e) => setParams({ ...params, trafficReductionPercent: parseInt(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>0%</span>
              <span>15% (Signal Sync)</span>
              <span>30% (BRT/Transit Shift)</span>
              <span>50% (Max)</span>
            </div>
            <p className="text-[11px] text-slate-400">
              AI traffic signal synchronization and public transit waves eliminate intersection idling heat rejection.
            </p>
          </div>

          {/* Slider 4: Cool Pavement */}
          <div className="space-y-2 pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center space-x-2">
                <Sun className="w-4 h-4 text-orange-400" />
                <span>4. Roads Converted to High-Albedo Cool Pavement</span>
              </span>
              <span className="font-mono text-orange-400 font-bold text-sm">
                {params.coolPavementPercent}% road network
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={params.coolPavementPercent}
              onChange={(e) => setParams({ ...params, coolPavementPercent: parseInt(e.target.value) })}
              className="w-full accent-orange-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>0%</span>
              <span>25% (Arterials)</span>
              <span>50%</span>
              <span>100%</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Solar-reflective titanium-dioxide sealants on black asphalt roads reduce surface skin temperatures.
            </p>
          </div>

          {/* Slider 5: Shaded Corridors */}
          <div className="space-y-2 pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center space-x-2">
                <Leaf className="w-4 h-4 text-teal-400" />
                <span>5. Shaded Pedestrian Walking Canopies</span>
              </span>
              <span className="font-mono text-teal-400 font-bold text-sm">
                {params.shadedCorridorsKm} km network
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="1"
              value={params.shadedCorridorsKm}
              onChange={(e) => setParams({ ...params, shadedCorridorsKm: parseInt(e.target.value) })}
              className="w-full accent-teal-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>0 km</span>
              <span>8 km (Transit links)</span>
              <span>25 km (City-wide)</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Tensile solar fabric and climbing green vines over sidewalks shelter pedestrian commuters.
            </p>
          </div>
        </div>

        {/* Real-Time Modeled Results Panel */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Before / After Scoreboard */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">
                Simulated Microclimate Impact
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                Live Simulation
              </span>
            </div>

            {/* Score Comparison Display */}
            <div className="grid grid-cols-2 gap-3">
              {/* Baseline */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                <span className="text-xs text-slate-400 font-mono block mb-1">Baseline Score</span>
                <div className="text-3xl font-black font-mono text-slate-200">
                  {result.baseHeatScore}
                  <span className="text-xs text-slate-500 font-normal">/100</span>
                </div>
                <span
                  className="mt-1 inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded"
                  style={{ backgroundColor: `${beforeColor.hex}22`, color: beforeColor.hex }}
                >
                  {result.heatRiskCategoryBefore}
                </span>
              </div>

              {/* After Scenario */}
              <div className="bg-emerald-950/20 p-4 rounded-xl border border-emerald-500/40 text-center shadow-lg shadow-emerald-500/10">
                <span className="text-xs text-emerald-400 font-mono block mb-1">After Scenario</span>
                <div className="text-3xl font-black font-mono text-emerald-400">
                  {result.simulatedHeatScore}
                  <span className="text-xs text-emerald-500/60 font-normal">/100</span>
                </div>
                <span
                  className="mt-1 inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded"
                  style={{ backgroundColor: `${afterColor.hex}22`, color: afterColor.hex }}
                >
                  {result.heatRiskCategoryAfter}
                </span>
              </div>
            </div>

            {/* Score Improvement Banner */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-center">
              <div className="text-xs text-slate-300 font-medium">Estimated Improvement</div>
              <div className="text-2xl font-black font-mono text-emerald-400 flex items-center justify-center space-x-1">
                <TrendingDown className="w-5 h-5 text-emerald-400" />
                <span>-{result.heatScoreDelta} Heat Risk Points</span>
              </div>
            </div>

            {/* Physical Temperature Reductions */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-0.5">Surface Temp Drop (LST)</span>
                <div className="text-lg font-bold text-amber-400">
                  -{result.surfaceTempReductionC}°C
                </div>
                <span className="text-[10px] text-slate-500">Peak afternoon skin</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-0.5">Air Temp Drop (2m)</span>
                <div className="text-lg font-bold text-orange-400">
                  -{result.ambientTempReductionC}°C
                </div>
                <span className="text-[10px] text-slate-500">Ambient microclimate</span>
              </div>
            </div>

            {/* Co-Benefits Metric Grid */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Quantified Environmental Co-Benefits:
              </span>

              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-300 flex items-center space-x-2">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Annual Cooling Electricity Saved:</span>
                  </span>
                  <strong className="text-amber-400 font-mono">
                    {result.coolingEnergySavedMWhPerYear.toLocaleString()} MWh/yr
                  </strong>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-300 flex items-center space-x-2">
                    <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                    <span>CO2 Sequestration (Trees):</span>
                  </span>
                  <strong className="text-emerald-400 font-mono">
                    {result.co2AbsorbedTonsPerYear.toLocaleString()} tons/yr
                  </strong>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-300 flex items-center space-x-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                    <span>Heat-Stress Days Prevented:</span>
                  </span>
                  <strong className="text-teal-400 font-mono">
                    {result.heatStressReductionDaysPerYear} days/yr
                  </strong>
                </div>
              </div>
            </div>

            {/* Model Confidence & Disclaimer */}
            <div className="text-[10px] text-slate-500 italic bg-slate-950/40 p-2.5 rounded border border-slate-800/60 leading-relaxed">
              <strong>Model Simulation Disclaimer:</strong> This projection is generated using numerical urban microclimate simulations (Oke 1982 energy balance). Actual temperature outcomes depend on local tree canopy survival rates, street aspect ratios (H/W), and regional synoptic weather patterns. Not a guaranteed real-world outcome.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
