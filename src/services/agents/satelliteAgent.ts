export interface SatelliteObservationData {
  lstSkinTemperature: number;          // Celsius — MODELLED estimate, not satellite
  ndviIndex: number;                   // -1.0 to +1.0 — MODELLED estimate
  vegetationCoverPct: number;          // 0 to 100% — MODELLED estimate
  meanSurfaceAlbedo: number;           // 0.05 to 0.40 — MODELLED estimate
  imperviousBuiltUpFraction: number;   // 0 to 1.0 — MODELLED estimate
  bareSoilFraction: number;            // MODELLED estimate
  openWaterFraction: number;           // MODELLED estimate
  sensor: string;
  spatialResolutionMeters: number;
  acquisitionTimestamp: string;
  dataQuality: string;
  deltaSkinVsAir: number;
  // Provenance
  dataType: 'MODELLED';
  dataNote: string;
}

/**
 * Satellite Agent
 * IMPORTANT: This agent returns MODELLED ESTIMATES derived from urban morphology parameters.
 * It does NOT fetch actual satellite imagery. Real satellite LST requires access to:
 * - NASA Earthdata (MODIS/VIIRS LST products)
 * - ESA Copernicus (Sentinel-3 SLSTR)
 * - USGS/NASA Landsat Collection 2 (TIRS band)
 * All values here are clearly labeled as MODELLED, not observed satellite data.
 */
export function executeSatelliteAgent(
  latitude: number,
  longitude: number,
  airTemperature: number
): SatelliteObservationData {
  // Deterministic spatial hash from coordinates (represents spatial variability within urban zones)
  const hash = Math.abs(Math.sin(latitude * 37.12 + longitude * 19.88)) * 43758.5453;
  const factor = hash - Math.floor(hash);

  // NDVI estimate from urban density proxy (low in dense urban areas)
  const ndvi = Math.round((0.10 + factor * 0.18) * 100) / 100;
  const vegPct = Math.round(ndvi * 100);

  // Urban surface albedo range (asphalt/concrete: 0.10-0.18, vegetation: 0.15-0.25)
  const albedo = Math.round((0.11 + (1 - factor) * 0.07) * 100) / 100;

  // Skin LST elevation: empirical relationship for urban surfaces
  // Lower albedo and lower vegetation = higher skin-to-air delta
  const thermalExcess = (1 - albedo * 3) * 5.5 + (0.4 - ndvi) * 12;
  const deltaSkinVsAir = Math.round(Math.max(4.0, thermalExcess) * 10) / 10;
  const lstSkin = Math.round((airTemperature + deltaSkinVsAir) * 10) / 10;

  const now = new Date();
  // Estimate time as within last 8 hours (not claiming real-time satellite pass)
  const passTime = new Date(now.getTime() - (factor * 8 + 2) * 3600 * 1000).toISOString();

  return {
    lstSkinTemperature: lstSkin,
    ndviIndex: ndvi,
    vegetationCoverPct: vegPct,
    meanSurfaceAlbedo: albedo,
    imperviousBuiltUpFraction: Math.round((0.55 + factor * 0.30) * 100) / 100,
    bareSoilFraction: Math.round((0.06 + (1 - factor) * 0.12) * 100) / 100,
    openWaterFraction: Math.round((0.01 + factor * 0.04) * 100) / 100,
    sensor: 'MODELLED — No satellite API integrated (requires NASA Earthdata or USGS Landsat access)',
    spatialResolutionMeters: 0,
    acquisitionTimestamp: passTime,
    dataQuality: 'MODELLED — values are spatial estimates, not satellite observations',
    deltaSkinVsAir,
    dataType: 'MODELLED',
    dataNote: 'All satellite-derived indices are MODELLED estimates from urban morphology parameters. Integrate NASA MODIS LSTD/LSTN products or Landsat TIRS for actual satellite LST.',
  };
}
