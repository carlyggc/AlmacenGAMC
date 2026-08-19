import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { ui } from '../styles';
import CardShell from './CardShell';
import { IconCalendario, IconBasura } from './BoxIcon';
import PhotoChooserPanel from './PhotoChooserPanel';
import { pickFromLibrary, takePhoto } from '../utils/photos';
import ConfirmModal from './ConfirmModal';
import { fmtDate } from '../utils/helpers';

export default function ProductCard({ product, onRename, onChangeQty, onSetQty, onChangePhoto, onDelete }) {
  const [name, setName] = useState(product.name);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  function commitName() {
    const t = name.trim();
    if (!t) { setName(product.name); return; }
    if (t !== product.name) onRename(product.id, t);
  }

  const askQtyInput = (text) => {
    const n = parseInt(text.replace(/[^0-9]/g, ''), 10);
    onSetQty(product.id, isNaN(n) ? 0 : n);
  };

  async function handlePickCamera() {
    setPickerVisible(false);
    const r = await takePhoto();
    if (r.uri) onChangePhoto(product.id, r.uri);
  }

  async function handlePickLibrary() {
    setPickerVisible(false);
    const r = await pickFromLibrary();
    if (r.uri) onChangePhoto(product.id, r.uri);
  }

  const abierto = pickerVisible || confirmVisible;

  return (
    <View style={[st.wrapper, abierto && st.wrapperTop]}>
      <CardShell
        cat={product.cat}
        photo={product.photo}
        name={product.name} // ✅ título para la vista ampliada
        onPhotoPress={() => setPickerVisible(true)} // ✅ solo se usa cuando NO hay foto
        overlayLabel={product.photo ? 'Cambiar' : 'Añadir foto'}
        onOverlayPress={() => setPickerVisible(true)}
        nameNode={(
          <View style={st.nameRow}>
            <TextInput
              style={st.nameInput}
              value={name}
              onChangeText={setName}
              onEndEditing={commitName}
              onSubmitEditing={commitName}
              returnKeyType="done"
              numberOfLines={1}
              scrollEnabled
              placeholder="Nombre"
              placeholderTextColor={colors.steel}
            />
            <TouchableOpacity
              onPress={() => setConfirmVisible(true)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <IconBasura color={colors.steel} />
            </TouchableOpacity>
          </View>
        )}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <IconCalendario color={colors.steel} />
          <Text style={{ fontSize: 10, color: colors.steel, letterSpacing: 0.5 }}>
            {fmtDate(product.createdAt)}
          </Text>
        </View>
        <View style={st.qtyRow}>
          <TouchableOpacity style={[st.qtyBtn, st.qtyBtnMinus]} onPress={() => onChangeQty(product.id, -1)}>
            <Text style={st.qtyBtnText}>−</Text>
          </TouchableOpacity>
          <TextInput
            style={st.qtyInput}
            value={String(product.qty)}
            onChangeText={askQtyInput}
            keyboardType="number-pad"
          />
          <TouchableOpacity style={[st.qtyBtn, st.qtyBtnPlus]} onPress={() => onChangeQty(product.id, 1)}>
            <Text style={st.qtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={[ui.qtyLabel, { marginBottom: 0 }]}>{product.unit || 'Unidad'}</Text>
      </CardShell>

      {/* Búsqueda / selector de foto DENTRO de la tarjeta, desplegado hacia arriba */}
      <PhotoChooserPanel
        inline
        title="Elegir foto"
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onPickCamera={handlePickCamera}
        onPickLibrary={handlePickLibrary}
        onPickWeb={uri => onChangePhoto(product.id, uri)}
        initialQuery={product.name}
      />

      <ConfirmModal
        inline
        visible={confirmVisible}
        title="Eliminar producto"
        message={`¿Eliminar "${product.name}" del depósito? Esta acción no se puede deshacer.`}
        onCancel={() => setConfirmVisible(false)}
        onConfirm={() => { setConfirmVisible(false); onDelete(product.id); }}
      />
    </View>
  );
}

const st = StyleSheet.create({
  wrapper: {
    flex: 1,
    minWidth: 150,
    maxWidth: 400,
    margin: 6,
    position: 'relative',
  },
  wrapperTop: { zIndex: 100, elevation: 20 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  nameInput: {
    flex: 1, minWidth: 0, fontSize: 13, fontWeight: '700',
    textTransform: 'uppercase', color: colors.ink,
    paddingVertical: 2, marginRight: 6,
  },
  qtyRow: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: {
    width: 32, height: 32, borderRadius: 4, borderWidth: 2,
    borderColor: colors.ink, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surface, flexShrink: 0,
  },
  qtyBtnMinus: { marginRight: 8 },
  qtyBtnPlus: { backgroundColor: colors.teal, marginLeft: 8 },
  qtyBtnText: { fontSize: 18, fontWeight: '700', color: colors.ink, lineHeight: 20 },
  qtyInput: {
    flex: 1, minWidth: 0, textAlign: 'center', fontSize: 18, fontWeight: '700',
    borderWidth: 2, borderColor: colors.ink, borderRadius: 4,
    paddingVertical: 4, color: colors.ink,
  },
});