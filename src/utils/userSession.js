const STORAGE_KEYS = {
  usuario: 'usuario',
  token: 'token',
  gerente: 'gerente',
  funcionarioId: 'funcionarioId',
};

function parseJson(valor) {
  if (!valor) return null;

  try {
    return JSON.parse(valor);
  } catch {
    return null;
  }
}

export function getUsuarioAtual() {
  return parseJson(localStorage.getItem(STORAGE_KEYS.usuario)) ?? {};
}

export function getUsuarioInfo() {
  const usuario = getUsuarioAtual();
  const idDoStorage = Number(localStorage.getItem(STORAGE_KEYS.funcionarioId));
  const idUsuario = usuario.id ?? usuario.funcionarioId ?? idDoStorage;

  return {
    id: Number.isFinite(idUsuario) && idUsuario !== 0 ? idUsuario : null,
    nome: usuario.nome ?? usuario.name ?? '',
    email: usuario.email ?? '',
    gerente: typeof usuario.gerente === 'boolean'
      ? usuario.gerente
      : String(usuario.gerente ?? localStorage.getItem(STORAGE_KEYS.gerente) ?? 'false').toLowerCase() === 'true',
    token: localStorage.getItem(STORAGE_KEYS.token) ?? '',
    ...usuario,
  };
}

export function setUsuarioAtual(usuario) {
  if (!usuario) {
    localStorage.removeItem(STORAGE_KEYS.usuario);
    return;
  }

  const dados = {
    ...usuario,
    gerente: Boolean(usuario.gerente),
  };

  localStorage.setItem(STORAGE_KEYS.usuario, JSON.stringify(dados));
  localStorage.setItem(STORAGE_KEYS.gerente, String(Boolean(dados.gerente)));

  if (usuario.id != null) {
    localStorage.setItem(STORAGE_KEYS.funcionarioId, String(usuario.id));
  }
}

export function limparUsuarioAtual() {
  localStorage.removeItem(STORAGE_KEYS.usuario);
  localStorage.removeItem(STORAGE_KEYS.gerente);
  localStorage.removeItem(STORAGE_KEYS.funcionarioId);
  localStorage.removeItem(STORAGE_KEYS.token);
}

export { STORAGE_KEYS };
