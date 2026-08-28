// Cabecalho Authorization com o token salvo no login (localStorage),
// para usar em toda chamada que exige o usuario autenticado.
export function authHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}
