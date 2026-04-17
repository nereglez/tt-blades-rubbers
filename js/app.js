// ─── PUNTO DE ENTRADA ─────────────────────────────────────────────────────────
// Orquesta la inicialización y expone las funciones globales que el HTML
// referencia en sus atributos onclick="…".
//
// NOTA: Los handlers inline (onclick="fn()") requieren que las funciones estén
// en window. En una refactorización futura se puede migrar a addEventListener
// con delegación de eventos y eliminar esta sección de window.*.

import { state }             from './state.js';
import * as storage          from './services/storage.js';
import { populateBrandFilters, applyFilters, resetFilters, toggleRated } from './ui/filters.js';
import { openModal, closeModal, closeModalOutside, setTempRating, saveUserData } from './ui/modal.js';
import { toggleCompare, updateCompareBar, clearCompare, renderCompare } from './ui/compare.js';
import { renderSetups, openSetupModal, setTempSetupRating, saveSetup, deleteSetup,
         closeSetupModal, closeSetupModalOutside } from './ui/setups.js';

// ── TABS ──────────────────────────────────────────────────────────────────────
function switchTab(tab) {
  state.currentTab = tab;

  ['rubbers', 'blades', 'compare', 'setups'].forEach(t => {
    const btn = document.getElementById('tab-' + t);
    if (btn) btn.classList.toggle('active', t === tab);
  });

  const isSetups  = tab === 'setups';
  const isCompare = tab === 'compare';

  document.getElementById('main-view').style.display    = (!isSetups && !isCompare) ? 'block' : 'none';
  document.getElementById('compare-view').style.display = isCompare ? 'block' : 'none';
  document.getElementById('setups-view').style.display  = isSetups  ? 'block' : 'none';

  // La sidebar no tiene sentido en la pestaña de setups
  document.querySelector('.sidebar').style.display = isSetups ? 'none' : 'flex';

  document.getElementById('rubber-filters').style.display = (tab === 'rubbers') ? 'flex' : 'none';
  document.getElementById('blade-filters').style.display  = (tab === 'blades')  ? 'flex' : 'none';

  if (isCompare)     renderCompare();
  else if (isSetups) renderSetups();
  else               applyFilters();
}

// ── INIT ──────────────────────────────────────────────────────────────────────
async function init() {
  // Hidratar estado de usuario desde el backend de persistencia
  await storage.hydrate();
  state.userRatings = storage.getRatings();
  state.userNotes   = storage.getNotes();
  state.setupsList  = storage.getSetups();

  // Event delegation para el grid (evita 100+ listeners individuales)
  document.getElementById('grid').addEventListener('click', (e) => {
    // Click en botón comparar
    const compareBtn = e.target.closest('[data-compare]');
    if (compareBtn) {
      e.stopPropagation();
      toggleCompare(e, compareBtn.dataset.compare);
      return;
    }
    // Click en card → abrir modal
    const card = e.target.closest('.card[data-id]');
    if (card) {
      openModal(card.dataset.id);
    }
  });

  populateBrandFilters();
  applyFilters();
}

// ── EXPONER FUNCIONES GLOBALES (onclick handlers en el HTML) ──────────────────
// Al usar ES Modules el scope es local, por lo que hay que asignar
// explícitamente a window lo que el HTML referencia como onclick="…".
Object.assign(window, {
  switchTab,
  applyFilters,
  resetFilters,
  toggleRated,
  openModal,
  closeModal,
  closeModalOutside,
  setTempRating,
  saveUserData,
  toggleCompare,
  updateCompareBar,
  clearCompare,
  openSetupModal,
  setTempSetupRating,
  saveSetup,
  deleteSetup,
  closeSetupModal,
  closeSetupModalOutside,
});

// ── ARRANCAR ──────────────────────────────────────────────────────────────────
init();
