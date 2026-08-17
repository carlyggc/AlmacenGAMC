import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { colors, radius } from '../theme';
import ModalShell from './ModalShell';
import { IconCamara, IconImagen, IconBuscar } from './BoxIcon';

// ── GOOGLE 100% real (opcional, gratis 100 búsquedas/día): pega tus claves y listo ──
const GOOGLE_API_KEY = '';
const GOOGLE_CX = '';

// Diccionario técnico (solo para el respaldo de la biblioteca libre)
const DICC = {
  cablecanal: ['cable trunking', 'PVC cable duct', 'wiremold'],
  canal: ['cable trunking', 'PVC cable duct'],
  abrazadera: ['hose clamp', 'pipe clamp', 'band clamp'],
  adaptador: ['fiber optic adapter', 'LC adapter'],
  lc: ['LC connector', 'LC patch cord'],
  bandeja: ['fiber optic splice tray', 'fiber distribution tray', 'cable tray'],
  fibra: ['optical fiber', 'fiber optic cable'],
  mufla: ['fiber optic splice closure'],
  pigtail: ['fiber pigtail'],
  coaxial: ['coaxial cable'],
  bipolar: ['electrical cable', 'twin core cable'],
  energia: ['power cable'],
  telefon: ['telephone cable'],
  utp: ['UTP cable'],
  cable: ['electrical cable'],
  crimper: ['crimping tool'],
  desarmador: ['screwdriver'],
  destornillador: ['screwdriver'],
  alicates: ['pliers'],
  amoladora: ['angle grinder'],
  soplador: ['blower'],
  escalera: ['ladder'],
  taladro: ['drill'],
  tornillo: ['screws'],
  cinta: ['adhesive tape'],
  grapa: ['cable staple'],
  rack: ['server rack'],
  conector: ['electrical connector'],
  jack: ['RJ45 jack'],
  patch: ['patch cord'],
  linterna: ['flashlight'],
  casco: ['safety helmet'],
  guante: ['work gloves'],
  switch: ['network switch'],
  router: ['router'],
  onu: ['ONU GPON'],
};
function queriesFor(q) {
  const low = q.toLowerCase();
  const list = [];
  Object.keys(DICC).forEach(k => {
    if (low.includes(k)) DICC[k].forEach(t => { if (!list.includes(t)) list.push(t); });
  });
  list.push(q);
  return list;
}
async function searchGoogle(q) {
  const url = 'https://www.googleapis.com/customsearch/v1?key=' + GOOGLE_API_KEY + '&cx=' + GOOGLE_CX + '&searchType=image&num=20&safe=active&q=' + encodeURIComponent(q);
  const res = await fetch(url);
  const json = await res.json();
  return (json.items || [])
    .filter(it => it.link && /^https?:/.test(it.link))
    .map(it => ({ thumb: (it.image && (it.image.thumbnailLink || it.link)) || it.link }));
}
// ✅ FUENTE PRINCIPAL SIN CLAVES: DuckDuckGo Imágenes (índice de Bing = resultados tipo Google)
async function searchDuckDuckGo(q) {
  const proxies = ['https://api.allorigins.win/raw?url=', 'https://corsproxy.io/?url='];
  let vqd = '';
  const paso1 = 'https://duckduckgo.com/?q=' + encodeURIComponent(q) + '&iax=images&ia=i';
  for (const p of proxies) {
    try {
      const r1 = await fetch(p + encodeURIComponent(paso1));
      const html = await r1.text();
      const m = html.match(/vqd=["']?([\d-]+)/);
      if (m) { vqd = m[1]; break; }
    } catch (e) {}
  }
  if (!vqd) return [];
  const paso2 = 'https://duckduckgo.com/i.js?l=wt-wt&o=json&nojs=1&p=1&sp=0&vqd=' + encodeURIComponent(vqd) + '&q=' + encodeURIComponent(q);
  for (const p of proxies) {
    try {
      const r2 = await fetch(p + encodeURIComponent(paso2));
      const json = await r2.json();
      const items = (json.results || [])
        .filter(r => r.thumbnail || r.image)
        .slice(0, 24)
        .map(r => ({ thumb: r.thumbnail || r.image }));
      if (items.length) return items;
    } catch (e) {}
  }
  return [];
}
// Respaldo: biblioteca libre, solo fotos reales (JPEG/PNG)
async function searchWikimedia(q) {
  const url = 'https://commons.wikimedia.org/w/api.php'
    + '?action=query&format=json&origin=*'
    + '&generator=search&gsrnamespace=6&gsrlimit=24'
    + '&gsrsearch=' + encodeURIComponent('filetype:bitmap ' + q)
    + '&prop=imageinfo&iiprop=url|mime&iiurlwidth=640';
  const res = await fetch(url);
  const json = await res.json();
  const pages = (json.query && json.query.pages) ? Object.values(json.query.pages) : [];
  pages.sort((a, b) => (a.index || 0) - (b.index || 0));
  return pages
    .map(p => (p.imageinfo || [])[0])
    .filter(ii => ii && (ii.thumburl || ii.url) && (!ii.mime || ii.mime === 'image/jpeg' || ii.mime === 'image/png'))
    .map(ii => ({ thumb: ii.thumburl || ii.url }));
}

export default function PhotoChooserPanel({ visible, onClose, onPickCamera, onPickLibrary, onPickWeb, initialQuery = '', title = 'Elegir foto' }) {
  const [mode, setMode] = useState('menu');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) { setMode('menu'); setQuery(initialQuery || ''); setResults([]); setError(''); }
  }, [visible, initialQuery]);

  async function doSearch(texto) {
    const q = (texto || '').trim();
    if (!q || loading) return;
    setLoading(true); setError(''); setResults([]);
    try {
      let items = [];
      if (GOOGLE_API_KEY && GOOGLE_CX) items = await searchGoogle(q);   // 1º Google (si hay claves)
      if (!items.length) items = await searchDuckDuckGo(q);             // 2º DuckDuckGo (como Google)
      if (!items.length) {                                              // 3º biblioteca técnica
        const qs = queriesFor(q);
        for (let i = 0; i < qs.length && i < 4 && items.length < 24; i++) {
          const r = await searchWikimedia(qs[i]);
          r.forEach(it => { if (!items.some(x => x.thumb === it.thumb)) items.push(it); });
        }
      }
      if (!items.length) setError('Sin resultados. Prueba con otras palabras.');
      setResults(items);
    } catch (e) {
      setError('No se pudo buscar. Revisa tu conexión a internet.');
    }
    setLoading(false);
  }
  function openWeb() {
    setMode('web');
    setQuery(initialQuery || '');
    if ((initialQuery || '').trim()) doSearch(initialQuery);
  }
  function pick(item) {
    if (onPickWeb) onPickWeb(item.thumb);
    onClose();
  }

  return (
    <ModalShell visible={visible} title={mode === 'web' ? 'Buscar imagen en Internet' : title} onClose={onClose} maxWidth={mode === 'web' ? 560 : 320} scroll={false} closeOnOverlay>
      {mode === 'menu' ? (
        <View>
          {Platform.OS !== 'web' && (
            <TouchableOpacity style={st.opt} onPress={onPickCamera}>
              <View style={st.optInner}><IconCamara color={colors.ink} /><Text style={st.optText}>Tomar foto</Text></View>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={st.opt} onPress={onPickLibrary}>
            <View style={st.optInner}><IconImagen color={colors.ink} /><Text style={st.optText}>Subir imagen</Text></View>
          </TouchableOpacity>
          {onPickWeb ? (
            <TouchableOpacity style={st.opt} onPress={openWeb}>
              <View style={st.optInner}><IconBuscar color={colors.ink} /><Text style={st.optText}>Buscar en Internet</Text></View>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity style={st.close} onPress={onClose}><Text style={st.closeText}>Cancelar</Text></TouchableOpacity>
        </View>
      ) : (
        <View>
          <View style={st.row}>
            <TextInput style={st.input} value={query} onChangeText={setQuery}
              placeholder="Ej. cablecanal 100x50, abrazadera..." placeholderTextColor={colors.steel}
              onSubmitEditing={() => doSearch(query)} returnKeyType="search" />
            <TouchableOpacity style={st.btnSearch} onPress={() => doSearch(query)}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <IconBuscar color="#fff" /><Text style={st.btnSearchText}>Buscar</Text>
              </View>
            </TouchableOpacity>
          </View>
          {loading ? (
            <View style={st.center}>
              <ActivityIndicator color={colors.teal} />
              <Text style={st.hint}>Buscando imágenes...</Text>
            </View>
          ) : (
            <ScrollView style={st.grid} nestedScrollEnabled={true}>
              <View style={st.gridInner}>
                {results.map((it, i) => (
                  <TouchableOpacity key={i} style={st.cell} onPress={() => pick(it)}>
                    <Image source={{ uri: it.thumb }} style={st.thumb} />
                  </TouchableOpacity>
                ))}
              </View>
              {error ? <Text style={st.error}>{error}</Text> : null}
              {!error && results.length === 0 ? (
                <Text style={st.hint}>Escribe qué material buscas y toca "Buscar".</Text>
              ) : null}
            </ScrollView>
          )}
          <TouchableOpacity style={st.close} onPress={() => setMode('menu')}><Text style={st.closeText}>← Volver</Text></TouchableOpacity>
        </View>
      )}
    </ModalShell>
  );
}

const st = StyleSheet.create({
  opt: { borderWidth: 2, borderColor: colors.ink, borderRadius: radius.sm, paddingVertical: 12, alignItems: 'center', marginBottom: 10, backgroundColor: colors.surface },
  optInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  optText: { fontWeight: '700', fontSize: 13, color: colors.ink },
  close: { paddingVertical: 10, alignItems: 'center' },
  closeText: { fontSize: 12, fontWeight: '700', color: colors.steel, textTransform: 'uppercase' },
  row: { flexDirection: 'row', marginBottom: 10, gap: 8 },
  input: { flex: 1, borderWidth: 2, borderColor: colors.ink, borderRadius: radius.sm, paddingVertical: 10, paddingHorizontal: 12, fontSize: 13, color: colors.ink, backgroundColor: colors.surface },
  btnSearch: { backgroundColor: colors.teal, borderRadius: radius.sm, paddingHorizontal: 14, justifyContent: 'center' },
  btnSearchText: { color: '#fff', fontWeight: '800', fontSize: 12, textTransform: 'uppercase' },
  grid: { maxHeight: 320 },
  gridInner: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cell: { width: '31%', aspectRatio: 1, borderRadius: 6, overflow: 'hidden', borderWidth: 2, borderColor: colors.line },
  thumb: { width: '100%', height: '100%' },
  center: { paddingVertical: 30, alignItems: 'center' },
  hint: { fontSize: 12, color: colors.steel, textAlign: 'center', marginTop: 8 },
  error: { fontSize: 12, color: colors.rust, fontWeight: '700', textAlign: 'center', marginTop: 8 },
});