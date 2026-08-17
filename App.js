import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView, StyleSheet, Platform, StatusBar, View, Text, TouchableOpacity } from 'react-native';
import { colors } from './src/theme';
import { loadProducts, saveProducts, loadCatalog, saveCatalog } from './src/utils/storage';
import { loadSession, saveSession, clearSession } from './src/utils/auth';
import LoginScreen from './src/components/LoginScreen';
import HomeScreen from './src/components/HomeScreen';
import AlmacenScreen from './src/components/AlmacenScreen';
import FaltantesScreen from './src/components/FaltantesScreen';
import SalidasScreen from './src/components/SalidasScreen';
import StockScreen from './src/components/StockScreen';

if (Platform.OS === 'web' && typeof Node !== 'undefined') {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function (child) {
    if (child && child.parentNode !== this) return child;
    return originalRemoveChild.call(this, child);
  };
  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (newNode, refNode) {
    if (refNode && refNode.parentNode !== this) return this.appendChild(newNode);
    return originalInsertBefore.call(this, newNode, refNode);
  };
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
  return {
    ...p, deposit,
    category: p.category === 'herramienta' ? 'herramienta' : 'material',
    cat: p.cat || (p.category === 'herramienta' ? 'Herramientas' : 'Materiales'),
    unit: p.unit || 'Pieza',
    qty: typeof p.qty === 'number' ? p.qty : (parseInt(p.qty, 10) || 0),
    required: typeof p.required === 'number' ? p.required : 0,
    price: p.price !== undefined ? p.price : 0,
    currency: p.currency === '$us' ? '$us' : 'Bs',
  };
}
const keyOf = (p) => (p.name || '').trim().toUpperCase() + '|' + (p.deposit || '');
const nameKey = (p) => (p.name || '').trim().toUpperCase();

function App() {
  const [session, setSession] = useState(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [screen, setScreen] = useState('home');
  const [products, setProducts] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { loadSession().then(s => { setSession(s); setSessionLoaded(true); }); }, []);

  useEffect(() => {
    (async () => {
      const data = await loadProducts();
      const merged = {};
      data.map(migrate).forEach(p => {
        const k = keyOf(p);
        if (merged[k]) {
          merged[k].qty += p.qty || 0;
          merged[k].required = (merged[k].required || 0) + (p.required || 0);
          merged[k].photo = merged[k].photo || p.photo;
          merged[k].price = merged[k].price || p.price;
          merged[k].unit = merged[k].unit || p.unit;
        } else merged[k] = { ...p };
      });
      const list = Object.values(merged);
      const photoByName = {};
      list.forEach(p => { const up = nameKey(p); if (p.photo && !photoByName[up]) photoByName[up] = p.photo; });
      list.forEach(p => { const up = nameKey(p); if (!p.photo && photoByName[up]) p.photo = photoByName[up]; });
      const catRaw = await loadCatalog();
      const validNames = new Set(list.map(p => nameKey(p)));
      const cat = catRaw.filter(c => validNames.has((c.name || '').trim().toUpperCase()));
      let changed = cat.length !== catRaw.length;
      list.forEach(p => {
        const up = nameKey(p);
        let ex = cat.find(c => (c.name || '').toUpperCase() === up);
        if (!ex) {
          ex = { name: p.name, unit: p.unit || 'Pieza', cat: p.category === 'herramienta' ? 'Herramientas' : 'Materiales', type: p.category, price: p.price || 0, photo: null };
          cat.push(ex); changed = true;
        }
        if (p.photo && !ex.photo) { ex.photo = p.photo; changed = true; }
      });
      if (changed) await saveCatalog(cat);
      setProducts(list);
      setLoaded(true);
    })();
  }, []);

  useEffect(() => { if (loaded) saveProducts(products); }, [products, loaded]);

  const addProduct = useCallback((prod) => {
    setProducts(prev => {
      const k = keyOf(prod);
      const existing = prev.find(p => keyOf(p) === k);
      if (existing) {
        return prev.map(p => p.id === existing.id ? {
          ...p,
          qty: (p.qty || 0) + (prod.qty || 0),
          required: (p.required || 0) + (prod.required || 0),
          unit: prod.unit || p.unit, category: prod.category || p.category,
          cat: prod.cat || p.cat, photo: prod.photo || p.photo,
          price: prod.price || p.price, currency: prod.currency || p.currency,
        } : p);
      }
      const p = { ...prod, id: 'p' + Date.now() + Math.random().toString(36).slice(2, 8), createdAt: new Date().toISOString() };
      if (!p.photo) {
        const up = (p.name || '').trim().toUpperCase();
        const conFoto = prev.find(x => (x.name || '').trim().toUpperCase() === up && x.photo);
        if (conFoto) p.photo = conFoto.photo;
      }
      return [p, ...prev];
    });
  }, []);
  const renameProduct = useCallback((id, name) => setProducts(prev => prev.map(p => p.id === id ? { ...p, name } : p)), []);
  const changeQty = useCallback((id, d) => setProducts(prev => prev.map(p => p.id === id ? { ...p, qty: Math.max(0, p.qty + d) } : p)), []);
  const setQty = useCallback((id, v) => setProducts(prev => prev.map(p => p.id === id ? { ...p, qty: Math.max(0, v) } : p)), []);
  const changePhoto = useCallback((id, uri) => {
    const prod = products.find(p => p.id === id);
    if (!prod) return;
    const up = nameKey(prod);
    setProducts(prev => prev.map(p => (p.id === id || nameKey(p) === up) ? { ...p, photo: uri } : p));
    (async () => {
      const cat = await loadCatalog();
      let ex = cat.find(c => (c.name || '').trim().toUpperCase() === up);
      if (!ex) {
        ex = { name: prod.name, unit: prod.unit || 'Pieza', cat: prod.cat || (prod.category === 'herramienta' ? 'Herramientas' : 'Materiales'), type: prod.category, price: prod.price || 0, photo: null };
        cat.push(ex);
      }
      ex.photo = uri;
      await saveCatalog(cat);
    })();
  }, [products]);
  const deleteProduct = useCallback((id) => setProducts(prev => prev.filter(p => p.id !== id)), []);
  const updatePrice = useCallback((id, price, currency) => setProducts(prev => prev.map(p => p.id === id ? { ...p, price, currency } : p)), []);
  const withdraw = useCallback((id, amount) => setProducts(prev => prev.map(p => p.id === id ? { ...p, qty: Math.max(0, p.qty - amount) } : p)), []);
  const markFaltante = useCallback((id, req) => setProducts(prev => prev.map(p => p.id === id ? { ...p, faltante: true, required: Math.max(1, parseInt(req, 10) || 1) } : p)), []);
  const unmarkFaltante = useCallback((id) => setProducts(prev => prev.map(p => p.id === id ? { ...p, faltante: false, required: 0 } : p)), []);

  function handleLogin(s) { setSession(s); saveSession(s); setScreen('home'); }
  function handleLogout() { clearSession(); setSession(null); setScreen('home'); }

  if (!sessionLoaded) return null;
  if (!session) return <LoginScreen onLogin={handleLogin} />;

  const show = (name) => ({ flex: 1, display: screen === name ? 'flex' : 'none' });
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.teal} />
      <View style={show('home')}>
        <HomeScreen products={products} onNavigate={setScreen} session={session} onLogout={handleLogout} />
      </View>
      <View style={show('almacen')}>
        <AlmacenScreen products={products} onBack={() => setScreen('home')} onAdd={addProduct} onRename={renameProduct} onChangeQty={changeQty} onSetQty={setQty} onChangePhoto={changePhoto} onDelete={deleteProduct} />
      </View>
      <View style={show('faltantes')}>
        <FaltantesScreen products={products} onBack={() => setScreen('home')} onAdd={addProduct} onDelete={deleteProduct} onUpdatePrice={updatePrice} onUnmark={unmarkFaltante} />
      </View>
      <View style={show('salidas')}>
        <SalidasScreen products={products} onBack={() => setScreen('home')} onWithdraw={withdraw} />
      </View>
      <View style={show('stock')}>
        <StockScreen products={products} onBack={() => setScreen('home')} onMarkFaltante={markFaltante} />
      </View>
    </SafeAreaView>
  );
}

export default function Root() {
  return <ErrorBoundary><App /></ErrorBoundary>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.bg, paddingTop: Platform.OS === 'android' ? 24 : 0 } });