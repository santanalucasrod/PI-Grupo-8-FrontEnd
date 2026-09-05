import { api } from '../../providers/axiosClient';
import { authHeader } from '../../utils/authHeader';

export const API_BASE_URL = String(api.defaults.baseURL || '').replace(/\/$/, '');

function configuracao(signal, configuracaoExtra = {}) {
  return {
    ...configuracaoExtra,
    signal,
    headers: {
      ...authHeader(),
      ...configuracaoExtra.headers,
    },
  };
}

function inteiroPositivo(valor) {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero > 0 ? numero : null;
}

export async function buscarProdutosAgrupados(signal) {
  const resposta = await api.get('/produtos/agrupados', configuracao(signal));
  return resposta.data && typeof resposta.data === 'object' ? resposta.data : {};
}

export async function buscarIngredientesPorProduto(id, signal) {
  const produtoId = inteiroPositivo(id);
  if (!produtoId) throw new Error('Produto inválido.');

  try {
    const resposta = await api.get(
      `/ingredientes/por-produto/${produtoId}`,
      configuracao(signal, { params: { produtoId } })
    );

    const vistos = new Set();
    return (Array.isArray(resposta.data) ? resposta.data : [])
      .filter((item) => inteiroPositivo(item?.id) && String(item?.nome || '').trim())
      .filter((item) => {
        const chave = String(item.nome).trim().toLocaleLowerCase('pt-BR');
        if (vistos.has(chave)) return false;
        vistos.add(chave);
        return true;
      })
      .map((item) => ({ id: Number(item.id), nome: String(item.nome).trim() }));
  } catch (erro) {
    if (erro?.code === 'ERR_CANCELED') throw erro;
    if (erro?.response?.status === 404 || erro?.response?.status === 204) return [];
    throw erro;
  }
}

export function resolverImagemProduto(pathFt) {
  const caminho = String(pathFt || '').trim();
  if (!caminho) return null;
  if (/^https?:\/\//i.test(caminho)) return caminho;
  return `${API_BASE_URL}/imagens/${caminho.replace(/^\/+/, '')}`;
}

export async function criarPedido({ nome, funcionarioId, infoAdicionalId, itens }) {
  const funcionarioIdResolvido = inteiroPositivo(
    funcionarioId ?? localStorage.getItem('funcionarioId')
  );
  const infoAdicionalIdResolvido = inteiroPositivo(infoAdicionalId);

  if (!funcionarioIdResolvido) {
    throw new Error(
      'Não foi possível identificar o funcionário logado. Faça login novamente.'
    );
  }

  if (!infoAdicionalIdResolvido) {
    throw new Error(
      'A API exige uma informação adicional já cadastrada para concluir o pedido.'
    );
  }

  const payload = {
    nome: String(nome || '').trim(),
    funcionario: { id: funcionarioIdResolvido },
    infoAdicional: { id: infoAdicionalIdResolvido },
    itens: itens.map((item) => ({
      produtoId: inteiroPositivo(item.produtoId),
      quantidade: inteiroPositivo(item.quantidade),
    })),
  };

  const resposta = await api.post('/pedidos', payload, configuracao());
  return resposta.data;
}
