import React from 'react';
import ReportModal from './ReportModal';
import { colors } from '../theme';
import { byName, byCat, monthInfo, csvQuote as q } from '../utils/helpers';

const catOf = (p) => (p.cat || 'Sin categoría');
const priceFor = (p) => {
  const num = parseFloat(p.price) || 0;
  if (num <= 0) return '-';
  return (p.currency === '$us' ? '$ ' : 'Bs ') + num;
};

export default function CSVPreviewModal({ visible, data = [], onClose, showCost = false, showDate = false, showDeposit = false, groupByMonth = false, groupByCat = false, title = 'Reporte' }) {
  if (!visible) return null;

  const columns = [
    { key: 'photo', label: 'Foto', width: 56, type: 'photo', csv: () => '' },
    ...(showDeposit ? [{ key: 'deposit', label: 'Depósito', flex: 1 }] : []),
    { key: 'name', label: 'Descripción', flex: 2, bold: true },
    { key: 'qty', label: 'Cant.', flex: 0.8, align: 'center' },
    { key: 'unit', label: 'Unidad', flex: 0.8 },
    ...(showDate ? [{ key: 'createdAt', label: 'Fecha', flex: 0.9, type: 'date' }] : []),
    ...(showCost ? [{
      key: 'price', label: 'Precio por Unidad', flex: 1, render: priceFor, csv: r => q(priceFor(r)),
      headStyle: { backgroundColor: colors.rust, color: 'white' },
      cellStyle: r => (parseFloat(r.price) > 0 ? { color: colors.rust, fontWeight: 'bold' } : null),
    }] : []),
  ];

  const groups = [];
  if (groupByMonth) {
    const mmap = {};
    data.forEach(p => {
      const m = monthInfo(p.createdAt);
      const k = m ? m.key : 'sinfecha';
      if (!mmap[k]) mmap[k] = { key: k, label: m ? m.label : 'SIN FECHA', items: [] };
      mmap[k].items.push(p);
    });
    Object.values(mmap).sort((a, b) => {
      if (a.key === 'sinfecha') return 1;
      if (b.key === 'sinfecha') return -1;
      return a.key < b.key ? -1 : 1;
    }).forEach(m => {
      const cmap = {};
      m.items.forEach(p => { const c = catOf(p); (cmap[c] = cmap[c] || []).push(p); });
      Object.keys(cmap).sort(byCat).forEach(c => groups.push({ key: m.key + c, label: `${m.label} · ${c}`, rows: cmap[c].slice().sort(byName) }));
    });
  } else if (groupByCat) {
    const cmap = {};
    data.forEach(p => { const c = catOf(p); (cmap[c] = cmap[c] || []).push(p); });
    Object.keys(cmap).sort(byCat).forEach(c => groups.push({ key: c, label: c, rows: cmap[c].slice().sort(byName) }));
  } else {
    groups.push({ key: 'mat', label: 'Materiales', rows: data.filter(p => p.category !== 'herramienta').sort(byName) });
    groups.push({ key: 'her', label: 'Herramientas', rows: data.filter(p => p.category === 'herramienta').sort(byName) });
  }

  return <ReportModal visible={visible} onClose={onClose} title={title} columns={columns} groups={groups} />;
}