import { authHeader } from '../../utils/authHeader';

const API_BASE_URL = 'http://localhost:8080';

// Envia a imagem do produto (multipart/form-data) e retorna o produto atualizado (com o novo pathFt)
export async function enviarImagemProduto(produtoId, arquivo) {
  const formData = new FormData();
  formData.append('imagem', arquivo); // nome do campo esperado pelo @RequestParam("imagem") no backend

  const resposta = await fetch(`${API_BASE_URL}/produtos/${produtoId}/imagem`, {
    method: 'POST',
    headers: {
      accept: '*/*',
      ...authHeader(),
      // Sem "Content-Type" manual: o browser define o boundary do multipart sozinho.
    },
    body: formData,
  });

  if (!resposta.ok) {
    let detalhe = '';
    try {
      detalhe = await resposta.text();
    } catch {
      // ignora falha ao ler o corpo do erro
    }
    console.error(
      `POST ${API_BASE_URL}/produtos/${produtoId}/imagem falhou (${resposta.status}):`,
      detalhe
    );
    throw new Error(`Erro ${resposta.status} ao enviar imagem do produto`);
  }

  return resposta.json();
}
