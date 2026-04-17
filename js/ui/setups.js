import { RUBBERS } from '../data/rubbers-slim.js';
import { BLADES }  from '../data/blades-slim.js';
import { state }   from '../state.js';
import * as storage from '../services/storage.js';
import { THICKNESS_OPTS, renderStars } from '../utils.js';

export function renderSetups() {
  const grid  = document.getElementById('setups-grid');
  const empty = document.getElementById('setups-empty');

  if (!state.setupsList.length) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  grid.innerHTML = state.setupsList.map(s => {
    const stars   = renderStars(s.rating || 0);
    const dateStr = s.date ? new Date(s.date).toLocaleDateString('es-ES') : '';
    const badgeFH = `<span class="setup-part-badge ${s.fhColor === 'Rojo' ? 'badge-red' : 'badge-black'}">${s.fhColor}</span>`;
    const badgeBH = `<span class="setup-part-badge ${s.bhColor === 'Rojo' ? 'badge-red' : 'badge-black'}">${s.bhColor}</span>`;
    return `
    <div class="setup-card">
      <div class="setup-card-title">${s.blade || '—'}</div>
      <div class="setup-card-date">${dateStr}</div>
      <div class="setup-parts">
        <div class="setup-part">
          <span class="setup-part-label">Derecha</span>
          <span class="setup-part-val">${s.fhRubber || '—'}</span>
          <span style="color:var(--text-dim);font-size:0.78rem">${s.fhThickness}mm</span>
          ${badgeFH}
        </div>
        <div class="setup-part">
          <span class="setup-part-label">Revés</span>
          <span class="setup-part-val">${s.bhRubber || '—'}</span>
          <span style="color:var(--text-dim);font-size:0.78rem">${s.bhThickness}mm</span>
          ${badgeBH}
        </div>
      </div>
      ${s.notes ? `<div class="setup-note-preview">📝 ${s.notes}</div>` : ''}
      <div class="setup-footer">
        <div class="card-rating">${stars}</div>
        <div class="setup-actions">
          <button class="btn btn-outline btn-sm" onclick="openSetupModal('${s.id}')">Editar</button>
          <button class="btn btn-danger btn-sm" onclick="deleteSetup('${s.id}')">Eliminar</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

export function openSetupModal(id) {
  state.editingSetupId = id;
  const s = id ? state.setupsList.find(x => x.id === id) : null;
  state.tempSetupRating = s ? (s.rating || 0) : 0;

  const bladeNames  = BLADES.map(b => b.name).sort();
  const rubberNames = RUBBERS.map(r => r.name).sort();

  const thicknessOpts   = THICKNESS_OPTS.map(t => `<option value="${t}"${(s && s.fhThickness === t) ? ' selected' : ''}>${t}</option>`).join('');
  const thicknessOptsBH = THICKNESS_OPTS.map(t => `<option value="${t}"${(s && s.bhThickness === t) ? ' selected' : ''}>${t}</option>`).join('');

  document.getElementById('setup-modal-content').innerHTML = `
    <div class="modal-header">
      <div class="modal-title-area">
        <h2>${id ? 'Editar setup' : 'Nuevo setup'}</h2>
      </div>
      <button class="modal-close" onclick="closeSetupModal()">✕</button>
    </div>

    <div class="setup-modal-grid">
      <div class="form-group" style="grid-column:1/-1">
        <label>Madera</label>
        <input type="text" id="setup-blade" list="blade-list"
               placeholder="Nombre de la madera…" value="${s ? s.blade : ''}">
        <datalist id="blade-list">${bladeNames.map(n => `<option value="${n}">`).join('')}</datalist>
      </div>
      <div class="form-group" style="grid-column:1/-1">
        <hr style="border-color:var(--border);margin:4px 0">
      </div>

      <div class="form-group">
        <label>Goma Derecha (FH)</label>
        <input type="text" id="setup-fh-rubber" list="rubber-list-fh"
               placeholder="Nombre de la goma…" value="${s ? s.fhRubber : ''}">
        <datalist id="rubber-list-fh">${rubberNames.map(n => `<option value="${n}">`).join('')}</datalist>
      </div>
      <div class="form-group">
        <label>Color</label>
        <select id="setup-fh-color">
          <option value="Rojo"  ${s && s.fhColor === 'Rojo'  ? 'selected' : ''}>Rojo</option>
          <option value="Negro" ${s && s.fhColor === 'Negro' ? 'selected' : ''}>Negro</option>
        </select>
      </div>
      <div class="form-group">
        <label>Grosor FH</label>
        <select id="setup-fh-thickness">${thicknessOpts}</select>
      </div>

      <div class="form-group" style="grid-column:1/-1">
        <hr style="border-color:var(--border);margin:4px 0">
      </div>

      <div class="form-group">
        <label>Goma Revés (BH)</label>
        <input type="text" id="setup-bh-rubber" list="rubber-list-bh"
               placeholder="Nombre de la goma…" value="${s ? s.bhRubber : ''}">
        <datalist id="rubber-list-bh">${rubberNames.map(n => `<option value="${n}">`).join('')}</datalist>
      </div>
      <div class="form-group">
        <label>Color</label>
        <select id="setup-bh-color">
          <option value="Rojo"  ${s && s.bhColor === 'Rojo'  ? 'selected' : ''}>Rojo</option>
          <option value="Negro" ${s && s.bhColor === 'Negro' ? 'selected' : ''}>Negro</option>
        </select>
      </div>
      <div class="form-group">
        <label>Grosor BH</label>
        <select id="setup-bh-thickness">${thicknessOptsBH}</select>
      </div>
    </div>

    <div class="rating-section">
      <h3>Puntuación del setup</h3>
      <div class="stars-input" id="setup-stars-input">
        ${[1,2,3,4,5].map(i =>
          `<button class="star-btn" onclick="setTempSetupRating(${i})" data-v="${i}"
                   style="color:${i <= state.tempSetupRating ? 'var(--star)' : 'var(--text-dim)'}">
            ${i <= state.tempSetupRating ? '★' : '☆'}
          </button>`
        ).join('')}
      </div>
      <h3 style="margin-bottom:8px">Notas</h3>
      <textarea id="setup-notes"
                placeholder="Sensaciones, contexto, torneos donde lo usaste…"
                style="height:90px">${s ? s.notes : ''}</textarea>
    </div>
    <div class="modal-save-row">
      <button class="btn btn-outline" onclick="closeSetupModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="saveSetup()">Guardar setup</button>
    </div>
  `;
  document.getElementById('setup-modal').classList.add('open');
}

export function setTempSetupRating(val) {
  state.tempSetupRating = val;
  document.querySelectorAll('#setup-stars-input .star-btn').forEach(btn => {
    const v = +btn.dataset.v;
    btn.textContent = v <= val ? '★' : '☆';
    btn.style.color = v <= val ? 'var(--star)' : 'var(--text-dim)';
  });
}

export async function saveSetup() {
  const existingSetup = state.editingSetupId
    ? state.setupsList.find(x => x.id === state.editingSetupId)
    : null;

  const setup = {
    id:           state.editingSetupId || ('s' + Date.now()),
    blade:        document.getElementById('setup-blade').value.trim(),
    fhRubber:     document.getElementById('setup-fh-rubber').value.trim(),
    fhThickness:  document.getElementById('setup-fh-thickness').value,
    fhColor:      document.getElementById('setup-fh-color').value,
    bhRubber:     document.getElementById('setup-bh-rubber').value.trim(),
    bhThickness:  document.getElementById('setup-bh-thickness').value,
    bhColor:      document.getElementById('setup-bh-color').value,
    rating:       state.tempSetupRating,
    notes:        document.getElementById('setup-notes').value.trim(),
    date:         existingSetup ? existingSetup.date : new Date().toISOString(),
  };

  await storage.upsertSetup(setup);
  // Sincronizar caché local en state
  state.setupsList = storage.getSetups();

  closeSetupModal();
  renderSetups();
}

export async function deleteSetup(id) {
  if (!confirm('¿Eliminar este setup?')) return;
  await storage.removeSetup(id);
  state.setupsList = storage.getSetups();
  renderSetups();
}

export function closeSetupModal() {
  document.getElementById('setup-modal').classList.remove('open');
}

export function closeSetupModalOutside(e) {
  if (e.target.id === 'setup-modal') closeSetupModal();
}
