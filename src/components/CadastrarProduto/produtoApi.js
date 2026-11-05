import { authHeader } from '../../utils/authHeader.js';
import { interpretarRespostaPaginada } from '../../utils/respostaPaginada.js';

export async function requisitarProduto(caminho, { body, headers, ...opcoes } = {}) {
  const resposta = await fetch(`/api${caminho}`, {
    ...opcoes,
    headers: { ...authHeader(), ...(body !== undefined && { 'Content-Type': 'application/json' }), ...headers },
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });
  if (!resposta.ok) {
    const erro = new Error(`Não foi possível acessar ${caminho} (${resposta.status}).`);
    erro.status = resposta.status;
    throw erro;
  }
  if (resposta.status === 204) return null;
  return resposta.json();
}

// Os catálogos de ingredientes e personalizações são Page do Spring.
// Percorre todas as páginas para não omitir opções após os primeiros registros.
export async function buscarCatalogo(caminho, signal) {
  const itens = [];
  for (let numero = 0; ; numero += 1) {
    const dados = await requisitarProduto(`${caminho}?page=${numero}&size=100`, { signal });
    if (dados === null) break;
    const pagina = interpretarRespostaPaginada(dados);
    itens.push(...pagina.itens);
    if (pagina.totalPaginas === null || numero + 1 >= pagina.totalPaginas) break;
  }
  return itens;
}

export async function buscarListaProduto(caminho, signal) {
  const dados = await requisitarProduto(caminho, { signal });
  if (dados === null) return [];
  if (!Array.isArray(dados)) throw new Error('A API retornou uma lista inválida.');
  return dados;
}

export async function sincronizarTamanhos(produtoId, selecionados) {
  // Reconsulta antes de cada tentativa para retomar um salvamento parcial.
  const atuais = await buscarListaProduto(`/produtos/${produtoId}/tamanhos`);
  for (const atual of atuais) {
    const desejado = selecionados.find((item) => item.tamanhoId === atual.tamanhoId);
    if (!desejado || Number(desejado.precoUnidade) !== Number(atual.precoUnidade)) {
      await requisitarProduto(`/produtos/${produtoId}/tamanhos/${atual.tamanhoId}`, { method: 'DELETE' });
    }
  }
  for (const item of selecionados) {
    const mantido = atuais.some((atual) => atual.tamanhoId === item.tamanhoId && Number(atual.precoUnidade) === Number(item.precoUnidade));
    if (!mantido) await requisitarProduto(`/produtos/${produtoId}/tamanhos`, {
      method: 'POST', body: { tamanhoId: item.tamanhoId, precoUnidade: Number(item.precoUnidade) },
    });
  }
}
