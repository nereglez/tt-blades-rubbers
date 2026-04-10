import { state } from '../state.js';
import { toESN, hardnessPct, renderStars, typeTag, nivelColor } from '../utils.js';

export function renderGrid(items) {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  if (!items.length) {
    grid.innerHTML = '<div class="no-results"><span>🏓</span>Sin resultados con estos filtros</div>';
    return;
  }
  const isRubber = state.currentTab === 'rubbers';
  items.forEach(item => {
    const inCompare = state.compareList.includes(item.id);
    const rating    = state.userRatings[item.id] || 0;
    const note      = state.userNotes[item.id]   || '';

    grid.innerHTML += `
    <div class="card ${inCompare ? 'in-compare' : ''}" id="card-${item.id}" onclick="openModal('${item.id}')">
      <div class="card-top">
        <div>
          <div class="card-brand">${item.brand}</div>
          <div class="card-name">${item.name}</div>
        </div>
        <button class="btn btn-compare btn-sm ${inCompare ? 'active' : ''}"
                onclick="toggleCompare(event,'${item.id}')">⊕</button>
      </div>
      <div class="card-tags">
        ${isRubber
          ? `<span class="tag ${typeTag(item.type)}">${item.type}</span>
             <span class="tag tag-cat">${item.cat}</span>`
          : `<span class="tag tag-off">${item.cat}</span>
             <span class="tag tag-mat">${item.material}</span>`
        }
        ${item.nivel
          ? `<span class="tag" style="background:#1a1a2e;color:${nivelColor(item.nivel)};border:1px solid ${nivelColor(item.nivel)}40">${item.nivel}</span>`
          : ''
        }
      </div>
      <div class="stat-bars">
        <div class="stat-row">
          <span class="stat-label">Velocidad</span>
          <div class="stat-bar-bg"><div class="stat-bar-fill fill-speed" style="width:${item.speed}%"></div></div>
          <span class="stat-num">${item.speed}</span>
        </div>
        ${isRubber ? `
        <div class="stat-row">
          <span class="stat-label">Spin</span>
          <div class="stat-bar-bg"><div class="stat-bar-fill fill-spin" style="width:${item.spin}%"></div></div>
          <span class="stat-num">${item.spin}</span>
        </div>` : ''}
        <div class="stat-row">
          <span class="stat-label">Control</span>
          <div class="stat-bar-bg"><div class="stat-bar-fill fill-control" style="width:${item.control}%"></div></div>
          <span class="stat-num">${item.control}</span>
        </div>
        ${isRubber ? `
        <div class="stat-row">
          <span class="stat-label" style="color:#c084fc">Dureza</span>
          <div class="stat-bar-bg" title="${toESN(item.hardness, item.hardScale)}°ESN normalizado">
            <div class="stat-bar-fill" style="width:${hardnessPct(item)}%;background:linear-gradient(90deg,#818cf8,#c084fc)"></div>
          </div>
          <span class="stat-num" style="font-size:0.68rem;color:#c084fc">${toESN(item.hardness, item.hardScale)}°</span>
        </div>` : ''}
      </div>
      <div class="card-footer">
        <span class="card-price">~€${item.price}</span>
        ${isRubber
          ? `<span class="card-hardness" style="font-size:0.72rem">${item.hardness}${item.hardScale || ''}</span>`
          : `<span class="card-hardness">${item.plies} · ${item.weight}g</span>`
        }
        <div class="card-rating">${renderStars(rating)}</div>
      </div>
      ${note ? `<div class="card-note-preview">📝 ${note}</div>` : ''}
    </div>`;
  });
}
