import { api } from '../../providers/axiosClient';

const API_BASE_URL = String(api.defaults.baseURL || '').replace(/\/$/, '');

// Adicionais padrão usados quando o backend não retorna ingredientes vinculados
// ao produto (endpoint /ingredientes/por-produto/{id} - ver README-TELAS.md).
export const PERSONALIZACOES_PADRAO = ['Café espresso', 'Açúcar', 'Gelo', 'Chantilly'];

export async function buscarProdutosAgrupados(signal) {
  const resposta = await api.get('/produtos/agrupados', { signal });
  return resposta.data || {};
}

export async function buscarProdutoPorId(id, signal) {
  const resposta = await api.get(`/produtos/${id}`, { signal });
  return resposta.data;
}

// O backend expõe GET /ingredientes/por-produto/{produtoId}, mas o parâmetro está
// mapeado como @RequestParam numa rota com {produtoId} no path (não @PathVariable),
// então o valor do path provavelmente não é vinculado corretamente pelo Spring.
// Por isso aqui sempre mandamos os dois formatos (path e query) e, se ainda assim
// falhar ou vier vazio, caímos no fallback de PERSONALIZACOES_PADRAO.
export async function buscarPersonalizacoesPorProduto(produtoId, signal) {
  try {
    const resposta = await api.get(`/ingredientes/por-produto/${produtoId}`, {
      params: { produtoId },
      signal,
    });
    const dados = resposta.data;
    const nomes = Array.from(new Set((dados || []).map((item) => item.nome).filter(Boolean)));
    return nomes.length > 0 ? nomes : PERSONALIZACOES_PADRAO;
  } catch (erro) {
    if (erro?.code === 'ERR_CANCELED') throw erro;
    return PERSONALIZACOES_PADRAO;
  }
}

// Cria o pedido no backend. ATENÇÃO: hoje POST /pedidos exige funcionario.id e
// infoAdicional.id já existentes no banco (ver README-TELAS.md) — não há como
// obter esses dois valores a partir de um fluxo de cardápio/self-checkout.
// Mantemos a chamada real (sem mockar) para deixar a integração explícita: se o
// backend não tiver esses dados disponíveis, o erro retornado é exibido ao usuário.
export async function criarPedido({ nome, itens }) {
  const funcionarioId = localStorage.getItem('funcionarioId');

  const payload = {
    nome,
    itens: itens.map((item) => ({
      produtoId: item.produtoId,
      quantidade: item.quantidade,
    })),
    funcionario: funcionarioId ? { id: Number(funcionarioId) } : null,
    infoAdicional: null,
  };

  try {
    const resposta = await api.post('/pedidos', payload);
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
