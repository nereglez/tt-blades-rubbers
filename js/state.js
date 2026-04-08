// ─── ESTADO GLOBAL DE LA APLICACIÓN ──────────────────────────────────────────
// Módulo de estado reactivo mínimo. Exporta getters y setters explícitos para
// que los módulos de UI no accedan a variables globales directamente, y para
// facilitar la migración a un store más sofisticado en el futuro.

export const state = {
  currentTab: 'rubbers',
  compareList: [],
  showOnlyRated: false,
  tempRating: 0,
  tempSetupRating: 0,
  editingSetupId: null,

  // Datos de usuario — se hidratan desde storage en init()
  userRatings: {},
  userNotes: {},
  setupsList: [],
};
