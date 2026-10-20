import { api } from '../../providers/axiosClient';
import { authHeader } from '../../utils/authHeader';

// Compartilha inclusive requisições em andamento entre cards, modais e edição.
// Só guarda blobs em memória; URLs assinadas e credenciais não são persistidas.
const cache = new Map();
const VALIDADE = 5 * 60 * 1000;
const VALIDADE_FALHA = 60 * 1000;
let autorizacaoAtual;

export async function carregarImagemProduto(produtoId, pathFt) {
  const id = Number(produtoId);
  if (!Number.isSafeInteger(id) || id <= 0 || !String(pathFt || '').trim()) return null;

  const headers = authHeader();
  if (autorizacaoAtual !== headers.Authorization) {
    cache.clear();
    autorizacaoAtual = headers.Authorization;
  }

  const chave = JSON.stringify([id, pathFt]);
  const agora = Date.now();
  for (const [chaveAntiga, entrada] of cache) {
    if (entrada.expira <= agora) cache.delete(chaveAntiga);
  }
  if (cache.has(chave)) return cache.get(chave).promessa;

  const entrada = { expira: Infinity };
  entrada.promessa = api.get(`/produtos/${id}/imagem`, {
    headers,
    responseType: 'blob',
    timeout: 15000,
  }).then(({ data }) => {
    // GET retorna 302 para o S3; o navegador segue o redirecionamento.
    if (!(data instanceof Blob) || !data.type.startsWith('image/')) {
      throw new Error('Resposta de imagem inválida.');
    }
    entrada.expira = Date.now() + VALIDADE;
    return data;
  }).catch(() => {
    // Inclui 404, falhas de rede e CORS: sem ciclos automáticos de tentativa.
    entrada.expira = Date.now() + VALIDADE_FALHA;
    return null;
  });
  cache.set(chave, entrada);
  return entrada.promessa;
}

export async function enviarImagemProduto(produtoId, arquivo) {
  const formData = new FormData();
  formData.append('arquivo', arquivo);
  const resposta = await api.post(`/produtos/${produtoId}/imagem`, formData, {
    headers: authHeader(),
  });
  cache.clear();
  return resposta.data;
}
