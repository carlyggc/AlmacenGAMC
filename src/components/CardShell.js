import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { colors, radius } from '../theme';
import { catColor } from '../utils/helpers';
import PhotoZoomModal from './PhotoZoomModal';

export default function CardShell({ cat, photo, name, badge, onPhotoPress, overlayLabel, onOverlayPress, nameNode, children }) {
  const accent = catColor(cat);
  const [zoom, setZoom] = useState(false);

  // ✅ CON foto → ampliar; SIN foto → abrir selector
  function handlePhotoPress() {
    if (photo) { setZoom(true); return; }
    if (onPhotoPress) onPhotoPress();
  }

  return (
    <View style={[st.card, { borderTopColor: accent }]}>
      {cat ? (
        <View style={[st.categoryTag, { backgroundColor: accent }]}>
          <Text style={st.categoryTagText}>{cat.toUpperCase()}</Text>
        </View>
      ) : null}
      {badge}
      <TouchableOpacity activeOpacity={0.85} onPress={handlePhotoPress} style={[st.photoWrap, photo ? st.photoWrapWhite : null]}>
        {photo ? (
          <View style={st.photoInner}>
            <Image source={{ uri: photo }} style={st.photo} resizeMode="contain" />
          </View>
        ) : (
          <View style={st.photoPlaceholder}>
            <Text style={st.photoPlaceholderText}>SIN{'\n'}FOTO</Text>
          </View>
        )}
        {overlayLabel && (
          <TouchableOpacity style={st.overlay} onPress={onOverlayPress} activeOpacity={0.85}>
            <Text style={st.overlayText}>{overlayLabel}</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
      <View style={st.body}>
        {nameNode ? nameNode : (name ? <Text style={st.cardName} numberOfLines={2}>{name.toUpperCase()}</Text> : null)}
        {children}
      </View>
      <PhotoZoomModal visible={zoom} uri={photo} name={name} onClose={() => setZoom(false)} />
    </View>
  );
}

const st = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.ink,
    borderTopWidth: 4,
    borderRadius: radius.md,
    margin: 6,
    overflow: 'visible',
    position: 'relative',
  },
  categoryTag: { position: 'absolute', top: 8, right: 8, borderRadius: 4, paddingVertical: 3, paddingHorizontal: 7, zIndex: 4, maxWidth: '65%' },
  categoryTagText: { color: colors.white, fontSize: 8, fontWeight: '800', letterSpacing: 0.5 },
  // ✅ ALTURA FIJA: ya no se deforma con tarjetas anchas (antes aspectRatio 1.3)
  photoWrap: { width: '100%', height: 150, backgroundColor: colors.hole, position: 'relative' },
  photoWrapWhite: { backgroundColor: '#FFFFFF' },
  photoInner: { width: '100%', height: '100%', padding: 6, alignItems: 'center', justifyContent: 'center' },
  photo: { width: '100%', height: '100%' },
  photoPlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.hole },
  photoPlaceholderText: { color: colors.steel, fontSize: 14, fontWeight: '800', textAlign: 'center', letterSpacing: 1 },
  overlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.55)', paddingVertical: 6, alignItems: 'center' },
  overlayText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  body: { padding: 10 },
  // ✅ Nombre visible en Stock / Faltantes (las tarjetas de Almacen usan nameNode y no se duplica)
  cardName: { fontSize: 13, fontWeight: '800', color: colors.ink, textTransform: 'uppercase', marginBottom: 8 },
});