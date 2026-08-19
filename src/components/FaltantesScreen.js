import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { colors } from '../theme';
import { ui } from '../styles';
import ScreenHeader from './ScreenHeader';
import CardShell from './CardShell';
import { IconCheck, IconBasura, IconSubir } from './BoxIcon';
import AddProductModal from './AddProductModal';
import CSVPreviewModal from './CSVPreviewModal';
import CSVImportModal from './CSVImportModal';
import ConfirmModal from './ConfirmModal';
import ReportButton from './ReportButton';
import { byName, useCols, catsOf, fixTab, filterItems } from '../utils/helpers';

const localDateStr = (iso) => { if (!iso) return ''; const d = new Date(iso); if (isNaN(d.getTime())) return ''; return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

export default function FaltantesScreen({ products, onBack, onAdd, onDelete, onUpdatePrice, onUnmark }) {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('todos');
  const [modal, setModal] = useState(false);
  const [importVisible, setImportVisible] = useState(false);
  const [report, setReport] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const cols = useCols();

  // ✅ Solo lo que tú marcaste o importaste como faltante
  const allFalt = products.filter(p => p.faltante === true);
  const cats = catsOf(allFalt);
  const effectiveTab = fixTab(tab, cats);

  // ✅ FILTRO POR FECHA (fecha en que se pidió/marcó el material)
  const hasDateFilter = !!(dateFrom || dateTo);
  const inRange = (p) => { if (!hasDateFilter) return true; const d = localDateStr(p.createdAt); if (!d) return false; if (dateFrom && d < dateFrom) return false; if (dateTo && d > dateTo) return false; return true; };
  const filtered = filterItems(allFalt, effectiveTab, search).filter(inRange).sort(byName);
  const reportData = filtered.map(p => ({ ...p, qty: p.required || 1 }));

  const calcTotal = (p) => (p.required || 1) * (parseFloat(p.price) || 0);
  const fmt = (n) => n.toLocaleString('es-BO');
  const totalBs = filtered.filter(p => (p.currency || 'Bs') !== '$us').reduce((s, p) => s + calcTotal(p), 0);
  const totalUs = filtered.filter(p => (p.currency || 'Bs') === '$us').reduce((s, p) => s + calcTotal(p), 0);

  const webDateStyle = { borderWidth: 2, borderColor: colors.white, borderRadius: 6, padding: '4px 6px', backgroundColor: colors.surface, color: colors.ink, fontSize: 12 };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader style={ui.headerRust} onBack={onBack} title="INVENTARIO FALTANTE"
        sub={`Costo total estimado: Bs ${fmt(totalBs)}${totalUs > 0 ? `  ·  $us ${fmt(totalUs)}` : ''}`}
        search={search} onSearch={setSearch} searchPlaceholder="Buscar faltante..."
        actions={<>
          <TouchableOpacity style={ui.headerBtn} onPress={() => setImportVisible(true)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <IconSubir color={colors.rust} /><Text style={st.importBtnText}>Importar</Text>
            </View>
          </TouchableOpacity>
          <ReportButton onPress={() => setReport(true)} tint={colors.rust} />
        </>}
        tabs={cats} tab={effectiveTab} onTab={setTab}
        footer={(
          <View>
            <View style={st.dateRow}>
              <Text style={st.dateLabel}>Desde</Text>
              {Platform.OS === 'web' ? <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={webDateStyle} /> : <TextInput style={st.dateInput} placeholder="AAAA-MM-DD" placeholderTextColor={colors.steel} value={dateFrom} onChangeText={t => setDateFrom(t.trim())} />}
              <Text style={st.dateLabel}>Hasta</Text>
              {Platform.OS === 'web' ? <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={webDateStyle} /> : <TextInput style={st.dateInput} placeholder="AAAA-MM-DD" placeholderTextColor={colors.steel} value={dateTo} onChangeText={t => setDateTo(t.trim())} />}
              {hasDateFilter && (<TouchableOpacity onPress={() => { setDateFrom(''); setDateTo(''); }}><Text style={st.dateClear}>✕ Quitar filtro</Text></TouchableOpacity>)}
            </View>
            {hasDateFilter && <Text style={st.dateCount}>{filtered.length} faltante(s) en el rango · el reporte exportará solo esto</Text>}
          </View>
        )}
      />
      {filtered.length === 0 ? (
        <View style={ui.empty}>
          <View style={{ marginBottom: 10, transform: [{ scale: 2 }] }}><IconCheck color={colors.teal} /></View>
          <Text style={ui.emptyText}>No hay materiales faltantes.{'\n'}Usa "Importar" o el botón "+" para agregarlos.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={ui.list}>
          <View style={st.grid}>
            {filtered.map(item => {
              const symbol = item.currency === '$us' ? '$us' : 'Bs';
              const req = item.required || 1;
              const unitPrice = parseFloat(item.price) || 0;
              const total = req * unitPrice;
              return (
                <View key={item.id} style={{ width: `${100 / cols}%` }}>
                  <CardShell cat={item.cat} photo={item.photo} name={item.name}
                    badge={item.qty > 0 ? (<View style={st.stockBadge}><Text style={st.stockBadgeText}>CON STOCK: {item.qty}</Text></View>) : null}>
                    <Text style={st.meta}>Se necesitan: {req} ({item.unit})</Text>
                    <View style={ui.priceRow}>
                      <TouchableOpacity style={ui.currBtn} onPress={() => onUpdatePrice(item.id, item.price, item.currency === 'Bs' ? '$us' : 'Bs')}><Text style={ui.currText}>{symbol}</Text></TouchableOpacity>
                      <TextInput style={ui.priceInput} value={item.price ? String(item.price) : ''} placeholder="Costo unitario" placeholderTextColor={colors.steel} onChangeText={t => onUpdatePrice(item.id, t.replace(/[^0-9.]/g, ''), item.currency)} keyboardType="numeric" />
                    </View>
                    <View style={st.totalBox}>
                      <Text style={st.totalLabel}>COSTO TOTAL ({req} × {fmt(unitPrice)})</Text>
                      <Text style={st.totalValue}>{symbol} {fmt(total)}</Text>
                    </View>
                    {item.qty > 0 ? (
                      <TouchableOpacity onPress={() => onUnmark(item.id)}><Text style={st.unmarkText}>↩ Quitar de faltantes (tiene stock)</Text></TouchableOpacity>
                    ) : (
                      <TouchableOpacity onPress={() => setDeleteId(item.id)}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><IconBasura color={colors.rust} /><Text style={st.delText}>Eliminar</Text></View></TouchableOpacity>
                    )}
                  </CardShell>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
      <TouchableOpacity style={[ui.fab, ui.fabRust]} onPress={() => setModal(true)}><Text style={ui.fabText}>+</Text></TouchableOpacity>
      <AddProductModal visible={modal} onClose={() => setModal(false)} onSave={(d) => { onAdd(d); setModal(false); }} showDeposit={false} fixedDeposit="General" requirePrice={true} />
      {importVisible && (
        <CSVImportModal visible={importVisible} onClose={() => setImportVisible(false)} faltanteMode={true} onImport={(list) => { list.forEach(onAdd); }} />
      )}
      {report && <CSVPreviewModal visible={report} onClose={() => setReport(false)} showCost={true} showTotal={true} showDate={true} title="Inventario Faltante" data={reportData} />}
      <ConfirmModal visible={!!deleteId} title="Eliminar faltante" message="¿Eliminar este registro de faltantes?" onCancel={() => setDeleteId(null)} onConfirm={() => { onDelete(deleteId); setDeleteId(null); }} />
    </View>
  );
}

const st = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  importBtnText: { color: colors.rust, fontWeight: '800', fontSize: 11 },
  stockBadge: { position: 'absolute', top: 8, left: 8, borderRadius: 4, paddingVertical: 3, paddingHorizontal: 7, zIndex: 3, backgroundColor: colors.rust },
  stockBadgeText: { color: colors.white, fontSize: 8, fontWeight: '800', letterSpacing: 0.5 },
  meta: { fontSize: 11, color: colors.rust, fontWeight: '700', marginBottom: 8 },
  delText: { color: colors.rust, fontSize: 11, fontWeight: '700' },
  unmarkText: { color: colors.tealDark, fontSize: 11, fontWeight: '800' },
  totalBox: { marginTop: 8, marginBottom: 4, borderWidth: 2, borderColor: colors.rust, borderRadius: 6, backgroundColor: colors.surface, paddingVertical: 6, paddingHorizontal: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 6 },
  totalLabel: { fontSize: 9, fontWeight: '800', color: colors.steel, letterSpacing: 0.5, flexShrink: 1 },
  totalValue: { fontSize: 13, fontWeight: '800', color: colors.rust },
  dateRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 6, gap: 6 },
  dateLabel: { color: colors.white, fontSize: 11, fontWeight: '700' },
  dateInput: { borderWidth: 2, borderColor: colors.white, borderRadius: 6, paddingVertical: 4, paddingHorizontal: 8, backgroundColor: colors.surface, color: colors.ink, fontSize: 12, minWidth: 110 },
  dateClear: { color: colors.white, fontSize: 11, fontWeight: '700', marginLeft: 4 },
  dateCount: { color: colors.white, fontSize: 11, opacity: 0.9, marginTop: 6 },
});