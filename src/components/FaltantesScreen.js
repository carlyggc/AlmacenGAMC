import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { ui } from '../styles';
import ScreenHeader from './ScreenHeader';
import CardShell from './CardShell';
import { IconCheck, IconBasura } from './BoxIcon';
import AddProductModal from './AddProductModal';
import CSVPreviewModal from './CSVPreviewModal';
import ConfirmModal from './ConfirmModal';
import ReportButton from './ReportButton';
import { byName, useCols, catsOf, fixTab, filterItems } from '../utils/helpers';
export default function FaltantesScreen({ products, onBack, onAdd, onDelete, onUpdatePrice, onUnmark }) {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('todos');
  const [modal, setModal] = useState(false);
  const [report, setReport] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const cols = useCols();
  const allFalt = products.filter(p => p.qty === 0 || p.faltante === true);
  const cats = catsOf(allFalt);
  const effectiveTab = fixTab(tab, cats);
  const filtered = filterItems(allFalt, effectiveTab, search).sort(byName);
  const reportData = filtered.map(p => ({ ...p, qty: p.required || 1 }));
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader style={ui.headerRust} onBack={onBack} title="INVENTARIO FALTANTE" search={search} onSearch={setSearch} searchPlaceholder="Buscar faltante..."
        actions={<ReportButton onPress={() => setReport(true)} tint={colors.rust} />} tabs={cats} tab={effectiveTab} onTab={setTab} />
      {filtered.length === 0 ? (
        <View style={ui.empty}>
          <View style={{ marginBottom: 10, transform: [{ scale: 2 }] }}><IconCheck color={colors.teal} /></View>
          <Text style={ui.emptyText}>No hay materiales faltantes.</Text>
        </View>
      ) : (
        <FlatList data={filtered} numColumns={cols} key={'col' + cols} keyExtractor={i => i.id} contentContainerStyle={ui.list}
          renderItem={({ item }) => {
            const symbol = item.currency === '$us' ? '$' : 'Bs';
            return (
              <CardShell cat={item.cat} photo={item.photo}
                badge={item.qty > 0 ? (<View style={st.stockBadge}><Text style={st.stockBadgeText}>CON STOCK: {item.qty}</Text></View>) : null}>
                <Text style={st.meta}>Se necesitan: {item.required || 1} ({item.unit})</Text>
                <View style={ui.priceRow}>
                  <TouchableOpacity style={ui.currBtn} onPress={() => onUpdatePrice(item.id, item.price, item.currency === 'Bs' ? '$us' : 'Bs')}><Text style={ui.currText}>{symbol}</Text></TouchableOpacity>
                  <TextInput style={ui.priceInput} value={item.price ? String(item.price) : ''} placeholder="Costo unitario" placeholderTextColor={colors.steel} onChangeText={t => onUpdatePrice(item.id, t.replace(/[^0-9.]/g, ''), item.currency)} keyboardType="numeric" />
                </View>
                {item.qty > 0 ? (
                  <TouchableOpacity onPress={() => onUnmark(item.id)}><Text style={st.unmarkText}>↩ Quitar de faltantes (tiene stock)</Text></TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => setDeleteId(item.id)}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><IconBasura color={colors.rust} /><Text style={st.delText}>Eliminar</Text></View></TouchableOpacity>
                )}
              </CardShell>
            );
          }} />
      )}
      <TouchableOpacity style={[ui.fab, ui.fabRust]} onPress={() => setModal(true)}><Text style={ui.fabText}>+</Text></TouchableOpacity>
      <AddProductModal visible={modal} onClose={() => setModal(false)} onSave={(d) => { onAdd(d); setModal(false); }} showDeposit={false} fixedDeposit="General" requirePrice={true} />
      {report && <CSVPreviewModal visible={report} onClose={() => setReport(false)} showCost={true} showDate={true} title="Inventario Faltante" data={reportData} />}
      <ConfirmModal visible={!!deleteId} title="Eliminar faltante" message="¿Eliminar este registro de faltantes?" onCancel={() => setDeleteId(null)} onConfirm={() => { onDelete(deleteId); setDeleteId(null); }} />
    </View>
  );
}
const st = StyleSheet.create({
  stockBadge: { position: 'absolute', top: 8, left: 8, borderRadius: 4, paddingVertical: 3, paddingHorizontal: 7, zIndex: 3, backgroundColor: colors.rust },
  stockBadgeText: { color: colors.white, fontSize: 8, fontWeight: '800', letterSpacing: 0.5 },
  meta: { fontSize: 11, color: colors.rust, fontWeight: '700', marginBottom: 8 },
  delText: { color: colors.rust, fontSize: 11, fontWeight: '700' },
  unmarkText: { color: colors.tealDark, fontSize: 11, fontWeight: '800' },
});