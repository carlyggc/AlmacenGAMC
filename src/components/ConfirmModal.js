import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { ui } from '../styles';
import ModalShell from './ModalShell';

export default function ConfirmModal({ visible, title, message, onCancel, onConfirm, inline = false }) {
  if (!visible) return null;

  const body = (
    <View>
      <Text style={st.msg}>{message}</Text>
      <View style={ui.actions}>
        <TouchableOpacity style={[ui.btn, ui.btnCancel]} onPress={onCancel}>
          <Text style={ui.btnText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[ui.btn, ui.btnDanger]} onPress={onConfirm}>
          <Text style={[ui.btnText, ui.btnWhiteText]}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ✅ MODO INLINE: dentro de la tarjeta, desplegado hacia arriba
  if (inline) {
    return (
      <View style={st.inlineWrap}>
        <View style={st.inlineCard}>
          <Text style={st.inlineTitle}>{title}</Text>
          {body}
        </View>
      </View>
    );
  }

  // Modo modal clásico (lo sigue usando FaltantesScreen)
  return (
    <ModalShell visible={visible} title={title} onClose={onCancel} maxWidth={340} scroll={false} closeOnOverlay>
      {body}
    </ModalShell>
  );
}

const st = StyleSheet.create({
  msg: { fontSize: 12, color: colors.steel, marginBottom: 12, textAlign: 'center', fontWeight: '600', lineHeight: 16 },
  inlineWrap: { position: 'absolute', bottom: 8, left: -2, right: -2, zIndex: 95, elevation: 12 },
  inlineCard: { backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.ink, borderRadius: 8, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 12 },
  inlineTitle: { fontSize: 11, fontWeight: '800', color: colors.rust, textTransform: 'uppercase', marginBottom: 6, textAlign: 'center' },
});