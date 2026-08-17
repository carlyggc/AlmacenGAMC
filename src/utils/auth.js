import AsyncStorage from '@react-native-async-storage/async-storage';

// ── CREDENCIALES DEL ADMINISTRADOR (cámbialas aquí) ──
export const ADMIN = {
  user: 'admin',
  pass: 'almacen2026',
  nombre: 'Carly',
};

const SKEY = 'almacen_sesion';

export async function loadSession() {
  try { const raw = await AsyncStorage.getItem(SKEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
}
export async function saveSession(s) {
  try { await AsyncStorage.setItem(SKEY, JSON.stringify(s)); } catch (e) {}
}
export async function clearSession() {
  try { await AsyncStorage.removeItem(SKEY); } catch (e) {}
}
export function checkLogin(u, p) {
  if ((u || '').trim().toLowerCase() === ADMIN.user && p === ADMIN.pass) {
    return { rol: 'admin', nombre: ADMIN.nombre };
  }
  return null;
}
export const visitante = () => ({ rol: 'visitante', nombre: 'Visitante' });