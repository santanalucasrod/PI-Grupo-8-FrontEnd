// Fixtures exclusivas desta validação. Nunca são importadas pela aplicação.
// PLAYWRIGHT_MODULE pode apontar para o pacote Playwright já disponível no ambiente.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');

async function main() {
  const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_EXECUTABLE && { executablePath: process.env.BROWSER_EXECUTABLE }) });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1200 }, colorScheme: 'light' });
  const page = await context.newPage();
  page.setDefaultTimeout(7000);
  const requests = [], checks = [], errors = [];
  const scenario = { empty: false, failCatalog: false, failRelation: false, missing: false };
  const produto = { id: 42, nome: 'Cappuccino de validação', precoUnidade: 14.5, descricao: 'Café espresso com leite vaporizado.', categoria: { id: 3, nome: 'Cafés' }, pathFt: null, ativo: true };
  const tamanhos = [{ id: 1, nome: 'Pequeno', volumeMl: 200 }, { id: 2, nome: 'Grande', volumeMl: 400 }];
  const sizesByProduct = { 42: [{ tamanhoId: 1, nomeTamanho: 'Pequeno', volumeMl: 200, precoUnidade: 14.5 }] };
  function check(name, condition) { assert.ok(condition, name); checks.push(name); console.log(`OK ${checks.length}: ${name}`); }
  page.on('pageerror', (error) => errors.push(error.message));
  await context.addInitScript(() => {
    localStorage.setItem('token', 'token-exclusivo-dos-testes');
    localStorage.setItem('usuario', JSON.stringify({ id: 1, nome: 'Validação local', gerente: true }));
    localStorage.setItem('gerente', 'true');
    localStorage.setItem('kentocafe_tema', 'light');
  });
  await context.route('**/api/**', async (route) => {
    const req = route.request(), url = new URL(req.url());
    const endpoint = url.pathname.replace('/api', ''), method = req.method();
    let body;
    try { body = req.postData() ? JSON.parse(req.postData()) : null; } catch { body = 'multipart'; }
    requests.push({ method, endpoint, query: url.search, body });
    let status = 200, data;
    const match = endpoint.match(/^\/produtos\/(\d+)(?:\/(.*))?$/);
    const id = Number(match?.[1]);
    const suffix = match?.[2];
    if (endpoint === '/categorias') data = method === 'POST' ? { id: 9, nome: body.nome } : scenario.empty ? [] : [{ id: 3, nome: 'Cafés' }];
    else if (endpoint === '/ingredientes') data = scenario.empty ? null : { content: url.searchParams.get('page') === '1' ? [{ id: 12, nome: 'Canela' }, { id: 13, nome: 'Café' }] : [{ id: 10, nome: 'Café' }, { id: 11, nome: 'Leite' }], number: Number(url.searchParams.get('page') || 0), totalPages: 2 };
    else if (endpoint === '/personalizacoes') {
      status = scenario.failCatalog ? 500 : 200;
      data = scenario.empty ? null : { content: [{ id: 20, nome: 'Sem açúcar' }, { id: 21, nome: 'Leite vegetal' }], number: 0, totalPages: 1 };
    } else if (endpoint === '/tamanhos') data = scenario.empty ? [] : tamanhos;
    else if (endpoint === '/produtos/agrupados') data = scenario.empty ? {} : { 'Cafés': [produto] };
    else if (match && !suffix) {
      status = scenario.missing ? 404 : 200;
      data = { ...produto, ...body, id };
    } else if (match && suffix === 'ingredientes') data = scenario.empty ? null : [{ id: 10, nome: 'Café' }, { id: 11, nome: 'Leite' }];
    else if (match && suffix === 'personalizacoes') {
      status = scenario.failRelation && method === 'PUT' ? 500 : 200;
      data = scenario.empty ? [] : [{ id: 20, nome: 'Sem açúcar' }];
    } else if (match && suffix === 'tamanhos') {
      if (method === 'POST') {
        const tamanho = tamanhos.find((item) => item.id === body.tamanhoId);
        sizesByProduct[id] ??= [];
        sizesByProduct[id].push({ ...body, nomeTamanho: tamanho.nome, volumeMl: tamanho.volumeMl });
        status = 201; data = body;
      } else data = scenario.empty ? [] : sizesByProduct[id] || [];
    } else if (match && suffix.startsWith('tamanhos/')) {
      sizesByProduct[id] = (sizesByProduct[id] || []).filter((item) => item.tamanhoId !== Number(suffix.split('/')[1]));
      status = 204;
    } else if (endpoint === '/produtos' && method === 'POST') { status = 201; data = { ...produto, ...body, id: 77 }; }
    else if (endpoint === '/dashboard/resumo') data = { inicio: url.searchParams.get('inicio'), fim: url.searchParams.get('fim'), inicioAnterior: '2026-09-07', fimAnterior: '2026-10-06', metaMinutos: 10, atual: { faturamento: 0, pedidos: 0, cancelados: 0 }, anterior: { faturamento: 0, pedidos: 0, cancelados: 0 }, limitePedidosPorHora: null, horariosCriticos: [], serieDiaria: [], movimentoPorHora: [], esperaPorVolume: [], topProdutos: [], faturamentoPorCategoria: [], personalizacoes: [] };
    else if (endpoint === '/pedidos') data = [];
    else if (endpoint === '/funcionarios/crud') data = { content: [], number: 0, totalPages: 0 };
    else { status = 404; data = { message: `Endpoint não configurado: ${endpoint}` }; }
    if (data === null) status = 204;
    await route.fulfill({ status, contentType: 'application/json', ...(status !== 204 && { body: JSON.stringify(data) }) });
  });
  async function open(route) {
    await page.goto(`http://127.0.0.1:5173${route}`);
    if (route.startsWith('/produtos/cadastro') || route.startsWith('/produtos/editar')) await page.getByLabel('Nome do produto', { exact: true }).waitFor();
  }
  async function screenshot(filename) {
    await page.evaluate(() => {
      document.querySelector('#validacao-local')?.remove();
      const badge = document.createElement('div');
      badge.id = 'validacao-local';
      badge.textContent = 'VALIDAÇÃO LOCAL • Dados de teste isolados no navegador';
      badge.style.cssText = 'position:fixed;top:80px;right:16px;max-width:calc(100% - 56px);z-index:10000;pointer-events:none;background:#fff8e6;color:#634818;border:1px solid #d9c290;border-radius:6px;padding:8px 12px;font:12px Arial;';
      document.body.appendChild(badge);
    });
    await page.screenshot({ path: path.join(__dirname, filename), fullPage: true });
  }
  try {
    await open('/produtos/editar/42');
    check('Edição carrega o produto pela rota com ID', await page.getByLabel('Nome do produto', { exact: true }).inputValue() === produto.nome);
    check('Edição preenche ingredientes e personalizações vinculados', await page.getByLabel('Remover Café', { exact: true }).count() === 1 && await page.getByLabel('Remover Sem açúcar', { exact: true }).count() === 1);
    check('Edição preenche tamanho e preço próprios', await page.getByLabel('Preço Pequeno', { exact: true }).inputValue() === '14.5');
    await page.getByRole('combobox', { name: 'Ingredientes', exact: true }).click();
    check('Catálogo inclui a segunda página do Spring', await page.getByRole('option', { name: 'Canela', exact: true }).count() === 1);
    await page.getByRole('option', { name: 'Canela', exact: true }).click();
    await page.getByLabel('Remover Leite', { exact: true }).click();
    await page.getByRole('combobox', { name: 'Personalização', exact: true }).click();
    await page.getByRole('option', { name: 'Leite vegetal', exact: true }).click();
    await page.getByLabel('Preço Pequeno', { exact: true }).fill('15.90');
    await page.getByLabel('Grande · 400 ml', { exact: true }).check();
    await page.getByLabel('Preço Grande', { exact: true }).fill('19.90');
    await screenshot('03-edicao-produto-desktop.png');
    const inicio = requests.length;
    await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
    await page.waitForURL('**/produtos', { timeout: 7000 });
    const writes = requests.slice(inicio).filter((r) => r.method !== 'GET');
    check('Edição salva categoria com ID persistido', writes.some((r) => r.endpoint === '/produtos/42' && r.body.categoria.id === 3));
    check('Edição salva adição e remoção de ingredientes por IDs', writes.some((r) => r.endpoint.endsWith('/ingredientes') && JSON.stringify(r.body) === '[10,12]'));
    check('Edição salva personalizações por IDs', writes.some((r) => r.endpoint.endsWith('/personalizacoes') && JSON.stringify(r.body) === '[20,21]'));
    check('Atualização de preço respeita DELETE e POST existentes no Java', writes.some((r) => r.endpoint === '/produtos/42/tamanhos/1' && r.method === 'DELETE') && writes.some((r) => r.endpoint === '/produtos/42/tamanhos' && r.body.precoUnidade === 15.9));
    check('Novo tamanho salva seu próprio preço', writes.some((r) => r.endpoint === '/produtos/42/tamanhos' && r.body.precoUnidade === 19.9));

    await open('/produtos/editar/43');
    await page.getByRole('combobox', { name: 'Ingredientes', exact: true }).click();
    await page.getByRole('option', { name: 'Café', exact: true }).nth(1).click();
    await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
    await page.waitForURL('**/produtos', { timeout: 7000 });
    check('Ingredientes com nomes iguais preservam seus IDs distintos', requests.some((r) => r.endpoint === '/produtos/43/ingredientes' && r.method === 'PUT' && JSON.stringify(r.body) === '[10,11,13]'));

    await open('/produtos/cadastro');
    await page.getByLabel('Nome do produto', { exact: true }).fill('Produto de validação');
    await page.getByLabel('Preço', { exact: true }).fill('12.50');
    await page.getByLabel('Descrição', { exact: true }).fill('Descrição para o teste de cadastro.');
    await page.getByRole('button', { name: 'Adicionar categoria', exact: true }).click();
    await page.getByRole('dialog').getByLabel('Nome', { exact: true }).fill('Categoria criada no teste');
    await page.getByRole('dialog').getByRole('button', { name: 'Adicionar', exact: true }).click();
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    check('Categoria recém-criada fica selecionada', await page.getByRole('combobox', { name: 'Categoria', exact: true }).inputValue() === 'Categoria criada no teste');
    scenario.failRelation = true;
    const inicioCadastro = requests.length;
    await page.getByRole('button', { name: 'Cadastrar', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: 'O produto foi salvo' }).waitFor();
    check('Falha parcial mantém dados digitados e informa pendência', await page.getByLabel('Nome do produto', { exact: true }).inputValue() === 'Produto de validação');
    check('Cadastro usa ID real da categoria criada pelo modal', requests.slice(inicioCadastro).some((r) => r.method === 'POST' && r.endpoint === '/produtos' && r.body.categoria.id === 9));
    scenario.failRelation = false;
    await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click();
    await page.waitForURL('**/produtos', { timeout: 7000 });
    check('Nova tentativa reaproveita produto salvo sem duplicar POST', requests.slice(inicioCadastro).filter((r) => r.endpoint === '/produtos' && r.method === 'POST').length === 1 && requests.slice(inicioCadastro).some((r) => r.endpoint === '/produtos/77' && r.method === 'PUT'));

    scenario.empty = true;
    await open('/produtos/cadastro');
    const inicioInvalido = requests.length;
    await page.getByRole('button', { name: 'Cadastrar', exact: true }).click();
    check('Campos obrigatórios impedem cadastro inválido', await page.getByText('Informe a descrição do produto.', { exact: true }).count() === 1 && requests.slice(inicioInvalido).every((r) => r.method === 'GET'));
    await page.getByRole('combobox', { name: 'Ingredientes', exact: true }).fill('Ingrediente inexistente');
    check('Não cria opções fictícias por digitação', await page.getByRole('option').count() === 0 && await page.getByText('Nenhuma opção encontrada. Use + para cadastrar.').count() === 1);
    await page.getByLabel('Nome do produto', { exact: true }).click();
    check('204 é tratado como catálogo vazio', await page.getByText('Nenhum tamanho cadastrado.', { exact: true }).count() === 1);
    await screenshot('04-cadastro-sem-registros.png');

    scenario.empty = false; scenario.failCatalog = true;
    await page.goto('http://127.0.0.1:5173/produtos/editar/42');
    await page.getByRole('alert').waitFor();
    check('Falha de catálogo é visível e bloqueia salvar', await page.getByRole('button', { name: 'Salvar alterações', exact: true }).isDisabled());
    await screenshot('05-falha-de-carregamento.png');
    scenario.failCatalog = false;
    await page.getByRole('button', { name: 'Tentar novamente', exact: true }).click();
    await page.getByLabel('Nome do produto', { exact: true }).waitFor();
    check('Tentar novamente recupera todos os dados', await page.getByLabel('Nome do produto', { exact: true }).inputValue() === produto.nome);

    await page.setViewportSize({ width: 390, height: 844 });
    await screenshot('06-edicao-produto-mobile.png');
    await page.screenshot({ path: path.join(__dirname, '06a-edicao-mobile-topo.png') });
    await page.getByLabel('Preço Grande', { exact: true }).scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(__dirname, '06b-edicao-mobile-vinculos.png') });
    check('Formulário mobile não transborda horizontalmente', await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
    await page.getByRole('button', { name: 'Modo escuro', exact: true }).click();
    await screenshot('07-edicao-produto-escuro.png');
    check('Modo escuro mantém contraste e alternância', await page.evaluate(() => document.documentElement.dataset.theme === 'dark'));
    await page.setViewportSize({ width: 1440, height: 1200 });
    await open('/cardapio');
    await page.getByText(produto.nome, { exact: true }).first().click();
    await page.getByRole('dialog').getByRole('radio', { name: /Pequeno/ }).waitFor();
    check('Cardápio consulta os três vínculos pela rota do produto', ['/ingredientes', '/personalizacoes', '/tamanhos'].every((suffix) => requests.some((r) => r.endpoint === `/produtos/42${suffix}` && r.method === 'GET')));
    await screenshot('08-cardapio-detalhes.png');
    scenario.empty = true;
    for (const [route, filename] of [['/produtos', '09-produtos-vazio.png'], ['/ingredientes', '10-ingredientes-vazio.png'], ['/personalizacoes', '11-personalizacoes-vazio.png'], ['/categorias', '12-categorias-vazio.png'], ['/pedidos', '13-pedidos-vazio.png'], ['/funcionarios', '14-funcionarios-vazio.png'], ['/cardapio/sacola', '15-sacola-vazia.png'], ['/perfil', '16-perfil.png'], ['/dashboard', '17-dashboard-sem-pedidos.png'], ['/categorias/cadastro', '18-cadastro-categoria.png'], ['/ingredientes/cadastro', '19-cadastro-ingrediente.png'], ['/personalizacoes/cadastro', '20-cadastro-personalizacao.png'], ['/funcionarios/cadastro', '21-cadastro-funcionario.png']]) {
      await open(route);
      await page.getByText(/Carregando/).waitFor({ state: 'hidden' });
      await screenshot(filename);
      check(`Tela ${route} renderiza sem erros de JavaScript`, errors.length === 0);
    }
    scenario.empty = false; scenario.missing = true;
    await page.goto('http://127.0.0.1:5173/produtos/editar/999');
    await page.getByRole('alert').filter({ hasText: 'Produto não encontrado' }).waitFor();
    check('Produto inexistente exibe erro e bloqueia salvar', await page.getByRole('button', { name: 'Salvar alterações', exact: true }).isDisabled());
    check('Nenhum erro de JavaScript nas telas verificadas', errors.length === 0);
    await fs.writeFile(path.join(__dirname, 'resultado-interface.json'), JSON.stringify({ checks, errors, requests }, null, 2));
    console.log(`PASSOU: ${checks.length} verificações.`);
  } catch (error) {
    await page.screenshot({ path: path.join(__dirname, 'falha-teste.png'), fullPage: true });
    await fs.writeFile(path.join(__dirname, 'falha-teste.json'), JSON.stringify({ url: page.url(), checks, errors, requests, error: String(error) }, null, 2));
    throw error;
  } finally { await browser.close(); }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
