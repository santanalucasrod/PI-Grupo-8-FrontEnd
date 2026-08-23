const API_BASE_URL = 'http://localhost:8080';

// Cria o vínculo entre um produto e um ingrediente (tabela produto_ingrediente)
export async function vincularIngredienteAoProduto(produto, ingrediente) {
  const resposta = await fetch(`${API_BASE_URL}/produto-ingrediente`, {
    method: 'POST',
    headers: {
      accept: '*/*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ produto, ingrediente }),
  });

  if (!resposta.ok) {
    let detalhe = '';
    try {
      detalhe = await resposta.text();
    } catch {
      // ignora falha ao ler o corpo do erro
    }
    console.error(
      `POST ${API_BASE_URL}/produto-ingrediente falhou (${resposta.status}) ao vincular ingrediente "${ingrediente?.nome}" ao produto "${produto?.nome}":`,
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
