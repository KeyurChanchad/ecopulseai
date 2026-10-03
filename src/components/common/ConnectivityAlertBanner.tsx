import React, { useState } from 'react';
import { WifiOff, ServerCrash, RefreshCw, Terminal, AlertTriangle, X, CheckCircle2 } from 'lucide-react';
import { useConnectionStatus } from '../../services/connectionManager';

export const ConnectivityAlertBanner: React.FC = () => {
  const { isOnline, isBackendConnected, checking, recheck, error } = useConnectionStatus();
  const [isDismissed, setIsDismissed] = useState(false);

  // If everything is healthy, don't show the banner
  if (isOnline && isBackendConnected) {
    return null;
  }

  // If user dismissed it and nothing changed, allow collapse into a compact warning chip
  if (isDismissed) {
    return (
      <div className="fixed top-16 right-4 z-50">
        <button
          onClick={() => setIsDismissed(false)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-950/80 backdrop-blur-md border border-rose-500/40 text-rose-300 text-xs shadow-lg hover:bg-rose-900/90 transition"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span>{!isOnline ? 'Offline' : 'Backend Disconnected'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-r from-rose-950/90 via-amber-950/80 to-rose-950/90 border-b border-rose-500/30 backdrop-blur-md px-4 py-2.5 text-white transition-all duration-300 shadow-xl relative z-40">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-400 shrink-0 mt-0.5 sm:mt-0">
            {!isOnline ? (
              <WifiOff className="w-4 h-4 animate-pulse" />
            ) : (
              <ServerCrash className="w-4 h-4 animate-bounce" />
            )}
          </div>

          <div>
            <div className="font-semibold text-rose-200 flex items-center gap-2">
              {!isOnline
                ? 'No Internet Connection Detected'
                : 'EcoPulseAI Node.js Backend Server Offline (Port 5001)'}
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-rose-500/20 border border-rose-500/30 text-rose-300">
                {!isOnline ? 'Offline Mode' : 'AI Offline'}
              </span>
            </div>
            <p className="text-rose-300/80 text-xs mt-0.5">
              {!isOnline
                ? 'EcoPulseAI requires an active internet connection to query live Open-Meteo weather and satellite telemetry.'
                : 'The Express + AI reasoning engine is not responding. Live coordinate investigation and dynamic cause discovery require the server.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          {isOnline && !isBackendConnected && (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/40 border border-white/10 font-mono text-[11px] text-emerald-400">
              <Terminal className="w-3 h-3 text-emerald-400" />
              <span>npm run dev</span>
            </div>
          )}

          <button
            onClick={() => recheck()}
            disabled={checking}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 font-medium text-xs transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Checking...' : 'Retry Connection'}</span>
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded-md text-rose-400 hover:text-white hover:bg-white/10 transition"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
