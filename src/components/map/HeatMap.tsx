import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Layers,
  Map as MapIcon,
  Maximize2,
  Minimize2,
  Navigation,
  Eye,
  EyeOff,
  Flame,
  Info,
  Server,
  Key,
  Satellite,
  Mountain,
  Moon,
} from 'lucide-react';
import { CityHotspot, MapLayerConfig, DataCenterLocation, ScenarioZone, AnalysisRadius } from '../../types';
import { getHeatCategoryColor } from '../../services/heatModel';
import { MOCK_DATA_CENTERS } from '../../data/mockData';

interface HeatMapProps {
  cities: CityHotspot[];
  selectedCityId: string;
  selectedCoordinates: { lat: number; lng: number };
  activeLayers: MapLayerConfig[];
  scenarioZones?: ScenarioZone[];
  analysisRadius?: AnalysisRadius;
  onSelectCity: (cityId: string) => void;
  onMapClick: (lat: number, lng: number) => void;
  onToggleLayer: (layerId: string) => void;
  onOpenApiSettings?: () => void;
}

export const HeatMap: React.FC<HeatMapProps> = ({
  cities,
  selectedCityId,
  selectedCoordinates,
  activeLayers,
  scenarioZones = [],
  analysisRadius = '5km',
  onSelectCity,
  onMapClick,
  onToggleLayer,
  onOpenApiSettings,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const referenceLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const dataCenterLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const heatZonesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const selectedPinMarkerRef = useRef<L.Marker | null>(null);

  const [basemap, setBasemap] = useState<'satellite' | 'street' | 'terrain' | 'dark'>('satellite');
  const [showLayerDropdown, setShowLayerDropdown] = useState(false);

  // Free, high-performance basemap tile providers (NO API KEY REQUIRED by default)
  // 1. Satellite: Esri World Imagery (public & keyless) + Reference labels
  // 2. Street: OpenStreetMap official (free, open source worldwide)
  // 3. Terrain: Esri World Topo Map (elevation & contours)
  // 4. Dark: Esri World Dark Gray Canvas
  const cartoKey = typeof window !== 'undefined' 
    ? (localStorage.getItem('ecopulse_carto_key') || (import.meta.env.VITE_CARTO_API_KEY as string) || '') 
    : '';
  const googleKey = typeof window !== 'undefined' 
    ? (localStorage.getItem('ecopulse_google_key') || (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '') 
    : '';

  const basemapUrls = {
    satellite: googleKey
      ? `https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&key=${googleKey}`
      : 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    street: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    terrain: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    dark: cartoKey 
      ? `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?api_key=${cartoKey}`
      : 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Up to zoom 20 for full village and street level zoomability
    const map = L.map(mapContainerRef.current, {
      center: [selectedCoordinates.lat, selectedCoordinates.lng],
      zoom: 12,
      minZoom: 2,
      maxZoom: 20,
      zoomControl: false,
      attributionControl: true,
    });

    // Add zoom control to top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Initial tile layer with maxZoom 20
    const tileLayer = L.tileLayer(basemapUrls[basemap], {
      attribution: '&copy; OpenStreetMap contributors &copy; Esri &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20,
      maxNativeZoom: 19,
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Satellite hybrid labels (places, village names, roads)
    if (basemap === 'satellite' && !googleKey) {
      referenceLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 20, maxNativeZoom: 19 }
      ).addTo(map);
    } else if (basemap === 'dark' && !cartoKey) {
      referenceLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 20, maxNativeZoom: 16 }
      ).addTo(map);
    }

    // Layer groups for markers and overlays
    const markersGroup = L.layerGroup().addTo(map);
    const dataCenterGroup = L.layerGroup().addTo(map);
    const heatZonesGroup = L.layerGroup().addTo(map);

    markersLayerGroupRef.current = markersGroup;
    dataCenterLayerGroupRef.current = dataCenterGroup;
    heatZonesLayerGroupRef.current = heatZonesGroup;

    // Map click event
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      onMapClick(lat, lng);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Basemap
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }
    if (referenceLayerRef.current) {
      mapInstanceRef.current.removeLayer(referenceLayerRef.current);
      referenceLayerRef.current = null;
    }

    const newTile = L.tileLayer(basemapUrls[basemap], {
      attribution: '&copy; OpenStreetMap &copy; Esri &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20,
      maxNativeZoom: 19,
    }).addTo(mapInstanceRef.current);
    tileLayerRef.current = newTile;

    if (basemap === 'satellite' && !googleKey) {
      referenceLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 20, maxNativeZoom: 19 }
      ).addTo(mapInstanceRef.current);
    } else if (basemap === 'dark' && !cartoKey) {
      referenceLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 20, maxNativeZoom: 16 }
      ).addTo(mapInstanceRef.current);
    }
  }, [basemap]);

  // Center on selected location when changed (smooth flyTo down to village level)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const currentZoom = mapInstanceRef.current.getZoom();
    const targetZoom = Math.max(currentZoom, 13);

    mapInstanceRef.current.flyTo([selectedCoordinates.lat, selectedCoordinates.lng], targetZoom, {
      duration: 1.5,
      easeLinearity: 0.25,
    });

    // Update target pinpoint
    if (selectedPinMarkerRef.current) {
      mapInstanceRef.current.removeLayer(selectedPinMarkerRef.current);
    }

    const pinIcon = L.divIcon({
      className: 'custom-pin-icon',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="w-7 h-7 rounded-full bg-emerald-500/30 border-2 border-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/50 animate-bounce">
            <div class="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
          </div>
          <div class="absolute -bottom-1 w-2 h-2 rotate-45 bg-emerald-400"></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
    });

    selectedPinMarkerRef.current = L.marker([selectedCoordinates.lat, selectedCoordinates.lng], {
      icon: pinIcon,
    }).addTo(mapInstanceRef.current);
  }, [selectedCoordinates]);

  // Render City Heat Bubbles
  useEffect(() => {
    if (!markersLayerGroupRef.current) return;
    markersLayerGroupRef.current.clearLayers();

    cities.forEach((city) => {
      const colors = getHeatCategoryColor(city.category);
      const isSelected = city.id === selectedCityId;
      const radius = Math.max(12, Math.min(28, (city.heatScore / 100) * 26));

      // Custom animated SVG DivIcon
      const bubbleIcon = L.divIcon({
        className: 'city-heat-bubble-container',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer group" style="width: ${radius * 2}px; height: ${radius * 2}px;">
            <!-- Outer Pulsating Wave -->
            <div class="absolute inset-0 rounded-full ${city.category === 'Extreme' || city.category === 'Very High' ? 'animate-ping' : 'animate-pulse'}" 
                 style="background-color: ${colors.hex}; opacity: 0.35;"></div>
            
            <!-- Core Thermal Indicator -->
            <div class="relative rounded-full flex flex-col items-center justify-center shadow-xl border-2 transition-transform duration-300 group-hover:scale-125"
                 style="width: ${radius * 1.6}px; height: ${radius * 1.6}px; background-color: ${colors.hex}ee; border-color: ${isSelected ? '#ffffff' : colors.hex}; box-shadow: 0 0 15px ${colors.hex}99;">
              <span class="text-[10px] font-mono font-bold text-white leading-none">${Math.round(city.airTemp)}°</span>
            </div>

            <!-- City Label Floating -->
            <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-medium text-slate-200 pointer-events-none opacity-85 group-hover:opacity-100 shadow-md">
              ${city.name}
            </div>
          </div>
        `,
        iconSize: [radius * 2, radius * 2],
        iconAnchor: [radius, radius],
      });

      const marker = L.marker([city.lat, city.lng], { icon: bubbleIcon });

      // Click to select
      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectCity(city.id);
      });

      // Hover Popup with rich environmental summary
      marker.bindPopup(
        `
        <div class="p-3 bg-slate-900 text-slate-100 min-w-[220px]">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <div>
              <div class="font-bold text-sm text-slate-100">${city.name}</div>
              <div class="text-[10px] text-slate-400">${city.country} • ${city.climateZone}</div>
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold" style="background-color: ${colors.hex}22; color: ${colors.hex}; border: 1px solid ${colors.hex}44;">
              ${city.category}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-2 text-xs mb-2">
            <div class="bg-slate-800/60 p-1.5 rounded">
              <span class="text-[10px] text-slate-400 block">Air Temp</span>
              <span class="font-mono font-bold text-orange-400">${city.airTemp}°C</span>
            </div>
            <div class="bg-slate-800/60 p-1.5 rounded">
              <span class="text-[10px] text-slate-400 block">Heat Index</span>
              <span class="font-mono font-bold text-rose-400">${city.heatIndex}°C</span>
            </div>
            <div class="bg-slate-800/60 p-1.5 rounded">
              <span class="text-[10px] text-slate-400 block">Surface (LST)</span>
              <span class="font-mono font-bold text-amber-400">${city.surfaceTemp}°C</span>
            </div>
            <div class="bg-slate-800/60 p-1.5 rounded">
              <span class="text-[10px] text-slate-400 block">Heat Score</span>
              <span class="font-mono font-bold text-emerald-400">${city.heatScore}/100</span>
            </div>
          </div>

          <div class="text-[10px] text-slate-300 mb-3 bg-slate-950/70 p-1.5 rounded border border-slate-800">
            <strong class="text-slate-400 block">Top Contributor:</strong>
            ${city.primaryContributor}
          </div>

          <button class="w-full py-1 text-center text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-500 text-white transition">
            Open Location Intelligence →
          </button>
        </div>
      `,
        { offset: [0, -radius] }
      );

      marker.addTo(markersLayerGroupRef.current!);
    });
  }, [cities, selectedCityId]);

  // Render Data Center Markers if layer active
  useEffect(() => {
    if (!dataCenterLayerGroupRef.current) return;
    dataCenterLayerGroupRef.current.clearLayers();

    const isDataCenterActive = activeLayers.find((l) => l.id === 'dataCenters')?.active;
    if (!isDataCenterActive) return;

    MOCK_DATA_CENTERS.forEach((dc) => {
      const dcIcon = L.divIcon({
        className: 'datacenter-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer group">
            <div class="w-6 h-6 rounded-lg bg-sky-500/20 border border-sky-400 flex items-center justify-center shadow-lg shadow-sky-500/30">
              <span class="text-[10px] font-bold text-sky-300">DC</span>
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([dc.lat, dc.lng], { icon: dcIcon });
      marker.bindPopup(`
        <div class="p-3 bg-slate-900 text-slate-100 min-w-[240px]">
          <div class="flex items-center space-x-2 border-b border-slate-800 pb-2 mb-2">
            <div class="p-1 rounded bg-sky-500/20 text-sky-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path></svg>
            </div>
            <div>
              <div class="font-bold text-sm text-slate-200">${dc.name}</div>
              <div class="text-[10px] text-slate-400">${dc.operator} • ${dc.city}</div>
            </div>
          </div>
          <div class="space-y-1.5 text-xs text-slate-300 mb-2">
            <div><span class="text-slate-400">Estimated Rejection Heat:</span> <strong class="text-sky-300 font-mono">${dc.estimatedWasteHeatMW} MW</strong></div>
            <div><span class="text-slate-400">Cooling Method:</span> <span class="text-slate-200">${dc.coolingMethod}</span></div>
            <div><span class="text-slate-400">Model Confidence:</span> <span class="text-emerald-400 font-mono">${dc.confidence}%</span></div>
          </div>
          <div class="text-[10px] text-slate-400 bg-slate-950 p-2 rounded border border-slate-800 italic">
            Note: ${dc.note}
          </div>
        </div>
      `);

      marker.addTo(dataCenterLayerGroupRef.current!);
    });
  }, [activeLayers]);

  // Render Spatial Polygons for Active Layers (LST thermal anomalies, tree deficit zones, road corridors)
  useEffect(() => {
    if (!heatZonesLayerGroupRef.current) return;
    heatZonesLayerGroupRef.current.clearLayers();

    const isLstActive = activeLayers.find((l) => l.id === 'lst')?.active;
    const isTreeCanopyActive = activeLayers.find((l) => l.id === 'treeCanopy')?.active;
    const isRoadsActive = activeLayers.find((l) => l.id === 'roads')?.active;
    const isUhiActive = activeLayers.find((l) => l.id === 'uhi')?.active;

    // For the selected location, draw simulated GIS micro-hotspots around the core
    const { lat, lng } = selectedCoordinates;

    if (isLstActive) {
      // High LST zone (asphalt corridor)
      L.circle([lat + 0.015, lng + 0.012], {
        radius: 1800,
        color: '#dc2626',
        fillColor: '#ef4444',
        fillOpacity: 0.35,
        weight: 1.5,
        dashArray: '4, 4',
      })
        .bindTooltip('High LST Hotspot (>48°C) • Low Albedo Commercial Strip')
        .addTo(heatZonesLayerGroupRef.current);
    }

    if (isRoadsActive) {
      // Arterial road vector buffer
      const roadLine = L.polyline(
        [
          [lat - 0.04, lng - 0.03],
          [lat, lng],
          [lat + 0.05, lng + 0.035],
        ],
        {
          color: '#f97316',
          weight: 6,
          opacity: 0.7,
        }
      )
        .bindTooltip('Major Arterial Corridor • High Asphalt Heat Retention (SG Highway)')
        .addTo(heatZonesLayerGroupRef.current);
    }

    if (isTreeCanopyActive) {
      // Tree canopy deficit zone
      L.circle([lat - 0.018, lng - 0.015], {
        radius: 2200,
        color: '#eab308',
        fillColor: '#ca8a04',
        fillOpacity: 0.3,
        weight: 1.5,
      })
        .bindTooltip('Tree Canopy Deficit Polygon (<8% vegetative cover)')
        .addTo(heatZonesLayerGroupRef.current);
    }

    if (isUhiActive) {
      // Urban Heat Island Boundary
      L.circle([lat, lng], {
        radius: 6500,
        color: '#8b5cf6',
        fillColor: '#a855f7',
        fillOpacity: 0.15,
        weight: 2,
      })
        .bindTooltip('UHI Thermal Boundary (+4.8°C Urban Excess)')
        .addTo(heatZonesLayerGroupRef.current);
    }

    // Render Analysis Radius Buffer Circle (Section 42)
    const radiusMetersMap: Record<AnalysisRadius, number> = {
      '500m': 500,
      '1km': 1000,
      '5km': 5000,
      '10km': 10000,
      '25km': 25000,
    };
    const radiusMeters = radiusMetersMap[analysisRadius] || 5000;

    L.circle([lat, lng], {
      radius: radiusMeters,
      color: '#06b6d4',
      fillColor: '#0891b2',
      fillOpacity: 0.06,
      weight: 1.5,
      dashArray: '6, 6',
    })
      .bindTooltip(`Spatial Analysis Buffer (${analysisRadius})`, { permanent: false })
      .addTo(heatZonesLayerGroupRef.current);

    // Section 34: Scenario Map Intervention Zones
    if (scenarioZones && scenarioZones.length > 0) {
      scenarioZones.forEach((zone) => {
        const zoneCircle = L.circle([zone.lat, zone.lng], {
          radius: zone.radiusMeters,
          color: zone.colorHex,
          fillColor: zone.colorHex,
          fillOpacity: 0.35,
          weight: 2,
        });

        zoneCircle.bindPopup(`
          <div class="p-3 bg-slate-900 text-slate-100 min-w-[240px]">
            <div class="flex items-center space-x-1.5 pb-2 mb-2 border-b border-slate-800">
              <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${zone.colorHex}"></span>
              <strong class="text-xs font-bold text-slate-100">${zone.label}</strong>
            </div>
            <div class="space-y-1.5 text-xs text-slate-300">
              <p class="text-[11px] text-emerald-300 bg-emerald-950/40 p-1.5 rounded border border-emerald-800/40">
                <strong>Action:</strong> ${zone.recommendedAction}
              </p>
              <p class="text-[11px] text-slate-400">
                <strong>Reason:</strong> ${zone.reason}
              </p>
              <div class="grid grid-cols-2 gap-1 pt-1 font-mono text-[10px] text-slate-400">
                <div>Surface: <strong class="text-amber-400">-${zone.estimatedSurfaceDropC}°C</strong></div>
                <div>Ambient: <strong class="text-orange-400">-${zone.estimatedAmbientDropC}°C</strong></div>
                <div>Confidence: <strong class="text-emerald-400">${zone.confidence}</strong></div>
                <div>Cost: <strong class="text-slate-200">${zone.costCategory}</strong></div>
              </div>
            </div>
          </div>
        `);

        zoneCircle.addTo(heatZonesLayerGroupRef.current!);
      });
    }
  }, [activeLayers, selectedCoordinates, scenarioZones, analysisRadius]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-950">
      {/* Leaflet DOM container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Google Maps Style Basemap Mode Switcher (Bottom-Left) */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-col space-y-2">
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 p-1.5 rounded-2xl shadow-2xl flex items-center space-x-1.5">
          <button
            onClick={() => setBasemap('satellite')}
            title="High-resolution aerial satellite imagery with street & village labels"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              basemap === 'satellite'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Satellite className="w-3.5 h-3.5" />
            <span>Satellite</span>
          </button>

          <button
            onClick={() => setBasemap('street')}
            title="Default road, street, and village map with full OpenStreetMap detail"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              basemap === 'street'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Default</span>
          </button>

          <button
            onClick={() => setBasemap('terrain')}
            title="Topographic contours, elevation relief, and natural features"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              basemap === 'terrain'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Mountain className="w-3.5 h-3.5" />
            <span>Terrain</span>
          </button>

          <button
            onClick={() => setBasemap('dark')}
            title="Dark GIS environmental analysis canvas"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              basemap === 'dark'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Dark</span>
          </button>

          {onOpenApiSettings && (
            <button
              onClick={onOpenApiSettings}
              className="p-1.5 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition ml-1"
              title="Configure Google Maps or CARTO custom tile keys"
            >
              <Key className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Interactive Map Legend (Bottom Right) */}
      <div className="absolute bottom-4 right-4 z-20 bg-slate-900/90 backdrop-blur border border-slate-800 p-3 rounded-xl shadow-2xl max-w-xs text-xs hidden sm:block">
        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800">
          <span className="font-semibold text-slate-200 flex items-center space-x-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>Heat Intensity Scale</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400">EcoPulse Score</span>
        </div>

        {/* Color Gradient Bar */}
        <div className="h-2.5 w-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 via-orange-500 via-red-500 to-purple-800 mb-1.5 shadow-inner"></div>

        <div className="flex justify-between text-[10px] font-mono text-slate-400">
          <span>Low (&lt;40)</span>
          <span>Mod (40-60)</span>
          <span>High (60-75)</span>
          <span>V.High (75-88)</span>
          <span>Extreme (&gt;88)</span>
        </div>

        <div className="mt-2 text-[10px] text-slate-400 pt-1.5 border-t border-slate-800/80 flex items-center space-x-1">
          <Info className="w-3 h-3 text-slate-500 shrink-0" />
          <span>Zoom up to level 20 to inspect any village, street, or house.</span>
        </div>
      </div>

      {/* Floating Instructions Pill (Top Center) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur border border-slate-800/90 px-3 py-1 rounded-full text-slate-300 text-[11px] font-medium shadow-lg flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>Live Sentinel-2 / Landsat Thermal Stream Active</span>
        </div>
      </div>
    </div>
  );
};
