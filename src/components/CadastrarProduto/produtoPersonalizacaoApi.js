import { authHeader } from '../../utils/authHeader';

const API_BASE_URL = '/api';

// Cria o vínculo entre um produto e uma personalização.
// Rota: POST /produtos/{produtoId}/personalizacoes/{personalizacaoId}, sem corpo.
export async function vincularPersonalizacaoAoProduto(produto, personalizacao) {
  const produtoId = produto?.id;
  const personalizacaoId = personalizacao?.id;

  const resposta = await fetch(`${API_BASE_URL}/produtos/${produtoId}/personalizacoes/${personalizacaoId}`, {
    method: 'POST',
    headers: {
      accept: '*/*',
      ...authHeader(),
    },
  });

  if (!resposta.ok) {
    let detalhe = '';
    try {
      detalhe = await resposta.text();
    } catch {
      // ignora falha ao ler o corpo do erro
    }
    console.error(
      `POST ${API_BASE_URL}/produtos/${produtoId}/personalizacoes/${personalizacaoId} falhou (${resposta.status}) ao vincular personalização "${personalizacao?.nome}" ao produto "${produto?.nome}":`,
      detalhe
    );
    throw new Error(`Erro ${resposta.status} ao vincular personalização "${personalizacao?.nome}"`);
  }

  try {
    return await resposta.json();
  } catch {
    return null;
  }
}

// Remove o vínculo entre um produto e uma personalização.
// Rota: DELETE /produtos/{produtoId}/personalizacoes/{personalizacaoId}, sem corpo
// (mesmo padrão usado em produtoIngredienteApi.js; ajuste aqui se a rota real for diferente).
export async function desvincularPersonalizacaoDoProduto(produtoId, personalizacaoId) {
  const resposta = await fetch(`${API_BASE_URL}/produtos/${produtoId}/personalizacoes/${personalizacaoId}`, {
    method: 'DELETE',
    headers: {
      accept: '*/*',
      ...authHeader(),
    },
  });

  if (!resposta.ok) {
    let detalhe = '';
    try {
      detalhe = await resposta.text();
    } catch {
      // ignora falha ao ler o corpo do erro
    }
    console.error(
      `DELETE ${API_BASE_URL}/produtos/${produtoId}/personalizacoes/${personalizacaoId} falhou (${resposta.status}):`,
      detalhe
    );
    throw new Error(`Erro ${resposta.status} ao remover personalização do produto`);
  }

  try {
    return await resposta.json();
  } catch {
    return null;
  }
}
