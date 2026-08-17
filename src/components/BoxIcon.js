import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '../theme';
const T = colors.teal;
export function IconCaja() {
  return (<View style={{ width: 58, height: 50 }}>
    <View style={{ position: 'absolute', left: 6, right: 6, top: 12, bottom: 2, borderWidth: 3, borderColor: T, borderRadius: 4 }} />
    <View style={{ position: 'absolute', left: 6, right: 6, top: 12, height: 12, borderWidth: 3, borderColor: T, borderRadius: 4 }} />
    <View style={{ position: 'absolute', top: 4, left: '50%', marginLeft: -5, width: 10, height: 26, backgroundColor: T }} />
  </View>);
}
export function IconAlerta() {
  return (<View style={{ width: 58, height: 50, alignItems: 'center', justifyContent: 'flex-end' }}>
    <View style={{ width: 0, height: 0, borderLeftWidth: 27, borderRightWidth: 27, borderBottomWidth: 46, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: T }} />
    <View style={{ position: 'absolute', bottom: 3, width: 0, height: 0, borderLeftWidth: 22, borderRightWidth: 22, borderBottomWidth: 38, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: colors.hole }} />
    <Text style={{ position: 'absolute', bottom: 5, fontSize: 22, fontWeight: '800', color: T }}>!</Text>
  </View>);
}
export function IconSalida() {
  return (<View style={{ width: 58, height: 50, alignItems: 'center' }}>
    <Text style={{ fontSize: 26, fontWeight: '800', color: T, lineHeight: 26 }}>↑</Text>
    <View style={{ width: 42, height: 26, borderWidth: 3, borderColor: T, borderRadius: 4, borderTopWidth: 0, marginTop: -2 }} />
  </View>);
}
export function IconEdificio() {
  return (<View style={{ width: 46, height: 46 }}>
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: T, borderRadius: 2 }} />
    <View style={{ position: 'absolute', top: 3, left: 7, right: 7, bottom: 3, borderLeftWidth: 3, borderRightWidth: 3, borderColor: T }} />
    <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: T, borderRadius: 2 }} />
    <View style={{ position: 'absolute', top: 9, left: 13, width: 6, height: 6, backgroundColor: T }} />
    <View style={{ position: 'absolute', top: 9, right: 13, width: 6, height: 6, backgroundColor: T }} />
    <View style={{ position: 'absolute', top: 19, left: 13, width: 6, height: 6, backgroundColor: T }} />
    <View style={{ position: 'absolute', top: 19, right: 13, width: 6, height: 6, backgroundColor: T }} />
    <View style={{ position: 'absolute', bottom: 3, left: 18, width: 10, height: 11, borderLeftWidth: 3, borderRightWidth: 3, borderTopWidth: 3, borderColor: T }} />
  </View>);
}
export function IconStock() {
  return (<View style={{ width: 58, height: 50 }}>
    <View style={{ position: 'absolute', left: 6, right: 6, top: 12, bottom: 2, borderWidth: 3, borderColor: T, borderRadius: 4 }} />
    <View style={{ position: 'absolute', left: 6, right: 6, top: 12, height: 12, borderWidth: 3, borderColor: T, borderRadius: 4 }} />
    <Text style={{ position: 'absolute', top: 0, left: '50%', marginLeft: -6, fontSize: 14, fontWeight: '800', color: T }}>✓</Text>
  </View>);
}
export function IconReporte({ color = T }) {
  return (<View style={{ width: 14, height: 16 }}>
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderWidth: 2, borderColor: color, borderRadius: 3 }} />
    <View style={{ position: 'absolute', top: 4, left: 3, right: 3, height: 2, backgroundColor: color }} />
    <View style={{ position: 'absolute', top: 8, left: 3, right: 3, height: 2, backgroundColor: color }} />
    <View style={{ position: 'absolute', top: 12, left: 3, right: 6, height: 2, backgroundColor: color }} />
  </View>);
}
export function IconPrint({ color = T }) {
  return (<View style={{ width: 16, height: 16 }}>
    <View style={{ position: 'absolute', top: 0, left: 4, right: 4, height: 6, borderWidth: 2, borderColor: color, borderRadius: 2 }} />
    <View style={{ position: 'absolute', top: 4, left: 0, right: 0, height: 8, borderWidth: 2, borderColor: color, borderRadius: 2 }} />
    <View style={{ position: 'absolute', bottom: 0, left: 4, right: 4, height: 5, borderWidth: 2, borderColor: color, borderRadius: 2 }} />
  </View>);
}
export function IconDownload({ color = T }) {
  return (<View style={{ width: 16, height: 16, alignItems: 'center' }}>
    <View style={{ position: 'absolute', top: 0, left: 7, width: 2, height: 8, backgroundColor: color }} />
    <View style={{ position: 'absolute', top: 5, left: 4, width: 8, height: 8, borderLeftWidth: 2, borderRightWidth: 2, borderBottomWidth: 2, borderColor: color, transform: [{ rotate: '45deg' }] }} />
    <View style={{ position: 'absolute', bottom: 0, left: 1, right: 1, height: 2, backgroundColor: color }} />
  </View>);
}
export function IconCamara({ color = T }) {
  return (<View style={{ width: 18, height: 15 }}>
    <View style={{ position: 'absolute', top: 3, left: 0, right: 0, bottom: 0, borderWidth: 2, borderColor: color, borderRadius: 3 }} />
    <View style={{ position: 'absolute', top: 0, left: 5, width: 8, height: 4, backgroundColor: color, borderRadius: 2 }} />
    <View style={{ position: 'absolute', top: 6, left: 6, width: 6, height: 6, borderRadius: 3, borderWidth: 2, borderColor: color }} />
  </View>);
}
export function IconImagen({ color = T }) {
  return (<View style={{ width: 16, height: 14 }}>
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderWidth: 2, borderColor: color, borderRadius: 3 }} />
    <View style={{ position: 'absolute', top: 3, left: 3, width: 3, height: 3, backgroundColor: color, borderRadius: 2 }} />
    <View style={{ position: 'absolute', bottom: 3, left: 2, width: 5, height: 5, backgroundColor: color, transform: [{ rotate: '45deg' }] }} />
    <View style={{ position: 'absolute', bottom: 3, right: 2, width: 4, height: 4, backgroundColor: color, transform: [{ rotate: '45deg' }] }} />
  </View>);
}
export function IconBuscar({ color = T }) {
  return (<View style={{ width: 15, height: 15 }}>
    <View style={{ position: 'absolute', top: 0, left: 0, width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: color }} />
    <View style={{ position: 'absolute', bottom: 1, right: 1, width: 6, height: 2, backgroundColor: color, transform: [{ rotate: '45deg' }] }} />
  </View>);
}
export function IconCalendario({ color = T }) {
  return (<View style={{ width: 14, height: 14 }}>
    <View style={{ position: 'absolute', top: 2, left: 0, right: 0, bottom: 0, borderWidth: 2, borderColor: color, borderRadius: 2 }} />
    <View style={{ position: 'absolute', top: 0, left: 2, width: 2, height: 5, backgroundColor: color }} />
    <View style={{ position: 'absolute', top: 0, right: 2, width: 2, height: 5, backgroundColor: color }} />
    <View style={{ position: 'absolute', top: 7, left: 0, right: 0, height: 2, backgroundColor: color }} />
  </View>);
}
export function IconBasura({ color = T }) {
  return (<View style={{ width: 14, height: 16 }}>
    <View style={{ position: 'absolute', top: 4, left: 2, right: 2, bottom: 0, borderWidth: 2, borderColor: color, borderRadius: 2 }} />
    <View style={{ position: 'absolute', top: 2, left: 0, right: 0, height: 2, backgroundColor: color }} />
    <View style={{ position: 'absolute', top: 0, left: 5, width: 4, height: 2, backgroundColor: color }} />
    <View style={{ position: 'absolute', top: 7, left: 5, width: 2, height: 6, backgroundColor: color }} />
    <View style={{ position: 'absolute', top: 7, right: 5, width: 2, height: 6, backgroundColor: color }} />
  </View>);
}
export function IconAdvertencia({ color = T }) {
  return (<View style={{ width: 16, height: 14, alignItems: 'center', justifyContent: 'flex-end' }}>
    <View style={{ width: 0, height: 0, borderLeftWidth: 8, borderRightWidth: 8, borderBottomWidth: 14, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: color }} />
    <Text style={{ position: 'absolute', bottom: 1, fontSize: 9, fontWeight: '800', color: '#fff' }}>!</Text>
  </View>);
}
export function IconCheck({ color = T }) {
  return (<View style={{ width: 18, height: 18 }}>
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 9, borderWidth: 2, borderColor: color }} />
    <View style={{ position: 'absolute', top: 9, left: 4, width: 6, height: 2, backgroundColor: color, transform: [{ rotate: '45deg' }] }} />
    <View style={{ position: 'absolute', top: 8, left: 8, width: 8, height: 2, backgroundColor: color, transform: [{ rotate: '-45deg' }] }} />
  </View>);
}
export function IconSubir({ color = T }) {
  return (<View style={{ width: 14, height: 14, alignItems: 'center' }}>
    <View style={{ position: 'absolute', top: 3, left: 6, width: 2, height: 11, backgroundColor: color }} />
    <View style={{ position: 'absolute', top: 2, left: 3, width: 7, height: 7, borderLeftWidth: 2, borderTopWidth: 2, borderColor: color, transform: [{ rotate: '45deg' }] }} />
  </View>);
}

export default IconCaja;

export function IconUsuario({ color = T }) {
  return (<View style={{ width: 18, height: 18, alignItems: 'center' }}>
    <View style={{ width: 8, height: 8, borderRadius: 4, borderWidth: 2, borderColor: color }} />
    <View style={{ width: 14, height: 7, borderTopWidth: 2, borderLeftWidth: 2, borderRightWidth: 2, borderColor: color, borderTopLeftRadius: 7, borderTopRightRadius: 7, marginTop: 1 }} />
  </View>);
}
export function IconSalir({ color = T }) {
  return (<View style={{ width: 16, height: 16 }}>
    <View style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 10, borderWidth: 2, borderRightWidth: 0, borderColor: color, borderRadius: 2 }} />
    <View style={{ position: 'absolute', top: 7, left: 6, width: 9, height: 2, backgroundColor: color }} />
    <View style={{ position: 'absolute', top: 4, right: 2, width: 6, height: 6, borderTopWidth: 2, borderRightWidth: 2, borderColor: color, transform: [{ rotate: '45deg' }] }} />
  </View>);
}