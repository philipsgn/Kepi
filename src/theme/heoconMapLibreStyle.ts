import { OPENFREEMAP_VECTOR_SOURCE_URL } from '../services/pmtilesMapService';

/**
 * Nguồn GeoJSON cố định bảo đảm hiển thị rõ chủ quyền Quần đảo Hoàng Sa & Trường Sa (Việt Nam)
 */
export const HEOCON_SOVEREIGNTY_GEOJSON = {
  type: 'FeatureCollection' as const,
  features: [
    {
      type: 'Feature' as const,
      properties: { name: 'Quần đảo Hoàng Sa (Việt Nam)' },
      geometry: {
        type: 'Point' as const,
        coordinates: [112.0, 16.5],
      },
    },
    {
      type: 'Feature' as const,
      properties: { name: 'Quần đảo Trường Sa (Việt Nam)' },
      geometry: {
        type: 'Point' as const,
        coordinates: [114.5, 10.0],
      },
    },
  ],
};

/**
 * Tạo đối tượng StyleSpecification MapLibre nội bộ 100% mang bảng màu Heo Con Neo-Brutalist:
 * - Tương thích đồng nhất cả OpenFreeMap (`https://tiles.openfreemap.org/planet`) lẫn PMTiles (`pmtiles://file:///...` / `pmtiles://https://...`)
 * - Dùng bộ font chuẩn xác có sẵn trên OpenFreeMap: `Noto Sans Regular`, `Noto Sans Bold`
 */
export function buildHeoconOsmVectorStyle(
  vectorSourceUrl: string = OPENFREEMAP_VECTOR_SOURCE_URL
): any {
  return {
    version: 8,
    name: 'PigFly Heo Con OSM',
    glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
    sources: {
      openmaptiles: {
        type: 'vector',
        url: vectorSourceUrl || OPENFREEMAP_VECTOR_SOURCE_URL,
      },
      vn_sovereignty: {
        type: 'geojson',
        data: HEOCON_SOVEREIGNTY_GEOJSON,
      },
    },
    layers: [
      {
        id: 'bg',
        type: 'background',
        paint: {
          'background-color': '#F6EEDC',
        },
      },
      {
        id: 'landcover-green',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'landcover',
        paint: {
          'fill-color': '#D4E8C2',
          'fill-opacity': 0.55,
        },
      },
      {
        id: 'park-fill',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'park',
        paint: {
          'fill-color': '#C6E2B0',
          'fill-opacity': 0.8,
        },
      },
      {
        id: 'water-fill',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'water',
        paint: {
          'fill-color': '#9AD3E6',
        },
      },
      {
        id: 'waterway-line',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'waterway',
        paint: {
          'line-color': '#8ECBE3',
          'line-width': 2,
        },
      },
      {
        id: 'building-fill',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'building',
        minzoom: 13,
        paint: {
          'fill-color': '#EAE0CA',
          'fill-outline-color': '#D6C7AC',
          'fill-opacity': 0.85,
        },
      },
      {
        id: 'road-casing',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        paint: {
          'line-color': '#C9B99B',
          'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1.5, 14, 5, 17, 10],
        },
      },
      {
        id: 'road-minor',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        filter: ['!in', 'class', 'motorway', 'trunk', 'primary'],
        paint: {
          'line-color': '#FFFBF1',
          'line-width': ['interpolate', ['linear'], ['zoom'], 11, 0.8, 14, 3, 17, 7],
        },
      },
      {
        id: 'road-major',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        filter: ['in', 'class', 'motorway', 'trunk', 'primary'],
        paint: {
          'line-color': '#FCE09B',
          'line-width': ['interpolate', ['linear'], ['zoom'], 6, 1, 12, 3, 16, 8],
        },
      },
      {
        id: 'admin-boundary',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'boundary',
        paint: {
          'line-color': '#85735E',
          'line-width': 1,
          'line-dasharray': [3, 2],
        },
      },
      {
        id: 'road-label',
        type: 'symbol',
        source: 'openmaptiles',
        'source-layer': 'transportation_name',
        minzoom: 13,
        layout: {
          'symbol-placement': 'line',
          'text-field': ['coalesce', ['get', 'name:vi'], ['get', 'name']],
          'text-font': ['Noto Sans Bold'],
          'text-size': 11,
        },
        paint: {
          'text-color': '#5A4836',
          'text-halo-color': '#FFFBF1',
          'text-halo-width': 1.5,
        },
      },
      {
        id: 'poi-label',
        type: 'symbol',
        source: 'openmaptiles',
        'source-layer': 'poi',
        minzoom: 14,
        layout: {
          'text-field': ['coalesce', ['get', 'name:vi'], ['get', 'name']],
          'text-font': ['Noto Sans Regular'],
          'text-size': 10.5,
          'text-max-width': 9,
        },
        paint: {
          'text-color': '#6E5D4F',
          'text-halo-color': '#FFFBF1',
          'text-halo-width': 1.2,
        },
      },
      {
        id: 'place-label',
        type: 'symbol',
        source: 'openmaptiles',
        'source-layer': 'place',
        layout: {
          'text-field': ['coalesce', ['get', 'name:vi'], ['get', 'name']],
          'text-font': ['Noto Sans Bold'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 5, 11, 12, 14],
        },
        paint: {
          'text-color': '#2B2118',
          'text-halo-color': '#FFFBF1',
          'text-halo-width': 1.8,
        },
      },
      {
        id: 'vn-sovereignty-label',
        type: 'symbol',
        source: 'vn_sovereignty',
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Noto Sans Bold'],
          'text-size': 11.5,
        },
        paint: {
          'text-color': '#2B2118',
          'text-halo-color': '#FFFBF1',
          'text-halo-width': 2,
        },
      },
    ],
  };
}
