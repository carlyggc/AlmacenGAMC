import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet, Platform } from 'react-native';
import { colors } from '../theme';
import ModalShell from './ModalShell';
import { IconPrint, IconDownload } from './BoxIcon';
import { printHtml, downloadPdfFile, toDataUrl } from '../utils/export';
import { fmtDate, fmtDateTime } from '../utils/helpers';
import PhotoZoomModal from './PhotoZoomModal';
export default function ReportModal({ visible, onClose, title = 'Reporte', columns = [], groups = [] }) {
  const [zoomUri, setZoomUri] = useState(null);
  if (!visible) return null;
  const vGroups = groups.filter(g => g.rows && g.rows.length > 0);
  const cellText = (col, r) => {
    if (col.render) return col.render(r);
    const v = r[col.key];
    if (col.type === 'date') return fmtDate(v);
    if (col.type === 'datetime') return fmtDateTime(v);
    return v === undefined || v === null || v === '' ? '—' : v;
  };
  const handlePrint = () => {
    const tableHtml = rows => {
      let h = `<table><tr>${columns.map(c => `<th>${c.label}</th>`).join('')}</tr>`;
      rows.forEach(r => {
        h += '<tr>' + columns.map(c => {
          if (c.type === 'photo') { const img = r.photo ? `<img src="${r.photo}" style="width:40px;height:40px;object-fit:cover;border-radius:4px;">` : '—'; return `<td>${img}</td>`; }
          const sty = c.align === 'center' ? ' style="text-align:center;font-weight:bold;"' : '';
          return `<td${sty}>${cellText(c, r)}</td>`;
        }).join('') + '</tr>';
      });
      return h + '</table>';
    };
    printHtml(title, vGroups.map(g => `<h3>${g.label} (${g.rows.length})</h3>${tableHtml(g.rows)}`).join(''));
  };
  const handleDownload = async () => {
    const uris = Array.from(new Set(vGroups.flatMap(g => g.rows.map(r => r.photo)).filter(Boolean)));
    const imgMap = {};
    await Promise.all(uris.map(async u => { const d = await toDataUrl(u); if (d) imgMap[u] = d; }));
    await downloadPdfFile(title,
      columns.map(c => ({ label: c.label, center: c.align === 'center', photo: c.type === 'photo' })),
      vGroups.map(g => ({
        label: `${String(g.label).toUpperCase()} (${g.rows.length})`,
        rows: g.rows.map(r => columns.map(c => (c.type === 'photo' ? '' : String(cellText(c, r))))),
        photos: g.rows.map(r => (r.photo ? imgMap[r.photo] || null : null)),
      })));
    if (Platform.OS === 'web') onClose();
  };
  const Table = ({ rows }) => (
    <View style={{ marginBottom: 12 }}>
      <View style={st.tableHead}>
        {columns.map((c, i) => (<Text key={i} style={[st.headCell, c.width ? { width: c.width } : { flex: c.flex || 1 }, c.align === 'center' && { textAlign: 'center' }, c.headStyle]}>{c.label}</Text>))}
      </View>
      {rows.map((r, i) => (
        <View key={r.id || i} style={[st.row, i % 2 === 0 && st.rowEven]}>
          {columns.map((c, j) => {
            if (c.type === 'photo') {
              return (<View key={j} style={st.photoCell}>
                {r.photo ? (<TouchableOpacity onPress={() => setZoomUri(r.photo)}><Image source={{ uri: r.photo }} style={st.thumb} /></TouchableOpacity>) : (
                  <View style={st.thumbEmpty}><Text style={st.thumbEmptyText}>—</Text></View>
                )}
              </View>);
            }
            return (<Text key={j} style={[st.cell, c.width ? { width: c.width } : { flex: c.flex || 1 }, c.align === 'center' && { textAlign: 'center' }, c.bold && { fontWeight: '700' }, c.cellStyle && c.cellStyle(r)]}>{cellText(c, r)}</Text>);
          })}
        </View>
      ))}
    </View>
  );
  return (
    <ModalShell visible={visible} title={title} onClose={onClose} maxWidth={900} scroll={false}>
      <ScrollView style={{ maxHeight: 480 }} showsVerticalScrollIndicator={true}>
        {vGroups.length === 0 ? (<View style={st.emptyRow}><Text style={st.emptyText}>No hay registros para mostrar.</Text></View>) : (
          vGroups.map(g => (
            <View key={g.key || g.label} style={st.section}>
              <View style={st.sectionHeader}><Text style={st.sectionTitle}>{String(g.label).toUpperCase()} ({g.rows.length})</Text></View>
              <View style={{ padding: 8 }}><Table rows={g.rows} /></View>
            </View>
          ))
        )}
      </ScrollView>
      <View style={st.actions}>
        <TouchableOpacity style={[st.btn, st.btnPrint]} onPress={handlePrint}><View style={st.btnInner}><IconPrint color={colors.ink} /><Text style={st.btnText}>Imprimir</Text></View></TouchableOpacity>
        <TouchableOpacity style={[st.btn, st.btnDownload]} onPress={handleDownload}><View style={st.btnInner}><IconDownload color={colors.white} /><Text style={[st.btnText, { color: colors.white }]}>Descargar PDF</Text></View></TouchableOpacity>
      </View>
      <PhotoZoomModal visible={!!zoomUri} uri={zoomUri} name={title} onClose={() => setZoomUri(null)} />
    </ModalShell>
  );
}
const st = StyleSheet.create({
  section: { marginBottom: 14, borderWidth: 1, borderColor: colors.line, borderRadius: 8, overflow: 'hidden', backgroundColor: 'white' },
  sectionHeader: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: colors.tealDark },
  sectionTitle: { color: 'white', fontWeight: '800', fontSize: 13, letterSpacing: 1 },
  tableHead: { flexDirection: 'row', backgroundColor: colors.hole, borderBottomWidth: 1, borderBottomColor: colors.line },
  headCell: { paddingVertical: 8, paddingHorizontal: 6, fontSize: 10, fontWeight: '800', color: colors.steel, textTransform: 'uppercase' },
  row: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.line },
  rowEven: { backgroundColor: '#f9f9f9' },
  photoCell: { width: 56, alignItems: 'center', justifyContent: 'center', paddingVertical: 6, borderRightWidth: 1, borderRightColor: colors.line },
  thumb: { width: 44, height: 44, borderRadius: 6 },
  thumbEmpty: { width: 44, height: 44, borderRadius: 6, backgroundColor: colors.hole, alignItems: 'center', justifyContent: 'center' },
  thumbEmptyText: { color: colors.steel },
  cell: { paddingVertical: 8, paddingHorizontal: 6, fontSize: 11, color: colors.ink },
  emptyRow: { padding: 24, alignItems: 'center' },
  emptyText: { color: colors.steel, fontStyle: 'italic' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 14 },
  btn: { paddingVertical: 12, paddingHorizontal: 22, borderRadius: 8 },
  btnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnPrint: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.steel },
  btnDownload: { backgroundColor: colors.teal },
  btnText: { fontWeight: 'bold', color: colors.ink, fontSize: 14, textTransform: 'uppercase' },
});