import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet, Platform } from 'react-native';
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

const localDateStr = (iso) => { if (!iso) return ''; const d = new Date(iso); if (isNaN(d.getTime())) return ''; return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

function HistoryModal({ visible, onClose, history, products, rangeLabel }) {
  const fotoDe = (name) => {
    const up = (name || '').trim().toUpperCase();
    const p = (products || []).find(x => (x.name || '').trim().toUpperCase() === up && x.photo);
    return p ? p.photo : null;
  };
  const rows = [...history]
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    .map(h => ({ ...h, photo: h.photo || fotoDe(h.name) }));
  const columns = [
    { key: 'photo', label: 'Foto', width: 56, type: 'photo' },
    { key: 'createdAt', label: 'Fecha', flex: 1.2, type: 'datetime' },
    { key: 'name', label: 'Material', flex: 2, bold: true },
    { key: 'qty', label: 'Cant.', flex: 0.6, align: 'center' },
    { key: 'unit', label: 'Unidad', flex: 0.8 },
    { key: 'deposit', label: 'Depósito', flex: 1 },
    { key: 'serial', label: 'S/N', flex: 1 },
    { key: 'recipient', label: 'Recibió', flex: 1.2 },
    { key: 'destination', label: 'Destino', flex: 1.2 },
  ];
  return <ReportModal visible={visible} onClose={onClose} title={`Historial de Salidas${rangeLabel ? ' · ' + rangeLabel : ''}`} columns={columns} groups={[{ key: 'hist', label: 'Salidas registradas', rows }]} />;
}

export default function SalidasScreen({ products, onBack, onWithdraw }) {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('todos');
  const [sel, setSel] = useState(null);
  const [depSel, setDepSel] = useState(null);
  const [amount, setAmount] = useState('');
  const [serial, setSerial] = useState('');
  const [recipient, setRecipient] = useState('');
  const [showRecs, setShowRecs] = useState(false);
  const [destination, setDestination] = useState('');
  const [reportHistory, setReportHistory] = useState(false);
  const [importNames, setImportNames] = useState(false);
  const [history, setHistory] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const cols = useCols();
  useEffect(() => { getSalidas().then(setHistory).catch(() => {}); getPersonas().then(setRecipients).catch(() => {}); }, []);
  const conStock = products.filter(p => p.qty > 0);
  const cats = catsOf(conStock);
  const effectiveTab = fixTab(tab, cats);
  const groups = groupByName(filterItems(conStock, effectiveTab, search));
  const recSugs = recipients
    .filter(r => r.toLowerCase().includes(recipient.trim().toLowerCase()) && r.toLowerCase() !== recipient.trim().toLowerCase())
    .slice(0, 6);

  const hasDateFilter = !!(dateFrom || dateTo);
  const inRange = (r) => { if (!hasDateFilter) return true; const d = localDateStr(r.createdAt); if (!d) return false; if (dateFrom && d < dateFrom) return false; if (dateTo && d > dateTo) return false; return true; };
  const historyFiltered = history.filter(inRange);
  const rangeLabel = hasDateFilter ? `${dateFrom || 'inicio'} → ${dateTo || 'hoy'} (${historyFiltered.length} salida(s))` : '';

  function persistRecipient(name) {
    createPersona(name).catch(() => {});
    setRecipients(prev => prev.some(x => x.toLowerCase() === name.toLowerCase()) ? prev : [...prev, name]);
  }
  function importNamesList(names) {
    importPersonas(names).catch(() => {});
    setRecipients(prev => {
      const set = new Map(prev.map(p => [p.toLowerCase(), p]));
      names.forEach(n => { if (!set.has(n.toLowerCase())) set.set(n.toLowerCase(), n); });
      return Array.from(set.values());
    });
  }

  // ✅ Opciones por DEPÓSITO (sin fechas) con total disponible
  const depOptions = sel ? (() => {
    const m = {};
    sel.entries.forEach(e => { m[e.deposit] = (m[e.deposit] || 0) + (e.qty || 0); });
    return Object.keys(m).map(d => ({ deposit: d, qty: m[d] })).sort((a, b) => b.qty - a.qty);
  })() : [];

  const openWithdraw = (g) => {
    setSel(g);
    const m = {};
    g.entries.forEach(e => { m[e.deposit] = (m[e.deposit] || 0) + (e.qty || 0); });
    const opts = Object.keys(m).map(d => ({ deposit: d, qty: m[d] }));
    setDepSel(opts.length === 1 ? opts[0].deposit : null);
    setAmount(''); setSerial(''); setRecipient(''); setDestination('');
  };

  async function confirm() {
    const opt = depOptions.find(o => o.deposit === depSel);
    const n = parseInt(amount, 10);
    if (!opt) { Alert.alert('Depósito', 'Selecciona de qué depósito vas a retirar.'); return; }
    if (!n || n <= 0) { Alert.alert('Cantidad inválida', 'Escribe cuántas unidades vas a retirar.'); return; }
    if (n > opt.qty) { Alert.alert('Stock insuficiente', `En ${opt.deposit} solo hay ${opt.qty} (${sel.unit}).`); return; }
    if (!recipient.trim()) { Alert.alert('Falta un dato', 'Indica a quién se entregará el material.'); return; }
    if (!destination.trim()) { Alert.alert('Falta un dato', 'Indica a dónde se entregará el material.'); return; }

    // ✅ Descuenta del depósito elegido (reparte entre lotes, primero los más antiguos)
    const lots = sel.entries
      .filter(e => e.deposit === depSel && e.qty > 0)
      .sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
    let remaining = n;
    const affected = [];
    for (const lot of lots) {
      if (remaining <= 0) break;
      const take = Math.min(lot.qty || 0, remaining);
      if (take > 0) affected.push([lot.id, take]);
      remaining -= take;
    }
    affected.forEach(([id, take]) => onWithdraw(id, take));
    persistRecipient(recipient.trim());

    const rec = {
      id: 's' + Date.now() + Math.random().toString(36).slice(2, 8),
      createdAt: new Date().toISOString(),
      name: sel.name, cat: sel.cat, unit: sel.unit, qty: n, deposit: depSel,
      serial: serial.trim(), recipient: recipient.trim(), destination: destination.trim(),
    };
    try {
      await createSalida(rec);
      const fresh = await getSalidas();
      setHistory(fresh);
      Alert.alert('Salida registrada ✅', `Se retiraron ${n} (${sel.unit}) de "${sel.name}" en ${depSel}.\n👤 ${rec.recipient}\n📍 ${rec.destination}${rec.serial ? '\n🔢 S/N: ' + rec.serial : ''}`);
    } catch (e) {
      setHistory(prev => [rec, ...prev]);
      Alert.alert('⚠ No se guardó en el servidor', 'La salida aparece en pantalla pero NO se guardó. Revisa que el servidor esté corriendo.');
    }
    setSel(null);
  }

  const webDateStyle = { borderWidth: 2, borderColor: colors.white, borderRadius: 6, padding: '4px 6px', backgroundColor: colors.surface, color: colors.ink, fontSize: 12 };

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
              <IconReporte color={colors.purple} /><Text style={st.histBtnText}>Salidas históricas</Text>
            </View>
          </TouchableOpacity>
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
            {hasDateFilter && <Text style={st.dateCount}>{historyFiltered.length} salida(s) en el rango · el Historial mostrará solo esto</Text>}
          </View>
        )}
      />
      {groups.length === 0 ? (
        <View style={ui.empty}><Text style={ui.emptyText}>No hay materiales con stock.</Text></View>
      ) : (
        <ScrollView contentContainerStyle={ui.list}>
          <View style={st.grid}>
            {groups.map(item => (
              <View key={item.name} style={{ width: `${100 / cols}%` }}>
                <CardShell cat={item.cat} photo={item.photo} name={item.name}>
                  <View style={ui.qtyBox}><Text style={ui.qtyNum}>{item.total}</Text></View>
                  <Text style={ui.qtyLabel}>{item.unit}</Text>
                  <TouchableOpacity style={ui.dangerSolidBtn} onPress={() => openWithdraw(item)}>
                    <Text style={ui.dangerSolidBtnText}>Retirar</Text>
                  </TouchableOpacity>
                </CardShell>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* ✅✅✅ EL FORMULARIO DE RETIRO (el que te faltaba) */}
      {sel && (
        <ModalShell visible={true} title={`Retirar: ${sel.name}`} onClose={() => setSel(null)} maxWidth={430}>
          <Text style={st.modalSub}>Stock total disponible: {sel.total} {sel.unit}</Text>
          <Text style={ui.modalLabel}>1. Selecciona el depósito:</Text>
          <ScrollView style={st.depositScroll} nestedScrollEnabled={true}>
            <View style={st.depositList}>
              {depOptions.map(o => (
                <TouchableOpacity key={o.deposit} style={[ui.selChip, depSel === o.deposit && ui.selChipActiveTeal]} onPress={() => setDepSel(o.deposit)}>
                  <Text style={[ui.selChipText, depSel === o.deposit && ui.selChipTextActive]}>{o.deposit} (Disp: {o.qty})</Text>
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
      {reportHistory && <HistoryModal visible={reportHistory} onClose={() => setReportHistory(false)} history={historyFiltered} products={products} rangeLabel={rangeLabel} />}
      <RecipientsImportModal visible={importNames} onClose={() => setImportNames(false)} onImport={importNamesList} />
    </View>
  );
}

const st = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  histBtnText: { color: colors.purple, fontWeight: '800', fontSize: 11 },
  modalSub: { fontSize: 12, color: colors.steel, marginBottom: 16 },
  depositScroll: { maxHeight: 110, marginBottom: 14 },
  depositList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  recList: { maxHeight: 130, borderWidth: 1, borderColor: colors.line, borderRadius: 6, marginBottom: 6, backgroundColor: colors.surface },
  recHint: { fontSize: 10, color: colors.steel, marginBottom: 10 },
  dateRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 6, gap: 6 },
  dateLabel: { color: colors.white, fontSize: 11, fontWeight: '700' },
  dateInput: { borderWidth: 2, borderColor: colors.white, borderRadius: 6, paddingVertical: 4, paddingHorizontal: 8, backgroundColor: colors.surface, color: colors.ink, fontSize: 12, minWidth: 110 },
  dateClear: { color: colors.white, fontSize: 11, fontWeight: '700', marginLeft: 4 },
  dateCount: { color: colors.white, fontSize: 11, opacity: 0.9, marginTop: 6 },
});