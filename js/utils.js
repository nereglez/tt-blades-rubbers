// ─── CONSTANTES ───────────────────────────────────────────────────────────────
export const THICKNESS_OPTS = ['1.5','1.7','1.8','1.9','2.0','2.1','2.2','2.3','Max'];

// ─── NORMALIZACIÓN DE DUREZA ──────────────────────────────────────────────────
// Solo Butterfly (°J, escala propietaria) y DHS/Sanwei (°C, Shore A) necesitan
// conversión. Los fabricantes europeos (Andro, Tibhar, JOOLA, Yasaka, Donic, Stiga,
// Victas, Xiom…) ya publican en Shore O (= °ESN) directamente.
//
// Tabla de equivalencia ESN ↔ DHS ↔ Butterfly. Fuente: r/tabletennis,
// "Tenergy and Dignics sponge hardness (ESN scale)" (post 1n86ntx).
// Cada fila es [°ESN (Shore O), °C (DHS, Shore A), °J (Butterfly)].
const HARDNESS_TABLE = [
  [40, 35.0, 32.0], [41, 35.0, 32.0], [42, 35.0, 32.0], [43, 35.0, 32.4],
  [44, 35.5, 33.2], [45, 36.0, 34.0], [46, 36.5, 34.8], [47, 37.0, 35.6],
  [48, 37.5, 36.5], [49, 38.0, 37.5], [50, 38.5, 38.5], [51, 39.0, 39.5],
  [52, 39.5, 40.3], [53, 40.0, 41.0], [54, 40.5, 41.7], [55, 41.0, 42.3],
  [56, 41.3, 43.0], [57, 41.7, 44.0], [58, 42.0, 44.0], [59, 42.0, 44.0],
  [60, 42.0, 44.0],
];
const COL = { '°C': 1, '°J': 2 };

// Gomas Butterfly que el propio post sitúa en una fila concreta. Mandan sobre la
// interpolación: en los tramos planos de la tabla (32.0 se repite en 40-42°ESN y
// 44.0 en 57-60°ESN) el inverso es ambiguo, y en 40°J/42°J la interpolación cae
// justo en el medio de dos filas.
const J_ANCHORS = {
  32: 40, // Tenergy FX (05, 64, 80, 25)
  35: 46, // Rozena
  36: 47, // Tenergy 05 / 19 / 64 / 80 / 25
  38: 50, // Glayzer
  40: 51, // Dignics 05 / 64 / 80
  42: 54, // Glayzer 09C
  43: 56, // Tenergy 05 Hard
  44: 57, // Dignics 09C
};

// Puntos (dureza origen → °ESN) de una columna, colapsando los tramos planos:
// de cada valor repetido nos quedamos con el °ESN más bajo, igual que hace el post
// al colocar ahí las gomas de ejemplo.
function tablePoints(col) {
  const pts = [];
  for (const row of HARDNESS_TABLE) {
    if (!pts.length || row[col] > pts[pts.length - 1][0]) pts.push([row[col], row[0]]);
  }
  return pts;
}
const POINTS = { '°C': tablePoints(COL['°C']), '°J': tablePoints(COL['°J']) };

// Interpolación lineal sobre los puntos. Fuera de rango extrapolamos con la pendiente
// media de toda la columna, no con la del segmento del extremo: los extremos de la tabla
// son tramos planos y su pendiente local dispara la extrapolación.
function interpESN(pts, h) {
  const first = pts[0], last = pts[pts.length - 1];
  const slope = (last[1] - first[1]) / (last[0] - first[0]);
  if (h <= first[0]) return first[1] + (h - first[0]) * slope;
  if (h >= last[0])  return last[1]  + (h - last[0])  * slope;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    if (h <= b[0]) return a[1] + (h - a[0]) * (b[1] - a[1]) / (b[0] - a[0]);
  }
  return last[1];
}

export function toESN(h, scale) {
  // Solo convertir si es escala japonesa (°J) o china (°C)
  const key = scale && scale.startsWith('°J') ? '°J'
            : scale && scale.startsWith('°C') ? '°C'
            : null;
  if (!key) return h;
  if (key === '°J' && J_ANCHORS[h] != null) return J_ANCHORS[h];
  return Math.round(interpESN(POINTS[key], h));
}

export function hardnessLabel(item) {
  const esn = toESN(item.hardness, item.hardScale);
  const orig = `${item.hardness}${item.hardScale}`;
  const needsConversion = item.hardScale && (item.hardScale.startsWith('°J') || item.hardScale.startsWith('°C'));
  if (needsConversion) {
    return `${orig} <span style="color:var(--text-dim);font-weight:400">≈ ${esn}°ESN</span>`;
  }
  return orig;
}

// Posición en la barra: escala 25–60°ESN normalizada a 0–100%. Es el rango real del
// catálogo (de los antitopspin/picos más blandos a las esponjas chinas más duras);
// con el rango anterior (38–62) todas las gomas blandas se aplastaban contra el 0%.
export const HARD_BAR_MIN = 25, HARD_BAR_MAX = 60;
export function hardnessPct(item) {
  const esn = toESN(item.hardness, item.hardScale);
  const pct = (esn - HARD_BAR_MIN) / (HARD_BAR_MAX - HARD_BAR_MIN) * 100;
  return Math.min(100, Math.max(0, Math.round(pct)));
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

// ─── VENTANA DE ACTIVACIÓN ────────────────────────────────────────────────────
// Curva gaussiana simplificada: y = exp(-0.5 * ((x-center)/sigma)^2)
// center/width vienen en escala 0-100 (posición relativa de velocidad de impacto).
// Ver la cabecera de data/rubbers.js para cómo se derivan center/width.
export function activationCurveSVG(item) {
  if (!item.activationWindow) return '';
  const { center, width } = item.activationWindow;
  const sigma = Math.max(8, width / 2.2);
  const W = 460, H = 150, padL = 10, padR = 10, padT = 14, padB = 26;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const toX = pct => padL + (pct / 100) * plotW;
  const pts = [];
  for (let x = 0; x <= 100; x += 2) {
    const y = Math.exp(-0.5 * Math.pow((x - center) / sigma, 2));
    pts.push(`${toX(x)},${padT + plotH * (1 - y)}`);
  }
  const path = 'M ' + pts.join(' L ');

  // Franja de saque: velocidades de impacto bajas (0-20% de la escala)
  const serveZoneW = toX(20) - padL;

  // Si tenemos ASL real, lo mostramos como banda sombreada aparte (dato oficial)
  let aslBand = '';
  if (item.aslReal) {
    // el propio aslReal ya está en unidades ASL (0-12 aprox); lo proyectamos sobre el eje 0-100
    const aslMinPos = toX(Math.max(0, Math.min(100, (item.aslReal[0] / 12) * 100)));
    const aslMaxPos = toX(Math.max(0, Math.min(100, (item.aslReal[1] / 12) * 100)));
    aslBand = `<rect x="${aslMinPos}" y="${padT}" width="${Math.max(2, aslMaxPos - aslMinPos)}" height="${plotH}" fill="#4fd17a" opacity="0.18"/>
      <text x="${(aslMinPos+aslMaxPos)/2}" y="${padT - 3}" text-anchor="middle" font-size="9" fill="#4fd17a">ASL real ${item.aslReal[0]}-${item.aslReal[1]}</text>`;
  }

  return `
  <svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" style="display:block">
    <rect x="${padL}" y="${padT}" width="${serveZoneW}" height="${plotH}" fill="#f75d5d" opacity="0.12"/>
    <text x="${padL + serveZoneW/2}" y="${H - padB + 14}" text-anchor="middle" font-size="9" fill="#f5807a">saque</text>
    ${aslBand}
    <line x1="${padL}" y1="${padT+plotH}" x2="${W-padR}" y2="${padT+plotH}" stroke="var(--border)" stroke-width="1"/>
    <path d="${path}" fill="none" stroke="var(--accent)" stroke-width="2.5"/>
    <text x="${padL}" y="${H-4}" font-size="9" fill="var(--text-dim)">lenta</text>
    <text x="${W-padR}" y="${H-4}" text-anchor="end" font-size="9" fill="var(--text-dim)">rápida</text>
    <text x="${W/2}" y="${H-4}" text-anchor="middle" font-size="9" fill="var(--text-dim)">velocidad de impacto</text>
  </svg>`;
}
