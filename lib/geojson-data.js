"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TPK_GEOJSON_DATA = exports.WOOD_TYPES = exports.CACAT_KAYU_OPTIONS = exports.STATUS_OPTIONS = exports.SORTIMEN_GRADE_OPTIONS = void 0;
exports.getWoodTypeColor = getWoodTypeColor;
exports.SORTIMEN_GRADE_OPTIONS = ["AI", "AII", "AIII"];
exports.STATUS_OPTIONS = ["LOKAL", "HARA", "VINIR", "INDUSTRI"];
exports.CACAT_KAYU_OPTIONS = ["NORMAL", "DORENG", "BUNCAK", "GROWONG", "LAPUK"];
exports.WOOD_TYPES = ["Jati", "Mahoni", "Pinus", "Sengon", "Meranti", "Kayu Putih"];
function getWoodTypeColor(woodType) {
    switch (woodType) {
        case "Jati": return "#b45309"; // amber-700
        case "Mahoni": return "#991b1b"; // red-800
        case "Pinus": return "#15803d"; // green-700
        case "Sengon": return "#eab308"; // yellow-500
        case "Meranti": return "#ea580c"; // orange-600
        case "Kayu Putih": return "#0f766e"; // teal-700
        default: return "#64748b"; // slate-500 default
    }
}
// TPK_GEOJSON_DATA - Data GeoJSON untuk TPK Cabak Bojonegoro
// Koordinat dalam format [longitude, latitude] sesuai standar GeoJSON
// Data asli dari QGIS TPK Cabak Blok
exports.TPK_GEOJSON_DATA = {
    type: "FeatureCollection",
    features: [
        // Blok F 1-3 (center-east, osm_id: 1492082972)
        {
            type: "Feature",
            properties: {
                id: "BLOK-F-1-3",
                zone: "Blok F 1-3",
                woodType: "Jati",
                volume: 0,
                logCount: 0,
                grade: "AI",
                status: "HARA",
            },
            geometry: {
                type: "Polygon",
                coordinates: [
                    [
                        [111.5151327, -7.0245601],
                        [111.5155813, -7.0253804],
                        [111.5159733, -7.025128],
                        [111.5155848, -7.0243463],
                        [111.5151327, -7.0245601],
                    ],
                ],
            },
        },
        // Blok E 4-8 (northernmost, osm_id: 1492082975)
        {
            type: "Feature",
            properties: {
                id: "BLOK-E-4-8",
                zone: "Blok E 4-8",
                woodType: "Jati",
                volume: 0,
                logCount: 0,
                grade: "AI",
                status: "HARA",
            },
            geometry: {
                type: "Polygon",
                coordinates: [
                    [
                        [111.5143822, -7.0228648],
                        [111.5151223, -7.0245111],
                        [111.5155529, -7.0242863],
                        [111.5147618, -7.0226907],
                        [111.5143822, -7.0228648],
                    ],
                ],
            },
        },
        // Blok B 4-6 (west, osm_id: 1492082980)
        {
            type: "Feature",
            properties: {
                id: "BLOK-B-4-6",
                zone: "Blok B 4-6",
                woodType: "Jati",
                volume: 0,
                logCount: 0,
                grade: "AI",
                status: "HARA",
            },
            geometry: {
                type: "Polygon",
                coordinates: [
                    [
                        [111.5127751, -7.0254367],
                        [111.5134377, -7.0259981],
                        [111.5136748, -7.0257387],
                        [111.5130067, -7.0252041],
                        [111.5127751, -7.0254367],
                    ],
                ],
            },
        },
        // Blok C 1-2 (south-center, osm_id: 1474111085)
        {
            type: "Feature",
            properties: {
                id: "BLOK-C-1-2",
                zone: "Blok C 1-2",
                woodType: "Jati",
                volume: 0,
                logCount: 0,
                grade: "AI",
                status: "HARA",
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
        // Blok G 1-3 (center-east, osm_id: 1492082973)
        {
            type: "Feature",
            properties: {
                id: "BLOK-G-1-3",
                zone: "Blok G 1-3",
                woodType: "Jati",
                volume: 0,
                logCount: 0,
                grade: "AI",
                status: "HARA",
            },
            geometry: {
                type: "Polygon",
                coordinates: [
                    [
                        [111.5147659, -7.0247997],
                        [111.5152017, -7.0255731],
                        [111.5155109, -7.0253967],
                        [111.5150824, -7.0246475],
                        [111.5147659, -7.0247997],
                    ],
                ],
            },
        },
        // Blok H 1-3 (center, osm_id: 1492082974)
        {
            type: "Feature",
            properties: {
                id: "BLOK-H-1-3",
                zone: "Blok H 1-3",
                woodType: "Jati",
                volume: 0,
                logCount: 0,
                grade: "AI",
                status: "HARA",
            },
            geometry: {
                type: "Polygon",
                coordinates: [
                    [
                        [111.5142289, -7.0250874],
                        [111.5147598, -7.0259026],
                        [111.5151543, -7.0256079],
                        [111.51471, -7.0248271],
                        [111.5142289, -7.0250874],
                    ],
                ],
            },
        },
        // Blok H 4-6 (center-west, osm_id: 1492082977)
        {
            type: "Feature",
            properties: {
                id: "BLOK-H-4-6",
                zone: "Blok H 4-6",
                woodType: "Jati",
                volume: 0,
                logCount: 0,
                grade: "AI",
                status: "HARA",
            },
            geometry: {
                type: "Polygon",
                coordinates: [
                    [
                        [111.5137124, -7.0239887],
                        [111.51421, -7.0250461],
                        [111.5146629, -7.0247707],
                        [111.5141845, -7.0237671],
                        [111.5137124, -7.0239887],
                    ],
                ],
            },
        },
        // Blok A 1-2 (south-west, osm_id: 1492082978)
        {
            type: "Feature",
            properties: {
                id: "BLOK-A-1-2",
                zone: "Blok A 1-2",
                woodType: "Jati",
                volume: 0,
                logCount: 0,
                grade: "AI",
                status: "HARA",
            },
            geometry: {
                type: "Polygon",
                coordinates: [
                    [
                        [111.513101, -7.0263509],
                        [111.5137152, -7.0269845],
                        [111.5140626, -7.026653],
                        [111.5134566, -7.0260435],
                        [111.513101, -7.0263509],
                    ],
                ],
            },
        },
        // Blok C 3-5 (west-center, osm_id: 1492082979)
        {
            type: "Feature",
            properties: {
                id: "BLOK-C-3-5",
                zone: "Blok C 3-5",
                woodType: "Jati",
                volume: 0,
                logCount: 0,
                grade: "AI",
                status: "HARA",
            },
            geometry: {
                type: "Polygon",
                coordinates: [
                    [
                        [111.5130094, -7.0251666],
                        [111.5136963, -7.0257147],
                        [111.5138633, -7.0254928],
                        [111.5132034, -7.0249394],
                        [111.5130094, -7.0251666],
                    ],
                ],
            },
        },
        // Blok A 3-5 (far west, osm_id: 1492082981)
        {
            type: "Feature",
            properties: {
                id: "BLOK-A-3-5",
                zone: "Blok A 3-5",
                woodType: "Jati",
                volume: 0,
                logCount: 0,
                grade: "AI",
                status: "HARA",
            },
            geometry: {
                type: "Polygon",
                coordinates: [
                    [
                        [111.5124707, -7.0257521],
                        [111.5130714, -7.0263376],
                        [111.5133919, -7.0260141],
                        [111.5127643, -7.0254714],
                        [111.5124707, -7.0257521],
                    ],
                ],
            },
        },
        // Blok D 1-5 (far east, osm_id: 1492082983)
        {
            type: "Feature",
            properties: {
                id: "BLOK-D-1-5",
                zone: "Blok D 1-5",
                woodType: "Jati",
                volume: 0,
                logCount: 0,
                grade: "AI",
                status: "HARA",
            },
            geometry: {
                type: "Polygon",
                coordinates: [
                    [
                        [111.5150781, -7.0258457],
                        [111.5153501, -7.026228],
                        [111.5164006, -7.0253538],
                        [111.5162417, -7.0250758],
                        [111.5150781, -7.0258457],
                    ],
                ],
            },
        },
        // Blok B 1-3 (center, osm_id: 1474111084)
        {
            type: "Feature",
            properties: {
                id: "BLOK-B-1-3",
                zone: "Blok B 1-3",
                woodType: "Jati",
                volume: 0,
                logCount: 0,
                grade: "AI",
                status: "HARA",
            },
            geometry: {
                type: "Polygon",
                coordinates: [
                    [
                        [111.5137489, -7.0257169],
                        [111.5143869, -7.0263295],
                        [111.5145642, -7.0261307],
                        [111.5139067, -7.025526],
                        [111.5137489, -7.0257169],
                    ],
                ],
            },
        },
        // Blok E 1-3 (far east-north, osm_id: 1492082971)
        {
            type: "Feature",
            properties: {
                id: "BLOK-E-1-3",
                zone: "Blok E 1-3",
                woodType: "Jati",
                volume: 0,
                logCount: 0,
                grade: "AI",
                status: "HARA",
            },
            geometry: {
                type: "Polygon",
                coordinates: [
                    [
                        [111.5156272, -7.0243253],
                        [111.5160086, -7.0251245],
                        [111.5163547, -7.0249002],
                        [111.5159592, -7.0241325],
                        [111.5156272, -7.0243253],
                    ],
                ],
            },
        },
        // Blok G 4-6 (north-center, osm_id: 1492082976)
        {
            type: "Feature",
            properties: {
                id: "BLOK-G-4-6",
                zone: "Blok G 4-6",
                woodType: "Jati",
                volume: 0,
                logCount: 0,
                grade: "AI",
                status: "HARA",
            },
            geometry: {
                type: "Polygon",
                coordinates: [
                    [
                        [111.513958, -7.0230991],
                        [111.5147491, -7.024758],
                        [111.5150553, -7.0246092],
                        [111.5143344, -7.0229281],
                        [111.513958, -7.0230991],
                    ],
                ],
            },
        },
        // Blok I 1-5 (southernmost, osm_id: 1492082982)
        {
            type: "Feature",
            properties: {
                id: "BLOK-I-1-5",
                zone: "Blok I 1-5",
                woodType: "Jati",
                volume: 0,
                logCount: 0,
                grade: "AI",
                status: "HARA",
            },
            geometry: {
                type: "Polygon",
                coordinates: [
                    [
                        [111.5138471, -7.0270781],
                        [111.5141273, -7.0273695],
                        [111.5149704, -7.0265996],
                        [111.5146256, -7.0262306],
                        [111.5138471, -7.0270781],
                    ],
                ],
            },
        },
    ],
};
