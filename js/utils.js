// ─── CONSTANTES ───────────────────────────────────────────────────────────────
export const THICKNESS_OPTS = ['1.5','1.7','1.8','1.9','2.0','2.1','2.2','2.3','Max'];

// ─── NORMALIZACIÓN DE DUREZA ──────────────────────────────────────────────────
// Solo Butterfly (°J) y DHS/Sanwei (°C) necesitan conversión (usan Shore A).
// Fabricantes europeos (Andro, Tibhar, JOOLA, Yasaka, Donic, Stiga, Victas, Xiom…)
// ya usan Shore O (= °ESN) directamente.
// Tabla de conversión empírica: Shore A → Shore O
// Fuente: r/tabletennis, TTGearLab, MyTableTennis forum.
export function toESN(h, scale) {
  // Solo convertir si es escala japonesa (°J) o china (°C)
  const needsConversion = scale && (scale.startsWith('°J') || scale.startsWith('°C'));
  if (!needsConversion) return h;
  const lut = {33:43,34:44,35:46,36:47,37:48,38:50,39:52,40:53,41:54,42:55,43:56,44:58,45:60};
  return lut[h] ?? (h >= 45 ? h + 15 : h + 11);
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
