import React from 'react';
import { MapLayerConfig } from '../../types';
import {
  Layers,
  Eye,
  EyeOff,
  Sliders,
  X,
  Thermometer,
  TreePine,
  Building,
  Car,
  Factory,
  Server,
  Users,
  Wind,
  Target,
} from 'lucide-react';

interface LayerControlPanelProps {
  isOpen: boolean;
  onClose: () => void;
  layers: MapLayerConfig[];
  onToggleLayer: (layerId: string) => void;
  onChangeOpacity: (layerId: string, opacity: number) => void;
}

export const LayerControlPanel: React.FC<LayerControlPanelProps> = ({
  isOpen,
  onClose,
  layers,
  onToggleLayer,
  onChangeOpacity,
}) => {
  if (!isOpen) return null;

  const categories = [
    'Thermal & Weather',
    'Surface & Land-Use',
    'Anthropogenic',
    'Planning & Action',
  ] as const;

  return (
    <div className="fixed top-16 right-0 bottom-0 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-md border-l border-slate-800 shadow-2xl z-30 flex flex-col overflow-hidden">
      {/* Panel Header */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-sm text-slate-100">GIS Layer Management</h3>
          <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
            {layers.filter((l) => l.active).length} Active
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Layer List Grouped by Category */}
      <div className="p-4 overflow-y-auto space-y-6 flex-1 text-xs">
        {categories.map((category) => {
          const categoryLayers = layers.filter((l) => l.category === category);
          if (categoryLayers.length === 0) return null;

          return (
            <div key={category} className="space-y-2.5">
              <span className="font-mono text-[10px] uppercase font-bold text-slate-400 tracking-wider block border-b border-slate-800/80 pb-1">
                {category}
              </span>

              <div className="space-y-2">
                {categoryLayers.map((layer) => (
                  <div
                    key={layer.id}
                    className={`p-2.5 rounded-xl border transition-all ${
                      layer.active
                        ? 'bg-slate-950/90 border-emerald-500/40 shadow-sm'
                        : 'bg-slate-950/40 border-slate-800/70 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-slate-200">{layer.label}</span>
                      <button
                        onClick={() => onToggleLayer(layer.id)}
                        className={`p-1 rounded transition ${
                          layer.active
                            ? 'text-emerald-400 hover:text-emerald-300'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                        title={layer.active ? 'Hide Layer' : 'Show Layer'}
                      >
                        {layer.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>

                    <p className="text-[10px] text-slate-400 leading-snug mb-2">
                      {layer.description}
                    </p>

                    {/* Opacity Slider */}
                    {layer.active && (
                      <div className="space-y-1 pt-1.5 border-t border-slate-800/80">
                        <div className="flex justify-between text-[10px] font-mono text-slate-400">
                          <span>Layer Opacity</span>
                          <span>{Math.round(layer.opacity * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="1.0"
                          step="0.05"
                          value={layer.opacity}
                          onChange={(e) => onChangeOpacity(layer.id, parseFloat(e.target.value))}
                          className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
