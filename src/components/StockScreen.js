import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { ui } from '../styles';
import ScreenHeader from './ScreenHeader';
import CardShell from './CardShell';
import { IconCaja, IconAdvertencia } from './BoxIcon';
import CSVPreviewModal from './CSVPreviewModal';
import ModalShell from './ModalShell';
import ReportButton from './ReportButton';
import { useCols, catsOf, fixTab, filterItems, groupByName } from '../utils/helpers';

export default function StockScreen({ products, onBack, onMarkFaltante }) {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('todos');
  const [report, setReport] = useState(false);
  const [markSel, setMarkSel] = useState(null);
  const [markQty, setMarkQty] = useState('1');
  const cols = useCols();
  const conStock = products.filter(p => p.qty > 0);
  const cats = catsOf(conStock);
  const effectiveTab = fixTab(tab, cats);
  const groups = groupByName(filterItems(conStock, effectiveTab, search));
  const totalUnits = conStock.reduce((s, p) => s + (p.qty || 0), 0);
  const openMark = (g) => { setMarkSel(g); setMarkQty('1'); };
  const confirmMark = () => { const n = parseInt(markQty, 10) || 1; markSel.entries.forEach(e => onMarkFaltante(e.id, n)); Alert.alert('Enviado a Faltante', `"${markSel.name}" se marcó como faltante con ${n} unidad(es) requerida(s).`); setMarkSel(null); };
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader style={ui.headerTealDark} onBack={onBack} title="PRODUCTOS EN STOCK" sub={`${groups.length} producto(s) · ${totalUnits} unidad(es) disponibles`}
        search={search} onSearch={setSearch} searchPlaceholder="Buscar en stock..."
        actions={<ReportButton onPress={() => setReport(true)} tint={colors.tealDark} />} tabs={cats} tab={effectiveTab} onTab={setTab} />
      {groups.length === 0 ? (
        <View style={ui.empty}><View style={{ marginBottom: 10 }}><IconCaja /></View><Text style={ui.emptyText}>No hay productos con stock.</Text></View>
      ) : (
        <ScrollView contentContainerStyle={ui.list}>
          <View style={st.grid}>
            {groups.map(item => {
              // ✅ Suma los lotes de cada depósito (600 lunes + 600 miércoles = "Tumusla: 1200")
              const depMap = {};
              item.entries.forEach(e => { depMap[e.deposit] = (depMap[e.deposit] || 0) + (e.qty || 0); });
              const depChips = Object.keys(depMap).map(d => ({ deposit: d, qty: depMap[d] })).sort((a, b) => b.qty - a.qty);
              return (
                <View key={item.name} style={{ width: `${100 / cols}%` }}>
                  <CardShell cat={item.cat} photo={item.photo} name={item.name}>
                    <View style={ui.qtyBox}><Text style={ui.qtyNum}>{item.total}</Text></View>
                    <Text style={ui.qtyLabel}>{item.unit}</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                      {depChips.map(e => (<View key={e.deposit} style={ui.chip}><Text style={ui.chipText}>{e.deposit}: {e.qty}</Text></View>))}
                    </View>
                    <TouchableOpacity style={ui.markBtn} onPress={() => openMark(item)}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><IconAdvertencia color={colors.rust} /><Text style={ui.markBtnText}>Enviar a Faltante</Text></View></TouchableOpacity>
                  </CardShell>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
      {markSel && (
        <ModalShell visible={true} title={`Enviar a Faltante: ${markSel.name}`} onClose={() => setMarkSel(null)} maxWidth={400} scroll={false}>
          <Text style={ui.modalLabel}>Cantidad requerida:</Text>
          <TextInput style={ui.amountInput} value={markQty} onChangeText={t => setMarkQty(t.replace(/[^0-9]/g, ''))} keyboardType="number-pad" placeholder="1" placeholderTextColor={colors.steel} />
          <View style={ui.actions}>
            <TouchableOpacity style={[ui.btn, ui.btnCancel]} onPress={() => setMarkSel(null)}><Text style={ui.btnText}>Cancelar</Text></TouchableOpacity>
            <TouchableOpacity style={[ui.btn, ui.btnDanger]} onPress={confirmMark}><Text style={[ui.btnText, ui.btnWhiteText]}>Enviar a Faltante</Text></TouchableOpacity>
          </View>
        </ModalShell>
      )}
      {report && (<CSVPreviewModal visible={report} onClose={() => setReport(false)} showDate={true} showDeposit={true} groupByCat={true} title="Materiales en Stock" data={filterItems(conStock, effectiveTab, search)} />)}
    </View>
  );
}

const st = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
});