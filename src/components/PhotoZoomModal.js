import React, { useState, useEffect } from 'react';
import { Modal, View, Image, TouchableOpacity, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
export default function PhotoZoomModal({ visible, uri, name, onClose }) {
  const [zoom, setZoom] = useState(false);
  useEffect(() => { if (!visible) setZoom(false); }, [visible]);
  if (!visible || !uri) return null;
  const { width, height } = Dimensions.get('window');
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={st.root}>
        <View style={st.topBar}>
          <Text style={st.name} numberOfLines={1}>{String(name || 'FOTO').toUpperCase()}</Text>
          <View style={st.btns}>
            <TouchableOpacity style={st.btn} onPress={() => setZoom(z => !z)}><Text style={st.btnText}>{zoom ? 'VER COMPLETA' : 'AMPLIAR +'}</Text></TouchableOpacity>
            <TouchableOpacity style={st.btn} onPress={onClose}><Text style={st.btnText}>✕ CERRAR</Text></TouchableOpacity>
          </View>
        </View>
        {zoom ? (
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={true} showsHorizontalScrollIndicator={true} contentContainerStyle={st.scrollContent}>
            <TouchableOpacity activeOpacity={1} onPress={() => setZoom(false)}>
              <Image source={{ uri }} style={{ width: width * 1.6, height: height * 1.6 }} resizeMode="contain" />
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <TouchableOpacity style={st.containWrap} activeOpacity={1} onPress={onClose}>
            <Image source={{ uri }} style={st.containImg} resizeMode="contain" />
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
}
const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'rgba(18,20,24,0.93)' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingTop: 14, gap: 10 },
  name: { flex: 1, color: '#fff', fontWeight: '800', fontSize: 13, letterSpacing: 1 },
  btns: { flexDirection: 'row', gap: 8 },
  btn: { backgroundColor: 'rgba(255,255,255,0.14)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)', borderRadius: 6, paddingVertical: 6, paddingHorizontal: 10 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 11 },
  scrollContent: { alignItems: 'center', justifyContent: 'center', padding: 10 },
  containWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 12 },
  containImg: { width: '100%', height: '100%' },
});