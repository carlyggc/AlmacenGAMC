import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { colors, DEPOSITOS } from '../theme';
import { ui } from '../styles';
import { IconEdificio } from './BoxIcon';

export default function DepositosScreen({ products, onBack, onSelect }) {
  const contarEn = (nombre) => products.filter(p => p.branch === nombre).length;
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={[ui.header, ui.headerTeal, { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 22, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }]}>
        <TouchableOpacity onPress={onBack}><Text style={ui.back}>← Volver</Text></TouchableOpacity>
        <Text style={ui.title}>REGISTRO DE DEPÓSITO</Text>
        <Text style={ui.sub}>SELECCIONA UN DEPÓSITO</Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingVertical: 20, paddingBottom: 40 }}>
        <View style={ui.bigRow}>
          {DEPOSITOS.map(dep => (
            <TouchableOpacity key={dep} style={ui.bigCard} onPress={() => onSelect(dep)} activeOpacity={0.85}>
              <View style={ui.bigCardTop}>
                <View style={st.hole} />
                <View style={[ui.bigBadge, { backgroundColor: colors.teal }]}>
                  <Text style={ui.bigBadgeText}>{contarEn(dep)}</Text>
                </View>
                <IconEdificio />
              </View>
              <View style={ui.bigCardBody}>
                <Text style={ui.bigCardTitle}>{dep}</Text>
                <Text style={ui.bigCardDesc}>Toca para gestionar materiales de este depósito.</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  hole: { position: 'absolute', top: 10, left: 10, width: 12, height: 12, borderRadius: 6, backgroundColor: colors.bg, borderWidth: 2, borderColor: colors.ink },
});