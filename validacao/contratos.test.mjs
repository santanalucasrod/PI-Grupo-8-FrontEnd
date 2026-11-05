import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { buscarCatalogo, buscarListaProduto, requisitarProduto, sincronizarTamanhos } from '../src/components/CadastrarProduto/produtoApi.js';
import { interpretarRespostaPaginada } from '../src/utils/respostaPaginada.js';
import { validarProduto } from '../src/components/CadastrarProduto/validacaoProduto.js';

const fetchOriginal = globalThis.fetch;
globalThis.localStorage = { getItem: () => 'token-exclusivo-dos-testes' };
after(() => { globalThis.fetch = fetchOriginal; delete globalThis.localStorage; });
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

test('catálogo reúne todas as páginas do Spring e preserva autenticação', async () => {
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    const number = Number(new URL(url, 'http://localhost').searchParams.get('page'));
    return json({ content: [{ id: number + 1, nome: `Registro ${number + 1}` }], number, totalPages: 2 });
  };
  assert.deepEqual((await buscarCatalogo('/ingredientes')).map((item) => item.id), [1, 2]);
  assert.equal(calls.length, 2);
  assert.equal(calls[1].options.headers.Authorization, 'Bearer token-exclusivo-dos-testes');
});

test('catálogo não paginado de categorias também é aceito', async () => {
  let calls = 0;
  globalThis.fetch = async () => { calls++; return json([{ id: 9, nome: 'Categoria' }]); };
  assert.equal((await buscarCatalogo('/categorias'))[0].id, 9);
  assert.equal(calls, 1);
});

test('204 dos controllers produz lista vazia sem tentar ler JSON inexistente', async () => {
  globalThis.fetch = async () => new Response(null, { status: 204 });
  assert.deepEqual(await buscarCatalogo('/ingredientes'), []);
  assert.deepEqual(await buscarListaProduto('/produtos/42/ingredientes'), []);
  assert.deepEqual(interpretarRespostaPaginada(''), { itens: [], paginaAtual: 0, totalPaginas: 0 });
});

test('falha HTTP é propagada para impedir salvamento com vínculos desconhecidos', async () => {
  globalThis.fetch = async () => json({ message: 'Falha de teste' }, 500);
  await assert.rejects(buscarListaProduto('/produtos/42/ingredientes'), (error) => error.status === 500);
});

test('resposta de lista malformada não é convertida silenciosamente em lista vazia', async () => {
  globalThis.fetch = async () => json({ inesperado: true });
  await assert.rejects(buscarListaProduto('/produtos/42/ingredientes'), /lista inválida/);
  await assert.rejects(buscarCatalogo('/ingredientes'), /paginação inválido/);
});

test('salvamento com 204 é aceito nas rotas de alteração', async () => {
  globalThis.fetch = async () => new Response(null, { status: 204 });
  assert.equal(await requisitarProduto('/produtos/42/ingredientes', { method: 'PUT', body: [] }), null);
});

test('tamanho com preço mantido não gera novas mutações', async () => {
  const methods = [];
  globalThis.fetch = async (url, options) => {
    methods.push(options.method || 'GET');
    return json([{ tamanhoId: 1, precoUnidade: 15.9 }]);
  };
  await sincronizarTamanhos(42, [{ tamanhoId: 1, precoUnidade: '15.90' }]);
  assert.deepEqual(methods, ['GET']);
});

test('mudança de preço usa as rotas DELETE e POST existentes, sem inventar PUT', async () => {
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, method: options.method || 'GET', body: options.body });
    if (!options.method) return json([{ tamanhoId: 1, precoUnidade: 10 }]);
    return options.method === 'DELETE' ? new Response(null, { status: 204 }) : json({ tamanhoId: 1, precoUnidade: 12 }, 201);
  };
  await sincronizarTamanhos(42, [{ tamanhoId: 1, precoUnidade: '12.00' }]);
  assert.deepEqual(calls.map((item) => item.method), ['GET', 'DELETE', 'POST']);
  assert.equal(calls[1].url, '/api/produtos/42/tamanhos/1');
  assert.deepEqual(JSON.parse(calls[2].body), { tamanhoId: 1, precoUnidade: 12 });
});

test('tamanho parcialmente salvo é retomado sem excluir de novo um vínculo já removido', async () => {
  let existe = true, falhar = true, deletes = 0;
  globalThis.fetch = async (url, options) => {
    if (!options.method) return json(existe ? [{ tamanhoId: 1, precoUnidade: 10 }] : []);
    if (options.method === 'DELETE') { deletes++; existe = false; return new Response(null, { status: 204 }); }
    if (falhar) return json({ message: 'Falha de teste' }, 500);
    existe = true;
    return json({ tamanhoId: 1, precoUnidade: 12 }, 201);
  };
  await assert.rejects(sincronizarTamanhos(42, [{ tamanhoId: 1, precoUnidade: '12.00' }]));
  falhar = false;
  await sincronizarTamanhos(42, [{ tamanhoId: 1, precoUnidade: '12.00' }]);
  assert.equal(deletes, 1);
  assert.equal(existe, true);
});

test('validação exige descrição como o ProdutoRequest Java e recusa preço zero', () => {
  const errors = validarProduto({ nome: 'Produto', preco: '0', descricao: ' ', categoria: 'Categoria' });
  assert.equal(errors.descricao, 'Informe a descrição do produto.');
  assert.ok(errors.preco);
});
