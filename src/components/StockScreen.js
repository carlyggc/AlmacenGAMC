import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ScrollView, Image, Alert, useWindowDimensions } from 'react-native';
import { colors } from '../theme';
import { ui } from '../styles';
import { IconCaja, IconAdvertencia } from './BoxIcon';
import CSVPreviewModal from './CSVPreviewModal';
import ModalShell from './ModalShell';
import ReportButton from './ReportButton';
import { byName, byCat } from '../utils/helpers';

export default function StockScreen({ products, onBack, onMarkFaltante }) {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('todos');
  const [report, setReport] = useState(false);
  const [markSel, setMarkSel] = useState(null);
  const [markQty, setMarkQty] = useState('1');
  const { width } = useWindowDimensions();
  const cols = width >= 1000 ? 4 : width >= 700 ? 3 : width >= 500 ? 2 : 1;
  const conStock = products.filter(p => p.qty > 0);
  const cats = Array.from(new Set(conStock.map(p => p.cat || 'Sin categoría'))).sort(byCat);
  const effectiveTab = tab !== 'todos' && !cats.includes(tab) ? 'todos' : tab;
  const filtered = conStock
    .filter(p => effectiveTab === 'todos' || (p.cat || 'Sin categoría') === effectiveTab)
    .filter(p => p.name.toLowerCase().includes(search.trim().toLowerCase()));
  const map = {};
  filtered.forEach(p => {
    const k = p.name.trim().toUpperCase();
    if (!map[k]) map[k] = { name: p.name, unit: p.unit || 'Unidad', cat: p.cat || 'Sin categoría', photo: p.photo || null, total: 0, entries: [], tool: false };
    if (!map[k].photo && p.photo) map[k].photo = p.photo;
    if (p.category === 'herramienta') map[k].tool = true;
    map[k].total += p.qty;
    map[k].entries.push(p);
  });
  const groups = Object.values(map).sort(byName);
  const totalUnits = conStock.reduce((s, p) => s + (p.qty || 0), 0);
  function openMark(g) { setMarkSel(g); setMarkQty('1'); }
  function confirmMark() {
    const n = parseInt(markQty, 10) || 1;
    markSel.entries.forEach(e => onMarkFaltante(e.id, n));
    Alert.alert('Enviado a Faltante', `"${markSel.name}" se marcó como faltante con ${n} unidad(es) requerida(s).`);
    setMarkSel(null);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={[ui.header, ui.headerTealDark]}>
        <TouchableOpacity onPress={onBack}><Text style={ui.back}>← Volver</Text></TouchableOpacity>
        <Text style={ui.title}>PRODUCTOS EN STOCK</Text>
        <Text style={ui.sub}>{groups.length} producto(s) · {totalUnits} unidad(es) disponibles</Text>
        <TextInput style={ui.search} placeholder="Buscar en stock..." placeholderTextColor={colors.steel} value={search} onChangeText={setSearch} />
        <View style={ui.btnsRow}>
          <ReportButton onPress={() => setReport(true)} tint={colors.tealDark} />
        </View>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          <View style={ui.tabsRow}>
            <TouchableOpacity style={[ui.tab, effectiveTab === 'todos' && ui.tabActivePurple]} onPress={() => setTab('todos')}>
              <Text style={[ui.tabText, effectiveTab === 'todos' && ui.tabTextActive]}>Todos</Text>
            </TouchableOpacity>
            {cats.map(c => (
              <TouchableOpacity key={c} style={[ui.tab, effectiveTab === c && ui.tabActivePurple]} onPress={() => setTab(c)}>
                <Text style={[ui.tabText, effectiveTab === c && ui.tabTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
      {groups.length === 0 ? (
        <View style={ui.empty}>
          <View style={{ marginBottom: 10 }}><IconCaja /></View>
          <Text style={ui.emptyText}>No hay productos con stock.</Text>
        </View>
      ) : (
        <FlatList
          data={groups} numColumns={cols} key={'col' + cols} keyExtractor={i => i.name}
          contentContainerStyle={ui.list}
          renderItem={({ item }) => (
            <View style={ui.card}>
              <View style={[ui.categoryTag, item.tool ? ui.tagHerramienta : ui.tagMaterial]}>
                <Text style={ui.categoryTagText}>{(item.cat || 'General').toUpperCase()}</Text>
              </View>
              <View style={ui.photoWrap}>
                {item.photo ? (
                  <Image source={{ uri: item.photo }} style={ui.photo} />
                ) : (
                  <View style={ui.photoPlaceholder}><Text style={ui.photoPlaceholderText}>SIN FOTO</Text></View>
                )}
              </View>
              <View style={ui.cardBody}>
                <Text style={ui.cardName}>{item.name}</Text>
                <View style={ui.qtyBox}><Text style={ui.qtyNum}>{item.total}</Text></View>
                <Text style={ui.qtyLabel}>{item.unit}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {item.entries.slice().sort((a, b) => (b.qty || 0) - (a.qty || 0)).map(e => (
                    <View key={e.id} style={ui.chip}><Text style={ui.chipText}>{e.deposit}: {e.qty}</Text></View>
                  ))}
                </View>
                <TouchableOpacity style={ui.markBtn} onPress={() => openMark(item)}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <IconAdvertencia color={colors.rust} /><Text style={ui.markBtnText}>Enviar a Faltante</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
      {markSel && (
        <ModalShell visible={true} title={`Enviar a Faltante: ${markSel.name}`} onClose={() => setMarkSel(null)} maxWidth={400} scroll={false}>
          <Text style={ui.modalLabel}>Cantidad requerida:</Text>
          <TextInput style={ui.amountInput} value={markQty}
            onChangeText={t => setMarkQty(t.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad" placeholder="1" placeholderTextColor={colors.steel} />
          <View style={ui.actions}>
            <TouchableOpacity style={[ui.btn, ui.btnCancel]} onPress={() => setMarkSel(null)}>
              <Text style={ui.btnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[ui.btn, ui.btnDanger]} onPress={confirmMark}>
              <Text style={[ui.btnText, ui.btnWhiteText]}>Enviar a Faltante</Text>
            </TouchableOpacity>
          </View>
        </ModalShell>
      )}
      {report && (
        <CSVPreviewModal visible={report} onClose={() => setReport(false)}
          showDate={true} showDeposit={true} groupByCat={true}
          title="Materiales en Stock" data={filtered} />
      )}
    </View>
  );
}