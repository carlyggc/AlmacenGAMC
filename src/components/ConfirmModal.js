import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { ui } from '../styles';
import ModalShell from './ModalShell';

export default function ConfirmModal({ visible, title, message, onCancel, onConfirm }) {
  return (
    <ModalShell visible={visible} title={title} onClose={onCancel} maxWidth={340} scroll={false} closeOnOverlay>
      <Text style={st.msg}>{message}</Text>
      <View style={ui.actions}>
        <TouchableOpacity style={[ui.btn, ui.btnCancel]} onPress={onCancel}><Text style={ui.btnText}>Cancelar</Text></TouchableOpacity>
        <TouchableOpacity style={[ui.btn, ui.btnDanger]} onPress={onConfirm}><Text style={[ui.btnText, ui.btnWhiteText]}>Eliminar</Text></TouchableOpacity>
      </View>
    </ModalShell>
  );
}

const st = StyleSheet.create({
  msg: { fontSize: 13, color: colors.steel, marginBottom: 16 },
});