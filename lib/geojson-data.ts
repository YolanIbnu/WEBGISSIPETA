export interface WoodBlock {
  id: string;
  zone: string;
  woodType: string;
  volume: number;
  logCount: number;
  grade: string;
  status: "Available" | "Sold";
  tanggal?: string;
}

export interface GeoJSONFeature {
  type: "Feature";
  properties: WoodBlock;
  geometry: {
    type: "Polygon";
    coordinates: number[][][];
  };
}

export interface GeoJSONCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

// TPK_GEOJSON_DATA - Data GeoJSON untuk TPK Cabak Bojonegoro
// Koordinat dalam format [longitude, latitude] sesuai standar GeoJSON
// Data asli dari QGIS TPK Cabak Blok

export const TPK_GEOJSON_DATA: GeoJSONCollection = {
  type: "FeatureCollection",
  features: [
    // BLOK 1 - TPK Cabak (Petak pertama)
    {
      type: "Feature",
      properties: {
        id: "TPK-A01",
        zone: "TPK Cabak - Blok A",
        woodType: "Jati",
        volume: 45.5,
        logCount: 120,
        grade: "A.II",
        status: "Available",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [111.5137489, -7.0257169],
            [111.5143869, -7.0263295],
            [111.5145642, -7.0261307],
            [111.5138825, -7.0255821],
            [111.5137489, -7.0257169],
          ],
        ],
      },
    },
    // BLOK 2 - TPK Cabak (Petak kedua)
    {
      type: "Feature",
      properties: {
        id: "TPK-A02",
        zone: "TPK Cabak - Blok A",
        woodType: "Mahoni",
        volume: 38.2,
        logCount: 95,
        grade: "B.I",
        status: "Available",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [111.5134979, -7.0260072],
            [111.5140806, -7.0265924],
            [111.5143247, -7.0263135],
            [111.5137489, -7.0257764],
            [111.5134979, -7.0260072],
          ],
        ],
      },
    },
  ],
};
