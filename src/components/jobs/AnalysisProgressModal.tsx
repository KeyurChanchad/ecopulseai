import React from 'react';
import { AnalysisJob, JobStepProgress } from '../../types';
import {
  Loader2,
  CheckCircle2,
  Circle,
  AlertCircle,
  Cpu,
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
  X,
  Layers,
  Brain,
  Minimize2,
} from 'lucide-react';

interface AnalysisProgressModalProps {
  job: AnalysisJob | null;
  isOpen: boolean;
  onClose: () => void;
  onViewResults: () => void;
}

export const AnalysisProgressModal: React.FC<AnalysisProgressModalProps> = ({
  job,
  isOpen,
  onClose,
  onViewResults,
}) => {
  if (!isOpen || !job) return null;

  const isCompleted = job.status === 'COMPLETED';
  const isFailed = job.status === 'FAILED';

  const completedStepsCount = job.stepList.filter((s) => s.status === 'completed').length;
  const totalSteps = job.stepList.length;
  const progressPercent = Math.round((completedStepsCount / totalSteps) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden select-text">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                  Dynamic Analysis Job
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-800 border border-slate-700 text-slate-300">
                  {job.jobId}
                </span>
              </div>
              <h2 className="text-lg font-extrabold text-slate-100 flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-orange-400" />
                <span>{job.locationName}</span>
                <span className="text-xs text-slate-400 font-normal">
                  ({(job.radius / 1000).toFixed(1)} km radius)
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase ${
                isCompleted
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : isFailed
                  ? 'bg-rose-950 text-rose-400 border border-rose-800'
                  : 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse'
              }`}
            >
              {job.status.replace('_', ' ')}
            </span>
            {isCompleted && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-5 pt-4 pb-2">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-slate-400 font-medium">Investigation Pipeline</span>
            <span className="font-mono font-bold text-emerald-400">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-orange-500 transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Dynamic Investigation Steps Checklist (Section 35) */}
        <div className="p-5 space-y-3 max-h-[55vh] overflow-y-auto">
          {job.stepList.map((step) => {
            const isStepRunning = step.status === 'running';
            const isStepDone = step.status === 'completed';
            const isStepFailed = step.status === 'failed';

            return (
              <div
                key={step.key}
                className={`p-3 rounded-xl border transition-all ${
                  isStepRunning
                    ? 'bg-emerald-950/20 border-emerald-500/50 shadow-sm'
                    : isStepDone
                    ? 'bg-slate-950/60 border-slate-800/80'
                    : 'bg-slate-950/20 border-slate-800/40 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5">
                      {isStepDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : isStepRunning ? (
                        <Loader2 className="w-4 h-4 text-orange-400 animate-spin shrink-0" />
                      ) : isStepFailed ? (
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                      )}
                    </div>
                    <div>
                      <p
                        className={`text-xs font-semibold ${
                          isStepDone
                            ? 'text-slate-200'
                            : isStepRunning
                            ? 'text-emerald-300 font-bold'
                            : 'text-slate-400'
                        }`}
                      >
                        {step.label}
                      </p>
                      {step.detail && (
                        <p className="text-[11px] font-mono text-emerald-400/90 mt-0.5">
                          ↳ {step.detail}
                        </p>
                      )}
                    </div>
                  </div>

                  {step.timestamp && (
                    <span className="text-[10px] font-mono text-slate-500 shrink-0">
                      {step.timestamp}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span>
              {isCompleted
                ? 'All specialist agents completed analysis successfully'
                : 'EcoPulse multi-agent team investigating evidence...'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {isCompleted ? (
              <button
                onClick={() => {
                  onClose();
                  onViewResults();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20 transition flex items-center space-x-1.5"
              >
                <span>View Full Intelligence Report</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              >
                Run in Background
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
