// ─── CONSTANTES ───────────────────────────────────────────────────────────────
export const THICKNESS_OPTS = ['1.5','1.7','1.8','1.9','2.0','2.1','2.2','2.3','Max'];

// ─── NORMALIZACIÓN DE DUREZA ──────────────────────────────────────────────────
// Butterfly (°J) y DHS (°C) usan Shore A.
// Fabricantes europeos (Andro, Tibhar, JOOLA, Yasaka, Donic, Stiga, Victas…)
// usan Shore O (= °ESN).
// Tabla de conversión empírica: Shore A → Shore O
// Fuente: r/tabletennis, TTGearLab, MyTableTennis forum.
export function toESN(h, scale) {
  if (!scale || scale.includes('ESN')) return h;
  const lut = {33:43,34:44,35:46,36:47,37:48,38:50,39:52,40:53,41:54,42:55,43:56,44:58,45:60};
  return lut[h] ?? (h >= 45 ? h + 15 : h + 11);
}

export function hardnessLabel(item) {
  const esn = toESN(item.hardness, item.hardScale);
  const orig = `${item.hardness}${item.hardScale}`;
  if (item.hardScale && !item.hardScale.includes('ESN')) {
    return `${orig} <span style="color:var(--text-dim);font-weight:400">≈ ${esn}°ESN</span>`;
  }
  return orig;
}

// Posición en la barra: escala 38–62°ESN normalizada a 0–100%
export function hardnessPct(item) {
  const esn = toESN(item.hardness, item.hardScale);
  return Math.min(100, Math.max(0, Math.round((esn - 38) / (62 - 38) * 100)));
}

// ─── HELPERS UI ───────────────────────────────────────────────────────────────
export function renderStars(n) {
  return [1,2,3,4,5].map(i =>
    `<span class="star ${i<=n?'':'empty'}">${i<=n?'★':'☆'}</span>`
  ).join('');
}

export function typeTag(type) {
  if (type === 'Ofensiva') return 'tag-off';
  if (type === 'Defensiva') return 'tag-def';
  return 'tag-all';
}

export function nivelColor(nivel) {
  if (nivel === 'Principiante') return '#4fd17a';
  if (nivel === 'Intermedio')   return '#f5c518';
  if (nivel === 'Avanzado')     return '#4f8ef7';
  if (nivel === 'Profesional')  return '#f75d5d';
  return '#7b82a8';
}
