import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView, StyleSheet, Platform, StatusBar, View, Text, TouchableOpacity } from 'react-native';
import { colors } from './src/theme';
import * as api from './src/utils/api';
import { loadSession, saveSession, clearSession } from './src/utils/auth';
import LoginScreen from './src/components/LoginScreen';
import HomeScreen from './src/components/HomeScreen';
import AlmacenScreen from './src/components/AlmacenScreen';
import FaltantesScreen from './src/components/FaltantesScreen';
import SalidasScreen from './src/components/SalidasScreen';
import StockScreen from './src/components/StockScreen';

if (Platform.OS === 'web' && typeof Node !== 'undefined') {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function (child) { if (child && child.parentNode !== this) return child; return originalRemoveChild.call(this, child); };
  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (newNode, refNode) { if (refNode && refNode.parentNode !== this) return this.appendChild(newNode); return originalInsertBefore.call(this, newNode, refNode); };
}

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) return (
      <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.bg }}>
        <Text style={{ fontSize: 18, fontWeight: '800', color: colors.rust, marginBottom: 10 }}>Ocurrió un error en la app</Text>
        <Text style={{ color: colors.steel, marginBottom: 16 }}>{String(this.state.error)}</Text>
        <TouchableOpacity onPress={() => this.setState({ error: null })} style={{ backgroundColor: colors.teal, padding: 12, borderRadius: 8 }}>
          <Text style={{ color: '#fff', fontWeight: '700', textAlign: 'center' }}>Volver a intentar</Text>
        </TouchableOpacity>
      </View>
    );
    return this.props.children;
  }
}

function migrate(p) {
  let deposit = p.deposit || p.branch || 'Baptista';
  if (deposit === 'Almacén Baptista' || deposit === 'Depósito Baptista') deposit = 'Baptista';
  if (deposit !== 'General' && !['Baptista', 'Tumusla', 'Nuevo Edificio -1'].includes(deposit)) deposit = 'Baptista';
  return { ...p, deposit, category: p.category === 'herramienta' ? 'herramienta' : 'material', cat: p.cat || (p.category === 'herramienta' ? 'Herramientas' : 'Materiales'), unit: p.unit || 'Pieza', qty: typeof p.qty === 'number' ? p.qty : (parseInt(p.qty, 10) || 0), required: typeof p.required === 'number' ? p.required : 0, price: p.price !== undefined ? p.price : 0, currency: p.currency === '$us' ? '$us' : 'Bs' };
}

function App() {
  const [session, setSession] = useState(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [screen, setScreen] = useState('home');
  const [products, setProducts] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { loadSession().then(s => { setSession(s); setSessionLoaded(true); }); }, []);

  useEffect(() => {
    (async () => {
      try {
        const list = (await api.getProducts()).map(migrate);
        const foto = {};
        list.forEach(p => { const up = (p.name || '').trim().toUpperCase(); if (p.photo && !foto[up]) foto[up] = p.photo; });
        list.forEach(p => { const up = (p.name || '').trim().toUpperCase(); if (!p.photo && foto[up]) p.photo = foto[up]; });
        setProducts(list);
      } catch (e) {}
      setLoaded(true);
    })();
  }, []);

  // ✅ HISTORIAL: cada carga = registro NUEVO con su fecha (nunca fusiona ni resta)
  const addProduct = useCallback((prod) => {
    const p = { ...prod, id: 'p' + Date.now() + Math.random().toString(36).slice(2, 8), createdAt: new Date().toISOString() };
    api.createProduct(p).catch(() => {});
    setProducts(prev => [p, ...prev]);
    // ✅ Si repones stock de un material que estaba en faltantes, limpia el aviso solo
    if ((p.qty || 0) > 0) {
      const up = (p.name || '').trim().toUpperCase();
      products.forEach(x => {
        if ((x.name || '').trim().toUpperCase() === up && x.faltante === true && (x.qty || 0) === 0) {
          api.updateProduct(x.id, { faltante: false, required: 0 }).catch(() => {});
          setProducts(prev => prev.map(y => y.id === x.id ? { ...y, faltante: false, required: 0 } : y));
        }
      });
    }
  }, [products]);

  const renameProduct = useCallback((id, name) => { api.updateProduct(id, { name }); setProducts(prev => prev.map(p => p.id === id ? { ...p, name } : p)); }, []);
  const changeQty = useCallback((id, d) => {
    const p = products.find(x => x.id === id); if (!p) return;
    const qty = Math.max(0, (p.qty || 0) + d);
    api.updateProduct(id, { qty });
    setProducts(prev => prev.map(x => x.id === id ? { ...x, qty } : x));
  }, [products]);
  const setQty = useCallback((id, v) => { const qty = Math.max(0, v); api.updateProduct(id, { qty }); setProducts(prev => prev.map(x => x.id === id ? { ...x, qty } : x)); }, []);
  const changePhoto = useCallback((id, uri) => {
    const prod = products.find(p => p.id === id); if (!prod) return;
    const up = (prod.name || '').trim().toUpperCase();
    api.updateProduct(id, { photo: uri });
    api.upsertCatalog({ name: prod.name, photo: uri });
    setProducts(prev => prev.map(p => (p.id === id || (p.name || '').trim().toUpperCase() === up) ? { ...p, photo: uri } : p));
  }, [products]);
  const deleteProduct = useCallback((id) => { api.deleteProduct(id); setProducts(prev => prev.filter(p => p.id !== id)); }, []);
  const updatePrice = useCallback((id, price, currency) => { api.updateProduct(id, { price, currency }); setProducts(prev => prev.map(p => p.id === id ? { ...p, price, currency } : p)); }, []);

  // ✅✅✅ ÚNICO lugar donde se RESTA stock: Salidas
  const withdraw = useCallback((id, amount) => {
    setProducts(prev => {
      const p = prev.find(x => x.id === id);
      if (!p) return prev;
      const qty = Math.max(0, (p.qty || 0) - amount);
      const patch = { qty };
      if (qty === 0) {
        // ✅ Si el material quedó en 0 en TODOS sus lotes → salta SOLO a Inventario Faltante
        const up = (p.name || '').trim().toUpperCase();
        const resto = prev.reduce((s, x) => s + ((x.name || '').trim().toUpperCase() === up && x.id !== id ? (x.qty || 0) : 0), 0);
        if (resto === 0) { patch.faltante = true; patch.required = Math.max(1, amount || 1); }
      }
      api.updateProduct(id, patch).catch(() => {});
      return prev.map(x => (x.id === id ? { ...x, ...patch } : x));
    });
  }, []);

  const markFaltante = useCallback((id, req) => { const required = Math.max(1, parseInt(req, 10) || 1); api.updateProduct(id, { faltante: true, required }); setProducts(prev => prev.map(p => p.id === id ? { ...p, faltante: true, required } : p)); }, []);
  const unmarkFaltante = useCallback((id) => { api.updateProduct(id, { faltante: false, required: 0 }); setProducts(prev => prev.map(p => p.id === id ? { ...p, faltante: false, required: 0 } : p)); }, []);

  function handleLogin(s) { setSession(s); saveSession(s); setScreen('home'); }
  function handleLogout() { clearSession(); setSession(null); setScreen('home'); }

  if (!sessionLoaded) return null;
  if (!session) return <LoginScreen onLogin={handleLogin} />;
  const show = (name) => ({ flex: 1, display: screen === name ? 'flex' : 'none' });
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.teal} />
      <View style={show('home')}><HomeScreen products={products} onNavigate={setScreen} session={session} onLogout={handleLogout} /></View>
      <View style={show('almacen')}><AlmacenScreen products={products} onBack={() => setScreen('home')} onAdd={addProduct} onRename={renameProduct} onChangeQty={changeQty} onSetQty={setQty} onChangePhoto={changePhoto} onDelete={deleteProduct} /></View>
      <View style={show('faltantes')}><FaltantesScreen products={products} onBack={() => setScreen('home')} onAdd={addProduct} onDelete={deleteProduct} onUpdatePrice={updatePrice} onUnmark={unmarkFaltante} /></View>
      <View style={show('salidas')}><SalidasScreen products={products} onBack={() => setScreen('home')} onWithdraw={withdraw} /></View>
      <View style={show('stock')}><StockScreen products={products} onBack={() => setScreen('home')} onMarkFaltante={markFaltante} /></View>
    </SafeAreaView>
  );
}

export default function Root() { return <ErrorBoundary><App /></ErrorBoundary>; }
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.bg, paddingTop: Platform.OS === 'android' ? 24 : 0 } });