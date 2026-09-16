// ─── CAPA DE PERSISTENCIA ─────────────────────────────────────────────────────
//
// Abstracción entre la lógica de UI y el backend de datos.
//
// HOY    → localStorage (sin servidor, funciona en GitHub Pages)
// FUTURO → sustituir la implementación interna por llamadas a Supabase.
//          La interfaz pública (hydrate / getRatings / setRating / …) no cambia,
//          por lo que los módulos de UI no necesitarán modificarse.
//
// Patrón: caché en memoria + escritura asíncrona al backend.
// Los reads son siempre síncronos desde la caché (ya hidratada).
// Los writes devuelven Promise para que en el futuro se pueda hacer await.
//
// ─── MIGRACIÓN A SUPABASE ─────────────────────────────────────────────────────
// 1. Instalar: import { createClient } from '@supabase/supabase-js'
// 2. Crear tablas: ratings(user_id, item_id, value), notes(user_id, item_id, text),
//    weights(user_id, item_id, grams),
//    setups(id, user_id, blade, fh_rubber, fh_thickness, fh_color,
//           bh_rubber, bh_thickness, bh_color, rating, notes, date)
// 3. Reemplazar las implementaciones de abajo con las llamadas al cliente de Supabase.
//    La interfaz pública permanece idéntica.
// ─────────────────────────────────────────────────────────────────────────────

const KEYS = {
  ratings: 'tt_ratings',
  notes:   'tt_notes',
  weights: 'tt_weights',
  setups:  'tt_setups',
};

// Caché en memoria
let _ratings = {};
let _notes   = {};
let _weights = {};
let _setups  = [];

// ── INIT ──────────────────────────────────────────────────────────────────────
/**
 * Carga todos los datos del usuario desde el backend.
 * Llamar una vez al arrancar la app (await storage.hydrate()).
 * FUTURO: aquí irá la llamada a Supabase con autenticación.
 */
export async function hydrate() {
  _ratings = JSON.parse(localStorage.getItem(KEYS.ratings) || '{}');
  _notes   = JSON.parse(localStorage.getItem(KEYS.notes)   || '{}');
  _weights = JSON.parse(localStorage.getItem(KEYS.weights) || '{}');
  _setups  = JSON.parse(localStorage.getItem(KEYS.setups)  || '[]');
}

// ── READS (síncronos desde caché) ─────────────────────────────────────────────
export function getRatings() { return _ratings; }
export function getNotes()   { return _notes;   }
export function getWeights() { return _weights; }
export function getSetups()  { return _setups;  }

// ── WRITES ────────────────────────────────────────────────────────────────────
export async function setRating(id, val) {
  _ratings[id] = val;
  localStorage.setItem(KEYS.ratings, JSON.stringify(_ratings));
  // FUTURO: await supabase.from('ratings').upsert({ item_id: id, value: val });
}

export async function setNote(id, text) {
  _notes[id] = text;
  localStorage.setItem(KEYS.notes, JSON.stringify(_notes));
  // FUTURO: await supabase.from('notes').upsert({ item_id: id, text });
}

/**
 * Peso medido por el usuario, en gramos. Pasar null/''/NaN borra la entrada.
 * Es un dato del usuario y vive aparte del `weight` del catálogo (hoja sin cortar):
 * aquí el usuario puede anotar lo que haya pesado él, cortado o no.
 */
export async function setWeight(id, val) {
  const n = parseFloat(val);
  if (!Number.isFinite(n) || n <= 0) delete _weights[id];
  else _weights[id] = Math.round(n * 10) / 10;
  localStorage.setItem(KEYS.weights, JSON.stringify(_weights));
  // FUTURO: await supabase.from('weights').upsert({ item_id: id, grams: n });
}

export async function upsertSetup(setup) {
  const idx = _setups.findIndex(s => s.id === setup.id);
  if (idx !== -1) _setups[idx] = setup;
  else _setups.unshift(setup);
  localStorage.setItem(KEYS.setups, JSON.stringify(_setups));
  // FUTURO: await supabase.from('setups').upsert(setup);
}

export async function removeSetup(id) {
  _setups = _setups.filter(s => s.id !== id);
  localStorage.setItem(KEYS.setups, JSON.stringify(_setups));
  // FUTURO: await supabase.from('setups').delete().eq('id', id);
}
