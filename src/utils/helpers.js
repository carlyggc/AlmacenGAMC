export const byName = (a, b) => (a.name || '').localeCompare(b.name || '', 'es', { sensitivity: 'base' });
export const byCat = (a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' });

export function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}
export function fmtDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()} ${hh}:${mi}`;
}
export function parseNum(v) {
  let s = String(v || '').trim(); if (!s) return 0;
  if (s.includes('.') && s.includes(',')) s = s.replace(/,/g, '');
  else if (s.includes(',')) s = s.replace(',', '.');
  s = s.replace(/[^0-9.-]/g, '');
  const n = parseFloat(s); return isNaN(n) ? 0 : n;
}
export const csvQuote = (v) => '"' + String(v || '').replace(/"/g, '""') + '"';

export const MESES = ['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];
export function monthInfo(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: `${MESES[d.getMonth()]} ${d.getFullYear()}` };
}

const CAT_PALETTE = ['#2FB6C4', '#3E1F5C', '#B94B30', '#2E7D32', '#1565C0', '#EF6C00', '#AD1457', '#00838F', '#7B1FA2', '#4E342E', '#455A64', '#C2185B', '#00796B', '#5D4037', '#283593'];
export function catColor(cat) {
  const c = String(cat || 'Sin categoría').trim();
  const low = c.toLowerCase();
  if (low === 'materiales') return '#2FB6C4';
  if (low === 'herramientas') return '#3E1F5C';
  let h = 0;
  for (let i = 0; i < c.length; i++) h = (h * 31 + c.charCodeAt(i)) >>> 0;
  return CAT_PALETTE[h % CAT_PALETTE.length];
}