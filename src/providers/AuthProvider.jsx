import { createContext, useContext, useMemo, useState } from 'react';
import { getUsuarioAtual, setUsuarioAtual, limparUsuarioAtual } from '../utils/userSession.js';

const AuthContext = createContext(null);

function parseGerente(valor) {
  if (typeof valor === 'boolean') return valor;
  if (typeof valor === 'string') {
    const normalizado = valor.trim().toLowerCase();
    return normalizado === 'true' || normalizado === '1' || normalizado === 'sim';
  }
  if (typeof valor === 'number') return valor === 1;
  return false;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [usuario, setUsuario] = useState(() => getUsuarioAtual());

  const isGerente = useMemo(
    () => parseGerente(usuario?.gerente ?? usuario?.isGerente ?? localStorage.getItem('gerente')),
    [usuario]
  );

  function login({ token: novoToken, user = {}, gerente = user?.gerente ?? user?.isGerente ?? false }) {
    const usuarioNormalizado = {
      ...user,
      gerente: parseGerente(gerente),
    };

    const tokenFinal = novoToken ?? token ?? null;

    setToken(tokenFinal);
    setUsuario(usuarioNormalizado);

    if (tokenFinal) {
      localStorage.setItem('token', tokenFinal);
    } else {
      localStorage.removeItem('token');
    }

    setUsuarioAtual(usuarioNormalizado);
  }

  function logout() {
    setToken(null);
    setUsuario({});
    limparUsuarioAtual();
  }

  const valor = useMemo(
    () => ({
      token,
      usuario,
      isAuthenticated: Boolean(token),
      isGerente,
      login,
      logout,
    }),
    [token, usuario, isGerente]
  );

//   console.log(isGerente)
//   console.log(usuario)

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return contexto;
}
