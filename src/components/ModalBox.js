import React from 'react';
import { View, StyleSheet } from 'react-native';
export default function ModalBox({ visible, children }) {
  if (!visible) return null;
  return <View style={styles.root}>{children}</View>;
}
const styles = StyleSheet.create({ root: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 } });