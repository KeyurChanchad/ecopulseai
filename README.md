# EcoPulseAI — AI-Powered Global Heat Monitoring & Heat Reduction Platform

**EcoPulseAI** is a desktop GIS & environmental intelligence software platform built with React, TypeScript, Vite, and Tailwind CSS. It is designed to monitor, analyze, predict, and recommend actionable solutions for reducing urban and regional heat.

---

## 🌟 Key Features

1. **Interactive Global Heat Map**
   - High-contrast 2D/Satellite GIS map powered by Leaflet with basemap switching (Dark GIS Matter, Esri World Imagery, and Light Terrain).
   - Animated **City Heat Bubbles** dynamically sized by heat intensity and color-coded by severity category (Low, Moderate, High, Very High, Extreme).
   - Click-to-interrogate anywhere on Earth to generate a real-time microclimate and environmental profile.

2. **Multi-Source Location Intelligence & Dashboard**
   - Scientific distinction between **Air Temperature (2m)**, **Heat Index (Feels Like)**, **Land Surface Temperature (LST)** from thermal satellites, and **Urban Heat Island (UHI)** excess.
   - **EcoPulse Heat Score (0–100)**: Proprietary analytical model combining satellite observations and built-environment parameters.
   - Comprehensive atmospheric telemetry: Relative humidity, wind speed & direction, solar irradiance (W/m²), UV index, and Air Quality Index (AQI).

3. **Rigorous Heat Contributors Attribution**
   - Explicit distinction between **Measured Data** (Copernicus Sentinel-2, Landsat-9 TIRS, WMO stations) and **AI-Inferred Factors** (building AC heat rejection, vehicle idling).
   - Individual confidence scores (e.g. Tree Coverage: 96%, Roads: 94%, Concrete: 90%, Traffic: 76%, AC: 42%).
   - Cautious documentation of industrial areas and verified enterprise data centers.

4. **"Why is this location hot?" AI Causal Explanation**
   - Synthesizes satellite observations, local morphology, and meteorological conditions.
   - **Separates natural climate background** (desert/arid geography, solar insolation) from human-generated urban heat island amplification.

5. **Actionable Heat Reduction Recommendation Engine**
   - Structured across the 4 core dimensions:
     - **Why?** (Root cause)
     - **Where?** (Specific deployment corridors and zones)
     - **What?** (Concrete intervention)
     - **Expected Effect** (Modeled surface & ambient temperature reduction ranges in °C with confidence)

6. **Interactive Urban Scenario Simulator**
   - Real-time physics-based what-if modeling calibrated against Oke & Akbari microclimate models.
   - Dynamic policy levers:
     - Additional Native Trees Planted (+0 to 50,000)
     - Cool / Reflective Roof Conversion (0% to 100%)
     - Peak Traffic & Idling Reduction (0% to 50%)
     - High-Albedo Cool Pavement on Roads (0% to 100%)
     - Shaded Pedestrian Walking Canopies (0 to 25 km)
   - Real-time before/after scoreboard showing heat risk score drops, surface/air temperature reductions, annual cooling energy saved (MWh), and CO2 sequestered.

7. **Multi-Horizon Future Projections & Heat Timeline**
   - 7-Day weather forecast.
   - 3-Month seasonal outlook with temperature anomalies and ENSO state.
   - IPCC CMIP6 long-term climate projections (SSP1-2.6, SSP2-4.5, SSP5-8.5).
   - 12-Month Heat Timeline progression (Today, 3 Months, 6 Months, 1 Year).

8. **14-Layer GIS Control Panel**
   - Atmospheric Temperature, Heat Index, Land Surface Temperature (LST), Vegetation (NDVI), Tree Canopy Deficit, Roads & Asphalt, Buildings 3D Mass, Traffic Heat Flux, Industrial Emissions, Data Centers, Population Vulnerability, Air Quality (AQI), UHI Footprint, and Priority Intervention Zones.
   - Individual layer visibility toggles and opacity sliders.

9. **Exportable Intelligence Dossiers**
   - **Location Report**, **City Heat Report**, and **Global Hotspots Comparison Report**.
   - One-click formatted print-to-PDF and Markdown export.

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 🏛️ Technology Stack
- **Frontend Framework:** React 18 + TypeScript + Vite
- **Styling & UI:** Tailwind CSS (Dark GIS & Environmental Palette)
- **Mapping Engine:** Leaflet + Custom Canvas & SVG Heat Bubbles
- **Icons:** Lucide React
- **Physics Models:** Rothfusz Heat Index regression & Oke-Akbari Urban Energy Balance
