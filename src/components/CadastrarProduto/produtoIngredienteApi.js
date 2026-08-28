import { authHeader } from '../../utils/authHeader';

const API_BASE_URL = 'http://localhost:8080';

// Cria o vínculo entre um produto e um ingrediente.
// Rota nova: POST /produtos/{produtoId}/ingredientes/{ingredienteId}, sem corpo.
export async function vincularIngredienteAoProduto(produto, ingrediente) {
  const produtoId = produto?.id;
  const ingredienteId = ingrediente?.id;

  const resposta = await fetch(`${API_BASE_URL}/produtos/${produtoId}/ingredientes/${ingredienteId}`, {
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
      `POST ${API_BASE_URL}/produtos/${produtoId}/ingredientes/${ingredienteId} falhou (${resposta.status}) ao vincular ingrediente "${ingrediente?.nome}" ao produto "${produto?.nome}":`,
      detalhe
    );
    throw new Error(`Erro ${resposta.status} ao vincular ingrediente "${ingrediente?.nome}"`);
  }

  try {
    return await resposta.json();
  } catch {
    return null;
  }
}

// Remove o vínculo entre um produto e um ingrediente.
// Rota: DELETE /produtos/{produtoId}/ingredientes/{ingredienteId}, sem corpo.
export async function desvincularIngredienteDoProduto(produtoId, ingredienteId) {
  const resposta = await fetch(`${API_BASE_URL}/produtos/${produtoId}/ingredientes/${ingredienteId}`, {
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
      `DELETE ${API_BASE_URL}/produtos/${produtoId}/ingredientes/${ingredienteId} falhou (${resposta.status}):`,
      detalhe
    );
    throw new Error(`Erro ${resposta.status} ao remover ingrediente do produto`);
  }

  try {
    return await resposta.json();
  } catch {
    return null;
  }
}
