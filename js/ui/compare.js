import { RUBBERS } from '../data/rubbers-slim.js';
import { BLADES }  from '../data/blades-slim.js';
import { state }   from '../state.js';
import { toESN, renderStars } from '../utils.js';
import { applyFilters } from './filters.js';

export function toggleCompare(event, id) {
  if (event) event.stopPropagation();
  if (state.compareList.includes(id)) {
    state.compareList = state.compareList.filter(x => x !== id);
  } else {
    if (state.compareList.length >= 4) { alert('Máximo 4 elementos a comparar'); return; }
    state.compareList.push(id);
  }
  updateCompareBar();
  const card = document.querySelector(`.card[data-id="${id}"]`);
  if (card) {
    card.classList.toggle('in-compare', state.compareList.includes(id));
    const btn = card.querySelector('.btn-compare');
    if (btn) btn.classList.toggle('active', state.compareList.includes(id));
  }
}

export function updateCompareBar() {
  const bar      = document.getElementById('compare-bar');
  const chips    = document.getElementById('compare-chips');
  const countEl  = document.getElementById('compare-count');
  countEl.textContent = state.compareList.length;
  bar.classList.toggle('visible', state.compareList.length > 0);
  const allItems = [...RUBBERS, ...BLADES];
  chips.innerHTML = state.compareList.map(id => {
    const item = allItems.find(x => x.id === id);
    return `<div class="compare-chip">${item.brand} ${item.name}
              <button onclick="toggleCompare(event,'${id}')">×</button>
            </div>`;
  }).join('');
}

export function clearCompare() {
  state.compareList = [];
  updateCompareBar();
  applyFilters();
}

export function renderCompare() {
  const wrap = document.getElementById('compare-table-wrap');
  const hint = document.getElementById('compare-hint');
  if (!state.compareList.length) { wrap.innerHTML = ''; hint.style.display = 'block'; return; }
  hint.style.display = 'none';

  const allItems = [...RUBBERS, ...BLADES];
  const items    = state.compareList.map(id => allItems.find(x => x.id === id)).filter(Boolean);
  const isRubbers = items[0].spin !== undefined;

  const keys = isRubbers
    ? [['Marca','brand'],['Categoría','cat'],['Tipo','type'],['Velocidad','speed'],['Spin','spin'],
       ['Control','control'],['Dureza','hardness'],['Espesores','thickness'],['Precio (€)','price']]
    : [['Marca','brand'],['Categoría','cat'],['Capas','plies'],['Material','material'],
       ['Velocidad','speed'],['Control','control'],['Peso (g)','weight'],['Grosor (mm)','thickness'],['Precio (€)','price']];

  const numKeys = isRubbers ? ['speed','spin','control'] : ['speed','control'];
  const maxVals = {};
  numKeys.forEach(k => { maxVals[k] = Math.max(...items.map(x => x[k] || 0)); });

  let html = `<table class="compare-table">
    <thead>
      <tr>
        <th>Parámetro</th>
        ${items.map(i => `<th class="prod-name-col">${i.brand}<br>${i.name}</th>`).join('')}
      </tr>
    </thead>
    <tbody>`;

  keys.forEach(([label, key]) => {
    html += `<tr><td>${label}</td>`;
    items.forEach(item => {
      const val    = Array.isArray(item[key]) ? item[key].join(', ') : (item[key] ?? '—');
      const isNum  = numKeys.includes(key);
      const isBest = isNum && item[key] === maxVals[key];
      const barPct = isNum ? Math.round((item[key] / 100) * 120) : 0;
      html += `<td class="${isBest ? 'best-val' : ''}">`;
      if (key === 'hardness' && isRubbers) {
        const esnVal = toESN(item.hardness, item.hardScale);
        html += `${item.hardness}${item.hardScale}<br><span style="font-size:0.75rem;color:#c084fc">≈ ${esnVal}°ESN</span>`;
      } else if (isNum) {
        html += `<div class="compare-bar-cell"><div class="bar" style="width:${barPct}px;min-width:4px"></div> ${val}</div>`;
      } else {
        html += val;
      }
      html += '</td>';
    });
    html += '</tr>';
  });

  html += `<tr><td>Mi puntuación</td>${items.map(i => `<td>${renderStars(state.userRatings[i.id] || 0)}</td>`).join('')}</tr>`;
  html += `<tr><td>Mis notas</td>${items.map(i => `<td style="font-size:0.8rem;color:var(--text-dim);font-style:italic">${state.userNotes[i.id] || '—'}</td>`).join('')}</tr>`;
  html += '</tbody></table>';
  wrap.innerHTML = html;
}
