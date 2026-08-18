import React, { useState, useEffect } from 'react';
import { Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { colors, radius, DEPOSITOS } from '../theme';
import { ui } from '../styles';
import ModalShell from './ModalShell';
import { getCatalog, upsertCatalog } from '../utils/api';

const MAT_KW = ['CABLE','JACK','RJ-','PATCH','CINTA','GRAPA','TOMA','CANAL','PISO','CONO','LINTERNA','PIGTAIL','ADAPTADOR','SOPORTE','MALLA','ABRAZADERA','CRUCETA','RACK','FIBRA','MUFLA','BANDEJA','CTO','GPON','TRANSEIVER','PDU','CAJA','CONECTOR','BIPOLAR','TELEFON','COAXIAL','UTP','HDMI','TORNILLO','PILA','BATERIA','RAM','LICENCIA','FIREWALL','CERTIFICADO','DOMINIO'];
function guessType(name, cat) {
  const c = (cat || '').toLowerCase();
  if (c.includes('herramient')) return 'herramienta';
  if (!c.includes('drt')) return 'material';
  const n = (name || '').toUpperCase();
  return MAT_KW.some(k => n.includes(k)) ? 'material' : 'herramienta';
}
const num = (v) => {
  let s = String(v || '').trim(); if (!s) return 0;
  if (s.includes('.') && s.includes(',')) s = s.replace(/,/g, '');
  else if (s.includes(',')) s = s.replace(',', '.');
  s = s.replace(/[^0-9.-]/g, '');
  const n = parseFloat(s); return isNaN(n) ? 0 : n;
};
function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (!lines.length) return [];
  const first = lines[0];
  const delim = [';', ',', '\t', '|'].reduce((a, b) => ((first.split(a).length - 1) >= (first.split(b).length - 1) ? a : b));
  const rows = lines.map(l => l.split(delim).map(c => c.replace(/^"|"$/g, '').trim()));
  const hi = rows.findIndex(r => r.some(c => /descrip/i.test(c)));
  const start = hi >= 0 ? hi + 1 : 0;
  const head = hi >= 0 ? rows[hi].map(h => h.toLowerCase()) : [];
  const idx = (k) => head.findIndex(h => h.includes(k));
  const iCat = idx('categor'), iDesc = idx('descrip'), iUni = idx('unidad'), iReq = idx('requerida'), iExi = idx('existente'), iCost = idx('costo');
  const out = [];
  for (let i = start; i < rows.length; i++) {
    const r = rows[i];
    const name = (iDesc >= 0 ? r[iDesc] : r[2]) || '';
    if (!name || /descrip/i.test(name)) continue;
    out.push({
      cat: (iCat >= 0 ? r[iCat] : r[1]) || 'Materiales', name,
      unit: ((iUni >= 0 ? r[iUni] : r[3]) || 'PIEZA').toUpperCase(),
      required: num(iReq >= 0 ? r[iReq] : 0),
      existing: num(iExi >= 0 ? r[iExi] : 0),
      price: num(iCost >= 0 ? r[iCost] : 0),
    });
  }
  return out;
}

export default function CSVImportModal({ visible, onClose, onImport, initialDeposit }) {
  const [deposit, setDeposit] = useState(initialDeposit || DEPOSITOS[0]);
  const [text, setText] = useState('');
  const [preview, setPreview] = useState(null);
  const [catalog, setCatalog] = useState([]);
  useEffect(() => {
    if (visible) { getCatalog().then(setCatalog); if (initialDeposit) setDeposit(initialDeposit); }
  }, [visible, initialDeposit]);
  function handleFile(e) {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    const rd = new FileReader();
    rd.onload = () => setText(String(rd.result || ''));
    rd.readAsText(f);
  }
  function confirm() {
    if (!preview || !preview.length) return;
    const products = preview.map(p => {
      const up = p.name.toUpperCase();
      const match = catalog.find(c => c.name.toUpperCase() === up);
      const price = p.price || (match && match.price) || 0;
      const catFinal = p.cat || (match && match.cat) || 'Materiales';
      const photo = (match && match.photo) || null;
      upsertCatalog({ name: p.name, unit: p.unit, cat: catFinal, type: guessType(p.name, p.cat), price, photo });
      return {
        name: p.name, unit: p.unit, category: guessType(p.name, p.cat),
        cat: catFinal, qty: p.existing || 0, required: p.required || 0,
        price, currency: 'Bs', deposit, photo,
      };
    });
    onImport(products);
    setPreview(null); setText('');
    onClose();
  }
  return (
    <ModalShell visible={visible} title="Importar CSV" onClose={onClose} maxWidth={480}>
      <Text style={ui.label}>Depósito destino</Text>
      <View style={ui.chipRow}>
        {DEPOSITOS.map(d => (
          <TouchableOpacity key={d} style={[ui.selChip, deposit === d && ui.selChipActive]} onPress={() => setDeposit(d)}>
            <Text style={[ui.selChipText, deposit === d && ui.selChipTextActive]}>{d}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {Platform.OS === 'web' && <input type="file" accept=".csv,.txt" onChange={handleFile} style={{ marginBottom: 10 }} />}
      <Text style={ui.label}>O pega el contenido</Text>
      <TextInput style={st.area} multiline numberOfLines={6} value={text} onChangeText={setText} placeholder="Categoria,Descripcion,Unidad,Cantidad..." />
      <TouchableOpacity style={st.btnParse} onPress={() => setPreview(parseCSV(text))}><Text style={st.btnParseText}>Vista previa</Text></TouchableOpacity>
      {preview && (
        <ScrollView style={st.prev}>
          {preview.slice(0, 50).map((p, i) => (
            <Text key={i} style={st.prevRow}>{p.name} · {p.unit} · ex:{p.existing} · req:{p.required} · {p.price}</Text>
          ))}
          <Text style={st.prevCount}>{preview.length} registros listos</Text>
        </ScrollView>
      )}
      <View style={ui.actions}>
        <TouchableOpacity style={[ui.btn, ui.btnCancel]} onPress={onClose}><Text style={ui.btnText}>Cancelar</Text></TouchableOpacity>
        <TouchableOpacity style={[ui.btn, ui.btnOk]} onPress={confirm}><Text style={[ui.btnText, ui.btnWhiteText]}>Importar</Text></TouchableOpacity>
      </View>
    </ModalShell>
  );
}
const st = StyleSheet.create({
  area: { borderWidth: 2, borderColor: colors.ink, borderRadius: radius.sm, minHeight: 110, padding: 10, fontSize: 12, color: colors.ink, textAlignVertical: 'top', marginBottom: 10, backgroundColor: colors.surface },
  btnParse: { backgroundColor: colors.teal, borderRadius: radius.sm, paddingVertical: 10, alignItems: 'center', marginBottom: 10 },
  btnParseText: { color: '#fff', fontWeight: '800', fontSize: 12, textTransform: 'uppercase' },
  prev: { maxHeight: 140, borderWidth: 1, borderColor: colors.line, borderRadius: radius.sm, padding: 8, marginBottom: 10, backgroundColor: colors.surface },
  prevRow: { fontSize: 11, color: colors.ink, marginBottom: 2 },
  prevCount: { fontSize: 12, fontWeight: '800', color: colors.teal, marginTop: 6 },
});