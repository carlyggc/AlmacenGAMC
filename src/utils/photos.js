import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

const DIR = (FileSystem.documentDirectory || '') + 'almacen_fotos/';

async function ensure() {
  if (Platform.OS === 'web') return;
  const i = await FileSystem.getInfoAsync(DIR);
  if (!i.exists) await FileSystem.makeDirectoryAsync(DIR, { intermediates: true });
}

async function persist(uri) {
  if (Platform.OS === 'web') return uri;
  await ensure();
  const d = DIR + `p_${Date.now()}.jpg`;
  await FileSystem.copyAsync({ from: uri, to: d });
  return d;
}

function webPick() {
  return new Promise(res => {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'image/*';
    inp.onchange = e => {
      const f = e.target.files && e.target.files[0];
      if (!f) return res({ uri: null });
      const r = new FileReader();
      r.onload = () => res({ uri: r.result });
      r.readAsDataURL(f);
    };
    inp.click();
  });
}

export async function pickFromLibrary() {
  if (Platform.OS === 'web') return webPick();
  const p = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!p.granted) return { error: 'Se necesita permiso para acceder a tus fotos.' };
  const r = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.6,
  });
  if (r.canceled || r.cancelled) return { uri: null };
  const uri = await persist(r.uri);
  return { uri };
}

// ✅ AGREGADO: función que faltaba (la usan AddProductModal y ProductCard)
export async function takePhoto() {
  if (Platform.OS === 'web') return webPick(); // en web no hay cámara, abre selector de archivo
  const p = await ImagePicker.requestCameraPermissionsAsync();
  if (!p.granted) return { error: 'Se necesita permiso para usar la cámara.' };
  const r = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.6,
  });
  if (r.canceled || r.cancelled) return { uri: null };
  const uri = await persist(r.uri);
  return { uri };
}