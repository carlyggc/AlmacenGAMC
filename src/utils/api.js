export const API_URL = 'http://localhost:3001/api'; // ← tu servidor
async function req(path, method = 'GET', body) {
  const r = await fetch(API_URL + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error('API ' + r.status);
  return r.json();
}
export const getProducts = () => req('/productos');
export const createProduct = (p) => req('/productos', 'POST', p);
export const updateProduct = (id, c) => req('/productos/' + encodeURIComponent(id), 'PUT', c);
export const deleteProduct = (id) => req('/productos/' + encodeURIComponent(id), 'DELETE');
export const getCatalog = () => req('/catalogo');
export const upsertCatalog = (c) => req('/catalogo', 'POST', c);
export const getUnits = () => req('/unidades');
export const createUnit = (name) => req('/unidades', 'POST', { name });
export const getPersonas = () => req('/personas');
export const createPersona = (name) => req('/personas', 'POST', { name });
export const importPersonas = (names) => req('/personas/importar', 'POST', { names });
export const getSalidas = () => req('/salidas');
export const createSalida = (s) => req('/salidas', 'POST', s);
export const getCategorias = () => req('/categorias');                                              // ✅ nuevo
export const createCategoria = (name, color) => req('/categorias', 'POST', { name, color });        // ✅ nuevo