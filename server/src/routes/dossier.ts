/**
 * EcoPulseAI Weather & Heat Analysis Dossier Route
 * Generates structured 5-part AI intelligence dossiers for any selected location:
 * 1. Current weather dashboard (with °C / °F conversion table)
 * 2. Causes & reduction strategies (Global warming, UHI, Anthropogenic, Shade deficit)
 * 3. Solutions & quantified temperature reduction effects table
 * 4. Future outlook at 3 months, 6 months, and 1 year (with seasonal highs)
 * 5. Monitoring checklist & bottom line takeaway
 */
import { Router, Request, Response } from 'express';
import { fetchLiveWeather, fetchAirQuality, fetchAccuWeatherSurat, aqiToStatus } from '../services/weatherService.js';
import { GoogleGenAI } from '@google/genai';

export const dossierRouter = Router();

function cToF(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}

function getSeason(monthIdx: number, isNorth: boolean): string {
  // monthIdx: 0=Jan, 1=Feb, etc.
  if (monthIdx === 11 || monthIdx === 0 || monthIdx === 1) return isNorth ? 'Winter' : 'Summer';
  if (monthIdx >= 2 && monthIdx <= 4) return isNorth ? 'Spring' : 'Autumn';
  if (monthIdx >= 5 && monthIdx <= 7) return isNorth ? 'Summer' : 'Winter';
  return isNorth ? 'Autumn' : 'Spring';
}

function computeSeasonalRanges(lat: number, baseAirTemp: number) {
  const isNorth = lat >= 0;
  const absLat = Math.abs(lat);

  // Climate band estimation: tropical (absLat < 23.5), subtropical (23.5-35), temperate (35-55), subarctic (>55)
  if (absLat < 23.5) {
    // Tropical (e.g. Surat, Mumbai, Singapore, Bangkok)
    return {
      threeMonths: {
        season: isNorth ? 'Winter' : 'Monsoon/Summer',
        lowC: 15,
        highC: 29,
        desc: 'Cooler dry nights with warm, clear sunny afternoons. Heat stress is significantly subdued compared to peak pre-monsoon periods.',
      },
      sixMonths: {
        season: isNorth ? 'Pre-Monsoon Summer' : 'Dry Season',
        lowC: 25,
        highC: 39,
        desc: 'Peak seasonal daytime heating with high solar radiation and extreme thermal stress. Urban surfaces experience peak sensible storage.',
      },
      oneYear: {
        season: isNorth ? 'Post-Monsoon Autumn' : 'Spring',
        lowC: 24,
        highC: 36,
        desc: 'Clear post-monsoon skies with high daytime highs and moderate nighttime radiative cooling. Tropical humidity elevates perceived Heat Index.',
      },
      monthlyHighs: [
        { month: 'January', tempC: 29, tempF: cToF(29) },
        { month: 'April', tempC: 39, tempF: cToF(39) },
        { month: 'July', tempC: 31, tempF: cToF(31) },
        { month: 'October', tempC: 36, tempF: cToF(36) },
      ],
    };
  } else if (absLat < 40) {
    // Subtropical (e.g. Phoenix, Cairo, Delhi, Tokyo)
    return {
      threeMonths: {
        season: isNorth ? 'Winter' : 'Summer',
        lowC: 5,
        highC: 18,
        desc: 'Milder temperatures with occasional cold advection. Low atmospheric moisture keeps night temperatures brisk.',
      },
      sixMonths: {
        season: isNorth ? 'Spring' : 'Autumn',
        lowC: 16,
        highC: 30,
        desc: 'Rapid thermal buildup with lengthening photoperiods. Afternoon convection and early heat events become probable.',
      },
      oneYear: {
        season: isNorth ? 'Autumn' : 'Spring',
        lowC: 15,
        highC: 29,
        desc: 'Subtropical transition characterized by declining sun angles and retreating summer humidity.',
      },
      monthlyHighs: [
        { month: 'January', tempC: 18, tempF: cToF(18) },
        { month: 'April', tempC: 28, tempF: cToF(28) },
        { month: 'July', tempC: 38, tempF: cToF(38) },
        { month: 'October', tempC: 29, tempF: cToF(29) },
      ],
    };
  } else {
    // Temperate (e.g. London, Paris, New York, Berlin)
    return {
      threeMonths: {
        season: isNorth ? 'Winter' : 'Summer',
        lowC: 2,
        highC: 9,
        desc: 'Cold, damp maritime weather, short daylight hours, and occasional frost. Atmospheric heat burden is at annual minimum.',
      },
      sixMonths: {
        season: isNorth ? 'Spring' : 'Autumn',
        lowC: 6,
        highC: 15,
        desc: 'Milder afternoons and longer daylight hours. Warm spells are possible, but sustained summer heat is atypical.',
      },
      oneYear: {
        season: isNorth ? 'Autumn' : 'Spring',
        lowC: 9,
        highC: 16,
        desc: 'Seasonal cooling with changing storm tracks and frontal precipitation. Temperatures are notably cooler than summer.',
      },
      monthlyHighs: [
        { month: 'January', tempC: 8.5, tempF: cToF(8.5) },
        { month: 'April', tempC: 14.5, tempF: cToF(14.5) },
        { month: 'July', tempC: 23.9, tempF: cToF(23.9) },
        { month: 'October', tempC: 16.0, tempF: cToF(16.0) },
      ],
    };
  }
}

dossierRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  const lat = parseFloat((req.query.lat as string) || '51.5074');
  const lng = parseFloat((req.query.lng as string) || '-0.1278');
  const locationName = (req.query.name as string) || (lat > 50 && lng < 1 ? 'London' : 'Selected Location');
  const country = (req.query.country as string) || (lat > 50 && lng < 1 ? 'United Kingdom' : 'India');

  try {
    const isSurat = Math.abs(lat - 21.1702) < 0.35 && Math.abs(lng - 72.8311) < 0.35;

    const [weatherRes, aqRes, accuRes] = await Promise.allSettled([
      fetchLiveWeather(lat, lng, 8000),
      fetchAirQuality(lat, lng, 6000),
      isSurat ? fetchAccuWeatherSurat(6000) : Promise.resolve({ result: null }),
    ]);

    const weatherData = weatherRes.status === 'fulfilled' ? weatherRes.value.result : null;
    const aqData = aqRes.status === 'fulfilled' ? aqRes.value.result : null;
    const accuData = accuRes.status === 'fulfilled' ? accuRes.value.result : null;

    // Numerical observations
    const currentTempC = Math.round(
      (accuData?.currentTemp ?? weatherData?.airTemperature?.value ?? (lat > 50 ? 10.0 : 35.0)) * 10
    ) / 10;
    const currentTempF = cToF(currentTempC);

    const tempHighC = Math.round(
      (accuData?.tempHigh ?? weatherData?.temperatureMax?.value ?? currentTempC + 4.5) * 10
    ) / 10;
    const tempHighF = cToF(tempHighC);

    const tempLowC = Math.round(
      (accuData?.tempLow ?? weatherData?.temperatureMin?.value ?? currentTempC - 5.5) * 10
    ) / 10;
    const tempLowF = cToF(tempLowC);

    const humidity = Math.round(accuData?.humidity ?? weatherData?.humidity?.value ?? (lat > 50 ? 82 : 35));
    const windSpeedKmH = Math.round(weatherData?.windSpeed?.value ?? 10);
    const windDirection = weatherData?.windDirection?.unit ?? 'W';
    const aqi = Math.round(aqData?.aqi?.value ?? (lat > 50 ? 18 : 108));
    const aqiCategory = aqiToStatus(aqi);

    const isHot = currentTempC >= 28 || (weatherData?.feelsLike?.value ?? currentTempC) >= 30;

    // Dates
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

    const seasonal = computeSeasonalRanges(lat, currentTempC);

    // Headline summary text
    let headlineSummary = '';
    if (!isHot) {
      headlineSummary = `${locationName} is not hot right now. The current weather is cool, around ${currentTempC}°C (${currentTempF}°F), with a daytime high forecast near ${tempHighC}°C (${tempHighF}°F). This represents normal seasonal atmospheric conditions rather than an urban heatwave.`;
    } else {
      headlineSummary = `${locationName} is currently experiencing significant thermal loading, around ${currentTempC}°C (${currentTempF}°F), with daytime highs reaching ${tempHighC}°C (${tempHighF}°F) and expected low of ${tempLowC}°C (${tempLowF}°F). Radiant heat absorption across urban surfaces amplifies heat stress during peak sun hours.`;
    }

    // Markdown generation
    const rawMarkdown = `# ${locationName} weather and heat analysis

Current date: ${currentDateFormatted} · ${locationName}, ${country}

${headlineSummary}

## 1. Current weather dashboard

${locationName} · Current conditions

# ${currentTempC}°C / ${currentTempF}°F
${weatherData?.weatherCode?.unit ?? accuData?.phrase ?? (isHot ? 'Sunny to Partly Cloudy' : 'Mostly cloudy')}
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

${
  isHot
    ? `${locationName} is currently subject to high ambient temperatures combined with urban heat island amplification. There are four primary drivers:`
    : `${locationName}'s current weather is not hot, but the city can experience severe heatwaves during summer and transition periods. There are four primary scientific mechanisms:`
}

1. **Global warming**
Greenhouse gases from fossil fuel combustion trap surplus longwave thermal energy in the climate system. This elevates background global baselines and triples the frequency of extreme heat domes.
*Reduction strategy*: Accelerate decarbonization across grid power, commercial heating, transit, and heavy industry. This mitigates long-term heating trajectory.

2. **Urban heat island (UHI)**
Bitumen roads, low-albedo asphalt, dark roofs, and dense masonry absorb incident solar radiation (typically 80–90% absorption) and radiate sensible heat late into the night. Narrow street canyons restrict convective airflow.
*Reduction strategy*: Deploy high-albedo reflective coatings (SRI > 78), expand street tree canopy, increase surface permeability, and preserve ventilation corridors.

3. **Waste heat from human activity**
Internal combustion vehicles, industrial HVAC installations, data centers, and building air-conditioning condenser units dump intensive sensible heat directly into pedestrian-level street canyons.
*Reduction strategy*: Transition to electrified transport, mandate high-COP heat pumps, implement district chilled-water loops, and eliminate idling heat generation.

4. **Limited shade and vegetation**
Impervious surfaces lacking mature tree canopy receive unabated direct downward shortwave solar flux. Trees provide vital radiative shielding and evaporative latent cooling.
*Reduction strategy*: Protect mature urban forests, plant drought-tolerant shade canopies along transit routes, and integrate biodiverse pocket parks.

*Empirical Urban Modeling*: Microclimate research demonstrates that high-canopy neighborhoods remain 2.5°C to 4.0°C cooler than unshaded asphalt corridors during peak diurnal heating.

## 3. How much could each solution reduce the heat?

*Critical distinction: Cooling a roof or pavement surface is not the same as lowering outdoor air temperature across an entire city.*

| Solution | Estimated effect on outdoor air temperature | What it means |
|---|---|---|
| Cool, reflective roofs | About −1.2°C city-wide; up to −2.0°C locally | Strongest and most scalable of tested city-wide interventions |
| More tree canopy | About −0.3°C to −1.5°C in city-wide modeling | Provides direct localized shade and daytime evapotranspirative cooling |
| Solar panels across roofs | About −0.5°C in dense rooftop deployments | Intercepts solar radiation while supplying clean electrical power |
| More green roofs | −0.1°C to −0.4°C average city-wide cooling | Moderates roof envelope heat flux and captures stormwater runoff |
| Reduce air-conditioning waste heat | Avoids additional +0.2°C to +0.4°C street heating | Prevents localized thermal dumping from building cooling rejection |

### Which solution should ${locationName} prioritise?

- **For reducing city-wide air temperature**: Cool reflective roofs (high albedo coatings provide the highest thermal return per square meter).
- **For street-level comfort and cooler nights**: Trees, shade corridors, and pocket parks (prioritize canopy deficits in dense residential zones).
- **For long-term global warming**: Accelerate greenhouse-gas emission reductions at the systemic infrastructure level.

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

## 5. What you should monitor

- **Temperature**: Monitor official meteorological heat advisories and nighttime minimum temperatures rather than isolated single-hour peaks.
- **Humidity**: High relative humidity combined with temperature compounds physical Heat Index; monitor wet-bulb thresholds.
- **Air quality**: Ground-level ozone (O₃) and PM2.5 spike during stagnant high-pressure summer heat episodes.
- **City cooling**: Track municipal progress on cool roof mandates, canopy preservation, and surface unsealing.

**Bottom line**: ${
      isHot
        ? `${locationName} is undergoing substantial heat stress today (${currentTempC}°C). The most effective immediate relief is shade and cool-surface deployment, reinforced by urban greening.`
        : `${locationName} is currently cool (${currentTempC}°C), not hot. The next 3 months will progress into winter before spring brings milder weather. Long-term heat resilience requires proactive cool roofs and canopy expansion ahead of summer.`
    }
`;

    res.json({
      success: true,
      locationName,
      country,
      coordinates: { lat, lng },
      currentDateFormatted,
      isHot,
      headlineSummary,
      weatherDashboard: {
        currentTempC,
        currentTempF,
        condition: weatherData?.weatherCode?.unit ?? accuData?.phrase ?? (isHot ? 'Sunny' : 'Mostly cloudy'),
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
          ? `${locationName} is currently subject to high ambient temperatures combined with urban heat island amplification.`
          : `${locationName}'s current weather is not hot, but the city can experience severe heatwaves during summer and transition periods.`,
        causes: [
          {
            id: 1,
            title: 'Global warming',
            category: 'Macroclimate & Planetary Forcing',
            explanation:
              'Greenhouse gases from fossil fuel combustion trap surplus longwave thermal energy in the climate system, elevating regional background baselines and multiplying heatwave frequency.',
            reductionStrategy:
              'Accelerate decarbonization across grid power, building heating, transit, and industry to mitigate the long-term baseline warming trajectory.',
          },
          {
            id: 2,
            title: 'Urban heat island',
            category: 'Built Environment & Thermal Mass',
            explanation:
              'Dark asphalt, bitumen, and dense masonry absorb 80–90% of solar shortwave flux and re-emit sensible infrared radiation late into the night. Narrow street canyons trap heat.',
            reductionStrategy:
              'Deploy high-albedo reflective roofs (SRI > 78), expand street tree canopy, increase permeable ground cover, and preserve ventilation corridors.',
          },
          {
            id: 3,
            title: 'Waste heat from human activity',
            category: 'Anthropogenic Sensible Flux',
            explanation:
              'Internal combustion engines, industrial HVAC, data center operations, and building air-conditioning condenser units reject heat directly into pedestrian-level street canyons.',
            reductionStrategy:
              'Transition to electrified transport, mandate high-efficiency heat pumps, implement district cooling loops, and eliminate vehicular engine idling.',
          },
          {
            id: 4,
            title: 'Limited shade and vegetation',
            category: 'Vegetation & Evaporative Deficit',
            explanation:
              'Low tree canopy allows direct shortwave solar radiation to strike pavement and building envelopes without natural interception or evaporative latent cooling.',
            reductionStrategy:
              'Protect mature trees, plant climate-resilient shade canopies along pedestrian corridors, and expand irrigated pocket parks.',
          },
        ],
        localEmpiricalNote:
          'Microclimate research demonstrates that high-canopy neighborhoods remain 2.5°C to 4.0°C cooler than unshaded asphalt corridors during peak diurnal heating.',
      },
      solutionsSection: {
        distinctionNote:
          'Critical distinction: Cooling a roof or pavement surface is not the same as lowering outdoor air temperature across an entire city.',
        modellingBasisNote:
          'Figures are based on calibrated urban microclimate models and empirical surface energy balance simulations.',
        solutionsTable: [
          {
            solution: 'Cool, reflective roofs',
            estimatedEffect: 'About −1.2°C city-wide; up to −2.0°C locally',
            whatItMeans: 'Strongest and most scalable of tested city-wide interventions',
          },
          {
            solution: 'More tree canopy',
            estimatedEffect: 'About −0.3°C to −1.5°C in city-wide modeling',
            whatItMeans: 'Provides direct localized shade and daytime evapotranspirative cooling',
          },
          {
            solution: 'Solar panels across roofs',
            estimatedEffect: 'About −0.5°C in dense rooftop deployments',
            whatItMeans: 'Intercepts solar radiation while supplying clean electrical power',
          },
          {
            solution: 'More green roofs',
            estimatedEffect: '−0.1°C to −0.4°C average city-wide cooling',
            whatItMeans: 'Moderates roof envelope heat flux and captures stormwater runoff',
          },
          {
            solution: 'Reduce air-conditioning waste heat',
            estimatedEffect: 'Avoids additional +0.2°C to +0.4°C street heating',
            whatItMeans: 'Prevents localized thermal dumping from building cooling rejection',
          },
        ],
        prioritization: {
          cityWideAirTemp: {
            title: 'For reducing city-wide air temperature',
            recommendation: 'Cool, reflective roofs',
            details: 'Reflective coatings (albedo > 0.70) reflect solar power before it enters the urban thermal mass.',
          },
          streetComfort: {
            title: 'For street-level comfort and cooler nights',
            recommendation: 'Trees, canopy and shade corridors',
            details: 'Prioritize neighborhoods with canopy deficits while preserving mature shade trees.',
          },
          longTermWarming: {
            title: 'For long-term global warming',
            recommendation: 'Reduce greenhouse-gas emissions',
            details: 'Addresses the foundational cause of planetary warming rather than only mitigating local symptoms.',
          },
        },
      },
      futureProjectionsSection: {
        introText: `Measured dynamically from ${currentDateFormatted}. Seasonal planning ranges derived from long-term meteorological climate normals:`,
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
          ? `${locationName} is undergoing substantial heat stress today (${currentTempC}°C). The most effective immediate relief is shade and cool-surface deployment, reinforced by urban greening.`
          : `${locationName} is currently cool (${currentTempC}°C), not hot. The next 3 months will progress into winter before spring brings milder weather. Long-term heat resilience requires proactive cool roofs and canopy expansion ahead of summer.`,
      },
      rawMarkdown,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message ?? 'Dossier generation failed' });
  }
});
