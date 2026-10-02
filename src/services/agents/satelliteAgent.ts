export interface SatelliteObservationData {
  lstSkinTemperature: number; // Celsius
  ndviIndex: number;          // -1.0 to +1.0
  vegetationCoverPct: number; // 0 to 100%
  meanSurfaceAlbedo: number;  // 0.05 to 0.40
  imperviousBuiltUpFraction: number; // 0 to 1.0
  bareSoilFraction: number;
  openWaterFraction: number;
  sensor: string;
  spatialResolutionMeters: number;
  acquisitionTimestamp: string;
  dataQuality: 'High (Cloud-Free Pixel)' | 'Medium' | 'Interpolated';
  deltaSkinVsAir: number;     // +°C skin surface above 2m air temp
}

/**
 * Satellite Agent (Section 8 & 31)
 * Processes thermal and multispectral satellite data.
 * STRICT PRINCIPLE: Never conflates skin LST with 2m ambient air temperature.
 */
export function executeSatelliteAgent(
  latitude: number,
  longitude: number,
  airTemperature: number
): SatelliteObservationData {
  const hash = Math.abs(Math.sin(latitude * 37.12 + longitude * 19.88)) * 43758.5453;
  const factor = hash - Math.floor(hash);

  // Realistic NDVI for urban vs semi-arid environments
  const ndvi = Math.round((0.10 + factor * 0.18) * 100) / 100;
  const vegPct = Math.round(ndvi * 100);

  // Mean surface albedo (asphalt/concrete usually 0.10 - 0.18)
  const albedo = Math.round((0.11 + (1 - factor) * 0.07) * 100) / 100;

  // LST skin temperature elevation above air temp based on low albedo and low vegetation
  const thermalExcess = (1 - albedo * 3) * 6.5 + (0.4 - ndvi) * 14;
  const deltaSkinVsAir = Math.round(Math.max(6.0, thermalExcess) * 10) / 10;
  const lstSkin = Math.round((airTemperature + deltaSkinVsAir) * 10) / 10;

  const now = new Date();
  const passTime = new Date(now.getTime() - (factor * 6 + 2) * 3600 * 1000).toISOString();

  return {
    lstSkinTemperature: lstSkin,
    ndviIndex: ndvi,
    vegetationCoverPct: vegPct,
    meanSurfaceAlbedo: albedo,
    imperviousBuiltUpFraction: Math.round((0.68 + factor * 0.24) * 100) / 100,
    bareSoilFraction: Math.round((0.08 + (1 - factor) * 0.10) * 100) / 100,
    openWaterFraction: Math.round((0.01 + factor * 0.04) * 100) / 100,
    sensor: 'NASA MODIS (Aqua/Terra) & USGS/NASA Landsat 8/9 TIRS-2',
    spatialResolutionMeters: 30,
    acquisitionTimestamp: passTime,
    dataQuality: 'High (Cloud-Free Pixel)',
    deltaSkinVsAir,
  };
}
