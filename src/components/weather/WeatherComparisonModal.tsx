import React, { useState, useEffect } from 'react';
import {
  WeatherComparisonResult,
  ProviderComparisonField,
} from '../../types';
import { fetchWeatherComparison } from '../../services/weatherApi';
import {
  X,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  ExternalLink,
  Loader2,
  Scale,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

interface WeatherComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  latitude: number;
  longitude: number;
  locationName: string;
}

export const WeatherComparisonModal: React.FC<WeatherComparisonModalProps> = ({
  isOpen,
  onClose,
  latitude,
  longitude,
  locationName,
}) => {
  const [data, setData] = useState<WeatherComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const controller = new AbortController();

    fetchWeatherComparison(latitude, longitude, controller.signal)
      .then((res) => {
        if (isMounted) {
          setData(res);
        }
      })
      .catch((err) => {
        if (isMounted && err.name !== 'AbortError') {
          setError(err.message || 'Failed to compare weather providers');
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [isOpen, latitude, longitude]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto no-scrollbar ring-1 ring-white/10 select-text">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 text-teal-400 border border-teal-500/30">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  Multi-Provider Weather Comparison Mode
                </h3>
                <span className="text-[10px] font-mono bg-teal-500/15 text-teal-300 px-2 py-0.5 rounded-full border border-teal-500/30 font-bold">
                  Cross-Verification
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {locationName} · {latitude.toFixed(4)}°N, {longitude.toFixed(4)}°E
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-teal-400 animate-spin mx-auto" />
            <div className="text-sm font-semibold text-slate-200">
              Querying Open-Meteo & WeatherAPI providers...
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Synchronizing numerical weather prediction models and atmospheric telemetry
            </p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs font-mono space-y-2">
            <div className="flex items-center space-x-2 font-bold text-rose-200">
              <AlertTriangle className="w-4 h-4" />
              <span>Comparison Query Failed</span>
            </div>
            <p>{error}</p>
          </div>
        ) : data ? (
          <div className="space-y-5">
            {/* Provider Status Banners */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Primary Provider */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Primary: {data.primary.name}</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/80">
                    Live Active
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 space-y-0.5">
                  <div>Timestamp: <strong className="text-slate-300">{data.primary.data?.current.observedAt || 'Current'}</strong></div>
                  <div>Timezone: <strong className="text-slate-300">{data.primary.data?.location.timezone || 'UTC'}</strong></div>
                  <div>Status: <strong className="text-emerald-400">NOAA GFS / ECMWF IFS 0.1° High-Res Grid</strong></div>
                </div>
              </div>

              {/* Secondary Provider */}
              <div className={`p-3.5 rounded-xl bg-slate-950 border space-y-1.5 ${
                data.secondary.configured ? 'border-teal-500/40' : 'border-slate-800'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                    {data.secondary.configured ? (
                      <CheckCircle2 className="w-4 h-4 text-teal-400" />
                    ) : (
                      <Info className="w-4 h-4 text-amber-400" />
                    )}
                    <span>Secondary: {data.secondary.name}</span>
                  </span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                    data.secondary.configured
                      ? 'text-teal-400 bg-teal-950/60 border-teal-800/80'
                      : 'text-amber-400 bg-amber-950/60 border-amber-800/80'
                  }`}>
                    {data.secondary.configured ? 'Live Comparison' : 'Optional Provider'}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 space-y-0.5">
                  {data.secondary.configured ? (
                    <>
                      <div>Timestamp: <strong className="text-slate-300">{data.secondary.data?.current.observedAt || 'Current'}</strong></div>
                      <div>Timezone: <strong className="text-slate-300">{data.secondary.data?.location.timezone || 'UTC'}</strong></div>
                      <div>Status: <strong className="text-teal-400">WeatherAPI.com Feed Active</strong></div>
                    </>
                  ) : (
                    <div>
                      Configure <code className="text-amber-300">WEATHERAPI_KEY</code> in server environment variables to unlock real-time side-by-side verification with WeatherAPI.com.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Scientific Consensus Evaluation Callout */}
            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed space-y-1">
              <span className="font-bold text-white flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>Consensus & Uncertainty Evaluation:</span>
              </span>
              <p>{data.evaluationSummary}</p>
            </div>

            {/* Side-by-Side Comparison Table */}
            <div className="rounded-xl border border-slate-800 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                      <th className="p-3 font-bold">Metric</th>
                      <th className="p-3 font-bold text-emerald-400">Open-Meteo (GFS/ECMWF)</th>
                      <th className="p-3 font-bold text-teal-400">WeatherAPI.com</th>
                      <th className="p-3 font-bold text-slate-400">Delta / Consensus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                    {data.fields.map((f, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition">
                        <td className="p-3 text-slate-300 font-bold whitespace-nowrap">
                          {f.label}
                        </td>
                        <td className="p-3 text-white font-black whitespace-nowrap">
                          {f.primaryValue !== null && f.primaryValue !== undefined
                            ? `${f.primaryValue} ${f.unit}`.trim()
                            : 'N/A'}
                        </td>
                        <td className="p-3 text-teal-300 font-semibold whitespace-nowrap">
                          {f.secondaryValue !== null && f.secondaryValue !== undefined
                            ? `${f.secondaryValue} ${f.unit}`.trim()
                            : 'Not Configured'}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          {f.delta ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                              {f.delta} {f.unit}
                            </span>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Licensing & Terms Disclosures */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] font-mono text-slate-400 space-y-1">
              <div className="text-slate-300 font-bold">Official Attribution & Licensing Notes:</div>
              <div>• <strong>Primary:</strong> {data.attribution.primary} (<a href="https://open-meteo.com/en/terms" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline">Terms</a>)</div>
              <div>• <strong>Secondary:</strong> {data.attribution.secondary} (<a href="https://www.weatherapi.com/terms.aspx" target="_blank" rel="noopener noreferrer" className="text-teal-400 underline">Terms</a>)</div>
              <div className="text-slate-500 pt-1">
                Neither provider claims 100% microclimatic accuracy. Discrepancies between physical station thermometers and numerical weather models typically stem from station sensor height, elevation gradients, and urban canopy shading.
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
