import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { IconReporte } from './BoxIcon';

export default function ReportButton({ onPress, tint = colors.tealDark }) {
  return (
    <TouchableOpacity style={st.btn} onPress={onPress}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <IconReporte color={tint} />
        <Text style={[st.text, { color: tint }]}>Reporte</Text>
      </View>
    </TouchableOpacity>
  );
}

const st = StyleSheet.create({
  btn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, backgroundColor: colors.white },
  text: { fontWeight: '800', fontSize: 11 },
});