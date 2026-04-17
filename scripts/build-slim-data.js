#!/usr/bin/env node
// Genera versiones slim de los archivos de datos (sin campos solo usados en modal)
// Ejecutar: node scripts/build-slim-data.js

import { RUBBERS } from '../js/data/rubbers.js';
import { BLADES } from '../js/data/blades.js';
import { writeFileSync } from 'fs';

// Campos a mantener para la vista de lista/filtros/comparar
const RUBBER_FIELDS = ['id', 'brand', 'name', 'type', 'cat', 'nivel', 'speed', 'spin', 'control', 'hardness', 'hardScale', 'thickness', 'price'];
const BLADE_FIELDS = ['id', 'brand', 'name', 'cat', 'material', 'nivel', 'speed', 'control', 'plies', 'layers', 'weight', 'thickness', 'price'];

function slim(items, fields) {
  return items.map(item => {
    const obj = {};
    fields.forEach(f => { if (item[f] !== undefined) obj[f] = item[f]; });
    return obj;
  });
}

const rubbersSlim = slim(RUBBERS, RUBBER_FIELDS);
const bladesSlim = slim(BLADES, BLADE_FIELDS);

const rubbersCode = `// Auto-generated slim data for grid view (run: node scripts/build-slim-data.js)
export const RUBBERS = ${JSON.stringify(rubbersSlim, null, 0)};
`;

const bladesCode = `// Auto-generated slim data for grid view (run: node scripts/build-slim-data.js)
export const BLADES = ${JSON.stringify(bladesSlim, null, 0)};
`;

writeFileSync('js/data/rubbers-slim.js', rubbersCode);
writeFileSync('js/data/blades-slim.js', bladesCode);

console.log('Slim data generated:');
console.log(`  rubbers-slim.js: ${(rubbersCode.length / 1024).toFixed(1)} KB (was ${(82513 / 1024).toFixed(1)} KB)`);
console.log(`  blades-slim.js: ${(bladesCode.length / 1024).toFixed(1)} KB (was ${(48149 / 1024).toFixed(1)} KB)`);
