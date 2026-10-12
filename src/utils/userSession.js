const STORAGE_KEYS = {
  usuario: 'usuario',
  token: 'token',
  gerente: 'gerente',
  funcionarioId: 'funcionarioId',
  emailUsuario: 'emailUsuario',
  nomeUsuario: 'nomeUsuario',
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
  const idNumerico = [
    usuario.id,
    usuario.ID_USUARIO,
    usuario.funcionarioId,
    localStorage.getItem(STORAGE_KEYS.funcionarioId),
    localStorage.getItem('ID_USUARIO'),
  ]
    .map(Number)
    .find((id) => Number.isFinite(id) && id !== 0);

  return {
    ...usuario,
    id: idNumerico ?? null,
    nome: usuario.nome ?? localStorage.getItem(STORAGE_KEYS.nomeUsuario) ?? '',
    email: usuario.email ?? localStorage.getItem(STORAGE_KEYS.emailUsuario) ?? '',
    gerente: typeof usuario.gerente === 'boolean'
      ? usuario.gerente
      : String(usuario.gerente ?? localStorage.getItem(STORAGE_KEYS.gerente) ?? 'false').toLowerCase() === 'true',
    token: localStorage.getItem(STORAGE_KEYS.token) ?? '',
  };
}

export function setUsuarioAtual(usuario) {
  if (!usuario) {
    localStorage.removeItem(STORAGE_KEYS.usuario);
    return;
  }

  const id = usuario.id ?? usuario.ID_USUARIO ?? usuario.funcionarioId;
  const nome = usuario.nome ?? usuario.NOME_USUARIO ?? usuario.name ?? '';
  const email = usuario.email ?? usuario.EMAIL_USUARIO ?? '';
  const dados = {
    ...usuario,
    id,
    nome,
    email,
    gerente: Boolean(usuario.gerente),
  };

  localStorage.setItem(STORAGE_KEYS.usuario, JSON.stringify(dados));
  localStorage.setItem(STORAGE_KEYS.gerente, String(Boolean(dados.gerente)));
  localStorage.setItem(STORAGE_KEYS.nomeUsuario, nome);
  localStorage.setItem(STORAGE_KEYS.emailUsuario, email);
  localStorage.removeItem('EMAIL_USUARIO');
  localStorage.removeItem('ID_USUARIO');
  localStorage.removeItem('NOME_USUARIO');

  if (id != null && id !== '') {
    localStorage.setItem(STORAGE_KEYS.funcionarioId, String(id));
  } else {
    localStorage.removeItem(STORAGE_KEYS.funcionarioId);
  }
}

export function limparUsuarioAtual() {
  localStorage.removeItem(STORAGE_KEYS.usuario);
  localStorage.removeItem(STORAGE_KEYS.gerente);
  localStorage.removeItem(STORAGE_KEYS.funcionarioId);
  localStorage.removeItem(STORAGE_KEYS.emailUsuario);
  localStorage.removeItem(STORAGE_KEYS.nomeUsuario);
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem('EMAIL_USUARIO');
  localStorage.removeItem('ID_USUARIO');
  localStorage.removeItem('NOME_USUARIO');
}

export { STORAGE_KEYS };
