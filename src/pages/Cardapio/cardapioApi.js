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
    const resposta = await api.get(`/produtos/${produtoId}/ingredientes`, configuracao(signal));

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

export async function buscarPersonalizacoesPorProduto(id, signal) {
  const produtoId = inteiroPositivo(id);
  if (!produtoId) throw new Error('Produto inválido.');

  const resposta = await api.get(
    `/produtos/${produtoId}/personalizacoes`,
    configuracao(signal)
  );

  const vistos = new Set();
  return (Array.isArray(resposta.data) ? resposta.data : [])
    .filter((item) => inteiroPositivo(item?.id) && String(item?.nome || '').trim())
    .filter((item) => {
      const idPersonalizacao = Number(item.id);
      if (vistos.has(idPersonalizacao)) return false;
      vistos.add(idPersonalizacao);
      return true;
    })
    .map((item) => ({ id: Number(item.id), nome: String(item.nome).trim() }));
}

export function resolverImagemProduto(pathFt) {
  const caminho = String(pathFt || '').trim();
  if (!caminho) return null;
  if (/^https?:\/\//i.test(caminho)) return caminho;
  return `${API_BASE_URL}/imagens/${caminho.replace(/^\/+/, '')}`;
}

export async function criarPedido({ nomeCliente, funcionarioId, itens }) {
  const funcionarioIdResolvido = inteiroPositivo(
    funcionarioId ?? localStorage.getItem('funcionarioId')
  );

  if (!funcionarioIdResolvido) {
    throw new Error(
      'Não foi possível identificar o funcionário logado. Faça login novamente.'
    );
  }

  const payload = {
    nomeCliente: String(nomeCliente || '').trim(),
    funcionarioId: funcionarioIdResolvido,
    itens: itens.map((item) => {
      const produtoId = inteiroPositivo(item.produtoId);
      const quantidade = inteiroPositivo(item.quantidade);

      if (!produtoId || !quantidade) {
        throw new Error('A sacola contém um item inválido. Remova-o e adicione novamente.');
      }

      const personalizacaoIds = Array.from(
        new Set(
          (Array.isArray(item.personalizacoes) ? item.personalizacoes : [])
            .map((personalizacao) => inteiroPositivo(personalizacao?.id))
            .filter(Boolean)
        )
      );

      const itemPedido = { produtoId, quantidade, personalizacaoIds };
      const tamanhoId = inteiroPositivo(item.tamanhoId);
      if (tamanhoId) itemPedido.tamanhoId = tamanhoId;

      return itemPedido;
    }),
  };

  if (!payload.nomeCliente) throw new Error('Informe o nome do cliente.');
  if (payload.itens.length === 0) throw new Error('A sacola está vazia.');

  try {
    const resposta = await api.post('/pedidos', payload, configuracao());
    return resposta.data;
  } catch (erro) {
    const detalhe = erro?.response?.data;
    const mensagem =
      (typeof detalhe === 'string' && detalhe.trim()) ||
      detalhe?.message ||
      detalhe?.erro ||
      'Não foi possível criar o pedido. Tente novamente.';
    throw new Error(mensagem, { cause: erro });
  }
}
