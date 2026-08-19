import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { colors, DEPOSITOS } from '../theme';
import { ui } from '../styles';
import { IconEdificio, IconCaja, IconSubir } from './BoxIcon';
import ScreenHeader from './ScreenHeader';
import ProductCard from './ProductCard';
import AddProductModal from './AddProductModal';
import CSVPreviewModal from './CSVPreviewModal';
import CSVImportModal from './CSVImportModal';
import ReportButton from './ReportButton';
import { byName, byCat, monthInfo, catColor, useCols, catsOf, fixTab, filterItems } from '../utils/helpers';

const localDateStr = (iso) => { if (!iso) return ''; const d = new Date(iso); if (isNaN(d.getTime())) return ''; return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const fmtDay = (d) => d.split('-').reverse().join('/');

function DepositCard({ name, n, onPress }) {
  return (
    <TouchableOpacity style={ui.bigCard} onPress={onPress} activeOpacity={0.85}>
      <View style={ui.bigCardTop}>
        <View style={[ui.bigBadge, { backgroundColor: colors.teal }]}><Text style={ui.bigBadgeText}>{n}</Text></View>
        <IconEdificio />
      </View>
      <View style={ui.bigCardBody}>
        <Text style={ui.bigCardTitle}>{name}</Text>
        <Text style={ui.bigCardDesc}>Toca para gestionar este depósito.</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function AlmacenScreen({ products, onBack, onAdd, onRename, onChangeQty, onSetQty, onChangePhoto, onDelete }) {
  const [deposit, setDeposit] = useState(null);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('todos');
  const [modal, setModal] = useState(false);
  const [report, setReport] = useState(false);
  const [importVisible, setImportVisible] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const cols = useCols();
  const count = (d) => products.filter(p => p.deposit === d).length;

  if (!deposit) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScreenHeader style={ui.headerTeal} onBack={onBack} title="REGISTRO DE DEPÓSITO" sub="SELECCIONA UN DEPÓSITO" />
        <ScrollView contentContainerStyle={{ paddingVertical: 20 }}>
          <View style={ui.bigRow}>
            <DepositCard name={DEPOSITOS[0]} n={count(DEPOSITOS[0])} onPress={() => setDeposit(DEPOSITOS[0])} />
            <DepositCard name={DEPOSITOS[1]} n={count(DEPOSITOS[1])} onPress={() => setDeposit(DEPOSITOS[1])} />
          </View>
          <View style={ui.bigRow}><DepositCard name={DEPOSITOS[2]} n={count(DEPOSITOS[2])} onPress={() => setDeposit(DEPOSITOS[2])} /></View>
        </ScrollView>
      </View>
    );
  }

  const hasDateFilter = !!(dateFrom || dateTo);
  const inRange = (p) => { if (!hasDateFilter) return true; const dstr = localDateStr(p.createdAt); if (!dstr) return false; if (dateFrom && dstr < dateFrom) return false; if (dateTo && dstr > dateTo) return false; return true; };
  const depositProducts = products.filter(p => p.deposit === deposit);
  const cats = catsOf(depositProducts);
  const effectiveTab = fixTab(tab, cats);
  const filtered = filterItems(depositProducts, effectiveTab, search).filter(inRange);

  // ✅ MES → CATEGORÍA → DÍA (historial por fecha de cada carga)
  const gmap = {};
  filtered.forEach(p => { const m = monthInfo(p.createdAt); const k = m ? m.key : 'sinfecha'; if (!gmap[k]) gmap[k] = { key: k, label: m ? m.label : 'SIN FECHA', items: [] }; gmap[k].items.push(p); });
  const monthGroups = Object.values(gmap).sort((a, b) => { if (a.key === 'sinfecha') return 1; if (b.key === 'sinfecha') return -1; return a.key < b.key ? -1 : 1; });
  monthGroups.forEach(g => {
    const cmap = {};
    g.items.forEach(i => { const c = i.cat || 'Sin categoría'; (cmap[c] = cmap[c] || []).push(i); });
    g.catGroups = Object.keys(cmap).sort(byCat).map(c => {
      const dmap = {};
      cmap[c].forEach(i => { const d = localDateStr(i.createdAt) || 'sinfecha'; (dmap[d] = dmap[d] || []).push(i); });
      const dayGroups = Object.keys(dmap).sort((a, b) => (a === 'sinfecha' ? 1 : b === 'sinfecha' ? -1 : b.localeCompare(a)))
        .map(d => ({ day: d, items: dmap[d].sort(byName) }));
      return { cat: c, dayGroups, total: cmap[c].length };
    });
  });

  const totalDep = depositProducts.length;
  const webDateStyle = { borderWidth: 2, borderColor: colors.white, borderRadius: 6, padding: '4px 6px', backgroundColor: colors.surface, color: colors.ink, fontSize: 12 };
  const renderGrid = (items) => (
    <View style={st.grid}>
      {items.map(item => (<View key={item.id} style={{ width: `${100 / cols}%` }}><ProductCard product={item} onRename={onRename} onChangeQty={onChangeQty} onSetQty={onSetQty} onChangePhoto={onChangePhoto} onDelete={onDelete} /></View>))}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader style={ui.headerTeal} onBack={() => setDeposit(null)} backLabel="← Depósitos" title={`DEPÓSITO ${deposit.toUpperCase()}`}
        search={search} onSearch={setSearch}
        actions={<>
          <TouchableOpacity style={ui.headerBtn} onPress={() => setImportVisible(true)}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><IconSubir color={colors.teal} /><Text style={st.importBtnText}>Importar</Text></View></TouchableOpacity>
          <ReportButton onPress={() => setReport(true)} tint={colors.tealDark} />
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
            {hasDateFilter && <Text style={st.dateCount}>{filtered.length} registro(s) en el rango seleccionado · el Reporte exportará solo esto</Text>}
          </View>
        )}
      />
      {filtered.length === 0 ? (
        <View style={ui.empty}><IconCaja /><Text style={ui.emptyText}>{totalDep === 0 ? 'Este depósito está vacío. Añade tu primer producto.' : 'Sin resultados con la búsqueda/filtros actuales.'}</Text></View>
      ) : (
        <ScrollView contentContainerStyle={ui.list}>
          {monthGroups.map(g => (
            <View key={g.key}>
              <View style={st.monthHeader}><Text style={st.monthTitle}>{g.label.toUpperCase()}</Text><Text style={st.monthCount}>{g.items.length} registro(s)</Text></View>
              {g.catGroups.map(cg => (
                <View key={cg.cat}>
                  <View style={[st.typeHeader, { backgroundColor: catColor(cg.cat) }]}><Text style={st.typeHeaderText}>{cg.cat.toUpperCase()} ({cg.total})</Text></View>
                  {cg.dayGroups.map(dg => (
                    <View key={dg.day}>
                      <Text style={st.dayHeader}>📅 {dg.day === 'sinfecha' ? 'SIN FECHA' : fmtDay(dg.day)}</Text>
                      {renderGrid(dg.items)}
                    </View>
                  ))}
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      )}
      <TouchableOpacity style={[ui.fab, ui.fabPurple]} onPress={() => setModal(true)}><Text style={ui.fabText}>+</Text></TouchableOpacity>
      <AddProductModal visible={modal} onClose={() => setModal(false)} onSave={(d) => { onAdd(d); setModal(false); }} showDeposit={false} fixedDeposit={deposit} requirePrice={false} />
      {report && (<CSVPreviewModal visible={report} onClose={() => setReport(false)} showCost={false} showDate={true} groupByMonth={true} title={'Depósito ' + deposit + (hasDateFilter ? ' · ' + (dateFrom || 'inicio') + ' → ' + (dateTo || 'hoy') : '')} data={filtered} />)}
      {importVisible && (<CSVImportModal visible={importVisible} onClose={() => setImportVisible(false)} initialDeposit={deposit} onImport={(list) => { list.forEach(onAdd); }} />)}
    </View>
  );
}

const st = StyleSheet.create({
  importBtnText: { color: colors.teal, fontWeight: '800', fontSize: 11 },
  dateRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 6, gap: 6 },
  dateLabel: { color: colors.white, fontSize: 11, fontWeight: '700' },
  dateInput: { borderWidth: 2, borderColor: colors.white, borderRadius: 6, paddingVertical: 4, paddingHorizontal: 8, backgroundColor: colors.surface, color: colors.ink, fontSize: 12, minWidth: 110 },
  dateClear: { color: colors.white, fontSize: 11, fontWeight: '700', marginLeft: 4 },
  dateCount: { color: colors.white, fontSize: 11, opacity: 0.9, marginTop: 6 },
  monthHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, marginBottom: 4, paddingHorizontal: 4, borderBottomWidth: 2, borderBottomColor: colors.teal, paddingBottom: 6 },
  monthTitle: { fontSize: 14, fontWeight: '800', color: colors.tealDark, letterSpacing: 1 },
  monthCount: { fontSize: 11, color: colors.steel, fontWeight: '700' },
  typeHeader: { borderRadius: 4, paddingVertical: 4, paddingHorizontal: 10, alignSelf: 'flex-start', marginVertical: 6 },
  typeHeaderText: { color: colors.white, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  dayHeader: { fontSize: 11, fontWeight: '800', color: colors.steel, letterSpacing: 1, marginVertical: 4, marginLeft: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
});