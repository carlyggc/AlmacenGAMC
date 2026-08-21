import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { colors, radius } from '../theme';
import * as api from '../utils/api';

export default function LoginScreen({ onLogin }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false); // ✅ nuevo: mostrar/ocultar
  const [loading, setLoading] = useState(false);

  async function handleAdmin() {
    if (loading) return;
    setLoading(true);
    try {
      const r = await api.login(user.trim(), pass);
      onLogin({ nombre: r.nombre || user.trim(), rol: r.rol || 'admin' });
    } catch (e) {
      Alert.alert('No se pudo ingresar', 'Verifica:\n• Usuario "admin" y contraseña "almacen2026".\n• Que el servidor esté en línea (nube o tu PC).');
    } finally {
      setLoading(false);
    }
  }

  function handleVisitante() {
    onLogin({ nombre: 'Visitante', rol: 'visitante' });
  }

  return (
    <View style={st.wrap}>
      <View style={st.card}>
        <Text style={st.icon}>👤</Text>
        <Text style={st.title}>INICIAR SESIÓN</Text>

        <Text style={st.label}>USUARIO</Text>
        <TextInput style={st.input} value={user} onChangeText={setUser} placeholder="admin" placeholderTextColor={colors.steel} autoCapitalize="none" />

        <Text style={st.label}>CONTRASEÑA</Text>
        <View style={st.passRow}>
          <TextInput style={st.passInput} value={pass} onChangeText={setPass} placeholder="Escribe tu contraseña" placeholderTextColor={colors.steel} secureTextEntry={!showPass} />
          <TouchableOpacity style={st.eye} onPress={() => setShowPass(s => !s)}>
            <Text style={st.eyeText}>{showPass ? '🙈' : '👁'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={st.btnOk} onPress={handleAdmin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={st.btnOkText}>INGRESAR COMO ADMINISTRADOR</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={st.btnVisit} onPress={handleVisitante}>
          <Text style={st.btnVisitText}>ENTRAR COMO VISITANTE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.hole, alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 460, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.ink, borderRadius: radius.md, padding: 24 },
  icon: { fontSize: 34, textAlign: 'center', marginBottom: 6 },
  title: { color: colors.teal, fontWeight: '800', fontSize: 16, letterSpacing: 1, textAlign: 'center', marginBottom: 18 },
  label: { color: colors.steel, fontWeight: '800', fontSize: 11, letterSpacing: 1, marginBottom: 6 },
  input: { borderWidth: 2, borderColor: colors.ink, borderRadius: radius.sm, padding: 12, fontSize: 14, color: colors.ink, backgroundColor: colors.surface, marginBottom: 14 },
  passRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: colors.ink, borderRadius: radius.sm, backgroundColor: colors.surface, marginBottom: 18 },
  passInput: { flex: 1, padding: 12, fontSize: 14, color: colors.ink },
  eye: { paddingHorizontal: 12, paddingVertical: 10 },
  eyeText: { fontSize: 16 },
  btnOk: { backgroundColor: colors.teal, borderRadius: radius.sm, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
  btnOkText: { color: '#fff', fontWeight: '800', letterSpacing: 1, fontSize: 13 },
  btnVisit: { backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.ink, borderRadius: radius.sm, paddingVertical: 12, alignItems: 'center' },
  btnVisitText: { color: colors.steel, fontWeight: '800', letterSpacing: 1, fontSize: 12 },
});