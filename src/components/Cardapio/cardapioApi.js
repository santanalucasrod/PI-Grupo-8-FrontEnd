import { api } from '../../providers/axiosClient';
import { authHeader } from '../../utils/authHeader';

const API_BASE_URL = String(api.defaults.baseURL || '').replace(/\/$/, '');

// Adicionais padrão usados quando o backend não retorna ingredientes vinculados
// ao produto (endpoint /ingredientes/por-produto/{id} - ver README-TELAS.md).
export const PERSONALIZACOES_PADRAO = [
  { id: null, nome: 'Café espresso' },
  { id: null, nome: 'Açúcar' },
  { id: null, nome: 'Gelo' },
  { id: null, nome: 'Chantilly' },
];

export async function buscarProdutosAgrupados(signal) {
  const resposta = await api.get('/produtos/agrupados', { signal, headers: authHeader() });
  return resposta.data || {};
}

export async function buscarProdutoPorId(id, signal) {
  const resposta = await api.get(`/produtos/${id}`, { signal, headers: authHeader() });
  return resposta.data;
}

// Busca os ingredientes vinculados ao produto (GET /produtos/{produtoId}/ingredientes).
// Se vier vazio ou a chamada falhar, caímos no fallback de PERSONALIZACOES_PADRAO.
export async function buscarPersonalizacoesPorProduto(produtoId, signal) {
  try {
    const resposta = await api.get(`/produtos/${produtoId}/ingredientes`, {
      signal,
      headers: authHeader(),
    });
    const dados = resposta.data;
    const vistos = new Set();
    const itens = (dados || [])
      .filter((item) => item?.nome && !vistos.has(item.nome) && vistos.add(item.nome))
      .map((item) => ({ id: item.id ?? null, nome: item.nome }));
    return itens.length > 0 ? itens : PERSONALIZACOES_PADRAO;
  } catch (erro) {
    if (erro?.code === 'ERR_CANCELED') throw erro;
    return PERSONALIZACOES_PADRAO;
  }
}

// Cria o pedido no backend no formato { nomeCliente, funcionarioId, itens: [{ produtoId, quantidade, personalizacaoIds }] }.
// ATENÇÃO: o backend exige um funcionarioId válido já existente no banco; hoje ele
// vem do localStorage ('funcionarioId'), que precisa estar preenchido em algum ponto
// do fluxo (login do funcionário/atendente que está lançando o pedido).
export async function criarPedido({ nome, funcionarioId, itens }) {
  const funcionarioIdResolvido = funcionarioId ?? localStorage.getItem('funcionarioId');

  // Sem funcionarioId o backend rejeita o pedido (403/400). Falha aqui, com uma
  // mensagem clara, em vez de mandar null e deixar a pessoa sem saber o motivo.
  if (funcionarioIdResolvido == null) {
    throw new Error('Não foi possível identificar o funcionário logado. Faça login novamente.');
  }

  const payload = {
    nomeCliente: nome,
    funcionarioId: funcionarioIdResolvido != null ? Number(funcionarioIdResolvido) : null,
    itens: itens.map((item) => ({
      produtoId: item.produtoId,
      quantidade: item.quantidade,
      personalizacaoIds: (item.personalizacoes || [])
        .map((personalizacao) => personalizacao.id)
        .filter((id) => id != null),
    })),
  };

  try {
    const resposta = await api.post('/pedidos', payload, { headers: authHeader() });
    return resposta.data;
  } catch (erro) {
    const detalhe = erro?.response?.data;
    const mensagem =
      typeof detalhe === 'string'
        ? detalhe
        : detalhe?.message || detalhe?.error || erro?.message;
    throw new Error(mensagem || 'Não foi possível criar o pedido.');
  }
}

export { API_BASE_URL };
