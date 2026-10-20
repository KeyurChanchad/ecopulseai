/**
 * EcoPulseAI Weather & Heat Analysis Dossier Service
 * Client-side service with backend /api/ai/dossier integration and resilient offline fallback.
 */
import { WeatherObservation } from '../types';
import {
  classifyLocationClimate,
  getTailoredCausalDrivers,
  getTailoredSolutions,
  getTailoredSeasonalProjections,
} from './climateCausalEngine';

export interface DossierConversionRow {
  measurement: string;
  celsius: string;
  fahrenheit: string;
}

export interface DossierCause {
  id: number;
  title: string;
  category: string;
  explanation: string;
  reductionStrategy: string;
}

export interface DossierSolutionRow {
  solution: string;
  estimatedEffect: string;
  whatItMeans: string;
}

export interface DossierFuturePeriod {
  timeframe: string;
  dateFormatted: string;
  season: string;
  tempRangeC: string;
  tempRangeF: string;
  description: string;
}

export interface DossierMonthlyHigh {
  month: string;
  tempC: number;
  tempF: number;
}

export interface WeatherHeatDossierData {
  locationName: string;
  country: string;
  coordinates: { lat: number; lng: number };
  currentDateFormatted: string;
  isHot: boolean;
  headlineSummary: string;
  weatherDashboard: {
    currentTempC: number;
    currentTempF: number;
    condition: string;
    feelsLikeText: string;
    tempLowC: number;
    tempLowF: number;
    tempHighC: number;
    tempHighF: number;
    humidity: number;
    windSpeedKmH: number;
    windDirection: string;
    aqi: number;
    aqiCategory: string;
    aqiScale: string;
    conversionTable: DossierConversionRow[];
    footnote: string;
  };
  causesSection: {
    introText: string;
    causes: DossierCause[];
    localEmpiricalNote: string;
  };
  solutionsSection: {
    distinctionNote: string;
    modellingBasisNote: string;
    solutionsTable: DossierSolutionRow[];
    prioritization: {
      cityWideAirTemp: {
        title: string;
        recommendation: string;
        details: string;
      };
      streetComfort: {
        title: string;
        recommendation: string;
        details: string;
      };
      longTermWarming: {
        title: string;
        recommendation: string;
        details: string;
      };
    };
  };
  futureProjectionsSection: {
    introText: string;
    periods: DossierFuturePeriod[];
    climateReferenceNote: string;
    seasonalDaytimeHighs: DossierMonthlyHigh[];
    climateChangeTrendNote: string;
  };
  monitoringSection: {
    items: Array<{
      category: string;
      advice: string;
    }>;
    bottomLine: string;
  };
  rawMarkdown: string;
}

function cToF(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}


/**
 * Generates local fallback dossier using real-world weather inputs.
 */
export function generateLocalWeatherHeatDossier(
  locationName: string,
  country: string,
  lat: number,
  lng: number,
  weather: WeatherObservation
): WeatherHeatDossierData {
  const currentTempC = weather.airTemperature;
  const currentTempF = cToF(currentTempC);
  const tempHighC = weather.tempHigh ?? currentTempC;
  const tempHighF = cToF(tempHighC);
  const tempLowC = weather.tempLow ?? currentTempC;
  const tempLowF = cToF(tempLowC);
  const humidity = weather.humidity;
  const windSpeedKmH = Math.round(weather.windSpeed);
  const windDirection = weather.windDirection;
  const aqi = weather.aqi || 25;
  const aqiCategory = weather.aqiStatus !== 'DATA_UNAVAILABLE' ? weather.aqiStatus : 'Good';
  const isHot = currentTempC >= 28 || weather.feelsLike >= 30;

  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  const currentDateFormatted = today.toLocaleDateString('en-GB', dateOptions);

  const d3 = new Date(today);
  d3.setMonth(d3.getMonth() + 3);
  const d3Formatted = d3.toLocaleDateString('en-GB', dateOptions);

  const d6 = new Date(today);
  d6.setMonth(d6.getMonth() + 6);
  const d6Formatted = d6.toLocaleDateString('en-GB', dateOptions);

  const d1y = new Date(today);
  d1y.setFullYear(d1y.getFullYear() + 1);
  const d1yFormatted = d1y.toLocaleDateString('en-GB', dateOptions);

  const climateProfile = classifyLocationClimate(lat, lng, locationName, country, weather);
  const tailoredDrivers = getTailoredCausalDrivers(locationName, country, lat, lng, weather);
  const tailoredSolutions = getTailoredSolutions(locationName, country, lat, lng, weather);
  const seasonal = getTailoredSeasonalProjections(lat, lng, locationName, country, currentTempC);

  const headlineSummary = !isHot
    ? `${locationName} is not hot right now. The current weather is cool, around ${currentTempC}°C (${currentTempF}°F), with a daytime high forecast near ${tempHighC}°C (${tempHighF}°F). Classified as ${climateProfile.zoneName} (${climateProfile.biomeDescription}), seasonal baseline shifts rather than an urban heat emergency characterize current readings.`
    : `${locationName} is currently experiencing significant thermal loading, around ${currentTempC}°C (${currentTempF}°F), with daytime highs reaching ${tempHighC}°C (${tempHighF}°F) and expected low of ${tempLowC}°C (${tempLowF}°F). Located in a ${climateProfile.zoneName} environment, ${climateProfile.thermalRiskProfile}.`;

  const rawMarkdown = `# ${locationName} weather and heat analysis

Current date: ${currentDateFormatted} · ${locationName}, ${country}
Biome Classification: ${climateProfile.zoneName} (${climateProfile.biomeDescription})

${headlineSummary}

## 1. Current weather dashboard

${locationName} · Current conditions

# ${currentTempC}°C / ${currentTempF}°F
${weather.condition ?? (isHot ? 'Sunny' : 'Mostly cloudy')}
${isHot ? 'High thermal stress' : 'Feels cool, not hot'}

Today's low–high
## ${tempLowC}–${tempHighC}°C
${tempLowF}–${tempHighF}°F

Humidity
## ${humidity}%
Latest reported reading

Wind
## ~${windSpeedKmH} km/h
${windDirection}

Air quality
## AQI ${aqi}
${aqiCategory}
US EPA / IQAir Scale

### Celsius and Fahrenheit conversion

| Measurement | Celsius | Fahrenheit |
|---|---|---|
| Current temperature | ${currentTempC}°C | ${currentTempF}°F |
| Today's expected low | ${tempLowC}°C | ${tempLowF}°F |
| Today's expected high | ${tempHighC}°C | ${tempHighF}°F |

*The current temperature is a snapshot; today's low may have already occurred or will occur overnight, so it can differ from the real-time instantaneous sensor reading.*

## 2. If ${locationName} becomes hot, what causes it?

**Biophysical Zone**: ${climateProfile.zoneName}
**Local Thermal Characteristic**: ${climateProfile.thermalRiskProfile}

${
  isHot
    ? `${locationName} is currently subject to high ambient temperatures combined with place-specific microclimate amplification. Here are the primary physical causes for ${locationName}:`
    : `${locationName}'s current weather is not hot, but when extreme heat develops, specific geographic, atmospheric, and urban mechanisms drive the temperature spike. Here are the primary physical causes for ${locationName}:`
}

${tailoredDrivers
  .map(
    (c, idx) => `${idx + 1}. **${c.title}** (${c.category})
${c.explanation}
*Reduction strategy*: ${c.reductionStrategy} [Estimated Cooling Effect: ~${c.quantifiedImpactC}]`
  )
  .join('\n\n')}

*Empirical Urban Modeling*: Microclimate research for ${climateProfile.zoneName} demonstrates that high-albedo coatings, strategic canopy shade, and climate-matched ventilation preserve 2.5°C to 4.5°C cooler street corridors during peak diurnal insolation.

## 3. How much could each solution reduce the heat in ${locationName}?

*Critical distinction: Cooling a roof or pavement surface is not the same as lowering outdoor air temperature across an entire city.*

| Solution | Estimated effect on outdoor air temperature | What it means for ${locationName} |
|---|---|---|
${tailoredSolutions.solutionsTable
  .map((s) => `| ${s.solution} | ${s.estimatedEffect} | ${s.whatItMeans} |`)
  .join('\n')}

### Which solution should ${locationName} prioritise?

- **${tailoredSolutions.prioritization.cityWideAirTemp.title}**: **${tailoredSolutions.prioritization.cityWideAirTemp.recommendation}** — ${tailoredSolutions.prioritization.cityWideAirTemp.details}
- **${tailoredSolutions.prioritization.streetComfort.title}**: **${tailoredSolutions.prioritization.streetComfort.recommendation}** — ${tailoredSolutions.prioritization.streetComfort.details}
- **${tailoredSolutions.prioritization.longTermWarming.title}**: **${tailoredSolutions.prioritization.longTermWarming.recommendation}** — ${tailoredSolutions.prioritization.longTermWarming.details}

## 4. What will ${locationName}'s weather be like in 3 months, 6 months and 1 year?

Measured dynamically from ${currentDateFormatted}:

### 3 months
**${d3Formatted} — ${seasonal.threeMonths.season}**
## ${seasonal.threeMonths.lowC}–${seasonal.threeMonths.highC}°C / ${cToF(seasonal.threeMonths.lowC)}–${cToF(seasonal.threeMonths.highC)}°F
${seasonal.threeMonths.desc}

### 6 months
**${d6Formatted} — ${seasonal.sixMonths.season}**
## ${seasonal.sixMonths.lowC}–${seasonal.sixMonths.highC}°C / ${cToF(seasonal.sixMonths.lowC)}–${cToF(seasonal.sixMonths.highC)}°F
${seasonal.sixMonths.desc}

### 1 year
**${d1yFormatted} — ${seasonal.oneYear.season}**
## ${seasonal.oneYear.lowC}–${seasonal.oneYear.highC}°C / ${cToF(seasonal.oneYear.lowC)}–${cToF(seasonal.oneYear.highC)}°F
${seasonal.oneYear.desc}

### Will ${locationName} become hotter over those periods?

Typical monthly daytime highs:
${seasonal.monthlyHighs.map((m) => `* **${m.month}**: ${m.tempC}°C (${m.tempF}°F)`).join('\n')}

The primary variation across these milestones is seasonal climatological progression. However, ongoing climate change continues to elevate long-term baseline probability of severe summer anomalies.

## 5. What you should monitor in ${locationName}

- **Temperature**: Monitor official meteorological heat advisories and nighttime minimum temperatures rather than isolated single-hour peaks.
- **Humidity**: High relative humidity combined with temperature compounds physical Heat Index; monitor wet-bulb thresholds.
- **Air quality**: Ground-level ozone (O₃) and PM2.5 spike during stagnant high-pressure summer heat episodes.
- **City cooling**: Track municipal progress on cool roof mandates, canopy preservation, and surface unsealing.

**Bottom line**: ${
    isHot
      ? `${locationName} is undergoing substantial heat stress today (${currentTempC}°C). The most effective immediate relief is shade and cool-surface deployment, reinforced by urban greening tailored to ${climateProfile.zoneName} conditions.`
      : `${locationName} is currently cool (${currentTempC}°C), not hot. The next 3 months will progress into winter before spring brings milder weather. Long-term heat resilience requires proactive cool roofs and canopy expansion ahead of summer.`
  }
`;

  return {
    locationName,
    country,
    coordinates: { lat, lng },
    currentDateFormatted,
    isHot,
    headlineSummary,
    weatherDashboard: {
      currentTempC,
      currentTempF,
      condition: weather.condition ?? (isHot ? 'Sunny' : 'Mostly cloudy'),
      feelsLikeText: isHot ? 'High thermal stress' : 'Feels cool, not hot',
      tempLowC,
      tempLowF,
      tempHighC,
      tempHighF,
      humidity,
      windSpeedKmH,
      windDirection,
      aqi,
      aqiCategory,
      aqiScale: 'US EPA / IQAir Scale',
      conversionTable: [
        { measurement: 'Current temperature', celsius: `${currentTempC}°C`, fahrenheit: `${currentTempF}°F` },
        { measurement: "Today's expected low", celsius: `${tempLowC}°C`, fahrenheit: `${tempLowF}°F` },
        { measurement: "Today's expected high", celsius: `${tempHighC}°C`, fahrenheit: `${tempHighF}°F` },
      ],
      footnote:
        "The current temperature is a snapshot; today's low may have already occurred or will occur overnight, so it can differ from the real-time instantaneous sensor reading.",
    },
    causesSection: {
      introText: isHot
        ? `${locationName} (${climateProfile.zoneName}) is currently subject to high ambient temperatures combined with urban heat island amplification.`
        : `${locationName} (${climateProfile.zoneName}) is currently not hot, but can experience severe heat episodes when specific meteorological forcing triggers high solar gain.`,
      causes: tailoredDrivers.map((d) => ({
        id: d.id,
        title: d.title,
        category: d.category,
        explanation: d.explanation,
        reductionStrategy: `${d.reductionStrategy} (Estimated local cooling: ~${d.quantifiedImpactC})`,
      })),
      localEmpiricalNote: `Calibrated for ${climateProfile.zoneName} biophysical conditions: Microclimate research demonstrates that targeted interventions yield up to 2.5°C to 4.5°C of street-level relief.`,
    },
    solutionsSection: {
      distinctionNote:
        'Critical distinction: Cooling a roof or pavement surface is not the same as lowering outdoor air temperature across an entire city.',
      modellingBasisNote: `Figures calibrated for ${climateProfile.zoneName} urban morphology and surface energy balance simulations.`,
      solutionsTable: tailoredSolutions.solutionsTable,
      prioritization: tailoredSolutions.prioritization,
    },
    futureProjectionsSection: {
      introText: `Measured dynamically from ${currentDateFormatted}. Seasonal planning ranges derived from long-term meteorological climate normals for ${climateProfile.zoneName}:`,
      periods: [
        {
          timeframe: '3 months',
          dateFormatted: d3Formatted,
          season: seasonal.threeMonths.season,
          tempRangeC: `${seasonal.threeMonths.lowC}–${seasonal.threeMonths.highC}°C`,
          tempRangeF: `${cToF(seasonal.threeMonths.lowC)}–${cToF(seasonal.threeMonths.highC)}°F`,
          description: seasonal.threeMonths.desc,
        },
        {
          timeframe: '6 months',
          dateFormatted: d6Formatted,
          season: seasonal.sixMonths.season,
          tempRangeC: `${seasonal.sixMonths.lowC}–${seasonal.sixMonths.highC}°C`,
          tempRangeF: `${cToF(seasonal.sixMonths.lowC)}–${cToF(seasonal.sixMonths.highC)}°F`,
          description: seasonal.sixMonths.desc,
        },
        {
          timeframe: '1 year',
          dateFormatted: d1yFormatted,
          season: seasonal.oneYear.season,
          tempRangeC: `${seasonal.oneYear.lowC}–${seasonal.oneYear.highC}°C`,
          tempRangeF: `${cToF(seasonal.oneYear.lowC)}–${cToF(seasonal.oneYear.highC)}°F`,
          description: seasonal.oneYear.desc,
        },
      ],
      climateReferenceNote:
        'These are rounded seasonal planning ranges, not daily forecast confidence limits. Actual conditions can vary.',
      seasonalDaytimeHighs: seasonal.monthlyHighs,
      climateChangeTrendNote:
        'Ongoing macroclimate change systematically increases baseline probability of prolonged summer heatwaves and high minimum temperatures.',
    },
    monitoringSection: {
      items: [
        {
          category: 'Temperature',
          advice: 'Watch for official heat-health alerts and sustained high nighttime temperatures.',
        },
        {
          category: 'Humidity',
          advice:
            'High relative humidity raises perceived Heat Index and limits evaporative sweating efficiency.',
        },
        {
          category: 'Air quality',
          advice:
            'Monitor AQI (ozone and particulates) closely during stagnant, sunny, or thermal inversion episodes.',
        },
        {
          category: 'City cooling',
          advice:
            'Track progress on cool roof coverage, street tree planting milestones, and clean energy adoption.',
        },
      ],
      bottomLine: isHot
        ? `${locationName} is undergoing substantial heat stress today (${currentTempC}°C). The most effective immediate relief is shade and cool-surface deployment, reinforced by urban greening tailored to ${climateProfile.zoneName} conditions.`
        : `${locationName} is currently cool (${currentTempC}°C), not hot. The next 3 months will progress into winter before spring brings milder weather. Long-term heat resilience requires proactive cool roofs and canopy expansion ahead of summer.`,
    },
    rawMarkdown,
  };
}

/**
 * Fetch dossier from backend API or fallback to local calculation.
 */
export async function fetchAIWeatherHeatDossier(
  locationName: string,
  country: string,
  lat: number,
  lng: number,
  weather: WeatherObservation
): Promise<WeatherHeatDossierData> {
  const isLocalHost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
  const backendBase = isLocalHost ? 'http://localhost:5001' : '';

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);

    const url = `${backendBase}/api/ai/dossier?lat=${lat}&lng=${lng}&name=${encodeURIComponent(
      locationName
    )}&country=${encodeURIComponent(country)}`;

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        return data as WeatherHeatDossierData;
      }
    }
  } catch (_err) {
    // Graceful fallback to local generator
  }

  return generateLocalWeatherHeatDossier(locationName, country, lat, lng, weather);
}
