const fs = require('fs');
const data = require('./lib/geojson-data.js');

let sql = `INSERT INTO public.stok_kayu (id, zone, wood_type, volume, log_count, grade, status, coordinates)\nVALUES\n`;

const values = data.TPK_GEOJSON_DATA.features.map(f => {
  const p = f.properties;
  const coords = JSON.stringify(f.geometry.coordinates);
  return `  ('${p.id}', '${p.zone}', '${p.woodType}', ${p.volume}, ${p.logCount}, '${p.grade}', '${p.status}', '${coords}'::jsonb)`;
});

sql += values.join(',\n');
sql += `\nON CONFLICT (id) DO UPDATE SET \n  coordinates = EXCLUDED.coordinates,\n  zone = EXCLUDED.zone;`;

fs.writeFileSync('./seed_geojson.sql', sql);
console.log('Successfully generated seed_geojson.sql');
