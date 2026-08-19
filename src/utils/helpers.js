import { useWindowDimensions } from 'react-native';
import { createCategoria } from './api';

export const byName = (a, b) => (a.name || '').localeCompare(b.name || '', 'es', { sensitivity: 'base' });
export const byCat = (a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' });

export function fmtDate(iso) { if (!iso) return '—'; const d = new Date(iso); if (isNaN(d.getTime())) return '—'; return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`; }
export function fmtDateTime(iso) { if (!iso) return '—'; const d = new Date(iso); if (isNaN(d.getTime())) return '—'; return `${fmtDate(iso)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; }

export const MESES = ['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];
export function monthInfo(iso) { if (!iso) return null; const d = new Date(iso); if (isNaN(d.getTime())) return null; return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: `${MESES[d.getMonth()]} ${d.getFullYear()}` }; }

// ✅ Paleta de 18 colores bien distintos (misma que en el servidor)
const CAT_PALETTE = ['#E53935','#1E88E5','#8E24AA','#43A047','#FB8C00','#D81B60','#6D4C41','#3949AB','#7CB342','#F4511E','#5E35B1','#00695C','#AD1457','#283593','#558B2F','#F9A825','#4E342E','#546E7A'];

// ✅ Mapa dinámico: categoría (minúsculas) → color. Se llena al iniciar y crece solo.
const catMap = new Map();

export function initCatColors(list) {
  (list || []).forEach(c => { if (c && c.name && c.color) catMap.set(String(c.name).toLowerCase(), c.color); });
}

export function catColor(cat) {
  const c = String(cat || 'Sin categoría').trim();
  const low = c.toLowerCase();
  if (low === 'materiales') return '#2FB6C4';
  if (low === 'herramientas') return '#3E1F5C';
  if (catMap.has(low)) return catMap.get(low);

  // 🆕 Categoría nueva: toma el primer color LIBRE (nunca repetido) y lo guarda en el backend
  const used = new Set(catMap.values());
  let color = CAT_PALETTE.find(x => !used.has(x));
  if (!color) { // si algún día superas los 18, reparte con hash FNV-1a
    let h = 2166136261;
    for (let i = 0; i < low.length; i++) { h ^= low.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    color = CAT_PALETTE[h % CAT_PALETTE.length];
  }
  catMap.set(low, color);
  createCategoria(c, color).catch(() => {}); // persiste sin bloquear la UI
  return color;
}

export function useCols() { const { width } = useWindowDimensions(); return width >= 1000 ? 4 : width >= 700 ? 3 : width >= 500 ? 2 : 1; }

export const catsOf = (items) => Array.from(new Set(items.map(p => p.cat || 'Sin categoría'))).sort(byCat);
export const fixTab = (tab, cats) => (tab !== 'todos' && !cats.includes(tab) ? 'todos' : tab);
export const filterItems = (items, tab, search) => items.filter(p => tab === 'todos' || (p.cat || 'Sin categoría') === tab).filter(p => (p.name || '').toLowerCase().includes((search || '').trim().toLowerCase()));

export function groupByName(items) {
  const map = {};
  items.forEach(p => {
    const k = (p.name || '').trim().toUpperCase();
    if (!map[k]) map[k] = { name: p.name, unit: p.unit || 'Unidad', cat: p.cat || 'Sin categoría', photo: p.photo || null, total: 0, entries: [] };
    if (!map[k].photo && p.photo) map[k].photo = p.photo;
    map[k].total += p.qty || 0; map[k].entries.push(p);
  });
  return Object.values(map).sort(byName);
}