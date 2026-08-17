import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius } from '../theme';
import { IconUsuario } from './BoxIcon';
import { checkLogin, visitante } from '../utils/auth';

export default function LoginScreen({ onLogin }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  function entrar() {
    const s = checkLogin(user, pass);
    if (!s) { setError('Usuario o contraseña incorrectos.'); return; }
    onLogin(s);
  }

  return (
    <View style={st.root}>
      <View style={st.header}>
        <Text style={st.title}>COCHA DEPÓSITO</Text>
        <Text style={st.sub}>CONTROL DE INVENTARIO</Text>
      </View>
      <View style={st.card}>
        <View style={st.iconWrap}><IconUsuario color={colors.teal} /></View>
        <Text style={st.cardTitle}>INICIAR SESIÓN</Text>
        <Text style={st.label}>Usuario</Text>
        <TextInput style={st.input} value={user} onChangeText={t => { setUser(t); setError(''); }}
          placeholder="admin" placeholderTextColor={colors.steel} autoCapitalize="none" />
        <Text style={st.label}>Contraseña</Text>
        <TextInput style={st.input} value={pass} onChangeText={t => { setPass(t); setError(''); }}
          placeholder="••••••••" placeholderTextColor={colors.steel} secureTextEntry onSubmitEditing={entrar} />
        {error ? <Text style={st.error}>{error}</Text> : null}
        <TouchableOpacity style={st.btnAdmin} onPress={entrar}>
          <Text style={st.btnAdminText}>Ingresar como Administrador</Text>
        </TouchableOpacity>
        <TouchableOpacity style={st.btnVisit} onPress={() => onLogin(visitante())}>
          <Text style={st.btnVisitText}>Entrar como Visitante</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.teal, paddingHorizontal: 20, paddingTop: 22, paddingBottom: 18, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  title: { fontSize: 24, fontWeight: '800', color: colors.white },
  sub: { fontSize: 10, color: colors.white, opacity: 0.9, letterSpacing: 1, marginTop: 4 },
  // ✅ Tarjeta centrada y de tamaño compacto
  card: {
    width: '92%', maxWidth: 420, alignSelf: 'center',
    marginVertical: 28,
    backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.ink,
    borderRadius: radius.lg, padding: 20,
  },
  iconWrap: { alignItems: 'center', marginBottom: 10, transform: [{ scale: 1.6 }] },
  cardTitle: { fontSize: 15, fontWeight: '800', color: colors.teal, textAlign: 'center', textTransform: 'uppercase', marginBottom: 14 },
  label: { fontSize: 10, fontWeight: '800', color: colors.steel, letterSpacing: 1, marginBottom: 5, textTransform: 'uppercase' },
  input: { borderWidth: 2, borderColor: colors.ink, borderRadius: radius.sm, paddingVertical: 9, paddingHorizontal: 12, fontSize: 13, color: colors.ink, backgroundColor: colors.surface, marginBottom: 10 },
  error: { color: colors.rust, fontSize: 11, fontWeight: '700', marginBottom: 8 },
  btnAdmin: { backgroundColor: colors.teal, borderWidth: 2, borderColor: colors.tealDark, borderRadius: radius.sm, paddingVertical: 11, alignItems: 'center', marginBottom: 8 },
  btnAdminText: { color: colors.white, fontWeight: '800', fontSize: 12, textTransform: 'uppercase' },
  btnVisit: { backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.steel, borderRadius: radius.sm, paddingVertical: 11, alignItems: 'center' },
  btnVisitText: { color: colors.steel, fontWeight: '700', fontSize: 12, textTransform: 'uppercase' },
});