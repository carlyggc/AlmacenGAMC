import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ScrollView, Alert, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { ui } from '../styles';
import ScreenHeader from './ScreenHeader';
import CardShell from './CardShell';
import ModalShell from './ModalShell';
import ReportModal from './ReportModal';
import RecipientsImportModal from './RecipientsImportModal';
import { IconReporte, IconSubir } from './BoxIcon';
import { getSalidas, createSalida, getPersonas, createPersona, importPersonas } from '../utils/api';
import { useCols, catsOf, fixTab, filterItems, groupByName } from '../utils/helpers';

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
  return <ReportModal visible={visible} onClose={onClose} title="Historial de Salidas" columns={columns} groups={[{ key: 'hist', label: 'Salidas registradas', rows }]} />;
}

export default function SalidasScreen({ products, onBack, onWithdraw }) {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('todos');
  const [sel, setSel] = useState(null);
  const [entryId, setEntryId] = useState(null);
  const [amount, setAmount] = useState('');
  const [serial, setSerial] = useState('');
  const [recipient, setRecipient] = useState('');
  const [showRecs, setShowRecs] = useState(false);
  const [destination, setDestination] = useState('');
  const [reportHistory, setReportHistory] = useState(false);
  const [importNames, setImportNames] = useState(false);
  const [history, setHistory] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const cols = useCols();

  useEffect(() => { getSalidas().then(setHistory).catch(() => {}); getPersonas().then(setRecipients).catch(() => {}); }, []);

  const conStock = products.filter(p => p.qty > 0);
  const cats = catsOf(conStock);
  const effectiveTab = fixTab(tab, cats);
  const groups = groupByName(filterItems(conStock, effectiveTab, search));

  const recSugs = recipients
    .filter(r => r.toLowerCase().includes(recipient.trim().toLowerCase()) && r.toLowerCase() !== recipient.trim().toLowerCase())
    .slice(0, 6);

  function persistRecipient(name) {
    createPersona(name);
    setRecipients(prev => prev.some(x => x.toLowerCase() === name.toLowerCase()) ? prev : [...prev, name]);
  }
  function importNamesList(names) {
    importPersonas(names);
    setRecipients(prev => {
      const set = new Map(prev.map(p => [p.toLowerCase(), p]));
      names.forEach(n => { if (!set.has(n.toLowerCase())) set.set(n.toLowerCase(), n); });
      return Array.from(set.values());
    });
  }
  const openWithdraw = (g) => {
    setSel(g);
    setEntryId(g.entries.length === 1 ? g.entries[0].id : null);
    setAmount(''); setSerial(''); setRecipient(''); setDestination('');
  };
  function confirm() {
    const entry = sel.entries.find(e => e.id === entryId);
    const n = parseInt(amount, 10);
    if (!entry) { Alert.alert('Depósito', 'Selecciona de qué depósito vas a retirar.'); return; }
    if (!n || n <= 0) { Alert.alert('Cantidad inválida', 'Escribe cuántas unidades vas a retirar.'); return; }
    if (n > entry.qty) { Alert.alert('Stock insuficiente', `En ${entry.deposit} solo hay ${entry.qty} (${entry.unit}).`); return; }
    if (!recipient.trim()) { Alert.alert('Falta un dato', 'Indica a quién se entregará el material.'); return; }
    if (!destination.trim()) { Alert.alert('Falta un dato', 'Indica a dónde se entregará el material.'); return; }
    onWithdraw(entry.id, n);
    persistRecipient(recipient.trim());
    const rec = {
      id: 's' + Date.now() + Math.random().toString(36).slice(2, 8),
      createdAt: new Date().toISOString(),
      name: sel.name, cat: sel.cat, unit: entry.unit, qty: n, deposit: entry.deposit,
      serial: serial.trim(), recipient: recipient.trim(), destination: destination.trim(),
    };
    createSalida(rec);
    setHistory(prev => [rec, ...prev]);
    Alert.alert('Salida registrada', `Se retiraron ${n} (${entry.unit}) de "${sel.name}" en ${entry.deposit}.\n👤 ${rec.recipient}\n📍 ${rec.destination}${rec.serial ? '\n🔢 S/N: ' + rec.serial : ''}`);
    setSel(null);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader
        style={ui.headerPurple} onBack={onBack} title="SALIDA DE MATERIALES"
        search={search} onSearch={setSearch} searchPlaceholder="Buscar material..."
        actions={<>
          <TouchableOpacity style={ui.headerBtn} onPress={() => setImportNames(true)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <IconSubir color={colors.purple} /><Text style={st.histBtnText}>Nombres</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={ui.headerBtn} onPress={() => setReportHistory(true)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <IconReporte color={colors.purple} /><Text style={st.histBtnText}>Historial Salidas</Text>
            </View>
          </TouchableOpacity>
        </>}
        tabs={cats} tab={effectiveTab} onTab={setTab}
      />
      {groups.length === 0 ? (
        <View style={ui.empty}><Text style={ui.emptyText}>No hay materiales con stock.</Text></View>
      ) : (
        <FlatList
          data={groups} numColumns={cols} key={'col' + cols} keyExtractor={i => i.name}
          contentContainerStyle={ui.list}
          renderItem={({ item }) => (
            <CardShell cat={item.cat} photo={item.photo} name={item.name}>
              <View style={ui.qtyBox}><Text style={ui.qtyNum}>{item.total}</Text></View>
              <Text style={ui.qtyLabel}>{item.unit}</Text>
              <TouchableOpacity style={ui.dangerSolidBtn} onPress={() => openWithdraw(item)}>
                <Text style={ui.dangerSolidBtnText}>Retirar</Text>
              </TouchableOpacity>
            </CardShell>
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
                <TouchableOpacity key={entry.id} style={[ui.selChip, entryId === entry.id && ui.selChipActiveTeal]} onPress={() => setEntryId(entry.id)}>
                  <Text style={[ui.selChipText, entryId === entry.id && ui.selChipTextActive]}>{entry.deposit} (Disp: {entry.qty})</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <Text style={ui.modalLabel}>2. Cantidad a retirar:</Text>
          <TextInput style={ui.amountInput} value={amount} onChangeText={t => setAmount(t.replace(/[^0-9]/g, ''))} keyboardType="number-pad" placeholder="0" placeholderTextColor={colors.steel} />
          <Text style={ui.modalLabel}>3. S/N o número de serie (opcional):</Text>
          <TextInput style={ui.fieldInput} value={serial} onChangeText={setSerial} placeholder="Ej. SN-123456" placeholderTextColor={colors.steel} />
          <Text style={ui.modalLabel}>4. A quién se entrega:</Text>
          <TextInput style={ui.fieldInput} value={recipient}
            onChangeText={t => { setRecipient(t); setShowRecs(true); }}
            onFocus={() => setShowRecs(true)}
            placeholder="Nombre de quien recibe" placeholderTextColor={colors.steel} />
          {showRecs && recSugs.length > 0 && (
            <ScrollView style={st.recList} nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
              {recSugs.map(r => (
                <TouchableOpacity key={r} style={ui.listItem} activeOpacity={0.7} onPress={() => { setRecipient(r); setShowRecs(false); }}>
                  <Text style={ui.listItemText}>{r}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          <Text style={st.recHint}>Los nombres que escribas o importes quedan guardados en el servidor y te los sugerirá la próxima vez.</Text>
          <Text style={ui.modalLabel}>5. A dónde se entregará:</Text>
          <TextInput style={ui.fieldInput} value={destination} onChangeText={setDestination} placeholder="Área / oficina / proyecto" placeholderTextColor={colors.steel} />
          <View style={ui.actions}>
            <TouchableOpacity style={[ui.btn, ui.btnCancel]} onPress={() => setSel(null)}><Text style={ui.btnText}>Cancelar</Text></TouchableOpacity>
            <TouchableOpacity style={[ui.btn, ui.btnOk]} onPress={confirm}><Text style={[ui.btnText, ui.btnWhiteText]}>Confirmar Retiro</Text></TouchableOpacity>
          </View>
        </ModalShell>
      )}
      {reportHistory && <HistoryModal visible={reportHistory} onClose={() => setReportHistory(false)} history={history} />}
      <RecipientsImportModal visible={importNames} onClose={() => setImportNames(false)} onImport={importNamesList} />
    </View>
  );
}
const st = StyleSheet.create({
  histBtnText: { color: colors.purple, fontWeight: '800', fontSize: 11 },
  modalSub: { fontSize: 12, color: colors.steel, marginBottom: 16 },
  depositScroll: { maxHeight: 110, marginBottom: 14 },
  depositList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  recList: { maxHeight: 130, borderWidth: 1, borderColor: colors.line, borderRadius: 6, marginBottom: 6, backgroundColor: colors.surface },
  recHint: { fontSize: 10, color: colors.steel, marginBottom: 10 },
});