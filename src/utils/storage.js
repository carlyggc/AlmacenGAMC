import AsyncStorage from '@react-native-async-storage/async-storage';

// ── DIRECCIÓN DEL BACKEND (tu túnel público) ──
export const API_URL = 'https://icon-scoff-skimmed.ngrok-free.dev';

const KEY = 'almacen_productos';
const CAT_KEY = 'almacen_catalogo';
const UNI_KEY = 'almacen_unidades';
const SAL_KEY = 'almacen_salidas';
const REP_KEY = 'almacen_reportes';

// ✅ Evita la página de aviso del plan gratis de ngrok
const NGROK = { 'ngrok-skip-browser-warning': '1' };

async function readLocal(key) {
  try { const raw = await AsyncStorage.getItem(key); return raw ? JSON.parse(raw) : []; } catch (e) { return []; }
}
async function writeLocal(key, list) {
  try { await AsyncStorage.setItem(key, JSON.stringify(list)); } catch (e) {}
}
async function apiGet(col) {
  const res = await fetch(API_URL + '/api/' + col, { headers: NGROK });
  if (!res.ok) throw new Error('backend');
  return await res.json();
}
async function apiPut(col, list) {
  const res = await fetch(API_URL + '/api/' + col, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...NGROK },
    body: JSON.stringify(list),
  });
  if (!res.ok) throw new Error('backend');
}
async function loadCol(col, key) {
  if (API_URL) {
    try {
      const remote = await apiGet(col);
      if (Array.isArray(remote) && remote.length) return remote;
      const local = await readLocal(key);
      if (local.length) { await apiPut(col, local); return local; } // migración automática
      return [];
    } catch (e) {}
  }
  return readLocal(key);
}
async function saveCol(col, key, list) {
  if (API_URL) { try { await apiPut(col, list); return; } catch (e) {} }
  await writeLocal(key, list);
}

export const loadProducts = () => loadCol('productos', KEY);
export const saveProducts = (l) => saveCol('productos', KEY, l);
export const loadCatalog = () => loadCol('catalogo', CAT_KEY);
export const saveCatalog = (l) => saveCol('catalogo', CAT_KEY, l);
export const loadUnits = () => loadCol('unidades', UNI_KEY);
export const saveUnits = (l) => saveCol('unidades', UNI_KEY, l);
export const loadWithdrawals = () => loadCol('salidas', SAL_KEY);
export const saveWithdrawals = (l) => saveCol('salidas', SAL_KEY, l);
export const loadReports = () => loadCol('reportes', REP_KEY);
export async function saveReportLog(rec) {
  const list = await loadReports();
  await saveCol('reportes', REP_KEY, [rec, ...list].slice(0, 200));
}