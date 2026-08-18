import { useWindowDimensions } from 'react-native';
export const byName = (a, b) => (a.name || '').localeCompare(b.name || '', 'es', { sensitivity: 'base' });
export const byCat = (a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' });
export function fmtDate(iso) { if (!iso) return '—'; const d = new Date(iso); if (isNaN(d.getTime())) return '—'; return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`; }
export function fmtDateTime(iso) { if (!iso) return '—'; const d = new Date(iso); if (isNaN(d.getTime())) return '—'; return `${fmtDate(iso)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; }
export const MESES = ['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];
export function monthInfo(iso) { if (!iso) return null; const d = new Date(iso); if (isNaN(d.getTime())) return null; return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: `${MESES[d.getMonth()]} ${d.getFullYear()}` }; }
const CAT_PALETTE = ['#2FB6C4','#3E1F5C','#B94B30','#2E7D32','#1565C0','#EF6C00','#AD1457','#00838F','#7B1FA2','#4E342E','#455A64','#C2185B','#00796B','#5D4037','#283593'];
export function catColor(cat) {
  const c = String(cat || 'Sin categoría').trim(); const low = c.toLowerCase();
  if (low === 'materiales') return '#2FB6C4';
  if (low === 'herramientas') return '#3E1F5C';
  let h = 0; for (let i = 0; i < c.length; i++) h = (h * 31 + c.charCodeAt(i)) >>> 0;
  return CAT_PALETTE[h % CAT_PALETTE.length];
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