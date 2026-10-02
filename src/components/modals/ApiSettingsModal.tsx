import React, { useState, useEffect } from 'react';
import {
  Key,
  X,
  Check,
  AlertCircle,
  ShieldCheck,
  Globe2,
  ExternalLink,
  Layers,
  HelpCircle,
  Save,
  RotateCcw,
} from 'lucide-react';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeysUpdated: () => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  onKeysUpdated,
}) => {
  const [cartoKey, setCartoKey] = useState('');
  const [googleKey, setGoogleKey] = useState('');
  const [openWeatherKey, setOpenWeatherKey] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCartoKey(localStorage.getItem('ecopulse_carto_key') || (import.meta.env.VITE_CARTO_API_KEY as string) || '');
      setGoogleKey(localStorage.getItem('ecopulse_google_key') || (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '');
      setOpenWeatherKey(localStorage.getItem('ecopulse_openweather_key') || (import.meta.env.VITE_OPENWEATHER_API_KEY as string) || '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem('ecopulse_carto_key', cartoKey.trim());
    localStorage.setItem('ecopulse_google_key', googleKey.trim());
    localStorage.setItem('ecopulse_openweather_key', openWeatherKey.trim());
    setSavedSuccess(true);
    onKeysUpdated();
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleClearAll = () => {
    localStorage.removeItem('ecopulse_carto_key');
    localStorage.removeItem('ecopulse_google_key');
    localStorage.removeItem('ecopulse_openweather_key');
    setCartoKey('');
    setGoogleKey('');
    setOpenWeatherKey('');
    onKeysUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden select-text">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center space-x-2">
                <span>API Keys & Map Provider Settings</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Optional
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Configure custom tile providers or external live meteorological APIs.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs leading-relaxed">
          {/* Important Clarification Banner */}
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 space-y-2">
            <div className="flex items-center space-x-2 font-bold text-emerald-300 text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Good News: No API Key is Required by Default!</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              The watermark <strong className="text-white">"API KEY REQUIRED carto.com/basemaps/apikey"</strong> was from the third-party CARTO tile server. We have switched the default map to <strong className="text-white">Esri World Dark Gray Canvas</strong> and <strong className="text-white">OpenStreetMap</strong>, which are <strong>100% free and work out-of-the-box with NO watermark and NO key required</strong>!
            </p>
          </div>

          {/* Question Breakdown Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="font-bold text-sm text-slate-200 flex items-center space-x-1.5">
              <HelpCircle className="w-4 h-4 text-sky-400" />
              <span>Answers to Common Questions:</span>
            </h4>
            <div className="space-y-2 text-slate-300">
              <div>
                <strong className="text-slate-100">1. Is it a Google Maps API?</strong>
                <p className="text-slate-400 mt-0.5">
                  No. The watermark in the screenshot was from <strong>CARTO</strong> (<code className="text-orange-300">carto.com</code>), an independent mapping service. Google Maps is a separate commercial provider.
                </p>
              </div>
              <div>
                <strong className="text-slate-100">2. How to get a CARTO API key (if you want CARTO dark tiles)?</strong>
                <p className="text-slate-400 mt-0.5">
                  Sign up for free at <a href="https://carto.com/basemaps" target="_blank" rel="noreferrer" className="text-emerald-400 underline inline-flex items-center">carto.com/basemaps <ExternalLink className="w-2.5 h-2.5 ml-0.5" /></a>, generate a free public API key, and paste it below.
                </p>
              </div>
              <div>
                <strong className="text-slate-100">3. Where to insert a Google Maps API key?</strong>
                <p className="text-slate-400 mt-0.5">
                  If you have a Google Maps API Key from the <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" className="text-emerald-400 underline inline-flex items-center">Google Cloud Console <ExternalLink className="w-2.5 h-2.5 ml-0.5" /></a>, paste it into the <strong>Google Maps Key</strong> field below. EcoPulseAI will immediately load Google's Satellite/Hybrid tiles!
                </p>
              </div>
            </div>
          </div>

          {/* Custom API Key Input Fields */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-slate-200">Optional Custom API Keys</h4>

            {/* 1. CARTO Basemap Key */}
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-200 flex items-center space-x-2">
                  <Globe2 className="w-3.5 h-3.5 text-orange-400" />
                  <span>CARTO Basemaps Key</span>
                </label>
                <a
                  href="https://carto.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-emerald-400 hover:underline flex items-center space-x-1"
                >
                  <span>Get CARTO key</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <input
                type="text"
                value={cartoKey}
                onChange={(e) => setCartoKey(e.target.value)}
                placeholder="Paste CARTO API key (optional)..."
                className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 block">
                Leave blank to use the built-in free Esri Dark Canvas (no key needed).
              </span>
            </div>

            {/* 2. Google Maps API Key */}
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-200 flex items-center space-x-2">
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  <span>Google Maps API Key</span>
                </label>
                <a
                  href="https://console.cloud.google.com/google/maps-apis"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-emerald-400 hover:underline flex items-center space-x-1"
                >
                  <span>Google Cloud Console</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <input
                type="text"
                value={googleKey}
                onChange={(e) => setGoogleKey(e.target.value)}
                placeholder="AIzaSy... (optional for Google Satellite tiles)"
                className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 block">
                Enables official Google Satellite and Hybrid imagery. Leave blank to use free Esri satellite.
              </span>
            </div>

            {/* 3. OpenWeatherMap API Key */}
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-200 flex items-center space-x-2">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>OpenWeatherMap API Key</span>
                </label>
                <a
                  href="https://openweathermap.org/api"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-emerald-400 hover:underline flex items-center space-x-1"
                >
                  <span>Get OpenWeather key</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <input
                type="text"
                value={openWeatherKey}
                onChange={(e) => setOpenWeatherKey(e.target.value)}
                placeholder="Paste OpenWeather API key (optional)..."
                className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 block">
                Optional for live weather radar overlays. Built-in global stations are active by default.
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <button
            onClick={handleClearAll}
            className="px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition flex items-center space-x-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Free Defaults</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition flex items-center space-x-1.5 shadow"
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{savedSuccess ? 'Saved & Applied!' : 'Save & Reload Map'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
