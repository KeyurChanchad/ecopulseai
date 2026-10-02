import React, { useState } from 'react';
import { EnvironmentalDomainAnalysis, WeatherObservation, LocationData } from '../../types';
import {
  Thermometer,
  Sun,
  TreePine,
  Route,
  Building,
  Car,
  Factory,
  Server,
  Droplets,
  Wind,
  Layers,
  Activity,
  AlertCircle,
  Clock,
  Compass,
} from 'lucide-react';

interface EnvironmentalDomainsCardProps {
  domains: EnvironmentalDomainAnalysis;
  weather: WeatherObservation;
  location: LocationData;
}

export const EnvironmentalDomainsCard: React.FC<EnvironmentalDomainsCardProps> = ({
  domains,
  weather,
  location,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'lst' | 'vegetation' | 'roads' | 'buildings' | 'traffic' | 'industrial' | 'water'>('all');

  const { vegetation, roads, buildings, traffic, industrial, dataCenters, water } = domains;
  const tempDiff = Math.round((weather.surfaceTemperature - weather.airTemperature) * 10) / 10;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <span>Multi-Source Environmental Domains Analysis</span>
          </h3>
          <p className="text-xs text-slate-400">
            Comprehensive biophysical evaluation within {location.analysisRadius || '5km'} radius (Satellite LST, NDVI, OSM GIS & Traffic).
          </p>
        </div>

        {/* Tab Filter */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs overflow-x-auto">
          {(
            [
              { id: 'all', label: 'All Domains' },
              { id: 'lst', label: 'LST vs Air' },
              { id: 'vegetation', label: 'Vegetation' },
              { id: 'roads', label: 'Roads & Albedo' },
              { id: 'buildings', label: 'Buildings' },
              { id: 'traffic', label: 'Traffic & Idling' },
              { id: 'industrial', label: 'Industrial & DC' },
              { id: 'water', label: 'Water Cooling' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Section 9 & 31: Crucial LST Skin vs 2m Air Temp Comparison Box */}
      {(activeTab === 'all' || activeTab === 'lst') && (
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4.5 rounded-xl border border-amber-500/30 shadow-lg space-y-3">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-800/80 pb-2.5">
            <div className="flex items-center space-x-2">
              <Sun className="w-5 h-5 text-amber-400" />
              <div>
                <h4 className="font-bold text-sm text-slate-100">
                  Land Surface Temperature (LST) vs Measured Air Temperature
                </h4>
                <span className="text-[10px] font-mono text-slate-400">
                  Sensor: {weather.lstSensor || 'Landsat-9 TIRS Band 10'} • {weather.lstObservationDate || 'Recent Pass'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                Skin Thermal Delta: +{tempDiff}°C
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-0.5">Atmospheric Air Temp (2m)</span>
              <div className="text-xl font-bold text-orange-400">{weather.airTemperature}°C</div>
              <span className="text-[10px] text-slate-500">Thermodynamic air measurement</span>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-0.5">Observed Skin LST</span>
              <div className="text-xl font-bold text-amber-400">{weather.surfaceTemperature}°C</div>
              <span className="text-[10px] text-slate-500">Peak radiometric radiation</span>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-0.5">Thermal Inertia Implication</span>
              <div className="text-sm font-bold text-rose-400">Night Heat Release</div>
              <span className="text-[10px] text-slate-500">Delays nighttime cooling</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 italic">
            * Scientific Note: Surface temperature (LST) reflects physical heat absorption of dark asphalt and concrete roofs. It is decoupled from air temperature to prevent misleading 1:1 equivalencies.
          </p>
        </div>
      )}

      {/* Grid of Domain Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        {/* Domain 1: Vegetation & Tree Canopy */}
        {(activeTab === 'all' || activeTab === 'vegetation') && (
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2">
                <span className="font-bold text-slate-200 flex items-center space-x-1.5">
                  <TreePine className="w-4 h-4 text-emerald-400" />
                  <span>Vegetation & Canopy</span>
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-orange-950 text-orange-300 border border-orange-800 font-bold">
                  {vegetation.freshness}
                </span>
              </div>

              <div className="space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Tree Canopy:</span>
                  <strong className="text-emerald-400">{vegetation.treeCanopyPercent}%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Vegetation Total:</span>
                  <strong className="text-slate-200">{vegetation.vegetationCoveragePercent}%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">NDVI Index:</span>
                  <strong className="text-slate-200">{vegetation.ndviIndex}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Canopy Assessment:</span>
                  <span className="text-rose-400 font-semibold">{vegetation.assessment}</span>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-800/80">
              Source: {vegetation.source}
            </div>
          </div>
        )}

        {/* Domain 2: Road Network & Paved Surfaces */}
        {(activeTab === 'all' || activeTab === 'roads') && (
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2">
                <span className="font-bold text-slate-200 flex items-center space-x-1.5">
                  <Route className="w-4 h-4 text-orange-400" />
                  <span>Roads & Paved Surfaces</span>
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                  {roads.freshness}
                </span>
              </div>

              <div className="space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Road Density:</span>
                  <strong className="text-orange-400">{roads.roadDensityPercent}%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Major Arterials:</span>
                  <strong className="text-slate-200">{roads.majorRoadsCount} corridors</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Paved Area Ratio:</span>
                  <strong className="text-slate-200">{roads.pavedAreaPercent}%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Surface Material:</span>
                  <span className="text-slate-300 truncate max-w-[140px]">{roads.surfaceType}</span>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-800/80">
              Source: {roads.source}
            </div>
          </div>
        )}

        {/* Domain 3: Built Environment & 3D Mass */}
        {(activeTab === 'all' || activeTab === 'buildings') && (
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2">
                <span className="font-bold text-slate-200 flex items-center space-x-1.5">
                  <Building className="w-4 h-4 text-sky-400" />
                  <span>Built Environment & Roofs</span>
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                  {buildings.freshness}
                </span>
              </div>

              <div className="space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Building Density:</span>
                  <strong className="text-sky-400">{buildings.buildingDensityPercent}%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Roof Area Coverage:</span>
                  <strong className="text-slate-200">{buildings.roofCoveragePercent}%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Open Space Ratio:</span>
                  <strong className="text-slate-200">{buildings.openSpacePercent}%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Heat Contribution:</span>
                  <span className="text-rose-400 font-semibold">{buildings.heatContribution}</span>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-800/80">
              Source: {buildings.source}
            </div>
          </div>
        )}

        {/* Domain 4: Traffic Congestion & Idling */}
        {(activeTab === 'all' || activeTab === 'traffic') && (
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2">
                <span className="font-bold text-slate-200 flex items-center space-x-1.5">
                  <Car className="w-4 h-4 text-amber-400" />
                  <span>Traffic & Vehicle Heat</span>
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                  {traffic.freshness}
                </span>
              </div>

              <div className="space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Congestion Level:</span>
                  <strong className="text-amber-400">{traffic.trafficLevel}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Congestion Index:</span>
                  <strong className="text-slate-200">{traffic.congestionIndexPercent}%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Major Congestion Zones:</span>
                  <strong className="text-slate-200">{traffic.majorCongestionZonesCount} bottlenecks</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Idling Heat Flux:</span>
                  <span className="text-orange-400">{traffic.idlingHeatFluxWPerM2} W/m²</span>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-800/80">
              Peak: {traffic.peakHours}
            </div>
          </div>
        )}

        {/* Domain 5: Industrial & Data Centers */}
        {(activeTab === 'all' || activeTab === 'industrial') && (
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2">
                <span className="font-bold text-slate-200 flex items-center space-x-1.5">
                  <Factory className="w-4 h-4 text-purple-400" />
                  <span>Industrial & Data Centers</span>
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                  {industrial.freshness}
                </span>
              </div>

              <div className="space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Industrial Facilities:</span>
                  <strong className="text-purple-400">{industrial.facilitiesWithinRadius} in radius</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Thermal Relevance:</span>
                  <strong className="text-slate-200">{industrial.thermalRelevance}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Data Centers Detected:</span>
                  <strong className="text-slate-200">{dataCenters.facilitiesDetected}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Nearest DC Distance:</span>
                  <span className="text-slate-300">{dataCenters.nearestDistanceKm} km</span>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 italic bg-slate-900/60 p-1.5 rounded">
              {dataCenters.cautiousNote}
            </div>
          </div>
        )}

        {/* Domain 6: Water Bodies & Riparian Cooling */}
        {(activeTab === 'all' || activeTab === 'water') && (
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2">
                <span className="font-bold text-slate-200 flex items-center space-x-1.5">
                  <Droplets className="w-4 h-4 text-teal-400" />
                  <span>Water & Blue Infrastructure</span>
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                  {water.freshness}
                </span>
              </div>

              <div className="space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Water Coverage:</span>
                  <strong className="text-teal-400">{water.waterCoveragePercent}%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Nearest Water Body:</span>
                  <span className="text-slate-200 truncate max-w-[140px]">{water.nearestWaterBodyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Distance:</span>
                  <strong className="text-slate-200">{water.nearestDistanceKm} km</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cooling Benefit:</span>
                  <strong className="text-emerald-400">{water.coolingBenefitC}°C buffer</strong>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-800/80">
              Source: {water.source}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
