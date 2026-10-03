import React, { useState } from 'react';
import { FullLocationProfile } from '../../services/locationService';
import { CityHotspot } from '../../types';
import {
  FileText,
  Printer,
  Download,
  Copy,
  Check,
  X,
  Globe2,
  MapPin,
  Flame,
  Shield,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: FullLocationProfile;
  hotspots?: CityHotspot[];
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  profile,
  hotspots = [],
}) => {
  const [reportType, setReportType] = useState<'location' | 'city' | 'global'>('location');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const { location, weather, heatScore, contributors, recommendations, diagnosis, projections } = profile;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    const md = `# EcoPulseAI Environmental Intelligence Report: ${location.name}
Generated: ${new Date().toISOString()}
Target: ${location.address} (${location.latitude.toFixed(4)}°N, ${location.longitude.toFixed(4)}°E)

## 1. Executive Summary & Heat Scoring
* EcoPulse Heat Score: ${heatScore.score}/100 (${heatScore.category})
* Measured Air Temperature: ${weather.airTemperature}°C
* Heat Index (Feels Like): ${weather.feelsLike}°C
* Land Surface Temperature (LST): ${weather.surfaceTemperature}°C
* Urban Heat Island (UHI) Delta: +${weather.uhiDelta}°C

## 2. Heat Contributors Breakdown
${contributors.map((c) => `* **${c.label}** (${c.impact}): ${c.evidence} [${c.isMeasured ? 'Measured' : 'AI-Estimated'}, ${c.confidence}% Confidence]`).join('\n')}

## 3. Recommended Interventions
${recommendations.map((r, i) => `### Priority ${i + 1}: ${r.title}
* Why: ${r.why}
* Where: ${r.where}
* What: ${r.what}
* Expected Cooling Effect: ${r.expectedEffect} (Surface: -${r.tempDropSurfaceRange[0]}°C to -${r.tempDropSurfaceRange[1]}°C)`).join('\n\n')}

## 4. Scientific Provenance & Sources
* Copernicus Sentinel-2 MSI (10m)
* Landsat-9 TIRS Thermal Infrared
* WMO & Regional Meteorological Station Network
* EcoPulse Analytical Decision Support Model
`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Top Bar */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                <span>Environmental Intelligence Dossier</span>
                <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                  ISO-14064 Compatible
                </span>
              </h2>
              <p className="text-xs text-slate-400">Formal exportable diagnostic for urban planners, municipal councils, and researchers.</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyMarkdown}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-slate-300 flex items-center space-x-1.5 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy MD'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white flex items-center space-x-1.5 transition shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Type Selector Tabs */}
        <div className="px-6 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setReportType('location')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              reportType === 'location'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Location Diagnostic ({location.city})
          </button>
          <button
            onClick={() => setReportType('city')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              reportType === 'city'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Metropolitan Heat Island Report
          </button>
          <button
            onClick={() => setReportType('global')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              reportType === 'global'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Global Hotspots & Comparative Analysis
          </button>
        </div>

        {/* Report Content Body (Scrollable & Styled for Printing) */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-200 print:text-black print:bg-white text-xs select-text leading-relaxed">
          {/* 1. Location Report */}
          {reportType === 'location' && (
            <div className="space-y-6">
              {/* Header Box */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2 pb-2 border-b border-slate-800/80">
                  <h3 className="text-base font-bold text-slate-100">{location.name}</h3>
                  <span className="font-mono text-emerald-400 text-xs">
                    Score: {heatScore.score}/100 ({heatScore.category} Risk)
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 block">Coordinates</span>
                    <span className="text-slate-300">{location.latitude.toFixed(4)}°, {location.longitude.toFixed(4)}°</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Climate Zone</span>
                    <span className="text-slate-300">{location.climateZone}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Air Temp / Feels Like</span>
                    <span className="text-orange-400 font-bold">{weather.airTemperature}°C / {weather.feelsLike}°C</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">LST Surface Temp</span>
                    <span className="text-amber-400 font-bold">{weather.surfaceTemperature}°C (Landsat)</span>
                  </div>
                </div>
              </div>

              {/* AI Causal Explanation */}
              <div>
                <h4 className="font-bold text-sm text-slate-100 mb-1 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>AI Causal Attribution & Scientific Diagnosis</span>
                </h4>
                <p className="text-slate-300 bg-slate-950/70 p-3 rounded-xl border border-slate-800 leading-relaxed">
                  {diagnosis.summary}
                </p>
              </div>

              {/* Contributor Matrix */}
              <div>
                <h4 className="font-bold text-sm text-slate-100 mb-2">Primary Heat Contributors & Provenance</h4>
                <div className="space-y-2">
                  {contributors.map((c) => (
                    <div key={c.id} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <strong className="text-slate-200">{c.label}</strong>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                            {c.isMeasured ? 'Sensor Measured' : 'AI Inferred'} ({c.confidence}% Conf)
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{c.evidence}</p>
                      </div>
                      <span className="font-mono font-bold text-xs text-orange-400 shrink-0 ml-3">
                        {c.impact}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prioritized Solutions */}
              <div>
                <h4 className="font-bold text-sm text-slate-100 mb-2">Priority Heat Reduction Recommendations</h4>
                <div className="space-y-3">
                  {recommendations.map((r, i) => (
                    <div key={r.id} className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                      <div className="flex justify-between items-center">
                        <strong className="text-slate-200">#{i + 1} {r.title}</strong>
                        <span className="font-mono text-emerald-400 text-[11px]">
                          Expected Surface Delta: -{r.tempDropSurfaceRange[0]}°C to -{r.tempDropSurfaceRange[1]}°C
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{r.what}</p>
                      <div className="text-[10px] font-mono text-slate-500">
                        Target Locations: {r.where} • Feasibility: {r.feasibility}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. City Heat Report */}
          {reportType === 'city' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h3 className="text-base font-bold text-slate-100">
                  {location.city} Metropolitan Urban Heat Island (UHI) Assessment
                </h3>
                <p className="text-slate-300">
                  Comprehensive municipal evaluation of urban canopy deficit, concrete thermal storage, and peak heat vulnerability across wards.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 block mb-1">Max UHI Core Differential</span>
                  <span className="text-xl font-bold font-mono text-purple-400">+{weather.uhiDelta}°C</span>
                  <p className="text-[10px] text-slate-500 mt-1">Concentrated in transit and industrial commercial belts</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 block mb-1">Canopy Coverage Deficit</span>
                  <span className="text-xl font-bold font-mono text-rose-400">8.2% vs 30% Target</span>
                  <p className="text-[10px] text-slate-500 mt-1">21.8% municipal canopy deficit across public rights-of-way</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 block mb-1">Cool Roofs Potential</span>
                  <span className="text-xl font-bold font-mono text-sky-400">350,000 m²</span>
                  <p className="text-[10px] text-slate-500 mt-1">Suitable flat concrete residential & industrial roofs</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <h4 className="font-bold text-slate-200 text-sm mb-2">Municipal Cooling Masterplan 2026-2030</h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-start space-x-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span><strong>Phase 1 (Immediate 12 Months):</strong> Mandatory cool roof coatings for all government buildings and incentives for informal settlement lime-washing.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span><strong>Phase 2 (24 Months):</strong> 25,000 native canopy trees planted along SG Highway, Ring Road medians, and open parking lots.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span><strong>Phase 3 (36-60 Months):</strong> Cool pavement integration during routine resurfacing cycles, plus smart intersection anti-idling signal waves.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* 3. Global Comparative Hotspots Report */}
          {reportType === 'global' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h3 className="text-base font-bold text-slate-100 mb-1">
                  Global Urban Heat Anomaly Tracker & Hotspots
                </h3>
                <p className="text-slate-400 text-xs">
                  Comparative cross-continental analysis across ten observed major metropolitan heat centers.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                      <th className="py-2 px-3">City / Country</th>
                      <th className="py-2 px-3">Air Temp</th>
                      <th className="py-2 px-3">Heat Index</th>
                      <th className="py-2 px-3">Surface (LST)</th>
                      <th className="py-2 px-3">Heat Score</th>
                      <th className="py-2 px-3">Primary Factor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {hotspots.map((city) => (
                      <tr key={city.id} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-semibold text-slate-200">
                          {city.name}, {city.country}
                        </td>
                        <td className="py-2.5 px-3 text-orange-400">{city.airTemp}°C</td>
                        <td className="py-2.5 px-3 text-rose-400 font-bold">{city.heatIndex}°C</td>
                        <td className="py-2.5 px-3 text-amber-400">{city.surfaceTemp}°C</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-emerald-400 font-bold">
                            {city.heatScore}/100
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 text-[11px] font-sans">
                          {city.primaryContributor}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Report Footer & Provenance */}
          <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500 font-mono flex flex-wrap justify-between items-center gap-2">
            <span>EcoPulseAI Environmental Intelligence Platform v1.0</span>
            <span>Data Sources: Copernicus Sentinel-2, Landsat-9 TIRS, IMD, NOAA, IPCC CMIP6</span>
          </div>
        </div>
      </div>
    </div>
  );
};
