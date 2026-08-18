import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { ui } from '../styles';
import { catColor } from '../utils/helpers';
import PhotoZoomModal from './PhotoZoomModal';
export default function CardShell({ cat, photo, name, badge, onPhotoPress, overlayLabel, onOverlayPress, nameNode, children }) {
  const [zoom, setZoom] = useState(false);
  const handlePhotoTap = () => {
    if (photo) setZoom(true);
    else if (onPhotoPress) onPhotoPress();
  };
  return (
    <View style={ui.card}>
      <View style={[ui.categoryTag, { backgroundColor: catColor(cat) }]}>
        <Text style={ui.categoryTagText}>{(cat || 'General').toUpperCase()}</Text>
      </View>
      {badge}
      <TouchableOpacity style={ui.photoWrap} onPress={handlePhotoTap} activeOpacity={0.9}>
        {photo ? <Image source={{ uri: photo }} style={ui.photo} resizeMode="contain" /> : (
          <View style={ui.photoPlaceholder}><Text style={ui.photoPlaceholderText}>SIN FOTO</Text></View>
        )}
        {onOverlayPress ? (
          <TouchableOpacity style={st.overlayBtn} onPress={onOverlayPress}>
            <Text style={st.overlayBtnText}>{overlayLabel || 'Añadir foto'}</Text>
          </TouchableOpacity>
        ) : null}
      </TouchableOpacity>
      <View style={ui.cardBody}>
        {nameNode || <Text style={ui.cardName}>{name}</Text>}
        {children}
      </View>
      <PhotoZoomModal visible={zoom} uri={photo} name={name} onClose={() => setZoom(false)} />
    </View>
  );
}
const st = StyleSheet.create({
  overlayBtn: { position: 'absolute', bottom: 6, right: 6, backgroundColor: 'rgba(32,36,43,0.85)', borderRadius: 4, paddingVertical: 4, paddingHorizontal: 8 },
  overlayBtnText: { color: '#fff', fontSize: 10, textTransform: 'uppercase' },
});