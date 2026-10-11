export interface MultiScaleGISAnalysis {
  scale500m: {
    buildingFootprintPct: number;
    roadSurfacePct: number;
    canopyCoveragePct: number;
    parkingLotsCount: number;
    pedestrianExposureIndex: number;
    immediateHeatTrapRisk: 'Low' | 'Moderate' | 'High' | 'Severe';
  };
  scale1km: {
    builtDensityPct: number;
    imperviousFractionPct: number;
    arterialCorridorCount: number;
    commercialFractionPct: number;
    vegetationDeficitPct: number;
  };
  scale5km: {
    industrialClusterPresent: boolean;
    majorHighwaysCount: number;
    waterBodiesDistanceKm: number;
    waterSurfaceCoveragePct: number;
    urbanHeatIslandCoreOffsetKm: number;
    regionalTopography: string;
  };
  landUseCategory: 'High-Density Commercial' | 'Urban Residential' | 'Industrial Mixed' | 'Transit Corridor' | 'Suburban / Open';
  // Provenance
  dataType: 'MODELLED';
  dataSource: string;
  dataNote: string;
}

/**
 * GIS Agent
 * IMPORTANT: Returns MODELLED ESTIMATES of urban morphology.
 * This agent does NOT query real GIS datasets (no OpenStreetMap Overpass API,
 * no Copernicus CORINE land cover, no NLCD). All values are coordinate-based estimates.
 *
 * For real GIS data, integrate:
 * - OpenStreetMap Overpass API (building/road geometry)
 * - Copernicus CORINE Land Cover (Europe)
 * - NLCD (USA)
 * - ESA World Cover 10m (global)
 */
export function executeGISAgent(
  latitude: number,
  longitude: number,
  radiusMeters: number
): MultiScaleGISAnalysis {
  // Deterministic spatial hash from coordinates
  const hash = Math.abs(Math.sin(latitude * 12.9898 + longitude * 78.233)) * 43758.5453;
  const factor = hash - Math.floor(hash);

  // Urban intensity approximation
  const absLat = Math.abs(latitude);
  const isUrban = absLat > 10 && absLat < 62;
  const isArid = absLat >= 15 && absLat <= 35 && (Math.abs(longitude) > 30 || longitude > 50);

  // Micro scale (500m) — MODELLED
  const bldg500 = isUrban ? Math.round(30 + factor * 40) : Math.round(5 + factor * 15);
  const road500 = isUrban ? Math.round(18 + (1 - factor) * 22) : Math.round(4 + factor * 8);
  const canopy500 = isArid
    ? Math.max(2, Math.round(4 + factor * 6))
    : Math.max(3, Math.round(20 - bldg500 * 0.2 + factor * 8));
  const parking500 = Math.round(2 + factor * 5);
  const trapRisk: 'Low' | 'Moderate' | 'High' | 'Severe' =
    bldg500 + road500 > 75 ? 'Severe' : bldg500 + road500 > 60 ? 'High' : bldg500 + road500 > 45 ? 'Moderate' : 'Low';

  // Meso scale (1km) — MODELLED
  const built1km = isUrban ? Math.round(40 + factor * 30) : Math.round(8 + factor * 15);
  const impervious1km = Math.min(95, Math.round(bldg500 + road500 + factor * 10));
  const arterial1km = Math.round(2 + factor * 4);
  const vegDeficit1km = Math.min(95, Math.max(20, Math.round(100 - canopy500 * 2)));

  // Macro scale (5km) — MODELLED
  const industrial5km = factor > 0.4 && isUrban;
  const highways5km = isUrban ? Math.round(2 + factor * 4) : Math.round(1 + factor * 2);
  const waterDist = Math.round((0.8 + (1 - factor) * 5) * 10) / 10;
  const waterPct = Math.round(Math.max(0.3, 5.0 - waterDist * 0.8) * 10) / 10;

  let landUse: MultiScaleGISAnalysis['landUseCategory'] = 'Urban Residential';
  if (!isUrban) landUse = 'Suburban / Open';
  else if (bldg500 > 65) landUse = 'High-Density Commercial';
  else if (industrial5km && factor > 0.6) landUse = 'Industrial Mixed';
  else if (road500 > 35) landUse = 'Transit Corridor';

  return {
    scale500m: {
      buildingFootprintPct: bldg500,
      roadSurfacePct: road500,
      canopyCoveragePct: canopy500,
      parkingLotsCount: parking500,
      pedestrianExposureIndex: Math.round((bldg500 * 0.4 + road500 * 0.6) * 10) / 10,
      immediateHeatTrapRisk: trapRisk,
    },
    scale1km: {
      builtDensityPct: built1km,
      imperviousFractionPct: Math.min(95, impervious1km),
      arterialCorridorCount: arterial1km,
      commercialFractionPct: Math.round(factor * 45),
      vegetationDeficitPct: Math.min(95, Math.max(20, vegDeficit1km)),
    },
    scale5km: {
      industrialClusterPresent: industrial5km,
      majorHighwaysCount: highways5km,
      waterBodiesDistanceKm: waterDist,
      waterSurfaceCoveragePct: waterPct,
      urbanHeatIslandCoreOffsetKm: Math.round(factor * 2.5 * 10) / 10,
      regionalTopography: isArid
        ? 'Arid Plain / Desert Basin'
        : 'Alluvial Urban Plain with Moderate Aerodynamic Roughness',
    },
    landUseCategory: landUse,
    // Provenance
    dataType: 'MODELLED',
    dataSource: 'EcoPulseAI Urban Morphology Model (coordinate-based estimate)',
    dataNote: 'All GIS values are MODELLED ESTIMATES derived from urban typology and coordinate-based algorithms. NOT fetched from OpenStreetMap, Copernicus CORINE, NLCD, or ESA World Cover. Integrate real GIS APIs for accurate land-use data.',
  };
}
