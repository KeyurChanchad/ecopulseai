import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Thermometer,
  Wind,
  Droplets,
  Activity,
  Flame,
  Calendar,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import {
  WeatherHeatDossierData,
  fetchAIWeatherHeatDossier,
  generateLocalWeatherHeatDossier,
} from '../../services/aiDossierService';
import { WeatherObservation } from '../../types';

interface AiWeatherHeatDossierViewProps {
  locationName: string;
  country: string;
  latitude: number;
  longitude: number;
  weather: WeatherObservation;
  onOpenSimulator?: () => void;
  showCardWrapper?: boolean;
}

export const AiWeatherHeatDossierView: React.FC<AiWeatherHeatDossierViewProps> = ({
  locationName,
  country,
  latitude,
  longitude,
  weather,
  onOpenSimulator,
  showCardWrapper = true,
}) => {
  const [data, setData] = useState<WeatherHeatDossierData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'interactive' | 'markdown'>('interactive');

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const instantData = generateLocalWeatherHeatDossier(
      locationName,
      country,
      latitude,
      longitude,
      weather
    );
    setData(instantData);

    fetchAIWeatherHeatDossier(locationName, country, latitude, longitude, weather)
      .then((serverData) => {
        if (isMounted && serverData) {
          setData(serverData);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [locationName, country, latitude, longitude, weather]);

  if (!data) return null;

  const handleCopyMarkdown = () => {
    if (!data) return;
    navigator.clipboard.writeText(data.rawMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const {
    currentDateFormatted,
    headlineSummary,
    weatherDashboard,
    causesSection,
    solutionsSection,
    futureProjectionsSection,
    monitoringSection,
  } = data;

  const maxMonthlyTemp = Math.max(
    ...futureProjectionsSection.seasonalDaytimeHighs.map((m) => m.tempC),
    30
  );

  const containerClasses = showCardWrapper
    ? 'bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl space-y-8 select-text leading-relaxed text-slate-100'
    : 'space-y-8 select-text leading-relaxed text-slate-100';

  return (
    <div className={containerClasses}>
      {/* Dossier Control & Provenance Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-black text-white">
                {locationName} Weather & Heat Analysis
              </h2>
              <span className="text-[10px] font-mono uppercase bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                AI Synthesis
              </span>
              {isLoading && (
                <span className="flex items-center space-x-1 text-[11px] text-amber-400 font-mono">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="hidden sm:inline">Syncing live...</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Current date: {currentDateFormatted} · {locationName}, {country}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setActiveTab('interactive')}
              className={`px-2.5 py-1 rounded-md transition ${
                activeTab === 'interactive'
                  ? 'bg-slate-800 text-emerald-400 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Interactive Report
            </button>
            <button
              onClick={() => setActiveTab('markdown')}
              className={`px-2.5 py-1 rounded-md transition ${
                activeTab === 'markdown'
                  ? 'bg-slate-800 text-emerald-400 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Markdown View
            </button>
          </div>

          <button
            onClick={handleCopyMarkdown}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-slate-300 flex items-center space-x-1.5 transition"
            title="Copy full AI analysis as formatted Markdown"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {activeTab === 'markdown' ? (
        <div className="bg-slate-950 p-4 sm:p-6 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap select-text overflow-x-auto">
          {data.rawMarkdown}
        </div>
      ) : (
        <>
          {/* Executive Assessment Callout */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-300 leading-relaxed">
            <span className="font-bold text-white block mb-1">
              Executive Assessment:
            </span>
            {headlineSummary}
          </div>

          {/* ============================================================ */}
          {/* SECTION 1: CURRENT WEATHER DASHBOARD */}
          {/* ============================================================ */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
              <h3 className="text-lg font-black text-white flex items-center space-x-2">
                <span className="text-emerald-400">1.</span>
                <span>Current weather dashboard</span>
              </h3>
            </div>

            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-5 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-1 space-y-1">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                  {locationName} · Current conditions
                </span>
                <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                  {weatherDashboard.currentTempC}°C / {weatherDashboard.currentTempF}°F
                </div>
                <div className="text-sm font-semibold text-slate-300">
                  {weatherDashboard.condition}
                </div>
                <div className="text-xs text-slate-400">
                  {weatherDashboard.feelsLikeText}
                </div>
              </div>

              <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <span className="text-[11px] text-slate-400 font-mono flex items-center space-x-1">
                    <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                    <span>Today's low–high</span>
                  </span>
                  <div className="text-base sm:text-lg font-bold text-orange-300 font-mono mt-1">
                    {weatherDashboard.tempLowC}–{weatherDashboard.tempHighC}°C
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {weatherDashboard.tempLowF}–{weatherDashboard.tempHighF}°F
                  </div>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <span className="text-[11px] text-slate-400 font-mono flex items-center space-x-1">
                    <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Humidity</span>
                  </span>
                  <div className="text-base sm:text-lg font-bold text-cyan-300 font-mono mt-1">
                    {weatherDashboard.humidity}%
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Latest reported reading
                  </div>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <span className="text-[11px] text-slate-400 font-mono flex items-center space-x-1">
                    <Wind className="w-3.5 h-3.5 text-teal-400" />
                    <span>Wind</span>
                  </span>
                  <div className="text-base sm:text-lg font-bold text-teal-300 font-mono mt-1">
                    ~{weatherDashboard.windSpeedKmH} km/h
                  </div>
                  <div className="text-[10px] text-slate-400">
                    From {weatherDashboard.windDirection}
                  </div>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <span className="text-[11px] text-slate-400 font-mono flex items-center space-x-1">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Air quality</span>
                  </span>
                  <div className="text-base sm:text-lg font-bold text-emerald-300 font-mono mt-1 flex items-center space-x-1.5">
                    <span>AQI {weatherDashboard.aqi}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {weatherDashboard.aqiCategory}
                    </span>
                    <span className="text-[9px] text-slate-500">IQAir scale</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              {weatherDashboard.footnote}
            </p>

            <div className="space-y-2 pt-2">
              <h4 className="text-sm font-bold text-slate-200">
                Celsius and Fahrenheit conversion
              </h4>
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/70">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-3 font-semibold">Measurement</th>
                      <th className="p-3 font-semibold">Celsius</th>
                      <th className="p-3 font-semibold">Fahrenheit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {weatherDashboard.conversionTable.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/50 transition">
                        <td className="p-3 font-medium text-slate-300">{row.measurement}</td>
                        <td className="p-3 font-bold text-emerald-400">{row.celsius}</td>
                        <td className="p-3 font-bold text-teal-400">{row.fahrenheit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-slate-400">
                The current temperature is a snapshot; today's low may have already occurred, so it can be lower than the current reading.
              </p>
            </div>
          </section>

          {/* ============================================================ */}
          {/* SECTION 2: IF PLACE BECOMES HOT, WHAT CAUSES IT? */}
          {/* ============================================================ */}
          <section className="space-y-4">
            <div className="border-b border-slate-800 pb-2">
              <h3 className="text-lg font-black text-white flex items-center space-x-2">
                <span className="text-emerald-400">2.</span>
                <span>If {locationName} becomes hot, what causes it?</span>
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                {causesSection.introText}
              </p>
            </div>

            <div className="space-y-4">
              {causesSection.causes.map((cause) => (
                <div
                  key={cause.id}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition space-y-2.5"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                      {cause.id}
                    </div>
                    <h4 className="text-sm font-bold text-white tracking-wide">
                      {cause.title}
                    </h4>
                  </div>

                  <p className="text-xs text-slate-300 pl-10 leading-relaxed">
                    {cause.explanation}
                  </p>

                  <div className="ml-10 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 flex items-start space-x-2">
                    <span className="font-bold text-emerald-400 shrink-0">
                      Reduction strategy:
                    </span>
                    <span>{cause.reductionStrategy}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-400 flex items-start space-x-2.5">
              <Flame className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
              <span>{causesSection.localEmpiricalNote}</span>
            </div>
          </section>

          {/* ============================================================ */}
          {/* SECTION 3: HOW MUCH COULD EACH SOLUTION REDUCE THE HEAT? */}
          {/* ============================================================ */}
          <section className="space-y-4">
            <div className="border-b border-slate-800 pb-2">
              <h3 className="text-lg font-black text-white flex items-center space-x-2">
                <span className="text-emerald-400">3.</span>
                <span>How much could each solution reduce the heat?</span>
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                {solutionsSection.distinctionNote}
              </p>
              <p className="text-[11px] text-slate-400 italic mt-0.5">
                {solutionsSection.modellingBasisNote}
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/70">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3 font-semibold">Solution</th>
                    <th className="p-3 font-semibold">Estimated effect on outdoor air temperature</th>
                    <th className="p-3 font-semibold">What it means</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {solutionsSection.solutionsTable.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/50 transition">
                      <td className="p-3 font-semibold text-slate-200 whitespace-nowrap">
                        {row.solution}
                      </td>
                      <td className="p-3 font-bold text-emerald-400">
                        {row.estimatedEffect}
                      </td>
                      <td className="p-3 text-slate-300 font-sans text-xs">
                        {row.whatItMeans}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              These interventions were modelled separately. Their effects should not simply be added together to predict the exact temperature of a future season.
            </p>

            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-bold text-white">
                Which solution should {locationName} prioritise?
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1.5 flex flex-col justify-between">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{solutionsSection.prioritization.cityWideAirTemp.title}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-100">
                    {solutionsSection.prioritization.cityWideAirTemp.recommendation}
                  </div>
                  <p className="text-xs text-slate-400">
                    {solutionsSection.prioritization.cityWideAirTemp.details}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1.5 flex flex-col justify-between">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{solutionsSection.prioritization.streetComfort.title}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-100">
                    {solutionsSection.prioritization.streetComfort.recommendation}
                  </div>
                  <p className="text-xs text-slate-400">
                    {solutionsSection.prioritization.streetComfort.details}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1.5 flex flex-col justify-between">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{solutionsSection.prioritization.longTermWarming.title}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-100">
                    {solutionsSection.prioritization.longTermWarming.recommendation}
                  </div>
                  <p className="text-xs text-slate-400">
                    {solutionsSection.prioritization.longTermWarming.details}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* SECTION 4: WEATHER IN 3 MONTHS, 6 MONTHS AND 1 YEAR */}
          {/* ============================================================ */}
          <section className="space-y-4">
            <div className="border-b border-slate-800 pb-2">
              <h3 className="text-lg font-black text-white flex items-center space-x-2">
                <span className="text-emerald-400">4.</span>
                <span>What will {locationName}'s weather be like in 3 months, 6 months and 1 year?</span>
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                {futureProjectionsSection.introText}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {futureProjectionsSection.periods.map((period, idx) => (
                <div
                  key={idx}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-emerald-400 mb-1">
                      <span className="font-bold uppercase tracking-wider">{period.timeframe}</span>
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-xs font-medium text-slate-400 mb-2">
                      {period.dateFormatted} — <strong className="text-slate-200">{period.season}</strong>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-white font-mono">
                      {period.tempRangeC}
                    </div>
                    <div className="text-xs font-mono text-slate-400 mb-3">
                      {period.tempRangeF}
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-slate-800/80">
                    {period.description}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-400 italic">
              {futureProjectionsSection.climateReferenceNote}
            </p>

            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4 pt-4">
              <div>
                <h4 className="text-sm font-bold text-white">
                  Will {locationName} become hotter over those periods?
                </h4>
                <span className="text-xs text-slate-400 font-mono block">
                  Typical monthly daytime highs near {locationName} (Reference Climatology)
                </span>
              </div>

              <div className="pt-4 pb-2">
                <div className="grid grid-cols-4 gap-4 items-end h-44 border-b border-slate-800 px-4">
                  {futureProjectionsSection.seasonalDaytimeHighs.map((bar, idx) => {
                    const heightPct = Math.max(12, Math.round((bar.tempC / maxMonthlyTemp) * 100));
                    return (
                      <div key={idx} className="flex flex-col items-center h-full justify-end group">
                        <span className="text-[11px] font-mono font-bold text-slate-300 mb-1 group-hover:text-emerald-400 transition">
                          {bar.tempC}°C
                        </span>
                        <div
                          className="w-full max-w-[64px] bg-gradient-to-t from-blue-600 via-sky-500 to-emerald-400 rounded-t-lg transition-all duration-500 group-hover:brightness-125 shadow-md shadow-sky-950/50"
                          style={{ height: `${heightPct}%` }}
                        />
                        <span className="text-[11px] font-mono text-slate-400 mt-2 font-semibold">
                          {bar.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {futureProjectionsSection.climateChangeTrendNote}
              </p>
            </div>
          </section>

          {/* ============================================================ */}
          {/* SECTION 5: WHAT YOU SHOULD MONITOR & BOTTOM LINE */}
          {/* ============================================================ */}
          <section className="space-y-4">
            <div className="border-b border-slate-800 pb-2">
              <h3 className="text-lg font-black text-white flex items-center space-x-2">
                <span className="text-emerald-400">5.</span>
                <span>What you should monitor</span>
              </h3>
            </div>

            <div className="space-y-2.5">
              {monitoringSection.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start space-x-3"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <div className="text-xs leading-relaxed text-slate-300">
                    <strong className="text-white font-semibold mr-1.5">
                      {item.category}:
                    </strong>
                    <span>{item.advice}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/40 text-xs sm:text-sm text-slate-200 leading-relaxed shadow-lg">
              <span className="font-bold text-emerald-400 block mb-1 uppercase tracking-wider text-xs">
                Bottom line
              </span>
              {monitoringSection.bottomLine}
            </div>
          </section>
        </>
      )}
    </div>
  );
};
