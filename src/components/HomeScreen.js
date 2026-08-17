import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { colors, radius } from '../theme';
import { IconCaja, IconAlerta, IconSalida, IconStock, IconUsuario, IconSalir } from './BoxIcon';

export default function HomeScreen({ products, onNavigate, session, onLogout }) {
  const isAdmin = session && session.rol === 'admin';
  const totales = products.length;
  const conStock = products.filter(p => p.qty > 0).length;
  const faltantes = products.filter(p => p.qty === 0).length;

  const Card = ({ onPress, icon, title, desc, badge, badgeColor }) => (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardTop}>
        {badge !== undefined && <View style={[styles.badge, { backgroundColor: badgeColor }]}><Text style={styles.badgeText}>{badge}</Text></View>}
        {icon}
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDesc}>{desc}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>COCHA DEPÓSITO</Text>
        <Text style={styles.subtitle}>CONTROL DE INVENTARIO</Text>
        <View style={styles.userRow}>
          <View style={styles.userChip}>
            <IconUsuario color={colors.white} />
            <Text style={styles.userName}>{session.nombre} · {isAdmin ? 'Administrador' : 'Visitante'}</Text>
          </View>
          <TouchableOpacity onPress={onLogout}>
            <View style={styles.logoutBtn}>
              <IconSalir color={colors.white} />
              <Text style={styles.logoutText}>Salir</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.sectionLabel}>SELECCIONA UN MÓDULO</Text>
      <View style={styles.row}>
        {isAdmin && (
          <Card onPress={() => onNavigate('almacen')} icon={<IconCaja />} title="Registro de Depósito" desc="Gestiona materiales y herramientas por depósito." badge={totales} badgeColor={colors.purple} />
        )}
        <Card onPress={() => onNavigate('faltantes')} icon={<IconAlerta />} title="Inventario Faltante" desc="Registra lo que falta con costo en Bs o $us." badge={faltantes} badgeColor={colors.rust} />
        <Card onPress={() => onNavigate('stock')} icon={<IconStock />} title="Productos en Stock" desc="Consulta lo disponible por depósito." badge={conStock} badgeColor={colors.teal} />
      </View>
      <View style={styles.row}>
        <Card onPress={() => onNavigate('salidas')} icon={<IconSalida />} title="Salida de Materiales" desc="Retira materiales y descuenta el stock." />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 40 },
  header: { backgroundColor: colors.teal, paddingHorizontal: 20, paddingTop: 26, paddingBottom: 18, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  title: { fontSize: 26, fontWeight: '800', color: colors.white },
  subtitle: { fontSize: 10, color: colors.white, opacity: 0.9, letterSpacing: 1, marginTop: 4 },
  userRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
  userChip: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12 },
  userName: { color: colors.white, fontWeight: '700', fontSize: 12 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: colors.white, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12 },
  logoutText: { color: colors.white, fontWeight: '700', fontSize: 11, textTransform: 'uppercase' },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: colors.steel, letterSpacing: 1, marginHorizontal: 16, marginTop: 18, marginBottom: 8, textAlign: 'center' },
  row: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', paddingHorizontal: 12 },
  card: { width: '44%', minWidth: 160, maxWidth: 280, margin: 8, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.purple, borderRadius: radius.md, overflow: 'hidden' },
  cardTop: { height: 100, backgroundColor: colors.hole, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 2, borderBottomColor: colors.purple, borderStyle: 'dashed' },
  badge: { position: 'absolute', top: 8, right: 8, borderRadius: 4, paddingVertical: 3, paddingHorizontal: 8 },
  badgeText: { color: colors.white, fontSize: 10, fontWeight: '800' },
  cardBody: { padding: 12, alignItems: 'center' },
  cardTitle: { fontSize: 14, fontWeight: '800', color: colors.ink, textAlign: 'center' },
  cardDesc: { fontSize: 11, color: colors.steel, textAlign: 'center', marginTop: 6 },
});