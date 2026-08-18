import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './api';
const SKEY = 'almacen_sesion';
export async function loadSession() { try { const raw = await AsyncStorage.getItem(SKEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; } }
export async function saveSession(s) { try { await AsyncStorage.setItem(SKEY, JSON.stringify(s)); } catch (e) {} }
export async function clearSession() { try { await AsyncStorage.removeItem(SKEY); } catch (e) {} }
export async function checkLogin(u, p) {
  try {
    const r = await fetch(`${API_URL}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user: (u || '').trim().toLowerCase(), pass: p }) });
    return r.ok ? await r.json() : null;
  } catch (e) { return null; }
}
export const visitante = () => ({ rol: 'visitante', nombre: 'Visitante' });