import { RUBBERS } from '../data/rubbers.js';
import { BLADES }  from '../data/blades.js';
import { state }   from '../state.js';
import { toESN }   from '../utils.js';
import { renderGrid } from './cards.js';

export function populateBrandFilters() {
  const rubberBrands = [...new Set(RUBBERS.map(r => r.brand))].sort();
  const bladeBrands  = [...new Set(BLADES.map(b => b.brand))].sort();
  const rSel = document.getElementById('filter-brand');
  const bSel = document.getElementById('filter-blade-brand');
  rubberBrands.forEach(b => { rSel.innerHTML += `<option>${b}</option>`; });
  bladeBrands.forEach(b  => { bSel.innerHTML += `<option>${b}</option>`; });
}

export function applyFilters() {
  if (state.currentTab === 'compare' || state.currentTab === 'setups') return;

  const search = document.getElementById('search').value.toLowerCase();
  const sort   = document.getElementById('sort-select').value;

  let items;
  if (state.currentTab === 'rubbers') {
    const type     = document.getElementById('filter-type').value;
    const cat      = document.getElementById('filter-cat').value;
    const brand    = document.getElementById('filter-brand').value;
    const minSpeed = +document.getElementById('filter-speed').value;
    const minHard  = +document.getElementById('filter-hard-min').value;
    const maxHard  = +document.getElementById('filter-hard').value;
    const nivel    = document.getElementById('filter-nivel').value;

    items = RUBBERS.filter(r => {
      if (search && !r.name.toLowerCase().includes(search) && !r.brand.toLowerCase().includes(search)) return false;
      if (type  && r.type  !== type)  return false;
      if (cat   && r.cat   !== cat)   return false;
      if (brand && r.brand !== brand) return false;
      if (r.speed < minSpeed) return false;
      const hardESN = toESN(r.hardness, r.hardScale);
      if (hardESN < minHard || hardESN > maxHard) return false;
      if (nivel && r.nivel !== nivel) return false;
      if (state.showOnlyRated && !state.userRatings[r.id]) return false;
      return true;
    });
  } else {
    const cat      = document.getElementById('filter-blade-cat').value;
    const brand    = document.getElementById('filter-blade-brand').value;
    const mat      = document.getElementById('filter-material').value;
    const minSpeed = +document.getElementById('filter-blade-speed').value;
    const nivel    = document.getElementById('filter-blade-nivel').value;

    items = BLADES.filter(b => {
      if (search && !b.name.toLowerCase().includes(search) && !b.brand.toLowerCase().includes(search)) return false;
      if (cat   && b.cat   !== cat)              return false;
      if (brand && b.brand !== brand)            return false;
      if (mat   && !b.material.includes(mat))    return false;
      if (b.speed < minSpeed)                    return false;
      if (nivel && b.nivel !== nivel)            return false;
      if (state.showOnlyRated && !state.userRatings[b.id]) return false;
      return true;
    });
  }

  // Ordenar
  items = [...items];
  if (sort === 'name')         items.sort((a,b) => a.name.localeCompare(b.name));
  else if (sort === 'speed-desc')   items.sort((a,b) => b.speed - a.speed);
  else if (sort === 'spin-desc')    items.sort((a,b) => (b.spin||0) - (a.spin||0));
  else if (sort === 'control-desc') items.sort((a,b) => b.control - a.control);
  else if (sort === 'rating-desc')  items.sort((a,b) => (state.userRatings[b.id]||0) - (state.userRatings[a.id]||0));
  else if (sort === 'price-asc')    items.sort((a,b) => a.price - b.price);

  document.getElementById('results-count').textContent = `${items.length} resultados`;
  renderGrid(items);
}

export function resetFilters() {
  document.getElementById('search').value = '';
  ['filter-type','filter-cat','filter-brand','filter-blade-cat','filter-blade-brand',
   'filter-material','filter-nivel','filter-blade-nivel'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('filter-speed').value      = 0; document.getElementById('spd-val').textContent      = '0';
  document.getElementById('filter-hard-min').value   = 25; document.getElementById('hrd-min-val').textContent = '25';
  document.getElementById('filter-hard').value       = 65; document.getElementById('hrd-val').textContent     = '65';
  document.getElementById('filter-blade-speed').value = 0; document.getElementById('bspd-val').textContent    = '0';
  applyFilters();
}

export function toggleRated() {
  state.showOnlyRated = !state.showOnlyRated;
  const btn = document.getElementById('rated-btn');
  btn.textContent    = 'Mostrar todas';
  btn.style.borderColor = state.showOnlyRated ? 'var(--star)' : '';
  applyFilters();
}
