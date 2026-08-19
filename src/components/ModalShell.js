import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { colors, radius } from '../theme';

export default function ModalShell({ visible, title, onClose, maxWidth = 460, scroll = true, closeOnOverlay = false, onOverlayPress, children }) {
  if (!visible) return null;

  const overlayPress = () => {
    if (onOverlayPress) onOverlayPress();
    if (closeOnOverlay && onClose) onClose();
  };

  return (
    <View
      style={[st.overlay, Platform.OS === 'web' && st.overlayWeb]}
      onMouseDown={overlayPress}
      onTouchStart={overlayPress}
    >
      <View
        style={[st.card, { maxWidth: maxWidth }]}
        onMouseDown={e => e.stopPropagation()}
        onTouchStart={e => e.stopPropagation()}
      >
        {onClose ? (
          <TouchableOpacity style={st.closeBtn} onPress={onClose}>
            <Text style={st.closeBtnText}></Text>
          </TouchableOpacity>
        ) : null}
        {title ? <Text style={st.title}>{title}</Text> : null}
        {scroll ? (
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        ) : children}
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 9999,
    backgroundColor: 'rgba(32,36,43,0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  overlayWeb: {
    position: 'fixed',  // ✅ En web, fixed cubre toda la ventana
  },
  card: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: radius.lg,
    padding: 18,
    overflow: 'hidden',
  },
  closeBtn: {
    position: 'absolute', top: 12, right: 12, zIndex: 5,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: colors.hole, alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { fontSize: 14, color: colors.steel, fontWeight: '700' },
  title: {
    fontSize: 18, fontWeight: '800', textTransform: 'uppercase',
    marginBottom: 12, color: colors.teal, textAlign: 'center', paddingRight: 30,
  },
});