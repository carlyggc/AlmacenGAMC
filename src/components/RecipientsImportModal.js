import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet, Platform, View } from 'react-native';
import { colors, radius } from '../theme';
import { ui } from '../styles';
import ModalShell from './ModalShell';
export const parseNames = (text) => text.split(/[\r\n,;\t]+/).map(s => s.replace(/^"|"$/g, '').trim()).filter(s => s.length > 1);
export default function RecipientsImportModal({ visible, onClose, onImport }) {
  const [text, setText] = useState('');
  function handleFile(e) { const f = e.target.files && e.target.files[0]; if (!f) return; const rd = new FileReader(); rd.onload = () => setText(String(rd.result || '')); rd.readAsText(f); }
  function confirm() { const names = parseNames(text); if (!names.length) return; onImport(names); setText(''); onClose(); }
  return (
    <ModalShell visible={visible} title="Importar nombres (CSV)" onClose={onClose} maxWidth={420}>
      {Platform.OS === 'web' && <input type="file" accept=".csv,.txt" onChange={handleFile} style={{ marginBottom: 10 }} />}
      <Text style={ui.label}>O pega los nombres (separados por coma o por línea)</Text>
      <TextInput style={st.area} multiline numberOfLines={5} value={text} onChangeText={setText} placeholder={'Ej: Juan Pérez, María Rojas...'} placeholderTextColor={colors.steel} />
      <View style={ui.actions}>
        <TouchableOpacity style={[ui.btn, ui.btnCancel]} onPress={onClose}><Text style={ui.btnText}>Cancelar</Text></TouchableOpacity>
        <TouchableOpacity style={[ui.btn, ui.btnOk]} onPress={confirm}><Text style={[ui.btnText, ui.btnWhiteText]}>Importar</Text></TouchableOpacity>
      </View>
    </ModalShell>
  );
}
const st = StyleSheet.create({ area: { borderWidth: 2, borderColor: colors.ink, borderRadius: radius.sm, minHeight: 100, padding: 10, fontSize: 12, color: colors.ink, backgroundColor: colors.surface, marginBottom: 10, textAlignVertical: 'top' } });