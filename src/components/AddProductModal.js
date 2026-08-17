import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import { colors, DEPOSITOS } from '../theme';
import { ui } from '../styles';
import { IconCamara } from './BoxIcon';
import { pickFromLibrary, takePhoto } from '../utils/photos';
import PhotoChooserPanel from './PhotoChooserPanel';
import { loadCatalog, saveCatalog, loadUnits, saveUnits } from '../utils/storage';
import ModalShell from './ModalShell';

const sanitizeName = (t) => t.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\/\.\-\(\)]/g, '');
const sanitizeUnit = (t) => t.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '');
const sanitizeCat = (t) => t.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\/\.\-\(\)&+°]/g, '');

export default function AddProductModal({ visible, onClose, onSave, showDeposit = true, fixedDeposit = null, requirePrice = false }) {
  const [deposit, setDeposit] = useState(DEPOSITOS[0]);
  const [name, setName] = useState('');
  const [nameFocused, setNameFocused] = useState(false);
  const [qty, setQty] = useState('0');
  const [unit, setUnit] = useState('');
  const [unitSearch, setUnitSearch] = useState('');
  const [showUnits, setShowUnits] = useState(false);
  const [units, setUnits] = useState([]);
  const [catText, setCatText] = useState('');
  const [catFocused, setCatFocused] = useState(false);
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('Bs');
  const [photo, setPhoto] = useState(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [catalog, setCatalog] = useState([]);

  useEffect(() => {
    if (visible) {
      loadCatalog().then(setCatalog);
      loadUnits().then(setUnits);
      if (fixedDeposit && DEPOSITOS.includes(fixedDeposit)) setDeposit(fixedDeposit);
    }
  }, [visible, fixedDeposit]);

  useEffect(() => {
    const up = name.trim().toUpperCase();
    if (!up) return;
    const ex = catalog.find(c => (c.name || '').toUpperCase() === up);
    if (!ex) return;
    if (ex.photo) setPhoto(p => (p ? p : ex.photo));
    if (ex.cat) setCatText(t => (t ? t : ex.cat));
    if (!(unit || unitSearch).trim() && ex.unit) { setUnit(ex.unit); setUnitSearch(ex.unit); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, catalog]);

  function closeLists() { setNameFocused(false); setCatFocused(false); setShowUnits(false); }
  const stop = { onMouseDown: (e) => e.stopPropagation(), onTouchStart: (e) => e.stopPropagation() };

  const q = name.trim().toUpperCase();
  const ordenado = [...catalog].sort((a, b) => a.name.localeCompare(b.name, 'es'));
  const sugs = !nameFocused ? [] : (q
    ? ordenado
      .filter(c => c.name.toUpperCase().includes(q) && c.name.toUpperCase() !== q)
      .sort((a, b) => (a.name.toUpperCase().startsWith(q) ? 0 : 1) - (b.name.toUpperCase().startsWith(q) ? 0 : 1) || a.name.localeCompare(b.name, 'es'))
    : ordenado).slice(0, 100);
  const allCats = Array.from(new Set(catalog.map(c => (c.cat || '').trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es'));
  const catSugs = !catFocused ? [] : allCats.filter(c => c.toLowerCase().includes(catText.trim().toLowerCase()) && c.toLowerCase() !== catText.trim().toLowerCase());
  const unitsMap = new Map();
  units.forEach(u => { const t = String(u || '').trim(); if (t) unitsMap.set(t.toLowerCase(), t); });
  catalog.forEach(c => { const t = String(c.unit || '').trim(); if (t) unitsMap.set(t.toLowerCase(), t); });
  const allUnits = Array.from(unitsMap.values()).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
  const filteredUnits = allUnits.filter(u => u.toLowerCase().includes(unitSearch.trim().toLowerCase()));
  const showUnitList = showUnits && (filteredUnits.length > 0 || unitSearch.trim() !== '');

  function reset() {
    setName(''); setNameFocused(false); setQty('0'); setUnit(''); setUnitSearch('');
    setShowUnits(false); setCatText(''); setCatFocused(false); setPrice(''); setCurrency('Bs');
    setPhoto(null); setErrors({});
  }
  function handleClose() { reset(); onClose(); }
  function clearError(k) { setErrors(e => ({ ...e, [k]: undefined })); }
  function adjustQty(d) { setQty(p => String(Math.max(0, (parseInt(p, 10) || 0) + d))); clearError('qty'); }
  function pickSug(c) {
    setName(c.name);
    setUnit(c.unit); setUnitSearch(c.unit);
    if (c.cat) setCatText(c.cat);
    if (c.photo) setPhoto(c.photo);
    if (requirePrice && c.price) setPrice(String(c.price));
    setNameFocused(false);
    clearError('name'); clearError('unit');
  }
  function pickCat(c) { setCatText(c); setCatFocused(false); clearError('cat'); }
  function pickUnit(u) { setUnit(u); setUnitSearch(u); setShowUnits(false); clearError('unit'); }
  function persistUnit(u) {
    setUnits(prev => {
      if (prev.some(x => x.toLowerCase() === u.toLowerCase())) return prev;
      const next = [...prev, u];
      saveUnits(next);
      return next;
    });
  }
  function handleSave() {
    const errs = {};
    const trimmed = name.trim();
    const n = parseInt(qty, 10) || 0;
    const finalUnit = (unit || unitSearch).trim();
    const finalCat = catText.trim();
    const cat = [...catalog];
    const exCat = cat.find(c => (c.name || '').toUpperCase() === trimmed.toUpperCase());
    const finalPhoto = photo || (exCat && exCat.photo) || null;
    if (trimmed.length <= 4) errs.name = '⚠ El nombre debe tener más de 4 letras.';
    if (!finalCat) errs.cat = '⚠ Selecciona o escribe una categoría.';
    if (n < 1) errs.qty = requirePrice ? '⚠ Indica cuántas unidades faltan (mínimo 1).' : '⚠ No puedes guardar con 0 materiales.';
    if (!finalUnit) errs.unit = '⚠ Selecciona o escribe una unidad.';
    if (!finalPhoto) errs.photo = '⚠ La foto es obligatoria.';
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    const category = /herramient/i.test(finalCat) ? 'herramienta' : 'material';
    if (exCat) {
      exCat.unit = finalUnit; exCat.type = category; exCat.cat = finalCat;
      if (finalPhoto) exCat.photo = finalPhoto;
      if (requirePrice) exCat.price = parseFloat(price) || exCat.price;
    } else {
      cat.push({ name: trimmed, unit: finalUnit, cat: finalCat, type: category, price: requirePrice ? (parseFloat(price) || 0) : 0, photo: finalPhoto });
    }
    saveCatalog(cat); setCatalog(cat);
    persistUnit(finalUnit);
    onSave({
      name: trimmed, qty: requirePrice ? 0 : n, required: requirePrice ? n : 0,
      unit: finalUnit, cat: finalCat, category, photo: finalPhoto,
      deposit: showDeposit ? deposit : (fixedDeposit || 'General'),
      price: requirePrice ? (parseFloat(price) || 0) : 0, currency,
    });
    reset();
  }
  async function handlePickCamera() { setPickerVisible(false); const r = await takePhoto(); if (r.error) setErrors(e => ({ ...e, photo: '⚠ ' + r.error })); else if (r.uri) { setPhoto(r.uri); clearError('photo'); } }
  async function handlePickLibrary() { setPickerVisible(false); const r = await pickFromLibrary(); if (r.error) setErrors(e => ({ ...e, photo: '⚠ ' + r.error })); else if (r.uri) { setPhoto(r.uri); clearError('photo'); } }

  return (
    <ModalShell visible={visible} title={requirePrice ? 'Nuevo faltante' : 'Nuevo registro'} onClose={handleClose} onOverlayPress={closeLists}>
      <View onMouseDown={closeLists} onTouchStart={closeLists}>
        {showDeposit && (
          <>
            <Text style={ui.label}>Depósito</Text>
            <View style={ui.chipRow}>
              {DEPOSITOS.map(d => (
                <TouchableOpacity key={d} style={[ui.selChip, deposit === d && ui.selChipActive]} onPress={() => setDeposit(d)}>
                  <Text style={[ui.selChipText, deposit === d && ui.selChipTextActive]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
        <Text style={ui.label}>Categoría</Text>
        <TextInput
          style={[ui.input, errors.cat && ui.inputError]}
          value={catText}
          onChangeText={t => { setCatText(sanitizeCat(t)); setCatFocused(true); setNameFocused(false); setShowUnits(false); clearError('cat'); }}
          onFocus={() => { setCatFocused(true); setNameFocused(false); setShowUnits(false); }}
          placeholder="Ej. Inventario DRT, Fibra Óptica..." placeholderTextColor={colors.steel}
        />
        {catSugs.length > 0 && (
          <ScrollView {...stop} style={[ui.dropdown, { maxHeight: 180, zIndex: 10 }]} nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
            {catSugs.map(c => (
              <TouchableOpacity key={c} style={ui.listItem} activeOpacity={0.7}
                onMouseDown={() => pickCat(c)} onPress={() => pickCat(c)}>
                <Text style={ui.listItemText}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        {errors.cat ? <Text style={ui.errorText}>{errors.cat}</Text> : null}
        <Text style={ui.label}>Nombre</Text>
        <TextInput
          style={[ui.input, errors.name && ui.inputError]}
          value={name}
          onChangeText={t => { setName(sanitizeName(t)); setNameFocused(true); setCatFocused(false); setShowUnits(false); clearError('name'); }}
          onFocus={() => { setNameFocused(true); setCatFocused(false); setShowUnits(false); }}
          placeholder="Ej. Tornillos 3/8" placeholderTextColor={colors.steel}
        />
        {nameFocused && catalog.length === 0 && (
          <View {...stop} style={ui.dropdown}>
            <Text style={ui.emptyHint}>Aún no hay nombres guardados.{'\n'}Aparecen al guardar productos o importar el CSV.</Text>
          </View>
        )}
        {sugs.length > 0 && (
          <ScrollView style={[ui.dropdown, { maxHeight: 180, zIndex: 10 }]} nestedScrollEnabled={true} keyboardShouldPersistTaps="handled"
            onMouseDown={e => { e.preventDefault(); e.stopPropagation(); }} onTouchStart={e => e.stopPropagation()}>
            {sugs.map(c => (
              <TouchableOpacity key={c.name} style={ui.listItem} activeOpacity={0.7}
                onMouseDown={() => pickSug(c)} onPress={() => pickSug(c)}>
                <Text style={ui.listItemText}>{c.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        {errors.name ? <Text style={ui.errorText}>{errors.name}</Text> : null}
        <Text style={ui.label}>{requirePrice ? 'Cantidad requerida' : 'Cantidad'}</Text>
        <View style={st.qtyRow}>
          <TouchableOpacity style={st.qtyBtn} onPress={() => adjustQty(-1)}><Text style={st.qtyBtnText}>−</Text></TouchableOpacity>
          <TextInput
            style={[st.qtyInput, errors.qty && ui.inputError]}
            value={qty}
            onChangeText={t => { setQty(t.replace(/[^0-9]/g, '')); clearError('qty'); }}
            onFocus={() => { closeLists(); if (qty === '0') setQty(''); }}
            onBlur={() => { if (qty === '') setQty('0'); }}
            keyboardType="number-pad"
          />
          <TouchableOpacity style={[st.qtyBtn, st.qtyBtnPlus]} onPress={() => adjustQty(1)}><Text style={st.qtyBtnText}>+</Text></TouchableOpacity>
        </View>
        {errors.qty ? <Text style={ui.errorText}>{errors.qty}</Text> : null}
        <Text style={ui.label}>Unidad</Text>
        <TextInput
          style={[ui.input, errors.unit && ui.inputError]}
          value={unitSearch}
          onChangeText={t => { setUnitSearch(sanitizeUnit(t)); setUnit(''); setShowUnits(true); setNameFocused(false); setCatFocused(false); clearError('unit'); }}
          onFocus={() => { setShowUnits(true); setNameFocused(false); setCatFocused(false); }}
          placeholder="Buscar unidad (ej. Bolsa)" placeholderTextColor={colors.steel}
        />
        {showUnits && filteredUnits.length === 0 && unitSearch.trim() === '' && (
          <View {...stop} style={ui.dropdown}>
            <Text style={ui.emptyHint}>No hay unidades guardadas todavía.{'\n'}Escribe una y toca "Usar ...", o importa el CSV.</Text>
          </View>
        )}
        {showUnitList && (
          <ScrollView {...stop} style={[ui.dropdown, { maxHeight: 160 }]} nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
            {filteredUnits.map(u => (
              <TouchableOpacity key={u} style={ui.listItem} activeOpacity={0.7}
                onMouseDown={() => pickUnit(u)} onPress={() => pickUnit(u)}>
                <Text style={ui.listItemText}>{u}</Text>
              </TouchableOpacity>
            ))}
            {unitSearch.trim() !== '' && filteredUnits.length === 0 && (
              <TouchableOpacity style={ui.listItem} activeOpacity={0.7}
                onMouseDown={() => pickUnit(unitSearch.trim())} onPress={() => pickUnit(unitSearch.trim())}>
                <Text style={[ui.listItemText, { color: colors.teal }]}>Usar "{unitSearch.trim()}"</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        )}
        {errors.unit ? <Text style={ui.errorText}>{errors.unit}</Text> : null}
        {requirePrice && (
          <>
            <Text style={ui.label}>Costo unitario</Text>
            <View style={ui.priceRow}>
              <TouchableOpacity style={ui.currBtn} onPress={() => setCurrency(c => c === 'Bs' ? '$us' : 'Bs')}>
                <Text style={ui.currText}>{currency === 'Bs' ? 'Bs' : '$us'}</Text>
              </TouchableOpacity>
              <TextInput style={ui.priceInput} value={price}
                onFocus={() => closeLists()}
                onChangeText={t => setPrice(t.replace(/[^0-9.]/g, ''))} placeholder="0.00" placeholderTextColor={colors.steel} keyboardType="numeric" />
            </View>
          </>
        )}
        <Text style={ui.label}>Foto (obligatoria)</Text>
        <TouchableOpacity style={[st.photoUpload, errors.photo && st.photoUploadError]} onPress={() => { closeLists(); setPickerVisible(true); }}>
          {photo ? <Image source={{ uri: photo }} style={st.photoPreview} /> : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <IconCamara color={colors.steel} />
              <Text style={{ fontSize: 12, color: colors.steel, textAlign: 'center' }}>Toca para subir la foto</Text>
            </View>
          )}
        </TouchableOpacity>
        {errors.photo ? <Text style={ui.errorText}>{errors.photo}</Text> : null}
        <View style={ui.actions}>
          <TouchableOpacity style={[ui.btn, ui.btnCancel]} onPress={handleClose}><Text style={ui.btnText}>Cancelar</Text></TouchableOpacity>
          <TouchableOpacity style={[ui.btn, ui.btnOk]} onPress={handleSave}><Text style={[ui.btnText, ui.btnWhiteText]}>Guardar</Text></TouchableOpacity>
        </View>
      </View>
      <PhotoChooserPanel visible={pickerVisible} onClose={() => setPickerVisible(false)} onPickCamera={handlePickCamera} onPickLibrary={handlePickLibrary}
        onPickWeb={(uri) => { setPhoto(uri); clearError('photo'); }} initialQuery={name || catText} />
    </ModalShell>
  );
}

const st = StyleSheet.create({
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  qtyBtn: { width: 40, height: 40, borderRadius: 4, borderWidth: 2, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, flexShrink: 0 },
  qtyBtnPlus: { backgroundColor: colors.teal },
  qtyBtnText: { fontSize: 18, fontWeight: '700', color: colors.ink },
  qtyInput: { flex: 1, marginHorizontal: 10, borderWidth: 2, borderColor: colors.ink, borderRadius: 4, paddingVertical: 8, fontSize: 16, fontWeight: '700', color: colors.ink, textAlign: 'center', backgroundColor: colors.surface },
  photoUpload: { borderWidth: 2, borderColor: colors.steel, borderStyle: 'dashed', borderRadius: 8, padding: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.hole, minHeight: 90, marginBottom: 6 },
  photoUploadError: { borderColor: colors.rust },
  photoPreview: { width: '100%', height: 110, borderRadius: 4 },
});