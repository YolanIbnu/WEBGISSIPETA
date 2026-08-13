const fs = require('fs');

// We will parse geojson-data.ts using regex to extract features
const geojsonFile = fs.readFileSync('./lib/geojson-data.ts', 'utf-8');

// A very naive but effective extraction since we know the format
// Find everything between features: [ and ];
const match = geojsonFile.match(/features:\s*\[([\s\S]*?)\]/);
if (!match) {
  console.error("Could not find features array in geojson-data.ts");
  process.exit(1);
}

const featuresContent = match[0];
// Let's use a dirty trick to parse it by wrapping it in a module
const script = `
  module.exports = {
    ${featuresContent}
  };
`;
fs.writeFileSync('./temp-parse.js', script);
const data = require('./temp-parse.js');

let sql = `INSERT INTO public.stok_kayu (id, zone, wood_type, volume, log_count, grade, status, coordinates)\nVALUES\n`;

const values = data.features.map(f => {
  const p = f.properties;
  const coords = JSON.stringify(f.geometry.coordinates);
  return `  ('${p.id}', '${p.zone}', '${p.woodType}', ${p.volume}, ${p.logCount}, '${p.grade}', '${p.status}', '${coords}'::jsonb)`;
});

sql += values.join(',\n');
sql += `\nON CONFLICT (id) DO UPDATE SET \n  coordinates = EXCLUDED.coordinates,\n  zone = EXCLUDED.zone;`;

fs.writeFileSync('./seed_geojson.sql', sql);
console.log('Successfully generated seed_geojson.sql');
fs.unlinkSync('./temp-parse.js');
