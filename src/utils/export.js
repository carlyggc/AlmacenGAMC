import { Platform, Alert } from 'react-native';

const BASE_CSS = `body{font-family:Arial,sans-serif;padding:20px;}h2{color:#3E1F5C;}h3{color:#1F92A0;margin-top:22px;text-transform:uppercase;}table{width:100%;border-collapse:collapse;margin-top:6px;}th,td{border:1px solid #ccc;padding:6px 8px;text-align:left;font-size:12px;vertical-align:middle;}th{background:#3E1F5C;color:#fff;}tr:nth-child(even){background:#f2f2f2;}.cost{color:#B94B30;font-weight:bold;}`;

export function printHtml(title, bodyHtml, css = BASE_CSS) {
  if (Platform.OS !== 'web') {
    Alert.alert('Imprimir', 'Solo disponible en la versión web.');
    return;
  }
  const w = window.open('', '', 'height=700,width=900');
  w.document.write(`<html><head><title>${title}</title><style>${css}</style></head><body><h2>${title}</h2>${bodyHtml}</body></html>`);
  w.document.close();
  w.print();
}

export function downloadCsvFile(filename, csv) {
  if (Platform.OS !== 'web') {
    Alert.alert('Reporte', 'La descarga automática solo funciona en la versión web.');
    return;
  }
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}