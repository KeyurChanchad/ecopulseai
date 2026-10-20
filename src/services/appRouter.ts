/**
 * EcoPulseAI Routing Layer
 * Handles browser URL pathname and search parameters synchronization:
 * - /map -> Global Map & GIS View
 * - /ai-analysis (or /analysis, /dashboard) -> AI Heat Analysis
 * - /simulator -> Intervention Scenario Simulator
 * - /timeline -> Future Timeline & Climate Projections
 *
 * Keeps URL in sync with tab switches and selected cities (e.g. /ai-analysis?city=dubai).
 */

export type AppTab = 'map' | 'dashboard' | 'simulator' | 'timeline' | 'reports';

export function tabToPath(tab: AppTab): string {
  switch (tab) {
    case 'dashboard':
      return '/ai-analysis';
    case 'simulator':
      return '/simulator';
    case 'timeline':
      return '/timeline';
    case 'reports':
      return '/reports';
    case 'map':
    default:
      return '/map';
  }
}

export function pathToTab(pathname: string): AppTab {
  const clean = pathname.toLowerCase().replace(/\/+$/, '') || '/';
  if (clean === '/ai-analysis' || clean === '/analysis' || clean === '/dashboard') {
    return 'dashboard';
  }
  if (clean === '/simulator') {
    return 'simulator';
  }
  if (clean === '/timeline') {
    return 'timeline';
  }
  if (clean === '/reports') {
    return 'reports';
  }
  return 'map';
}

/**
 * Updates browser address bar to reflect the current tab and active city/coordinates
 */
export function updateBrowserUrl(
  tab: AppTab,
  cityIdOrCoords?: { cityId?: string; lat?: number; lng?: number; name?: string },
  replace = false
): void {
  if (typeof window === 'undefined') return;

  const targetPath = tabToPath(tab);
  const currentParams = new URLSearchParams(window.location.search);

  if (cityIdOrCoords) {
    if (cityIdOrCoords.cityId) {
      currentParams.set('city', cityIdOrCoords.cityId);
      currentParams.delete('lat');
      currentParams.delete('lng');
      currentParams.delete('name');
    } else if (cityIdOrCoords.lat !== undefined && cityIdOrCoords.lng !== undefined) {
      currentParams.set('lat', cityIdOrCoords.lat.toFixed(4));
      currentParams.set('lng', cityIdOrCoords.lng.toFixed(4));
      if (cityIdOrCoords.name) {
        currentParams.set('name', cityIdOrCoords.name);
      }
      currentParams.delete('city');
    }
  }

  const queryString = currentParams.toString();
  const fullUrl = queryString ? `${targetPath}?${queryString}` : targetPath;

  if (window.location.pathname !== targetPath || window.location.search !== (queryString ? `?${queryString}` : '')) {
    if (replace) {
      window.history.replaceState({ tab }, '', fullUrl);
    } else {
      window.history.pushState({ tab }, '', fullUrl);
    }
  }
}

/**
 * Parses initial URL parameters for deep linking
 */
export function parseInitialUrl(): {
  initialTab: AppTab;
  cityId?: string;
  coords?: { lat: number; lng: number; name?: string };
  openMethodology: boolean;
} {
  if (typeof window === 'undefined') {
    return { initialTab: 'map', openMethodology: false };
  }

  const pathname = window.location.pathname;
  const initialTab = pathToTab(pathname);
  const params = new URLSearchParams(window.location.search);
  const cityParam = params.get('city') || undefined;
  const latParam = params.get('lat');
  const lngParam = params.get('lng');
  const nameParam = params.get('name') || undefined;
  const openMethodology = pathname.toLowerCase() === '/methodology' || params.get('modal') === 'methodology';

  let coords: { lat: number; lng: number; name?: string } | undefined;
  if (latParam && lngParam) {
    const lat = parseFloat(latParam);
    const lng = parseFloat(lngParam);
    if (!isNaN(lat) && !isNaN(lng)) {
      coords = { lat, lng, name: nameParam };
    }
  }

  return {
    initialTab,
    cityId: cityParam,
    coords,
    openMethodology,
  };
}
