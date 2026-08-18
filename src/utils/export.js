import { Platform, Alert } from 'react-native';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
const BASE_CSS = `body{font-family:Arial,sans-serif;padding:20px;}h2{color:#3E1F5C;}h3{color:#1F92A0;margin-top:22px;text-transform:uppercase;}table{width:100%;border-collapse:collapse;margin-top:6px;}th,td{border:1px solid #ccc;padding:6px 8px;text-align:left;font-size:12px;vertical-align:middle;}th{background:#3E1F5C;color:#fff;}tr:nth-child(even){background:#f2f2f2;}.cost{color:#B94B30;font-weight:bold;}`;
export function printHtml(title, bodyHtml, css = BASE_CSS) {
  if (Platform.OS !== 'web') { Alert.alert('Imprimir', 'Solo disponible en la versión web.'); return; }
  const w = window.open('', '', 'height=700,width=900');
  w.document.write(`<html><head><title>${title}</title><style>${css}</style></head><body><h2>${title}</h2>${bodyHtml}</body></html>`);
  w.document.close(); w.print();
}
export async function toDataUrl(uri) {
  if (!uri) return null;
  if (uri.startsWith('data:')) return uri;
  try {
    const res = await fetch(uri, { mode: 'cors' });
    const blob = await res.blob();
    return await new Promise(r => { const f = new FileReader(); f.onload = () => r(f.result); f.onerror = () => r(null); f.readAsDataURL(blob); });
  } catch (e) { return null; }
}
export function downloadPdfFile(title, columns, groups) {
  if (Platform.OS !== 'web') { Alert.alert('Reporte', 'La descarga solo funciona en la versión web.'); return; }
  const doc = new jsPDF('p', 'mm', 'a4');
  const photoIdx = columns.findIndex(c => c.photo);
  doc.setFontSize(15); doc.setTextColor(62, 31, 92); doc.text(title, 14, 15);
  let y = 20;
  groups.forEach(g => {
    autoTable(doc, { startY: y, theme: 'plain', head: [[g.label]], headStyles: { fillColor: [31, 146, 160], textColor: 255, fontSize: 9, fontStyle: 'bold' }, margin: { left: 14, right: 14 } });
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 1,
      head: [columns.map(c => c.label)],
      body: g.rows,
      styles: { fontSize: 8, cellPadding: 2, minCellHeight: photoIdx >= 0 ? 16 : 6 },
      headStyles: { fillColor: [62, 31, 92], textColor: 255, fontSize: 8 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: columns.reduce((m, c, i) => { if (c.center) m[i] = { halign: 'center' }; if (c.photo) m[i] = { cellWidth: 18 }; return m; }, {}),
      didDrawCell: (h) => {
        if (photoIdx >= 0 && h.section === 'body' && h.column.index === photoIdx) {
          const img = g.photos && g.photos[h.row.index];
          if (img) { const fmt = img.startsWith('data:image/png') ? 'PNG' : 'JPEG'; try { doc.addImage(img, fmt, h.cell.x + 1.5, h.cell.y + 1.5, h.cell.width - 3, h.cell.height - 3); } catch (e) {} }
        }
      },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 8;
  });
  doc.save(title.toLowerCase().replace(/\s+/g, '_') + '_' + new Date().toISOString().slice(0, 10) + '.pdf');
}