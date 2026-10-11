/**
 * Node-side mirror of the frontend registry (server rootDir is scoped to src/,
 * so the shared module cannot be imported across packages).
 */
export interface DataCenterIntelligenceReport {
  detected: boolean;
  facilityName: string;
  estimatedITLoadMW: number;
  coolingArchitecture: string;
  efficiencyMetrics: {
    pueEstimate: number;
    wueEstimate: number;
    sensibleHeatFluxWm2: number;
  };
  coolingOptimizationOptions: string[];
  wasteHeatReuseFeasibility: string;
  advancedCoolingScenarios: string;
  materialsEvaluationNote: string;
}


/**
 * Approved data center hub registry.
 *
 * The "Data Center Intelligence" section of the Why-Is-This-Place-Hot analysis is
 * rendered EXCLUSIVELY when the selected place is one of these hubs. Matching is
 * performed both by geo-coordinates (radius) and by normalized text tokens
 * (city / metro / region / country aliases), so every entry in the registry below
 * must be resolvable from the way the place is presented in the UI.
 */
export interface DataCenterHub {
  id: string;
  name: string;
  region: string;
  country: string;
  aliases: string[];
  lat: number;
  lng: number;
}

export interface DataCenterHubCandidate {
  locationName?: string;
  city?: string;
  country?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

/** Spatial match radius applied when coordinates are supplied. */
export const DATA_CENTER_HUB_MATCH_RADIUS_KM = 45;

export const DATA_CENTER_HUBS: DataCenterHub[] = [
  // ── North America · United States ──────────────────────────────────────────
  { id: 'us-ashburn', name: 'Ashburn / Northern Virginia', region: 'North America', country: 'United States', lat: 39.0438, lng: -77.4874, aliases: ['ashburn', 'northern virginia', 'loudoun', 'sterling', 'chantilly', 'data center alley', 'virginia'] },
  { id: 'us-washington-dc', name: 'Washington, D.C.', region: 'North America', country: 'United States', lat: 38.9072, lng: -77.0369, aliases: ['washington dc', 'washington d c', 'district of columbia', 'arlington virginia', 'arlington va', 'ashburn dc'] },
  { id: 'us-new-york-new-jersey', name: 'New York / New Jersey', region: 'North America', country: 'United States', lat: 40.7128, lng: -74.0060, aliases: ['new york', 'new york city', 'nyc', 'manhattan', 'brooklyn', 'queens', 'bronx', 'staten island', 'jersey city', 'newark', 'secaucus', 'edison nj', 'piscataway'] },
  { id: 'us-boston', name: 'Boston', region: 'North America', country: 'United States', lat: 42.3601, lng: -71.0589, aliases: ['boston', 'cambridge massachusetts', 'waltham', 'burlington ma'] },
  { id: 'us-chicago', name: 'Chicago', region: 'North America', country: 'United States', lat: 41.8781, lng: -87.6298, aliases: ['chicago', 'elk grove village', 'aurora illinois'] },
  { id: 'us-dallas-fort-worth', name: 'Dallas–Fort Worth', region: 'North America', country: 'United States', lat: 32.7767, lng: -96.7970, aliases: ['dallas', 'fort worth', 'dallas fort worth', 'plano', 'richardson', 'irving texas', 'allen texas', 'garland texas', 'arlington texas'] },
  { id: 'us-houston', name: 'Houston', region: 'North America', country: 'United States', lat: 29.7604, lng: -95.3698, aliases: ['houston', 'the woodlands'] },
  { id: 'us-austin', name: 'Austin', region: 'North America', country: 'United States', lat: 30.2672, lng: -97.7431, aliases: ['austin', 'round rock', 'san marcos texas'] },
  { id: 'us-san-antonio', name: 'San Antonio', region: 'North America', country: 'United States', lat: 29.4241, lng: -98.4936, aliases: ['san antonio'] },
  { id: 'us-phoenix', name: 'Phoenix', region: 'North America', country: 'United States', lat: 33.4484, lng: -112.0740, aliases: ['phoenix', 'chandler arizona', 'tempe', 'mesa arizona', 'scottsdale'] },
  { id: 'us-los-angeles', name: 'Los Angeles', region: 'North America', country: 'United States', lat: 34.0522, lng: -118.2437, aliases: ['los angeles', 'el segundo', 'culver city', 'irvine', 'santa monica'] },
  { id: 'us-san-francisco-silicon-valley', name: 'San Francisco / Silicon Valley', region: 'North America', country: 'United States', lat: 37.7749, lng: -122.4194, aliases: ['san francisco', 'silicon valley', 'san jose california', 'san jose ca', 'santa clara', 'sunnyvale', 'fremont', 'oakland', 'mountain view', 'palo alto', 'redwood city'] },
  { id: 'us-sacramento', name: 'Sacramento', region: 'North America', country: 'United States', lat: 38.5816, lng: -121.4944, aliases: ['sacramento', 'folsom', 'west sacramento'] },
  { id: 'us-portland-hillsboro', name: 'Portland / Hillsboro', region: 'North America', country: 'United States', lat: 45.5152, lng: -122.6784, aliases: ['portland oregon', 'hillsboro', 'hillsboro oregon', 'beaverton', 'the dalles'] },
  { id: 'us-seattle', name: 'Seattle', region: 'North America', country: 'United States', lat: 47.6062, lng: -122.3321, aliases: ['seattle', 'quincy washington', 'quincy wa', 'redmond', 'tukwila'] },
  { id: 'us-atlanta', name: 'Atlanta', region: 'North America', country: 'United States', lat: 33.7490, lng: -84.3880, aliases: ['atlanta', 'douglasville', 'atlanta georgia'] },
  { id: 'us-miami', name: 'Miami', region: 'North America', country: 'United States', lat: 25.7617, lng: -80.1918, aliases: ['miami', 'fort lauderdale', 'miami dade'] },
  { id: 'us-denver', name: 'Denver', region: 'North America', country: 'United States', lat: 39.7392, lng: -104.9903, aliases: ['denver', 'broomfield', 'denver colorado'] },
  { id: 'us-salt-lake-city', name: 'Salt Lake City', region: 'North America', country: 'United States', lat: 40.7608, lng: -111.8910, aliases: ['salt lake city', 'salt lake', 'west jordan'] },
  { id: 'us-columbus', name: 'Columbus', region: 'North America', country: 'United States', lat: 39.9612, lng: -82.9988, aliases: ['columbus ohio', 'columbus oh', 'new albany ohio'] },
  { id: 'us-minneapolis', name: 'Minneapolis', region: 'North America', country: 'United States', lat: 44.9778, lng: -93.2650, aliases: ['minneapolis', 'saint paul', 'st paul', 'minnesota'] },
  { id: 'us-las-vegas', name: 'Las Vegas', region: 'North America', country: 'United States', lat: 36.1699, lng: -115.1398, aliases: ['las vegas', 'henderson nevada'] },
  { id: 'us-nashville', name: 'Nashville', region: 'North America', country: 'United States', lat: 36.1627, lng: -86.7816, aliases: ['nashville', 'nashville tennessee'] },
  { id: 'us-indianapolis', name: 'Indianapolis', region: 'North America', country: 'United States', lat: 39.7684, lng: -86.1581, aliases: ['indianapolis', 'indianapolis indiana'] },
  { id: 'us-charlotte', name: 'Charlotte', region: 'North America', country: 'United States', lat: 35.2271, lng: -80.8431, aliases: ['charlotte', 'charlotte north carolina'] },
  { id: 'us-kansas-city', name: 'Kansas City', region: 'North America', country: 'United States', lat: 39.0997, lng: -94.5786, aliases: ['kansas city', 'kansas city mo', 'kansas city ks'] },
  { id: 'us-detroit', name: 'Detroit', region: 'North America', country: 'United States', lat: 42.3314, lng: -83.0458, aliases: ['detroit', 'canton michigan', 'southfield'] },
  { id: 'us-pittsburgh', name: 'Pittsburgh', region: 'North America', country: 'United States', lat: 40.4406, lng: -79.9959, aliases: ['pittsburgh', 'pittsburgh pennsylvania'] },
  { id: 'us-albuquerque', name: 'Albuquerque', region: 'North America', country: 'United States', lat: 35.0844, lng: -106.6504, aliases: ['albuquerque', 'albuquerque new mexico'] },
  { id: 'us-memphis', name: 'Memphis', region: 'North America', country: 'United States', lat: 35.1495, lng: -90.0490, aliases: ['memphis', 'memphis tennessee'] },

  // ── North America · Canada ───────────────────────────────────────────────
  { id: 'ca-toronto', name: 'Toronto', region: 'North America', country: 'Canada', lat: 43.6532, lng: -79.3832, aliases: ['toronto', 'markham'] },
  { id: 'ca-montreal', name: 'Montreal', region: 'North America', country: 'Canada', lat: 45.5019, lng: -73.5674, aliases: ['montreal', 'montréal'] },
  { id: 'ca-vancouver', name: 'Vancouver', region: 'North America', country: 'Canada', lat: 49.2827, lng: -123.1207, aliases: ['vancouver', 'burnaby'] },
  { id: 'ca-calgary', name: 'Calgary', region: 'North America', country: 'Canada', lat: 51.0447, lng: -114.0719, aliases: ['calgary'] },
  { id: 'ca-edmonton', name: 'Edmonton', region: 'North America', country: 'Canada', lat: 53.5461, lng: -113.4938, aliases: ['edmonton'] },
  { id: 'ca-ottawa', name: 'Ottawa', region: 'North America', country: 'Canada', lat: 45.4215, lng: -75.6972, aliases: ['ottawa'] },
  { id: 'ca-winnipeg', name: 'Winnipeg', region: 'North America', country: 'Canada', lat: 49.8951, lng: -97.1384, aliases: ['winnipeg'] },
  { id: 'ca-quebec-city', name: 'Quebec City', region: 'North America', country: 'Canada', lat: 46.8139, lng: -71.208, aliases: ['quebec city', 'québec'] },

  // ── North America · Mexico ───────────────────────────────────────────────
  { id: 'mx-mexico-city', name: 'Mexico City', region: 'North America', country: 'Mexico', lat: 19.4326, lng: -99.1332, aliases: ['mexico city', 'ciudad de mexico', 'cdmx'] },
  { id: 'mx-queretaro', name: 'Querétaro', region: 'North America', country: 'Mexico', lat: 20.5888, lng: -100.3899, aliases: ['queretaro', 'querétaro'] },
  { id: 'mx-monterrey', name: 'Monterrey', region: 'North America', country: 'Mexico', lat: 25.6866, lng: -100.3161, aliases: ['monterrey'] },
  { id: 'mx-guadalajara', name: 'Guadalajara', region: 'North America', country: 'Mexico', lat: 20.6597, lng: -103.3496, aliases: ['guadalajara'] },

  // ── South America · Brazil ───────────────────────────────────────────────
  { id: 'br-sao-paulo', name: 'São Paulo', region: 'South America', country: 'Brazil', lat: -23.5505, lng: -46.6333, aliases: ['sao paulo', 'são paulo'] },
  { id: 'br-rio-de-janeiro', name: 'Rio de Janeiro', region: 'South America', country: 'Brazil', lat: -22.9068, lng: -43.1729, aliases: ['rio de janeiro', 'rio'] },
  { id: 'br-campinas', name: 'Campinas', region: 'South America', country: 'Brazil', lat: -22.9099, lng: -47.0626, aliases: ['campinas'] },
  { id: 'br-fortaleza', name: 'Fortaleza', region: 'South America', country: 'Brazil', lat: -3.7319, lng: -38.5267, aliases: ['fortaleza'] },
  { id: 'br-porto-alegre', name: 'Porto Alegre', region: 'South America', country: 'Brazil', lat: -30.0346, lng: -51.2177, aliases: ['porto alegre'] },

  // ── South America · Other ───────────────────────────────────────────────
  { id: 'cl-santiago', name: 'Santiago', region: 'South America', country: 'Chile', lat: -33.4489, lng: -70.6693, aliases: ['santiago chile', 'santiago de chile'] },
  { id: 'co-bogota', name: 'Bogotá', region: 'South America', country: 'Colombia', lat: 4.711, lng: -74.0721, aliases: ['bogota', 'bogotá'] },
  { id: 'co-medellin', name: 'Medellín', region: 'South America', country: 'Colombia', lat: 6.2442, lng: -75.5812, aliases: ['medellin', 'medellín'] },
  { id: 'ar-buenos-aires', name: 'Buenos Aires', region: 'South America', country: 'Argentina', lat: -34.6037, lng: -58.3816, aliases: ['buenos aires'] },
  { id: 'ar-cordoba', name: 'Córdoba', region: 'South America', country: 'Argentina', lat: -31.4201, lng: -64.1888, aliases: ['cordoba argentina', 'córdoba argentina'] },
  { id: 'pe-lima', name: 'Lima', region: 'South America', country: 'Peru', lat: -12.0464, lng: -77.0428, aliases: ['lima peru', 'lima'] },
  { id: 'uy-montevideo', name: 'Montevideo', region: 'South America', country: 'Uruguay', lat: -34.9011, lng: -56.1645, aliases: ['montevideo'] },
  { id: 'ec-quito', name: 'Quito', region: 'South America', country: 'Ecuador', lat: -0.1807, lng: -78.4678, aliases: ['quito'] },

  // ── Europe · United Kingdom ─────────────────────────────────────────────
  { id: 'uk-london', name: 'London', region: 'Europe', country: 'United Kingdom', lat: 51.5074, lng: -0.1278, aliases: ['london', 'london uk', 'greater london'] },
  { id: 'uk-slough', name: 'Slough', region: 'Europe', country: 'United Kingdom', lat: 51.5105, lng: -0.595, aliases: ['slough'] },
  { id: 'uk-manchester', name: 'Manchester', region: 'Europe', country: 'United Kingdom', lat: 53.4808, lng: -2.2426, aliases: ['manchester'] },
  { id: 'uk-birmingham', name: 'Birmingham', region: 'Europe', country: 'United Kingdom', lat: 52.4862, lng: -1.8904, aliases: ['birmingham', 'birmingham uk', 'birmingham england'] },
  { id: 'uk-cardiff', name: 'Cardiff', region: 'Europe', country: 'United Kingdom', lat: 51.4816, lng: -3.1791, aliases: ['cardiff'] },
  { id: 'uk-edinburgh', name: 'Edinburgh', region: 'Europe', country: 'United Kingdom', lat: 55.9533, lng: -3.1883, aliases: ['edinburgh'] },
  { id: 'uk-newcastle', name: 'Newcastle', region: 'Europe', country: 'United Kingdom', lat: 54.9783, lng: -1.6178, aliases: ['newcastle', 'newcastle upon tyne'] },

  // ── Europe · Germany ────────────────────────────────────────────────────
  { id: 'de-frankfurt', name: 'Frankfurt', region: 'Europe', country: 'Germany', lat: 50.1109, lng: 8.6821, aliases: ['frankfurt', 'frankfurt am main'] },
  { id: 'de-berlin', name: 'Berlin', region: 'Europe', country: 'Germany', lat: 52.52, lng: 13.405, aliases: ['berlin', 'berlin germany'] },
  { id: 'de-munich', name: 'Munich', region: 'Europe', country: 'Germany', lat: 48.1351, lng: 11.582, aliases: ['munich', 'münchen'] },
  { id: 'de-hamburg', name: 'Hamburg', region: 'Europe', country: 'Germany', lat: 53.5511, lng: 9.9937, aliases: ['hamburg'] },
  { id: 'de-dusseldorf', name: 'Düsseldorf', region: 'Europe', country: 'Germany', lat: 51.2277, lng: 6.7735, aliases: ['dusseldorf', 'düsseldorf'] },
  { id: 'de-cologne', name: 'Cologne', region: 'Europe', country: 'Germany', lat: 50.9375, lng: 6.9603, aliases: ['cologne', 'köln', 'koln'] },

  // ── Europe · France ───────────────────────────────────────────────────
  { id: 'fr-paris', name: 'Paris', region: 'Europe', country: 'France', lat: 48.8566, lng: 2.3522, aliases: ['paris', 'paris france'] },
  { id: 'fr-marseille', name: 'Marseille', region: 'Europe', country: 'France', lat: 43.2965, lng: 5.3698, aliases: ['marseille'] },
  { id: 'fr-lyon', name: 'Lyon', region: 'Europe', country: 'France', lat: 45.764, lng: 4.8357, aliases: ['lyon'] },
  { id: 'fr-bordeaux', name: 'Bordeaux', region: 'Europe', country: 'France', lat: 44.8378, lng: -0.5792, aliases: ['bordeaux'] },

  // ── Europe · Netherlands ────────────────────────────────────────────────
  { id: 'nl-amsterdam', name: 'Amsterdam', region: 'Europe', country: 'Netherlands', lat: 52.3676, lng: 4.9041, aliases: ['amsterdam', 'amsterdam netherlands'] },
  { id: 'nl-rotterdam', name: 'Rotterdam', region: 'Europe', country: 'Netherlands', lat: 51.9244, lng: 4.4777, aliases: ['rotterdam'] },
  { id: 'nl-groningen', name: 'Groningen', region: 'Europe', country: 'Netherlands', lat: 53.2194, lng: 6.5665, aliases: ['groningen'] },
  { id: 'nl-eindhoven', name: 'Eindhoven', region: 'Europe', country: 'Netherlands', lat: 51.4416, lng: 5.4697, aliases: ['eindhoven'] },

  // ── Europe · Ireland ────────────────────────────────────────────────────
  { id: 'ie-dublin', name: 'Dublin', region: 'Europe', country: 'Ireland', lat: 53.3498, lng: -6.2603, aliases: ['dublin', 'dublin ireland'] },
  { id: 'ie-cork', name: 'Cork', region: 'Europe', country: 'Ireland', lat: 51.8985, lng: -8.4756, aliases: ['cork ireland', 'cork city'] },

  // ── Europe · Spain ─────────────────────────────────────────────────────
  { id: 'es-madrid', name: 'Madrid', region: 'Europe', country: 'Spain', lat: 40.4168, lng: -3.7038, aliases: ['madrid', 'madrid spain'] },
  { id: 'es-barcelona', name: 'Barcelona', region: 'Europe', country: 'Spain', lat: 41.3874, lng: 2.1686, aliases: ['barcelona'] },
  { id: 'es-zaragoza', name: 'Zaragoza', region: 'Europe', country: 'Spain', lat: 41.6488, lng: -0.8891, aliases: ['zaragoza'] },
  { id: 'es-aragon', name: 'Aragón', region: 'Europe', country: 'Spain', lat: 41.5976, lng: -0.9057, aliases: ['aragon', 'aragón', 'huesca', 'teruel'] },
  { id: 'es-navarra', name: 'Navarra', region: 'Europe', country: 'Spain', lat: 42.6954, lng: -1.5021, aliases: ['navarra', 'navarre'] },

  // ── Europe · Portugal ───────────────────────────────────────────────────
  { id: 'pt-lisbon', name: 'Lisbon', region: 'Europe', country: 'Portugal', lat: 38.7223, lng: -9.1393, aliases: ['lisbon', 'lisboa'] },
  { id: 'pt-porto', name: 'Porto', region: 'Europe', country: 'Portugal', lat: 41.1579, lng: -8.6291, aliases: ['porto portugal', 'oporto'] },
  { id: 'pt-sines', name: 'Sines', region: 'Europe', country: 'Portugal', lat: 37.956, lng: -8.8698, aliases: ['sines'] },

  // ── Europe · Other countries ─────────────────────────────────────────────
  { id: 'ch-zurich', name: 'Zurich', region: 'Europe', country: 'Switzerland', lat: 47.3769, lng: 8.5417, aliases: ['zurich', 'zürich'] },
  { id: 'ch-geneva', name: 'Geneva', region: 'Europe', country: 'Switzerland', lat: 46.2044, lng: 6.1432, aliases: ['geneva', 'genève'] },
  { id: 'lu-luxembourg-city', name: 'Luxembourg City', region: 'Europe', country: 'Luxembourg', lat: 49.6116, lng: 6.1319, aliases: ['luxembourg city', 'luxembourg'] },
  { id: 'be-brussels', name: 'Brussels', region: 'Europe', country: 'Belgium', lat: 50.8503, lng: 4.3517, aliases: ['brussels', 'brussel', 'brussel belgium'] },
  { id: 'be-antwerp', name: 'Antwerp', region: 'Europe', country: 'Belgium', lat: 51.2194, lng: 4.4025, aliases: ['antwerp', 'antwerpen'] },
  { id: 'dk-copenhagen', name: 'Copenhagen', region: 'Europe', country: 'Denmark', lat: 55.6761, lng: 12.5683, aliases: ['copenhagen', 'københavn'] },
  { id: 'se-stockholm', name: 'Stockholm', region: 'Europe', country: 'Sweden', lat: 59.3293, lng: 18.0686, aliases: ['stockholm'] },
  { id: 'no-oslo', name: 'Oslo', region: 'Europe', country: 'Norway', lat: 59.9139, lng: 10.7522, aliases: ['oslo'] },
  { id: 'fi-helsinki', name: 'Helsinki', region: 'Europe', country: 'Finland', lat: 60.1699, lng: 24.9384, aliases: ['helsinki'] },
  { id: 'is-reykjavik', name: 'Reykjavik', region: 'Europe', country: 'Iceland', lat: 64.1466, lng: -21.9426, aliases: ['reykjavik', 'reykjavík'] },
  { id: 'pl-warsaw', name: 'Warsaw', region: 'Europe', country: 'Poland', lat: 52.2297, lng: 21.0122, aliases: ['warsaw', 'warszawa'] },
  { id: 'cz-prague', name: 'Prague', region: 'Europe', country: 'Czechia', lat: 50.0755, lng: 14.4378, aliases: ['prague', 'praha'] },
  { id: 'at-vienna', name: 'Vienna', region: 'Europe', country: 'Austria', lat: 48.2082, lng: 16.3738, aliases: ['vienna', 'wien'] },
  { id: 'it-milan', name: 'Milan', region: 'Europe', country: 'Italy', lat: 45.4642, lng: 9.19, aliases: ['milan', 'milano'] },
  { id: 'it-rome', name: 'Rome', region: 'Europe', country: 'Italy', lat: 41.9028, lng: 12.4964, aliases: ['rome', 'roma italy'] },
  { id: 'it-turin', name: 'Turin', region: 'Europe', country: 'Italy', lat: 45.0703, lng: 7.6869, aliases: ['turin', 'torino'] },
  { id: 'gr-athens', name: 'Athens', region: 'Europe', country: 'Greece', lat: 37.9838, lng: 23.7275, aliases: ['athens', 'athens greece'] },
  { id: 'ro-bucharest', name: 'Bucharest', region: 'Europe', country: 'Romania', lat: 44.4268, lng: 26.1025, aliases: ['bucharest', 'bucuresti'] },
  { id: 'bg-sofia', name: 'Sofia', region: 'Europe', country: 'Bulgaria', lat: 42.6977, lng: 23.3219, aliases: ['sofia', 'sofia bulgaria'] },
  { id: 'hu-budapest', name: 'Budapest', region: 'Europe', country: 'Hungary', lat: 47.4979, lng: 19.0402, aliases: ['budapest'] },
  { id: 'tr-istanbul', name: 'Istanbul', region: 'Europe', country: 'Türkiye', lat: 41.0082, lng: 28.9784, aliases: ['istanbul', 'istanbul turkey', 'türkiye', 'turkiye'] },
  { id: 'ru-moscow', name: 'Moscow', region: 'Europe', country: 'Russia', lat: 55.7558, lng: 37.6173, aliases: ['moscow', 'moscow russia'] },
  { id: 'ru-st-petersburg', name: 'St. Petersburg', region: 'Europe', country: 'Russia', lat: 59.9311, lng: 30.3609, aliases: ['st petersburg', 'saint petersburg', 'st petersburg russia'] },
  { id: 'ua-kyiv', name: 'Kyiv', region: 'Europe', country: 'Ukraine', lat: 50.4501, lng: 30.5234, aliases: ['kyiv', 'kiev'] },

  // ── Asia · India ────────────────────────────────────────────────────────
  { id: 'in-mumbai', name: 'Mumbai', region: 'Asia', country: 'India', lat: 19.076, lng: 72.8777, aliases: ['mumbai', 'bombay'] },
  { id: 'in-navi-mumbai', name: 'Navi Mumbai', region: 'Asia', country: 'India', lat: 19.033, lng: 73.0297, aliases: ['navi mumbai'] },
  { id: 'in-pune', name: 'Pune', region: 'Asia', country: 'India', lat: 18.5204, lng: 73.8567, aliases: ['pune', 'pune india'] },
  { id: 'in-chennai', name: 'Chennai', region: 'Asia', country: 'India', lat: 13.0827, lng: 80.2707, aliases: ['chennai', 'madras'] },
  { id: 'in-hyderabad', name: 'Hyderabad', region: 'Asia', country: 'India', lat: 17.385, lng: 78.4867, aliases: ['hyderabad', 'hyderabad telangana'] },
  { id: 'in-bengaluru', name: 'Bengaluru', region: 'Asia', country: 'India', lat: 12.9716, lng: 77.5946, aliases: ['bengaluru', 'bangalore'] },
  { id: 'in-delhi', name: 'Delhi', region: 'Asia', country: 'India', lat: 28.6139, lng: 77.209, aliases: ['delhi', 'new delhi', 'delhi india'] },
  { id: 'in-noida', name: 'Noida', region: 'Asia', country: 'India', lat: 28.5355, lng: 77.391, aliases: ['noida'] },
  { id: 'in-greater-noida', name: 'Greater Noida', region: 'Asia', country: 'India', lat: 28.4744, lng: 77.504, aliases: ['greater noida'] },
  { id: 'in-gurugram', name: 'Gurugram', region: 'Asia', country: 'India', lat: 28.4595, lng: 77.0266, aliases: ['gurugram', 'gurgaon'] },
  { id: 'in-kolkata', name: 'Kolkata', region: 'Asia', country: 'India', lat: 22.5726, lng: 88.3639, aliases: ['kolkata', 'calcutta'] },
  { id: 'in-ahmedabad', name: 'Ahmedabad', region: 'Asia', country: 'India', lat: 23.0225, lng: 72.5714, aliases: ['ahmedabad'] },
  { id: 'in-gandhinagar', name: 'Gandhinagar', region: 'Asia', country: 'India', lat: 23.2156, lng: 72.6369, aliases: ['gandhinagar', 'gandhinagar gujarat'] },
  { id: 'in-jamnagar', name: 'Jamnagar', region: 'Asia', country: 'India', lat: 22.4707, lng: 70.0577, aliases: ['jamnagar'] },
  { id: 'in-nagpur', name: 'Nagpur', region: 'Asia', country: 'India', lat: 21.1458, lng: 79.0882, aliases: ['nagpur'] },
  { id: 'in-bhubaneswar', name: 'Bhubaneswar', region: 'Asia', country: 'India', lat: 20.2961, lng: 85.8245, aliases: ['bhubaneswar'] },
  { id: 'in-visakhapatnam', name: 'Visakhapatnam', region: 'Asia', country: 'India', lat: 17.6868, lng: 83.2185, aliases: ['visakhapatnam', 'vizag'] },
  { id: 'in-kochi', name: 'Kochi', region: 'Asia', country: 'India', lat: 9.9312, lng: 76.2673, aliases: ['kochi', 'cochin'] },
  { id: 'in-jaipur', name: 'Jaipur', region: 'Asia', country: 'India', lat: 26.9124, lng: 75.7873, aliases: ['jaipur'] },
  { id: 'in-lucknow', name: 'Lucknow', region: 'Asia', country: 'India', lat: 26.8467, lng: 80.9462, aliases: ['lucknow'] },
  { id: 'in-coimbatore', name: 'Coimbatore', region: 'Asia', country: 'India', lat: 11.0168, lng: 76.9558, aliases: ['coimbatore'] },
  { id: 'in-thiruvananthapuram', name: 'Thiruvananthapuram', region: 'Asia', country: 'India', lat: 8.5241, lng: 76.9366, aliases: ['thiruvananthapuram', 'trivandrum'] },

  // ── Asia · China ────────────────────────────────────────────────────────
  { id: 'cn-beijing', name: 'Beijing', region: 'Asia', country: 'China', lat: 39.9042, lng: 116.4074, aliases: ['beijing', 'peking'] },
  { id: 'cn-shanghai', name: 'Shanghai', region: 'Asia', country: 'China', lat: 31.2304, lng: 121.4737, aliases: ['shanghai'] },
  { id: 'cn-shenzhen', name: 'Shenzhen', region: 'Asia', country: 'China', lat: 22.5431, lng: 114.0579, aliases: ['shenzhen'] },
  { id: 'cn-guangzhou', name: 'Guangzhou', region: 'Asia', country: 'China', lat: 23.1291, lng: 113.2644, aliases: ['guangzhou', 'canton china'] },
  { id: 'cn-hangzhou', name: 'Hangzhou', region: 'Asia', country: 'China', lat: 30.2741, lng: 120.1551, aliases: ['hangzhou'] },
  { id: 'cn-chengdu', name: 'Chengdu', region: 'Asia', country: 'China', lat: 30.5728, lng: 104.0668, aliases: ['chengdu'] },
  { id: 'cn-chongqing', name: 'Chongqing', region: 'Asia', country: 'China', lat: 29.563, lng: 106.5516, aliases: ['chongqing'] },
  { id: 'cn-wuhan', name: 'Wuhan', region: 'Asia', country: 'China', lat: 30.5928, lng: 114.3055, aliases: ['wuhan'] },
  { id: 'cn-nanjing', name: 'Nanjing', region: 'Asia', country: 'China', lat: 32.0603, lng: 118.7969, aliases: ['nanjing', 'nanking'] },
  { id: 'cn-tianjin', name: 'Tianjin', region: 'Asia', country: 'China', lat: 39.3434, lng: 117.3616, aliases: ['tianjin'] },
  { id: 'cn-qingdao', name: 'Qingdao', region: 'Asia', country: 'China', lat: 36.0671, lng: 120.3826, aliases: ['qingdao'] },
  { id: 'cn-xian', name: "Xi'an", region: 'Asia', country: 'China', lat: 34.3416, lng: 108.9398, aliases: ['xian', 'xi an'] },
  { id: 'cn-guiyang', name: 'Guiyang', region: 'Asia', country: 'China', lat: 26.647, lng: 106.6302, aliases: ['guiyang'] },
  { id: 'cn-hohhot', name: 'Hohhot', region: 'Asia', country: 'China', lat: 40.8424, lng: 111.75, aliases: ['hohhot', 'huhehaote'] },
  { id: 'cn-ulanqab', name: 'Ulanqab', region: 'Asia', country: 'China', lat: 40.9938, lng: 113.1066, aliases: ['ulanqab', 'ulan qab'] },
  { id: 'cn-inner-mongolia', name: 'Inner Mongolia', region: 'Asia', country: 'China', lat: 43.8563, lng: 114.08, aliases: ['inner mongolia', 'nei mongol', 'ordos'] },

  // ── Asia · Japan ────────────────────────────────────────────────────────
  { id: 'jp-tokyo', name: 'Tokyo', region: 'Asia', country: 'Japan', lat: 35.6762, lng: 139.6503, aliases: ['tokyo', 'tokyo japan'] },
  { id: 'jp-osaka', name: 'Osaka', region: 'Asia', country: 'Japan', lat: 34.6937, lng: 135.5023, aliases: ['osaka'] },
  { id: 'jp-yokohama', name: 'Yokohama', region: 'Asia', country: 'Japan', lat: 35.4437, lng: 139.638, aliases: ['yokohama'] },
  { id: 'jp-kyoto', name: 'Kyoto', region: 'Asia', country: 'Japan', lat: 35.0116, lng: 135.7681, aliases: ['kyoto'] },
  { id: 'jp-nagoya', name: 'Nagoya', region: 'Asia', country: 'Japan', lat: 35.1815, lng: 136.9066, aliases: ['nagoya'] },
  { id: 'jp-fukuoka', name: 'Fukuoka', region: 'Asia', country: 'Japan', lat: 33.5904, lng: 130.4017, aliases: ['fukuoka'] },
  { id: 'jp-sapporo', name: 'Sapporo', region: 'Asia', country: 'Japan', lat: 43.0618, lng: 141.3545, aliases: ['sapporo'] },

  // ── Asia · South Korea ─────────────────────────────────────────────────
  { id: 'kr-seoul', name: 'Seoul', region: 'Asia', country: 'South Korea', lat: 37.5665, lng: 126.978, aliases: ['seoul', 'seoul south korea'] },
  { id: 'kr-busan', name: 'Busan', region: 'Asia', country: 'South Korea', lat: 35.1796, lng: 129.0756, aliases: ['busan', 'pusan'] },
  { id: 'kr-incheon', name: 'Incheon', region: 'Asia', country: 'South Korea', lat: 37.4563, lng: 126.7052, aliases: ['incheon'] },
  { id: 'kr-daejeon', name: 'Daejeon', region: 'Asia', country: 'South Korea', lat: 36.3504, lng: 127.3845, aliases: ['daejeon', 'daejeon south korea'] },

  // ── Asia · Singapore ───────────────────────────────────────────────────
  { id: 'sg-singapore', name: 'Singapore', region: 'Asia', country: 'Singapore', lat: 1.3521, lng: 103.8198, aliases: ['singapore'] },

  // ── Asia · Indonesia ───────────────────────────────────────────────────
  { id: 'id-jakarta', name: 'Jakarta', region: 'Asia', country: 'Indonesia', lat: -6.2088, lng: 106.8456, aliases: ['jakarta'] },
  { id: 'id-batam', name: 'Batam', region: 'Asia', country: 'Indonesia', lat: 1.13, lng: 104.05, aliases: ['batam'] },
  { id: 'id-bekasi', name: 'Bekasi', region: 'Asia', country: 'Indonesia', lat: -6.2383, lng: 106.9915, aliases: ['bekasi'] },
  { id: 'id-surabaya', name: 'Surabaya', region: 'Asia', country: 'Indonesia', lat: -7.2575, lng: 112.7521, aliases: ['surabaya'] },
  { id: 'id-bandung', name: 'Bandung', region: 'Asia', country: 'Indonesia', lat: -6.9175, lng: 107.6191, aliases: ['bandung'] },

  // ── Asia · Malaysia ────────────────────────────────────────────────────
  { id: 'my-johor-bahru', name: 'Johor Bahru', region: 'Asia', country: 'Malaysia', lat: 1.4927, lng: 103.7414, aliases: ['johor bahru', 'johor'] },
  { id: 'my-kuala-lumpur', name: 'Kuala Lumpur', region: 'Asia', country: 'Malaysia', lat: 3.139, lng: 101.6869, aliases: ['kuala lumpur', 'kl malaysia'] },
  { id: 'my-cyberjaya', name: 'Cyberjaya', region: 'Asia', country: 'Malaysia', lat: 2.9213, lng: 101.6559, aliases: ['cyberjaya'] },
  { id: 'my-iskandar-puteri', name: 'Iskandar Puteri', region: 'Asia', country: 'Malaysia', lat: 1.4265, lng: 103.6389, aliases: ['iskandar puteri'] },
  { id: 'my-penang', name: 'Penang', region: 'Asia', country: 'Malaysia', lat: 5.4141, lng: 100.3288, aliases: ['penang', 'georgetown penang', 'pulau pinang'] },

  // ── Asia · Thailand ────────────────────────────────────────────────────
  { id: 'th-bangkok', name: 'Bangkok', region: 'Asia', country: 'Thailand', lat: 13.7563, lng: 100.5018, aliases: ['bangkok'] },
  { id: 'th-chonburi', name: 'Chonburi', region: 'Asia', country: 'Thailand', lat: 13.3611, lng: 100.9847, aliases: ['chonburi', 'chon buri'] },
  { id: 'th-rayong', name: 'Rayong', region: 'Asia', country: 'Thailand', lat: 12.6814, lng: 101.2776, aliases: ['rayong'] },

  // ── Asia · Vietnam ─────────────────────────────────────────────────────
  { id: 'vn-ho-chi-minh-city', name: 'Ho Chi Minh City', region: 'Asia', country: 'Vietnam', lat: 10.8231, lng: 106.6297, aliases: ['ho chi minh city', 'ho chi minh', 'saigon'] },
  { id: 'vn-hanoi', name: 'Hanoi', region: 'Asia', country: 'Vietnam', lat: 21.0278, lng: 105.8342, aliases: ['hanoi'] },
  { id: 'vn-da-nang', name: 'Da Nang', region: 'Asia', country: 'Vietnam', lat: 16.0544, lng: 108.2022, aliases: ['da nang', 'danang'] },

  // ── Asia · Philippines ────────────────────────────────────────────────
  { id: 'ph-manila', name: 'Manila', region: 'Asia', country: 'Philippines', lat: 14.5995, lng: 120.9842, aliases: ['manila', 'metro manila'] },
  { id: 'ph-quezon-city', name: 'Quezon City', region: 'Asia', country: 'Philippines', lat: 14.676, lng: 121.0437, aliases: ['quezon city'] },
  { id: 'ph-cebu', name: 'Cebu', region: 'Asia', country: 'Philippines', lat: 10.3157, lng: 123.8854, aliases: ['cebu', 'cebu city'] },

  // ── Asia · Taiwan / Hong Kong ──────────────────────────────────────────
  { id: 'tw-taipei', name: 'Taipei', region: 'Asia', country: 'Taiwan', lat: 25.033, lng: 121.5654, aliases: ['taipei', 'taipei taiwan'] },
  { id: 'tw-new-taipei', name: 'New Taipei', region: 'Asia', country: 'Taiwan', lat: 25.0169, lng: 121.4628, aliases: ['new taipei', 'new taipei city'] },
  { id: 'tw-taoyuan', name: 'Taoyuan', region: 'Asia', country: 'Taiwan', lat: 24.9936, lng: 121.301, aliases: ['taoyuan', 'taoyuan taiwan'] },
  { id: 'tw-kaohsiung', name: 'Kaohsiung', region: 'Asia', country: 'Taiwan', lat: 22.6273, lng: 120.3014, aliases: ['kaohsiung'] },
  { id: 'hk-hong-kong', name: 'Hong Kong', region: 'Asia', country: 'Hong Kong', lat: 22.3193, lng: 114.1694, aliases: ['hong kong', 'hong kong sar', 'hongkong'] },

  // ── Asia · Other Asian locations ─────────────────────────────────────
  { id: 'ae-dubai', name: 'Dubai', region: 'Asia', country: 'United Arab Emirates', lat: 25.2048, lng: 55.2708, aliases: ['dubai', 'dubai uae'] },
  { id: 'ae-abu-dhabi', name: 'Abu Dhabi', region: 'Asia', country: 'United Arab Emirates', lat: 24.4539, lng: 54.3773, aliases: ['abu dhabi', 'abu dhabi uae'] },
  { id: 'ae-fujairah', name: 'Fujairah', region: 'Asia', country: 'United Arab Emirates', lat: 25.1164, lng: 56.3415, aliases: ['fujairah'] },
  { id: 'sa-riyadh', name: 'Riyadh', region: 'Asia', country: 'Saudi Arabia', lat: 24.7136, lng: 46.6753, aliases: ['riyadh', 'riyadh saudi arabia'] },
  { id: 'sa-jeddah', name: 'Jeddah', region: 'Asia', country: 'Saudi Arabia', lat: 21.4858, lng: 39.1925, aliases: ['jeddah', 'jeddah saudi arabia'] },
  { id: 'qa-doha', name: 'Doha', region: 'Asia', country: 'Qatar', lat: 25.2854, lng: 51.531, aliases: ['doha', 'doha qatar'] },
  { id: 'om-muscat', name: 'Muscat', region: 'Asia', country: 'Oman', lat: 23.588, lng: 58.3829, aliases: ['muscat', 'muscat oman'] },
  { id: 'il-tel-aviv', name: 'Tel Aviv', region: 'Asia', country: 'Israel', lat: 32.0853, lng: 34.7818, aliases: ['tel aviv', 'tel aviv israel'] },
  { id: 'bh-manama', name: 'Manama', region: 'Asia', country: 'Bahrain', lat: 26.2285, lng: 50.586, aliases: ['manama', 'manama bahrain'] },
  { id: 'pk-karachi', name: 'Karachi', region: 'Asia', country: 'Pakistan', lat: 24.8607, lng: 67.0011, aliases: ['karachi'] },
  { id: 'pk-lahore', name: 'Lahore', region: 'Asia', country: 'Pakistan', lat: 31.5204, lng: 74.3587, aliases: ['lahore'] },
  { id: 'pk-islamabad', name: 'Islamabad', region: 'Asia', country: 'Pakistan', lat: 33.6844, lng: 73.0479, aliases: ['islamabad'] },
  { id: 'bd-dhaka', name: 'Dhaka', region: 'Asia', country: 'Bangladesh', lat: 23.8103, lng: 90.4125, aliases: ['dhaka'] },
  { id: 'lk-colombo', name: 'Colombo', region: 'Asia', country: 'Sri Lanka', lat: 6.9271, lng: 79.8612, aliases: ['colombo', 'colombo sri lanka'] },
  { id: 'np-kathmandu', name: 'Kathmandu', region: 'Asia', country: 'Nepal', lat: 27.7172, lng: 85.324, aliases: ['kathmandu'] },
  { id: 'kz-almaty', name: 'Almaty', region: 'Asia', country: 'Kazakhstan', lat: 43.222, lng: 76.8512, aliases: ['almaty'] },
  { id: 'uz-tashkent', name: 'Tashkent', region: 'Asia', country: 'Uzbekistan', lat: 41.2995, lng: 69.2401, aliases: ['tashkent'] },

  // ── Oceania · Australia ───────────────────────────────────────────────
  { id: 'au-sydney', name: 'Sydney', region: 'Oceania', country: 'Australia', lat: -33.8688, lng: 151.2093, aliases: ['sydney', 'sydney australia'] },
  { id: 'au-melbourne', name: 'Melbourne', region: 'Oceania', country: 'Australia', lat: -37.8136, lng: 144.9631, aliases: ['melbourne'] },
  { id: 'au-canberra', name: 'Canberra', region: 'Oceania', country: 'Australia', lat: -35.2809, lng: 149.13, aliases: ['canberra'] },
  { id: 'au-brisbane', name: 'Brisbane', region: 'Oceania', country: 'Australia', lat: -27.4698, lng: 153.0251, aliases: ['brisbane'] },
  { id: 'au-perth', name: 'Perth', region: 'Oceania', country: 'Australia', lat: -31.9505, lng: 115.8605, aliases: ['perth western australia', 'perth australia'] },
  { id: 'au-adelaide', name: 'Adelaide', region: 'Oceania', country: 'Australia', lat: -34.9285, lng: 138.6007, aliases: ['adelaide'] },
  { id: 'au-darwin', name: 'Darwin', region: 'Oceania', country: 'Australia', lat: -12.4634, lng: 130.8456, aliases: ['darwin australia'] },

  // ── Oceania · New Zealand ────────────────────────────────────────────
  { id: 'nz-auckland', name: 'Auckland', region: 'Oceania', country: 'New Zealand', lat: -36.8485, lng: 174.7633, aliases: ['auckland', 'auckland new zealand'] },
  { id: 'nz-wellington', name: 'Wellington', region: 'Oceania', country: 'New Zealand', lat: -41.2865, lng: 174.7762, aliases: ['wellington', 'wellington new zealand'] },
  { id: 'nz-christchurch', name: 'Christchurch', region: 'Oceania', country: 'New Zealand', lat: -43.5321, lng: 172.6362, aliases: ['christchurch'] },
  { id: 'nz-hamilton', name: 'Hamilton', region: 'Oceania', country: 'New Zealand', lat: -37.787, lng: 175.2793, aliases: ['hamilton new zealand', 'hamilton nz'] },

  // ── Africa · South Africa ────────────────────────────────────────────
  { id: 'za-johannesburg', name: 'Johannesburg', region: 'Africa', country: 'South Africa', lat: -26.2041, lng: 28.0473, aliases: ['johannesburg', 'joburg', 'johannesburg south africa'] },
  { id: 'za-cape-town', name: 'Cape Town', region: 'Africa', country: 'South Africa', lat: -33.9249, lng: 18.4241, aliases: ['cape town', 'capetown'] },
  { id: 'za-durban', name: 'Durban', region: 'Africa', country: 'South Africa', lat: -29.8587, lng: 31.0218, aliases: ['durban'] },
  { id: 'za-pretoria', name: 'Pretoria', region: 'Africa', country: 'South Africa', lat: -25.7479, lng: 28.2293, aliases: ['pretoria'] },

  // ── Africa · Other African countries ─────────────────────────────────
  { id: 'ke-nairobi', name: 'Nairobi', region: 'Africa', country: 'Kenya', lat: -1.2864, lng: 36.8172, aliases: ['nairobi', 'nairobi kenya'] },
  { id: 'ke-mombasa', name: 'Mombasa', region: 'Africa', country: 'Kenya', lat: -4.0435, lng: 39.6682, aliases: ['mombasa'] },
  { id: 'ng-lagos', name: 'Lagos', region: 'Africa', country: 'Nigeria', lat: 6.5244, lng: 3.3792, aliases: ['lagos', 'lagos nigeria'] },
  { id: 'ng-abuja', name: 'Abuja', region: 'Africa', country: 'Nigeria', lat: 9.0765, lng: 7.3986, aliases: ['abuja'] },
  { id: 'gh-accra', name: 'Accra', region: 'Africa', country: 'Ghana', lat: 5.6037, lng: -0.187, aliases: ['accra', 'accra ghana'] },
  { id: 'eg-cairo', name: 'Cairo', region: 'Africa', country: 'Egypt', lat: 30.0444, lng: 31.2357, aliases: ['cairo', 'cairo egypt'] },
  { id: 'eg-alexandria', name: 'Alexandria', region: 'Africa', country: 'Egypt', lat: 31.2001, lng: 29.9187, aliases: ['alexandria egypt', 'alexandria'] },
  { id: 'ma-casablanca', name: 'Casablanca', region: 'Africa', country: 'Morocco', lat: 33.5731, lng: -7.5898, aliases: ['casablanca'] },
  { id: 'ma-rabat', name: 'Rabat', region: 'Africa', country: 'Morocco', lat: 34.0209, lng: -6.8416, aliases: ['rabat'] },
  { id: 'tn-tunis', name: 'Tunis', region: 'Africa', country: 'Tunisia', lat: 36.8065, lng: 10.1815, aliases: ['tunis', 'tunis tunisia'] },
  { id: 'et-addis-ababa', name: 'Addis Ababa', region: 'Africa', country: 'Ethiopia', lat: 9.032, lng: 38.7469, aliases: ['addis ababa'] },
  { id: 'ug-kampala', name: 'Kampala', region: 'Africa', country: 'Uganda', lat: 0.3476, lng: 32.5825, aliases: ['kampala', 'kampala uganda'] },
  { id: 'rw-kigali', name: 'Kigali', region: 'Africa', country: 'Rwanda', lat: -1.9441, lng: 30.0619, aliases: ['kigali'] },
  { id: 'ao-luanda', name: 'Luanda', region: 'Africa', country: 'Angola', lat: -8.8368, lng: 13.2342, aliases: ['luanda'] },
  { id: 'mz-maputo', name: 'Maputo', region: 'Africa', country: 'Mozambique', lat: -25.9692, lng: 32.5732, aliases: ['maputo'] },
  { id: 'sn-dakar', name: 'Dakar', region: 'Africa', country: 'Senegal', lat: 14.7167, lng: -17.4677, aliases: ['dakar'] },
  { id: 'mu-port-louis', name: 'Port Louis', region: 'Africa', country: 'Mauritius', lat: -20.1609, lng: 57.5012, aliases: ['port louis'] },

  // ── Central America and the Caribbean ────────────────────────────────
  { id: 'cr-san-jose', name: 'San José', region: 'Central America and the Caribbean', country: 'Costa Rica', lat: 9.9281, lng: -84.0907, aliases: ['san jose costa rica', 'san josé costa rica'] },
  { id: 'pa-panama-city', name: 'Panama City', region: 'Central America and the Caribbean', country: 'Panama', lat: 8.9824, lng: -79.5199, aliases: ['panama city', 'ciudad de panama'] },
  { id: 'gt-guatemala-city', name: 'Guatemala City', region: 'Central America and the Caribbean', country: 'Guatemala', lat: 14.6349, lng: -90.5069, aliases: ['guatemala city', 'guatemala'] },
  { id: 'sv-san-salvador', name: 'San Salvador', region: 'Central America and the Caribbean', country: 'El Salvador', lat: 13.6929, lng: -89.2182, aliases: ['san salvador'] },
  { id: 'do-santo-domingo', name: 'Santo Domingo', region: 'Central America and the Caribbean', country: 'Dominican Republic', lat: 18.4861, lng: -69.9312, aliases: ['santo domingo'] },
  { id: 'pr-san-juan', name: 'San Juan', region: 'Central America and the Caribbean', country: 'Puerto Rico', lat: 18.4655, lng: -66.1057, aliases: ['san juan puerto rico'] },
  { id: 'jm-kingston', name: 'Kingston', region: 'Central America and the Caribbean', country: 'Jamaica', lat: 17.9714, lng: -76.7936, aliases: ['kingston jamaica'] },
  { id: 'tt-port-of-spain', name: 'Port of Spain', region: 'Central America and the Caribbean', country: 'Trinidad and Tobago', lat: 10.6549, lng: -61.5019, aliases: ['port of spain', 'trinidad'] },
];

/** Removes diacritics and lowercases the string for stable comparisons. */
export function normalizeHubText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function textTokens(candidate: DataCenterHubCandidate): string {
  const parts = [candidate.locationName, candidate.city, candidate.address, candidate.country];
  return ` ${parts.filter(Boolean).map((p) => normalizeHubText(String(p))).join(' ')} `;
}

/** Kilometers between two WGS84 coordinates (haversine). */
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return 2 * R * Math.asin(Math.sqrt(a));
}

const COUNTRY_ALIASES: Record<string, string[]> = {
  'United States': ['united states', 'us', 'usa', 'u s a', 'united states of america'],
  Canada: ['canada'],
  Mexico: ['mexico'],
  Brazil: ['brazil'],
  Chile: ['chile'],
  Colombia: ['colombia'],
  Argentina: ['argentina'],
  Peru: ['peru'],
  Uruguay: ['uruguay'],
  Ecuador: ['ecuador'],
  'United Kingdom': ['united kingdom', 'uk', 'england', 'scotland', 'wales', 'great britain', 'northern ireland'],
  Germany: ['germany'],
  France: ['france'],
  Netherlands: ['netherlands', 'holland', 'the netherlands'],
  Ireland: ['ireland'],
  Spain: ['spain'],
  Portugal: ['portugal'],
  Switzerland: ['switzerland'],
  Luxembourg: ['luxembourg'],
  Belgium: ['belgium'],
  Denmark: ['denmark'],
  Sweden: ['sweden'],
  Norway: ['norway'],
  Finland: ['finland'],
  Iceland: ['iceland'],
  Poland: ['poland'],
  Czechia: ['czechia', 'czech republic'],
  Austria: ['austria'],
  Italy: ['italy'],
  Greece: ['greece'],
  Romania: ['romania'],
  Bulgaria: ['bulgaria'],
  Hungary: ['hungary'],
  Türkiye: ['turkiye', 'turkey'],
  Russia: ['russia'],
  Ukraine: ['ukraine'],
  India: ['india'],
  China: ['china'],
  Japan: ['japan'],
  'South Korea': ['south korea', 'korea', 'republic of korea'],
  Singapore: ['singapore'],
  Indonesia: ['indonesia'],
  Malaysia: ['malaysia'],
  Thailand: ['thailand'],
  Vietnam: ['vietnam', 'viet nam'],
  Philippines: ['philippines'],
  Taiwan: ['taiwan'],
  'Hong Kong': ['hong kong'],
  'United Arab Emirates': ['united arab emirates', 'uae'],
  'Saudi Arabia': ['saudi arabia'],
  Qatar: ['qatar'],
  Oman: ['oman'],
  Israel: ['israel'],
  Bahrain: ['bahrain'],
  Pakistan: ['pakistan'],
  Bangladesh: ['bangladesh'],
  'Sri Lanka': ['sri lanka'],
  Nepal: ['nepal'],
  Kazakhstan: ['kazakhstan'],
  Uzbekistan: ['uzbekistan'],
  Australia: ['australia'],
  'New Zealand': ['new zealand'],
  'South Africa': ['south africa'],
  Kenya: ['kenya'],
  Nigeria: ['nigeria'],
  Ghana: ['ghana'],
  Egypt: ['egypt'],
  Morocco: ['morocco'],
  Tunisia: ['tunisia'],
  Ethiopia: ['ethiopia'],
  Uganda: ['uganda'],
  Rwanda: ['rwanda'],
  Angola: ['angola'],
  Mozambique: ['mozambique'],
  Senegal: ['senegal'],
  Mauritius: ['mauritius'],
  'Costa Rica': ['costa rica'],
  Panama: ['panama'],
  Guatemala: ['guatemala'],
  'El Salvador': ['el salvador'],
  'Dominican Republic': ['dominican republic'],
  'Puerto Rico': ['puerto rico'],
  Jamaica: ['jamaica'],
  'Trinidad and Tobago': ['trinidad and tobago'],
};

/**
 * Narrows the hub set to a country when the country field is an exact country
 * match. Subnational values ("New Mexico", "Texas", "Karnataka") must NOT narrow
 * the scope: "New Mexico" contains "mexico" and would wrongly scope to Mexico.
 */
function hubsForCountry(normalizedCountry: string): DataCenterHub[] | undefined {
  if (!normalizedCountry) return undefined;
  const scoped = DATA_CENTER_HUBS.filter((hub) => {
    const aliases = COUNTRY_ALIASES[hub.country] || [normalizeHubText(hub.country)];
    return aliases.includes(normalizedCountry);
  });
  return scoped.length > 0 ? scoped : undefined;
}

/**
 * Start index of a normalized alias inside the padded text, or undefined.
 * Using the earliest match position keeps "New Taipei" resolving to the New
 * Taipei hub rather than Taipei ("taipei taiwan" compound alias).
 */
function aliasMatchStart(haystack: string, alias: string): number | undefined {
  if (!alias) return undefined;
  const padded = haystack.includes(' ') ? haystack : ` ${haystack} `;
  if (alias.includes(' ')) {
    const idx = padded.indexOf(` ${alias} `);
    return idx === -1 ? undefined : idx + 1;
  }
  const match = new RegExp(`(^| )${escapeRegExp(alias)}( |$)`).exec(padded);
  if (!match) return undefined;
  return match.index + match[1].length;
}

interface AliasMatch {
  start: number;
  length: number;
}

/** Best alias reference of a hub: earliest start, then longest alias. */
function hubAliasMatch(hub: DataCenterHub, text: string): AliasMatch | undefined {
  let best: AliasMatch | undefined;
  for (const alias of hub.aliases) {
    const normalized = normalizeHubText(alias);
    if (!normalized) continue;
    const start = aliasMatchStart(text, normalized);
    if (start === undefined) continue;
    const length = normalized.length;
    if (!best || start < best.start || (start === best.start && length > best.length)) {
      best = { start, length };
    }
  }
  return best;
}

/** Hub whose alias references the place most specifically. */
function bestTextMatch(hubs: DataCenterHub[], text: string): DataCenterHub | undefined {
  let bestHub: DataCenterHub | undefined;
  let bestMatch: AliasMatch | undefined;
  for (const hub of hubs) {
    const match = hubAliasMatch(hub, text);
    if (!match) continue;
    if (!bestMatch || match.start < bestMatch.start || (match.start === bestMatch.start && match.length > bestMatch.length)) {
      bestMatch = match;
      bestHub = hub;
    }
  }
  return bestHub;
}

function nearestHub(hubs: DataCenterHub[], lat: number, lng: number): DataCenterHub | undefined {
  let best: { hub: DataCenterHub; distanceKm: number } | undefined;
  for (const hub of hubs) {
    const distanceKm = haversineKm(lat, lng, hub.lat, hub.lng);
    if (distanceKm <= DATA_CENTER_HUB_MATCH_RADIUS_KM) {
      if (!best || distanceKm < best.distanceKm) {
        best = { hub, distanceKm };
      }
    }
  }
  return best?.hub;
}

/**
 * Resolves a selected place to its data center hub definition.
 * Matching priority: (1) text tokens, (2) coordinates within the match radius.
 * An explicit country narrows both passes, so "London, Ontario" never resolves
 * to the London (UK) hub. Within a tier the most specific reference wins.
 */
export function findDataCenterHub(candidate: DataCenterHubCandidate): DataCenterHub | undefined {
  if (!candidate) return undefined;
  const text = textTokens(candidate);
  const normalizedCountry = normalizeHubText(String(candidate.country || ''));
  const scope = hubsForCountry(normalizedCountry) ?? DATA_CENTER_HUBS;

  const textMatch = bestTextMatch(scope, text);
  if (textMatch) return textMatch;

  const lat = typeof candidate.latitude === 'number' ? candidate.latitude : undefined;
  const lng = typeof candidate.longitude === 'number' ? candidate.longitude : undefined;
  if (lat == null || lng == null) return undefined;

  return nearestHub(scope, lat, lng);
}

/** True only for approved data center hubs. */
export function isDataCenterHub(candidate: DataCenterHubCandidate): boolean {
  return findDataCenterHub(candidate) !== undefined;
}

function stableHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Builds the Data Center Intelligence report for an approved hub.
 * Facility scale metrics are deterministic (derived from coordinates) rather
 * than random, so repeated analyses of the same place stay consistent.
 */
export function buildHubDataCenterIntelligence(
  hub: DataCenterHub,
  latitude: number,
  longitude: number
): DataCenterIntelligenceReport {
  const hash = stableHash(`${hub.id}:${Math.round(latitude * 100)}:${Math.round(longitude * 100)}`);
  const estimatedITLoadMW = Math.round((18 + (hash % 60)) * 10) / 10;
  const pue = Math.round((1.12 + (hash % 18) * 0.01) * 100) / 100;
  const wue = Math.round((0.28 + (hash % 25) * 0.02) * 100) / 100;

  return {
    detected: true,
    facilityName: `${hub.name} Enterprise Hyperscale Compute Node`,
    estimatedITLoadMW,
    coolingArchitecture: 'Hybrid Chilled-Water Loop with Dual-Circuit Air-Side Economization',
    efficiencyMetrics: {
      pueEstimate: pue,
      wueEstimate: wue,
      sensibleHeatFluxWm2: Math.round(estimatedITLoadMW * 4.2),
    },
    coolingOptimizationOptions: [
      'Direct liquid-to-chip cold plate retrofits (enables 45°C water return)',
      'Water-side economizer operation activated whenever outdoor wet-bulb <= 16°C',
      'Containment of hot/cold aisles with variable speed EC fan arrays',
    ],
    wasteHeatReuseFeasibility: `High feasibility: 45°C to 50°C liquid cooling loop return can be piped directly into nearby municipal hot water networks or greenhouse agriculture, displacing fossil boiler fuel.`,
    advancedCoolingScenarios: `Closed-loop adiabatic dry coolers recommended. Conceptual underwater/subsea cooling requires engineering assessment of marine bio-fouling, corrosion rates, and ecological thermal plume limits.`,
    materialsEvaluationNote: `Thermal management relies on high thermal conductivity copper/vapor chambers (k ~ 400 W/mK) rather than exotic diamond layers; focus on interfacial thermal resistance and structural durability.`,
  };
}

/**
 * Returns data center intelligence only for approved hubs, otherwise undefined.
 * Coordinates take precedence over the currently selected place name.
 */
export function getHubDataCenterIntelligence(
  candidate: DataCenterHubCandidate
): DataCenterIntelligenceReport | undefined {
  const hub = findDataCenterHub(candidate);
  if (!hub) return undefined;
  const lat = typeof candidate.latitude === 'number' ? candidate.latitude : hub.lat;
  const lng = typeof candidate.longitude === 'number' ? candidate.longitude : hub.lng;
  return buildHubDataCenterIntelligence(hub, lat, lng);
}
