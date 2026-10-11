export interface MajorUrbanHeatCause {
  id: string;
  number: number;
  title: string;
  tag: string;
  imageUrl: string;
  imageCaption: string;
  mechanism: string;
  solutions: string[];
  potentialImpact: string;
  temperatureEffect: string;
  category: 'surfaces' | 'buildings' | 'transport' | 'industry' | 'nature' | 'morphology' | 'compute';
  iconName: string;
}

export interface OverlookedHeatCause {
  cause: string;
  whyIncreasesHeat: string;
  whatToDo: string;
  category: string;
}

export interface SolutionPriority {
  tier: number;
  title: string;
  subtitle: string;
  description: string;
  targetAreas: string;
  keyActions: string[];
  color: string;
}

export interface MeasurementMetric {
  metric: string;
  methodology: string;
  instrumentation: string;
  whyCritical: string;
  unit: string;
}

export const MAJOR_URBAN_HEAT_CAUSES: MajorUrbanHeatCause[] = [
  {
    id: 'roads_highways_parking',
    number: 1,
    title: 'Roads, highways and parking lots',
    tag: 'Major Contributor • Dark Asphalt Heat Sponge',
    imageUrl:
      'https://images.openai.com/static-rsc-4/GbEMwqq6Ux3ou1TJGuu5dARo3GL8hEwPyimsY6476KYEnHq-8-KsQ1fm2z-ZoRIxjm03uMx7fjG7nm7dVJXVYPHg-VU0457Iu1Si2fcdK0M8f8DNi5nhLZcZjFKnwXZCom-TXHC1ZR8KZoxZWTzGST3r6m8soJYLgoz7Vk9yBXU?purpose=inline',
    imageCaption: 'Close-up of asphalt surface softening and releasing trapped solar heat into the street air under blazing sunlight',
    mechanism:
      'Dark asphalt absorbs 85–95% of incoming solar radiation, heats up significantly (often exceeding 60°C in direct sun), and continuously releases stored heat into the air and surrounding buildings. Large paved areas also seal the ground, eliminating natural moisture evaporation and soil breathability.',
    solutions: [
      'Use reflective or lighter-coloured pavement (cool pavements) where appropriate.',
      'Add roadside trees and continuous shaded pedestrian corridors.',
      'Replace unnecessary paved areas with permeable surfaces, bioswales, and green verges.',
      'Construct shaded parking structures or solar-canopy carports instead of vast exposed asphalt lots.',
    ],
    potentialImpact:
      'Lighter surfaces can substantially reduce pavement surface temperatures by 10°C to 20°C. City-wide air cooling is generally more modest (0.5°C to 1.5°C) and depends strictly on the total percentage of paved area treated.',
    temperatureEffect: 'Direct Surface Heat + Sustained Nocturnal Radiative Release',
    category: 'surfaces',
    iconName: 'Car',
  },
  {
    id: 'roofs_exterior_materials',
    number: 2,
    title: 'Roofs and exterior building materials',
    tag: 'Solar Absorption & Indoor Thermal Transfer',
    imageUrl:
      'https://images.openai.com/static-rsc-4/kkwtivf4vvdNiMkcU-aq6VFRT1n0ZDITt19s1z0QXx_xkqxL1FnOgbaJ7TMBF1FnmDhB1BX83AAxt3PJbBDxY4cTHDccNtNVCHloV4XmxiBYmZ7OcWUY5-mU2i5Cj7LuuVNO5dhBIprECSLvlfo5mxcedW7XUVao00vQVYR3Pxg?purpose=inline',
    imageCaption: 'Aerial perspective of uninsulated dark roofs and concrete building envelopes soaking up midday solar irradiation',
    mechanism:
      'Dark roofs, uninsulated concrete walls, and dark exterior cladding absorb intense solar energy and conduct heat directly into building interiors while radiating sensible heat back into urban street canyons both day and night.',
    solutions: [
      'Install cool roofs with high solar reflectance (SRI > 78) and high thermal emittance.',
      'Apply light-coloured, reflective exterior finishes and elastomeric thermal coatings.',
      'Add roof insulation, thermal barriers, and ventilated cavity spaces.',
      'Deploy extensive green roofs where structural load capacity, water availability, and maintenance permit.',
    ],
    potentialImpact:
      'A cool roof can slash roof surface temperatures by 20°C to 35°C under intense sunlight. The reduction in neighbourhood ambient air temperature is smaller (0.4°C to 1.2°C), but indoor air-conditioning demand drops dramatically (15% to 40%).',
    temperatureEffect: 'Massive Surface Temp Reduction + Indoor Heat Load Slash',
    category: 'buildings',
    iconName: 'Building',
  },
  {
    id: 'population_vehicles',
    number: 3,
    title: 'Population growth and vehicles',
    tag: 'Combustion Tailpipes & Dense Anthropogenic Activity',
    imageUrl:
      'https://images.openai.com/static-rsc-4/gBlAcfbapW5HZuu3s99RqSXVS01VKRNqOXo3eRdNPiCACASKqy-r4UfXUWFG861pBgVOUpD5YpWKkEx3YpZy__vKfFrYcAXcXWlJnu8vueiS8AP2X5EGkYp5HscRa4p4N30_6moyHGQtSi-sOSMk0rKT5ZhFplUqo252BCD4FkE?purpose=inline',
    imageCaption: 'Heavy urban road traffic and vehicular congestion rejecting tailpipe combustion heat and particulate pollution',
    mechanism:
      'Rapid urban population growth brings more roads, buildings, vehicle trips, air conditioners, and electricity demand. Internal combustion engines and brake systems release direct sensible waste heat and particulate pollutants right at the pedestrian level.',
    solutions: [
      'Expand reliable, rapid public transit: metro networks, dedicated bus rapid transit (BRT), and electric bus fleets.',
      'Construct protected, continuous, shaded walking and cycling networks.',
      'Incentivize electric vehicles and establish low-emission zones to curb unnecessary car trips.',
      'Adopt compact, mixed-use transit-oriented planning so residents live within walking distance of daily needs.',
    ],
    potentialImpact:
      'Curtailing vehicular congestion substantially reduces street-level exhaust heat and improves air quality. The broader atmospheric cooling impact scales with clean electricity transition and modal transit shift.',
    temperatureEffect: 'Localized Street-Level Sensible Heat & Aerosol Pollution',
    category: 'transport',
    iconName: 'Activity',
  },
  {
    id: 'industry_powerplants',
    number: 4,
    title: 'Industrial areas and power plants',
    tag: 'Direct Sensible Heat Flumes & Combustion',
    imageUrl:
      'https://images.openai.com/static-rsc-4/9igrN-cNFnylgJsHhiskGabeOIu57LfAVkdecfikmWCFU059yVUrOhI_9BREN1O8UEX6bMiedAyJXIAHIjQXTcU0HP45MjoDc5obfWwt88olylXsa3anzIpmYy-ilVLUX_AlIeJoa-HtFvk6WYQ12vs2PSmQKxk1H3c5yXdUCkW2q4oBiArGeuwD6SqRj9xp?purpose=inline',
    imageCaption: 'Aerial view of thermal power generation and heavy industrial plant adjacent to expanding urban settlement',
    mechanism:
      'Heavy manufacturing, metal furnaces, chemical processing, industrial boilers, and fossil-fueled power stations release vast volumes of hot flue gases and thermal effluent directly into the atmosphere, while carbon emissions drive long-term baseline warming.',
    solutions: [
      'Upgrade industrial motors, boilers, and heating systems to high-efficiency standards.',
      'Deploy industrial waste-heat recovery (cogeneration and district heating systems).',
      'Electrify industrial process heating using clean renewable power sources.',
      'Buffer and separate high-heat industrial zones from vulnerable residential districts through zoning and green belts.',
    ],
    potentialImpact:
      'Immediate and substantial reduction in localized heat plumes and ambient temperatures around industrial clusters. City-scale cooling depends on plant capacity, prevailing wind dispersal, and stack heights.',
    temperatureEffect: 'Intense Point-Source Thermal Plumes + GHG Baseline Rise',
    category: 'industry',
    iconName: 'Factory',
  },
  {
    id: 'vegetation_loss',
    number: 5,
    title: 'Less forest, fewer trees and green spaces',
    tag: 'Loss of Evapotranspirative Shield',
    imageUrl:
      'https://images.openai.com/static-rsc-4/dykSkl2osFnMTcqnXmafmdFdJjLlG1aVHizaNlcslGkXrtKE1_DejTzNPouACQm9T-kxJYw0dZq1v53-gQh92NrbVgYIZhcn_gDRHQ4rgRdSO4E0fUDLBb4zg0b4mZ-FzhpqEFIqsupjQ4BU3-EZmD4HCUES1BvP3Kxcrfqo61ry7efkF1hWfBjQNCR38l3k?purpose=inline',
    imageCaption: 'Dramatic aerial boundary between dense concrete urban sprawl and contiguous cooling green forest canopy in Lima',
    mechanism:
      'Trees and vegetation provide physical canopy shade and cool the environment through active evapotranspiration (converting solar energy into latent heat rather than sensible heat). Removing greenery leaves concrete and asphalt exposed to unrelenting solar baking.',
    solutions: [
      'Strictly protect mature trees and preserve intact urban forests and urban agricultural tracts.',
      'Plant continuous shade tree canopies along pedestrian corridors, roadways, schoolyards, and bus plazas.',
      'Restore urban wetlands, pocket parks, and interconnected green infrastructure.',
      'Select drought-resilient, climate-adapted native tree species with deep rooting capacity and water-efficient irrigation.',
    ],
    potentialImpact:
      'Tree-shaded pavement surfaces can be 11°C to 25°C cooler than exposed surfaces. While outdoor air temperature drop is typically 1°C to 2.5°C, human mean radiant temperature (MRT) plummets by 15°C to 20°C, transforming survival conditions.',
    temperatureEffect: 'Radiant Shielding & Essential Human Thermal Comfort',
    category: 'nature',
    iconName: 'TreePine',
  },
  {
    id: 'dense_canyons_airflow',
    number: 6,
    title: 'Dense buildings and poor airflow',
    tag: 'Urban Canyon Radiation Trapping',
    imageUrl:
      'https://images.openai.com/static-rsc-4/FUVNoqNwND_EFminACfHBIqZpo-NroSvYxabY0GM7RP8LrxkOOECXv6ii1StBsfSNEXCwBaq9UIE13uCgLZaJyB8gRNjlHjXi1c_lEytLcffX4lqdbtre5l3fRDqa3R93G6aeszm4iQmc3MZWBlqWwfqs1Cdf18LxiFydPmDm7CFEE_yjOMAYE401yVzC1gs?purpose=inline',
    imageCaption: 'High-rise residential towers in Hong Kong creating deep urban street canyons that trap outgoing thermal radiation',
    mechanism:
      'Narrow street canyons formed by tall, closely spaced buildings severely reduce the Sky View Factor (SVF). Heat radiated from building facades bounces between walls rather than escaping into space, while deep canyons block prevailing natural breezes and prevent nocturnal cooling.',
    solutions: [
      'Preserve and align urban ventilation corridors with local prevailing wind directions.',
      'Regulate building height-to-width (H/W) ratios and setbacks to prevent stagnant air pockets.',
      'Incorporate shaded courtyards, stepped podiums, and interconnected green wind paths.',
      'Avoid continuous unshaded concrete plazas between tower clusters.',
    ],
    potentialImpact:
      'Enhances natural aerodynamic flushing and nocturnal heat dissipation by 1.5°C to 3.0°C. Prevents lethal night heat stagnation where vulnerable populations suffer the highest health risks.',
    temperatureEffect: 'Nighttime Heat Retention & Stagnant Air Boundary Layer',
    category: 'morphology',
    iconName: 'Layers',
  },
  {
    id: 'datacenters_servers',
    number: 7,
    title: 'Data centers and server facilities',
    tag: 'Continuous Hyperscale Sensible Heat Rejection',
    imageUrl:
      'https://images.openai.com/static-rsc-4/UfF8UK1kYFW78nhLq86yVODpdiUB67gCwSaONcogLnDq12y4uYl18xt6AbisZ00mCS78ayuHNcfTSMm5eRnz76YtuFKLasrE7PL8Q0uKmExkYf8WpZZzP75T1A0T7jM6xkE2eL69dh39hF6WXwCQiIZj63CE5t6uUYbgK7Hk5JtwaDg4vZULqmywVkA3dNXo?purpose=inline',
    imageCaption: 'High-angle perspective of large data center facility displaying rooftop industrial cooling chillers and heat rejection units',
    mechanism:
      'Modern compute servers convert virtually 100% of their electrical energy into thermal heat. Industrial cooling infrastructure (cooling towers, chillers, dry coolers) expels this sensible heat directly into the outdoor air 24 hours a day, 365 days a year, creating an intense localized heat dome.',
    solutions: [
      'Maximize server computing efficiency and hardware workload density.',
      'Adopt high-efficiency cooling: direct-to-chip liquid cooling and ambient free-air economizers.',
      'Recycle and pipe waste heat to nearby district heating networks, industrial drying, or greenhouse agriculture.',
      'Procure 100% clean renewable power and strategically locate facilities outside dense heat-vulnerable residential cores.',
    ],
    potentialImpact:
      'Lowering facility PUE (Power Usage Effectiveness) and recovering waste heat mitigates thousands of megawatts of continuous thermal rejection into the urban boundary layer.',
    temperatureEffect: 'Continuous 24/7 Sensible Heat Flux (Up to 100+ MW per Hub)',
    category: 'compute',
    iconName: 'Server',
  },
];

export const OVERLOOKED_HEAT_CAUSES: OverlookedHeatCause[] = [
  {
    cause: 'Air conditioners',
    whyIncreasesHeat:
      'Outdoor condenser units pump sensible heat directly into street canyons at pedestrian height; peak electrical load increases fossil power-plant generation and grid waste heat.',
    whatToDo:
      'Install high-efficiency inverter ACs, shade outdoor condenser units with adequate ventilation clearance, and improve building insulation and passive shading.',
    category: 'HVAC',
  },
  {
    cause: 'Global warming',
    whyIncreasesHeat:
      'Raises baseline regional temperatures, amplifies the intensity and duration of heatwaves, and reduces baseline nighttime recovery margins.',
    whatToDo:
      'Accelerate renewable energy transition, eliminate methane emissions, mandate building decarbonization, and eliminate systemic energy waste.',
    category: 'Climate',
  },
  {
    cause: 'Loss of wetlands and lakes',
    whyIncreasesHeat:
      'Removes natural high-heat-capacity thermal buffers and natural evaporative cooling sinks that cool adjacent neighbourhoods by up to 2–4°C.',
    whatToDo:
      'Legally protect remaining urban wetlands, restore degraded water bodies and retention ponds, and manage water quality to support evaporation.',
    category: 'Hydrology',
  },
  {
    cause: 'Waste heat from commercial buildings',
    whyIncreasesHeat:
      'Commercial lighting, heavy plug loads, commercial kitchens, walk-in refrigeration units, and exhaust fans reject heat continuously into street canyons.',
    whatToDo:
      'Enforce energy-efficient appliances, commercial kitchen heat exchangers, heat recovery chillers, and high-performance building envelopes.',
    category: 'Commercial',
  },
  {
    cause: 'Excessive energy consumption',
    whyIncreasesHeat:
      'Drives higher power-generation demand, substation transformer losses, and localized building waste heat rejection throughout peak afternoon hours.',
    whatToDo:
      'Adopt high-efficiency smart appliances, install rooftop solar self-generation, and deploy automated demand-response energy management.',
    category: 'Energy',
  },
  {
    cause: 'Poor urban planning',
    whyIncreasesHeat:
      'Concentrates heat sources, creates uninterrupted impervious concrete zones, and blocks natural regional wind breezeways.',
    whatToDo:
      'Adopt climate-resilient building codes, mandate green corridor setbacks, enforce cool roof standards, and conduct neighborhood heat vulnerability mapping.',
    category: 'Planning',
  },
];

export const SOLUTION_PRIORITIES: SolutionPriority[] = [
  {
    tier: 1,
    title: 'Priority 1 — Cool Roofs and Shaded Streets',
    subtitle: 'Immediate Direct Solar Intervention',
    description:
      'Directly address the primary mechanism of heat absorption: solar radiation hitting exposed roofs and asphalt pavement. Cool surfaces reflect sunlight back into space before it converts into sensible heat.',
    targetAreas: 'Schools, public hospitals, transit stops, senior centers, and densely populated residential zones.',
    keyActions: [
      'High-albedo reflective coatings (SRI > 78) on municipal and residential roofs',
      'Solar-reflective asphalt treatments on public streets and open parking lots',
      'Shaded pedestrian transit corridors and covered bus stops',
    ],
    color: 'emerald',
  },
  {
    tier: 2,
    title: 'Priority 2 — Trees and Connected Green Spaces',
    subtitle: 'Living Canopy Protection & Evapotranspiration',
    description:
      'Protect mature trees first, then systematically expand canopy coverage in heat-vulnerable, low-vegetation districts. Focus on long-term tree survival, water availability, and continuous shade networks.',
    targetAreas: 'High-temperature neighbourhoods, arterial transit avenues, school grounds, and riverside greenways.',
    keyActions: [
      'Legal protection and maintenance for existing mature shade trees',
      'Targeted planting of climate-resilient, drought-tolerant native canopy trees',
      'Pocket parks, bioswales, and interconnected green ventilation corridors',
    ],
    color: 'teal',
  },
  {
    tier: 3,
    title: 'Priority 3 — Efficient Buildings, Factories & Data Centers',
    subtitle: 'Waste Heat Suppression & Industrial Decarbonization',
    description:
      'Cut continuous waste heat at the source by improving insulation, optimizing industrial processes, elevating HVAC efficiency, and capturing waste heat from high-load data centers.',
    targetAreas: 'Commercial districts, industrial parks, hyperscale data center clusters, and high-rise developments.',
    keyActions: [
      'High-performance building envelope insulation and double-glazed low-E windows',
      'Data center liquid cooling, free-air economizers, and waste heat district export',
      'Industrial heat recovery for manufacturing processes and pre-heating',
    ],
    color: 'cyan',
  },
  {
    tier: 4,
    title: 'Priority 4 — Transport and Urban Planning',
    subtitle: 'Structural Urban Form & Modal Mobility Transition',
    description:
      'Restructure city development patterns to minimize car dependence, promote clean transit, and preserve natural aerodynamic ventilation corridors as urban areas expand.',
    targetAreas: 'Metropolitan master plans, transit hubs, new development zones, and coastal/riverfront corridors.',
    keyActions: [
      'High-frequency electric public transit (BRT, metro) and connected bike networks',
      'Preservation of wind breezeway corridors aligned with prevailing seasonal winds',
      'Transit-oriented mixed-use zoning reducing average vehicular trip lengths',
    ],
    color: 'indigo',
  },
];

export const MEASUREMENT_METRICS: MeasurementMetric[] = [
  {
    metric: 'Air Temperature (Ambient 2m)',
    methodology: 'Calibrated weather sensors mounted at standardized 2-meter height in shielded, ventilated radiation screens.',
    instrumentation: 'WMO-standard aspirated weather stations across shaded, exposed, and green areas.',
    whyCritical: 'Represents the actual air temperature breathed by pedestrians and residents.',
    unit: '°C (Celsius)',
  },
  {
    metric: 'Surface Temperature (Skin LST)',
    methodology: 'Thermal infrared radiometric observations from satellites (ECOSTRESS, Landsat-9, MODIS) or thermal imaging drones.',
    instrumentation: 'Thermal radiometers and satellite infrared skin sensors.',
    whyCritical: 'Measures physical heat absorbed by roofs and pavements; cool roofs can drop by 20–35°C here.',
    unit: '°C (Radiometric Skin)',
  },
  {
    metric: 'Nighttime Temperature (UHI Nocturnal)',
    methodology: 'Continuous monitoring of nocturnal cooling rates between 22:00 and 05:00 comparing urban core to rural baseline.',
    instrumentation: 'Datalogger networks and nocturnal satellite thermal passes.',
    whyCritical: 'High nighttime temperatures prevent human cardiovascular recovery and cause peak heatwave mortality.',
    unit: '°C / hour cooling rate',
  },
  {
    metric: 'Tree Canopy Coverage',
    methodology: 'High-resolution aerial multispectral imagery, LiDAR point clouds, and NDVI vegetative analysis.',
    instrumentation: 'Airborne LiDAR, drone photogrammetry, and Sentinel-2 satellite data.',
    whyCritical: 'Tracks true percentage of ground surface protected by tree leaves and shade over multiple seasons.',
    unit: '% of urban surface',
  },
  {
    metric: 'Waste Heat Flux',
    methodology: 'Calculation of electrical power consumption and industrial/HVAC sensible heat rejection per square kilometer.',
    instrumentation: 'Utility smart meter aggregation, facility PUE telemetry, and traffic sensor counts.',
    whyCritical: 'Quantifies continuous human-generated heat injected directly into the urban canopy layer.',
    unit: 'W/m² (Watts per square meter)',
  },
  {
    metric: 'Human Thermal Comfort (MRT & UTCI)',
    methodology: 'Universal Thermal Climate Index (UTCI) combining air temperature, humidity, wind speed, and Mean Radiant Temperature.',
    instrumentation: 'Globe thermometers, sonic anemometers, and biometeorological stations.',
    whyCritical: 'Captures true physiological stress experienced by human bodies under solar radiant exposure.',
    unit: '°C Equivalent Temperature',
  },
];
