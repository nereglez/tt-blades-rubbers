import { state }   from '../state.js';
import * as storage from '../services/storage.js';
import { hardnessLabel, renderStars, typeTag, nivelColor, activationCurveSVG } from '../utils.js';
import { applyFilters } from './filters.js';

// Cache para datos completos (lazy loaded)
let fullData = null;

async function loadFullData() {
  if (fullData) return fullData;
  const [rubbersModule, bladesModule] = await Promise.all([
    import('../data/rubbers.js'),
    import('../data/blades.js')
  ]);
  fullData = [...rubbersModule.RUBBERS, ...bladesModule.BLADES];
  return fullData;
}

export async function openModal(id) {
  const allItems = await loadFullData();
  const item = allItems.find(x => x.id === id);
  if (!item) return;

  const isRubber = !!item.spin;
  const rating   = state.userRatings[id] || 0;
  const note     = state.userNotes[id]   || '';
  state.tempRating = rating;

  document.getElementById('modal-content').innerHTML = `
    <div class="modal-header">
      <div class="modal-title-area">
        <div class="modal-brand">${item.brand}</div>
        <h2>${item.name}</h2>
        <div class="card-tags" style="margin-top:8px">
          ${isRubber
            ? `<span class="tag ${typeTag(item.type)}">${item.type}</span>
               <span class="tag tag-cat">${item.cat}</span>`
            : `<span class="tag tag-off">${item.cat}</span>
               <span class="tag tag-mat">${item.material}</span>`
          }
        </div>
      </div>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>

    <div class="stat-bars-big">
      <div class="stat-row-big">
        <span class="stat-label-big">Velocidad</span>
        <div class="stat-bar-bg-big"><div class="stat-bar-fill-big fill-speed" style="width:${item.speed}%"></div></div>
        <span class="stat-num-big">${item.speed}/100</span>
      </div>
      ${isRubber ? `
      <div class="stat-row-big">
        <span class="stat-label-big">Spin</span>
        <div class="stat-bar-bg-big"><div class="stat-bar-fill-big fill-spin" style="width:${item.spin}%"></div></div>
        <span class="stat-num-big">${item.spin}/100</span>
      </div>` : ''}
      <div class="stat-row-big">
        <span class="stat-label-big">Control</span>
        <div class="stat-bar-bg-big"><div class="stat-bar-fill-big fill-control" style="width:${item.control}%"></div></div>
        <span class="stat-num-big">${item.control}/100</span>
      </div>
    </div>

    <div class="modal-grid">
      <div class="spec-section">
        <h3>Especificaciones</h3>
        <div class="spec-table">
          ${isRubber ? `
            <div class="spec-row"><span class="spec-key">Dureza</span><span class="spec-val">${hardnessLabel(item)}</span></div>
            <div class="spec-row"><span class="spec-key">Espesores</span><span class="spec-val">${Array.isArray(item.thickness) ? item.thickness.join(' / ') : item.thickness} mm</span></div>
            <div class="spec-row"><span class="spec-key">Colores</span><span class="spec-val">${item.color}</span></div>
          ` : `
            <div class="spec-row"><span class="spec-key">Capas</span><span class="spec-val">${item.plies}</span></div>
            <div class="spec-row"><span class="spec-key">Nº capas</span><span class="spec-val">${item.layers === 5 ? '5 capas' : item.layers === 7 ? '7 capas' : item.layers}</span></div>
            <div class="spec-row"><span class="spec-key">Material</span><span class="spec-val">${item.material}</span></div>
            ${item.wood ? `
            <div class="spec-row" style="display:block;padding:8px 10px;background:var(--surface2);border-radius:6px">
              <span class="spec-key">🌲 Maderas</span>
              <p style="font-size:0.8rem;color:var(--text);margin-top:4px;font-family:monospace">${item.wood}</p>
            </div>` : ''}
            <div class="spec-row"><span class="spec-key">Grosor</span><span class="spec-val">${item.thickness} mm</span></div>
            <div class="spec-row"><span class="spec-key">Peso aprox.</span><span class="spec-val">${item.weight} g</span></div>
          `}
        </div>
      </div>
      <div class="spec-section">
        <h3>Comercial</h3>
        <div class="spec-table">
          <div class="spec-row"><span class="spec-key">Precio aprox.</span><span class="spec-val" style="color:var(--accent3)">~€${item.price}</span></div>
          <div class="spec-row"><span class="spec-key">Categoría</span><span class="spec-val">${isRubber ? item.type : item.cat}</span></div>
          <div class="spec-row"><span class="spec-key">Marca</span><span class="spec-val">${item.brand}</span></div>
          ${item.nivel ? `<div class="spec-row"><span class="spec-key">Nivel recom.</span><span class="spec-val" style="color:${nivelColor(item.nivel)}">${item.nivel}</span></div>` : ''}
          ${item.note ? `
          <div class="spec-row" style="display:block;padding:8px 10px;background:var(--surface2);border-radius:6px">
            <span class="spec-key">📋 Info comunidad</span>
            <p style="font-size:0.8rem;color:var(--text);margin-top:4px">${item.note}</p>
          </div>` : ''}
        </div>
      </div>
    </div>

    ${isRubber && item.activationWindow ? `
    <div class="spec-section" style="margin-top:16px">
      <h3>Ventana de activación <span style="font-size:0.7rem;color:var(--text-dim);font-weight:400">(estimación)</span></h3>
      ${activationCurveSVG(item)}
      <p style="font-size:0.78rem;color:var(--text-dim);margin-top:6px">
        A baja velocidad de impacto (zona de saque), esta goma rinde ${item.activationWindow.center > 55 ? 'por debajo de su zona óptima — requiere más precisión y aceleración en el gesto para sacar con efecto' : 'dentro o cerca de su zona óptima — es más fácil generar efecto al sacar'}.
        ${item.aslReal ? `Rango verificado en andro.de (ASL): ${item.aslReal[0]}-${item.aslReal[1]}.` : `Estimación calculada a partir de dureza y elasticidad, sin dato oficial de ${item.brand} para este modelo.`}
      </p>
    </div>` : ''}

    <div class="rating-section">
      <h3>Mi puntuación</h3>
      <div class="stars-input" id="stars-input">
        ${[1,2,3,4,5].map(i =>
          `<button class="star-btn" onclick="setTempRating(${i},'${id}')" data-v="${i}">${i<=rating?'★':'☆'}</button>`
        ).join('')}
      </div>
      <h3 style="margin-bottom:8px">Mis notas</h3>
      <textarea id="note-input" placeholder="Escribe aquí tus observaciones…">${note}</textarea>
      <div class="modal-save-row">
        <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
        <button class="btn btn-primary" onclick="saveUserData('${id}')">Guardar</button>
      </div>
    </div>
  `;
  document.getElementById('modal').classList.add('open');
}

export function setTempRating(val) {
  state.tempRating = val;
  document.querySelectorAll('#stars-input .star-btn').forEach(btn => {
    const v = +btn.dataset.v;
    btn.textContent = v <= val ? '★' : '☆';
    btn.style.color = v <= val ? 'var(--star)' : 'var(--text-dim)';
  });
}

export async function saveUserData(id) {
  state.userRatings[id] = state.tempRating;
  state.userNotes[id]   = document.getElementById('note-input').value;
  await storage.setRating(id, state.tempRating);
  await storage.setNote(id, state.userNotes[id]);
  closeModal();
  applyFilters();
}

export function closeModal() {
  document.getElementById('modal').classList.remove('open');
}

export function closeModalOutside(e) {
  if (e.target.id === 'modal') closeModal();
}
