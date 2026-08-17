import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { ui } from '../styles';
import { IconCalendario, IconBasura } from './BoxIcon';
import PhotoChooserPanel from './PhotoChooserPanel';
import { pickFromLibrary, takePhoto } from '../utils/photos';
import ConfirmModal from './ConfirmModal';
import { fmtDate } from '../utils/helpers';

export default function ProductCard({ product, onRename, onChangeQty, onSetQty, onChangePhoto, onDelete }) {
  const [name, setName] = useState(product.name);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const isTool = product.category === 'herramienta';

  function commitName() {
    const trimmed = name.trim();
    if (!trimmed) { setName(product.name); return; }
    if (trimmed !== product.name) onRename(product.id, trimmed);
  }
  function askQtyInput(text) {
    const n = parseInt(text.replace(/[^0-9]/g, ''), 10);
    onSetQty(product.id, isNaN(n) ? 0 : n);
  }
  async function handlePickCamera() { setPickerVisible(false); const r = await takePhoto(); if (r.uri) onChangePhoto(product.id, r.uri); }
  async function handlePickLibrary() { setPickerVisible(false); const r = await pickFromLibrary(); if (r.uri) onChangePhoto(product.id, r.uri); }

  return (
    <View style={ui.card}>
      <View style={[ui.categoryTag, isTool ? ui.tagHerramienta : ui.tagMaterial]}>
        <Text style={ui.categoryTagText}>{(product.cat || (isTool ? 'Herramientas' : 'Materiales')).toUpperCase()}</Text>
      </View>
      <TouchableOpacity style={ui.photoWrap} onPress={() => setPickerVisible(true)} activeOpacity={0.8}>
        {product.photo ? (
          <Image source={{ uri: product.photo }} style={ui.photo} />
        ) : (
          <View style={ui.photoPlaceholder}><Text style={ui.photoPlaceholderText}>SIN FOTO</Text></View>
        )}
        <View style={st.photoBtn}><Text style={st.photoBtnText}>{product.photo ? 'Cambiar' : 'Añadir foto'}</Text></View>
      </TouchableOpacity>
      <View style={ui.cardBody}>
        <View style={st.nameRow}>
          <TextInput style={st.nameInput} value={name} onChangeText={setName}
            onEndEditing={commitName} onSubmitEditing={commitName} returnKeyType="done"
            numberOfLines={1} scrollEnabled={true} placeholder="Nombre" placeholderTextColor={colors.steel} />
          <TouchableOpacity onPress={() => setConfirmVisible(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <IconBasura color={colors.steel} />
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <IconCalendario color={colors.steel} />
          <Text style={{ fontSize: 10, color: colors.steel, letterSpacing: 0.5 }}>{fmtDate(product.createdAt)}</Text>
        </View>
        <View style={st.qtyRow}>
          <TouchableOpacity style={[st.qtyBtn, st.qtyBtnMinus]} onPress={() => onChangeQty(product.id, -1)}><Text style={st.qtyBtnText}>−</Text></TouchableOpacity>
          <TextInput style={st.qtyInput} value={String(product.qty)} onChangeText={askQtyInput} keyboardType="number-pad" />
          <TouchableOpacity style={[st.qtyBtn, st.qtyBtnPlus]} onPress={() => onChangeQty(product.id, 1)}><Text style={st.qtyBtnText}>+</Text></TouchableOpacity>
        </View>
        <Text style={[ui.qtyLabel, { marginBottom: 0 }]}>{product.unit || 'Unidad'}</Text>
      </View>
      <PhotoChooserPanel title="Cambiar foto" visible={pickerVisible} onClose={() => setPickerVisible(false)} onPickCamera={handlePickCamera} onPickLibrary={handlePickLibrary}
        onPickWeb={(uri) => onChangePhoto(product.id, uri)} initialQuery={product.name} />
      <ConfirmModal visible={confirmVisible} title="Eliminar producto"
        message={`¿Eliminar "${product.name}" del depósito? Esta acción no se puede deshacer.`}
        onCancel={() => setConfirmVisible(false)} onConfirm={() => { setConfirmVisible(false); onDelete(product.id); }} />
    </View>
  );
}

const st = StyleSheet.create({
  photoBtn: { position: 'absolute', bottom: 6, right: 6, backgroundColor: 'rgba(32,36,43,0.85)', borderRadius: 4, paddingVertical: 4, paddingHorizontal: 8 },
  photoBtnText: { color: '#fff', fontSize: 10, textTransform: 'uppercase' },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  nameInput: { flex: 1, minWidth: 0, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', color: colors.ink, paddingVertical: 2, marginRight: 6 },
  qtyRow: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: { width: 32, height: 32, borderRadius: 4, borderWidth: 2, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, flexShrink: 0 },
  qtyBtnMinus: { marginRight: 8 },
  qtyBtnPlus: { backgroundColor: colors.teal, marginLeft: 8 },
  qtyBtnText: { fontSize: 18, fontWeight: '700', color: colors.ink, lineHeight: 20 },
  qtyInput: { flex: 1, minWidth: 0, textAlign: 'center', fontSize: 18, fontWeight: '700', borderWidth: 2, borderColor: colors.ink, borderRadius: 4, paddingVertical: 4, color: colors.ink },
});