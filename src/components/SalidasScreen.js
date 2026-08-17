import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ScrollView, Image, StyleSheet, Alert, useWindowDimensions } from 'react-native';
import { colors } from '../theme';
import { ui } from '../styles';
import ModalShell from './ModalShell';
import ReportModal from './ReportModal';
import { IconReporte } from './BoxIcon';
import { loadWithdrawals, saveWithdrawals } from '../utils/storage';
import { byName, byCat } from '../utils/helpers';

function HistoryModal({ visible, onClose, history }) {
  const rows = [...history].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  const columns = [
    { key: 'createdAt', label: 'Fecha', flex: 1.2, type: 'datetime' },
    { key: 'name', label: 'Material', flex: 2, bold: true },
    { key: 'qty', label: 'Cant.', flex: 0.6, align: 'center' },
    { key: 'unit', label: 'Unidad', flex: 0.8 },
    { key: 'deposit', label: 'Depósito', flex: 1 },
    { key: 'serial', label: 'S/N', flex: 1 },
    { key: 'recipient', label: 'Recibió', flex: 1.2 },
    { key: 'destination', label: 'Destino', flex: 1.2 },
  ];
  return (
    <ReportModal visible={visible} onClose={onClose} title="Historial de Salidas"
      columns={columns} groups={[{ key: 'hist', label: 'Salidas registradas', rows }]} />
  );
}

export default function SalidasScreen({ products, onBack, onWithdraw }) {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('todos');
  const [sel, setSel] = useState(null);
  const [entryId, setEntryId] = useState(null);
  const [amount, setAmount] = useState('');
  const [serial, setSerial] = useState('');
  const [recipient, setRecipient] = useState('');
  const [destination, setDestination] = useState('');
  const [reportHistory, setReportHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const { width } = useWindowDimensions();
  const cols = width >= 1000 ? 4 : width >= 700 ? 3 : width >= 500 ? 2 : 1;
  useEffect(() => { loadWithdrawals().then(setHistory); }, []);
  const conStock = products.filter(p => p.qty > 0);
  const cats = Array.from(new Set(conStock.map(p => p.cat || 'Sin categoría'))).sort(byCat);
  const effectiveTab = tab !== 'todos' && !cats.includes(tab) ? 'todos' : tab;
  const filteredEntries = conStock
    .filter(p => effectiveTab === 'todos' || (p.cat || 'Sin categoría') === effectiveTab)
    .filter(p => p.name.toLowerCase().includes(search.trim().toLowerCase()));
  const map = {};
  filteredEntries.forEach(p => {
    const k = p.name.trim().toUpperCase();
    if (!map[k]) map[k] = { name: p.name, unit: p.unit || 'Unidad', cat: p.cat || 'Sin categoría', photo: p.photo || null, total: 0, entries: [], tool: false };
    if (!map[k].photo && p.photo) map[k].photo = p.photo;
    if (p.category === 'herramienta') map[k].tool = true;
    map[k].total += p.qty;
    map[k].entries.push(p);
  });
  const groups = Object.values(map).sort(byName);

  function openWithdraw(g) {
    setSel(g);
    setEntryId(g.entries.length === 1 ? g.entries[0].id : null);
    setAmount(''); setSerial(''); setRecipient(''); setDestination('');
  }
  function confirm() {
    const entry = sel.entries.find(e => e.id === entryId);
    const n = parseInt(amount, 10);
    if (!entry) { Alert.alert('Depósito', 'Selecciona de qué depósito vas a retirar.'); return; }
    if (!n || n <= 0) { Alert.alert('Cantidad inválida', 'Escribe cuántas unidades vas a retirar.'); return; }
    if (n > entry.qty) { Alert.alert('Stock insuficiente', `En ${entry.deposit} solo hay ${entry.qty} (${entry.unit}).`); return; }
    if (!recipient.trim()) { Alert.alert('Falta un dato', 'Indica a quién se entregará el material.'); return; }
    if (!destination.trim()) { Alert.alert('Falta un dato', 'Indica a dónde se entregará el material.'); return; }
    onWithdraw(entry.id, n);
    const rec = {
      id: 's' + Date.now() + Math.random().toString(36).slice(2, 8),
      createdAt: new Date().toISOString(),
      name: sel.name, cat: sel.cat, unit: entry.unit, qty: n, deposit: entry.deposit,
      serial: serial.trim(), recipient: recipient.trim(), destination: destination.trim(),
    };
    const next = [rec, ...history];
    setHistory(next); saveWithdrawals(next);
    Alert.alert('Salida registrada', `Se retiraron ${n} (${entry.unit}) de "${sel.name}" en ${entry.deposit}.\n👤 ${rec.recipient}\n📍 ${rec.destination}${rec.serial ? '\n🔢 S/N: ' + rec.serial : ''}`);
    setSel(null);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={[ui.header, ui.headerPurple]}>
        <TouchableOpacity onPress={onBack}><Text style={ui.back}>← Volver</Text></TouchableOpacity>
        <Text style={ui.title}>SALIDA DE MATERIALES</Text>
        <TextInput style={ui.search} placeholder="Buscar material..." placeholderTextColor={colors.steel} value={search} onChangeText={setSearch} />
        <View style={ui.btnsRow}>
          <TouchableOpacity style={ui.headerBtn} onPress={() => setReportHistory(true)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <IconReporte color={colors.purple} />
              <Text style={st.histBtnText}>Historial Salidas</Text>
            </View>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          <View style={ui.tabsRow}>
            <TouchableOpacity style={[ui.tab, effectiveTab === 'todos' && ui.tabActiveTeal]} onPress={() => setTab('todos')}>
              <Text style={[ui.tabText, effectiveTab === 'todos' && ui.tabTextActive]}>Todos</Text>
            </TouchableOpacity>
            {cats.map(c => (
              <TouchableOpacity key={c} style={[ui.tab, effectiveTab === c && ui.tabActiveTeal]} onPress={() => setTab(c)}>
                <Text style={[ui.tabText, effectiveTab === c && ui.tabTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
      {groups.length === 0 ? (
        <View style={ui.empty}><Text style={ui.emptyText}>No hay materiales con stock.</Text></View>
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
                <TouchableOpacity style={ui.dangerSolidBtn} onPress={() => openWithdraw(item)}>
                  <Text style={ui.dangerSolidBtnText}>Retirar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
      {sel && (
        <ModalShell visible={true} title={`Retirar: ${sel.name}`} onClose={() => setSel(null)} maxWidth={430}>
          <Text style={st.modalSub}>Stock total disponible: {sel.total} {sel.unit}</Text>
          <Text style={ui.modalLabel}>1. Selecciona el depósito:</Text>
          <ScrollView style={st.depositScroll} nestedScrollEnabled={true}>
            <View style={st.depositList}>
              {sel.entries.map(entry => (
                <TouchableOpacity key={entry.id}
                  style={[ui.selChip, entryId === entry.id && ui.selChipActiveTeal]}
                  onPress={() => setEntryId(entry.id)}>
                  <Text style={[ui.selChipText, entryId === entry.id && ui.selChipTextActive]}>
                    {entry.deposit} (Disp: {entry.qty})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <Text style={ui.modalLabel}>2. Cantidad a retirar:</Text>
          <TextInput style={ui.amountInput} value={amount}
            onChangeText={t => setAmount(t.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad" placeholder="0" placeholderTextColor={colors.steel} />
          <Text style={ui.modalLabel}>3. S/N o número de serie (opcional):</Text>
          <TextInput style={ui.fieldInput} value={serial} onChangeText={setSerial}
            placeholder="Ej. SN-123456" placeholderTextColor={colors.steel} />
          <Text style={ui.modalLabel}>4. A quién se entrega:</Text>
          <TextInput style={ui.fieldInput} value={recipient} onChangeText={setRecipient}
            placeholder="Nombre de quien recibe" placeholderTextColor={colors.steel} />
          <Text style={ui.modalLabel}>5. A dónde se entregará:</Text>
          <TextInput style={ui.fieldInput} value={destination} onChangeText={setDestination}
            placeholder="Área / oficina / proyecto" placeholderTextColor={colors.steel} />
          <View style={ui.actions}>
            <TouchableOpacity style={[ui.btn, ui.btnCancel]} onPress={() => setSel(null)}>
              <Text style={ui.btnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[ui.btn, ui.btnOk]} onPress={confirm}>
              <Text style={[ui.btnText, ui.btnWhiteText]}>Confirmar Retiro</Text>
            </TouchableOpacity>
          </View>
        </ModalShell>
      )}
      {reportHistory && (
        <HistoryModal visible={reportHistory} onClose={() => setReportHistory(false)} history={history} />
      )}
    </View>
  );
}

const st = StyleSheet.create({
  histBtnText: { color: colors.purple, fontWeight: '800', fontSize: 11 },
  modalSub: { fontSize: 12, color: colors.steel, marginBottom: 16 },
  depositScroll: { maxHeight: 110, marginBottom: 14 },
  depositList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});