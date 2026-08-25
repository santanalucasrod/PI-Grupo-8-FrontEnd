import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import HeaderCardapio from './HeaderCardapio';
import AbasCategoria from './AbasCategoria';
import SecaoProdutos from './SecaoProdutos';
import FooterCardapio from './FooterCardapio';
import ModalNomeCliente from './ModalNomeCliente';
import ModalPagamento from './ModalPagamento';
import { buscarProdutosAgrupados, API_BASE_URL } from './cardapioApi';
import { useCart } from '../../providers/CartContext';
import ImagemProduto from '../../assets/img-cafe.png';
import styles from './TelaCardapio.module.css';

// O backend não marca categorias como "quente"/"gelado" (Categoria só tem `nome`),
// então classificamos pelo nome da categoria vinda da API. Ver README-TELAS.md.
const PALAVRAS_QUENTES = ['quente', 'quentes', 'hot'];
const PALAVRAS_GELADOS = ['gelado', 'gelados', 'gelada', 'geladas', 'frio', 'frios', 'ice', 'cold'];

function classificarCategoria(nomeCategoria) {
  const nome = (nomeCategoria || '').toLowerCase();
  if (PALAVRAS_QUENTES.some((palavra) => nome.includes(palavra))) return 'quentes';
  if (PALAVRAS_GELADOS.some((palavra) => nome.includes(palavra))) return 'gelados';
  return 'outros';
}

function mapearProduto(produto) {
  const precoUnidade = Number(produto?.precoUnidade);

  return {
    id: produto?.id,
    nome: produto?.nome || 'Produto',
    precoUnidade: Number.isFinite(precoUnidade) ? precoUnidade : 0,
    descricao: produto?.descricao || '',
    categoriaNome: produto?.categoria?.nome || '',
    imagem: produto?.pathFt ? `${API_BASE_URL}/imagens/${produto.pathFt}` : ImagemProduto,
  };
}

function produtosUnicos(produtos) {
  return Array.from(
    new Map(produtos.filter((produto) => produto.id != null).map((produto) => [produto.id, produto])).values()
  );
}

export default function TelaCardapio() {
  const navigate = useNavigate();
  const location = useLocation();
  const { itens, total, limparCarrinho } = useCart();

  const [produtosAgrupados, setProdutosAgrupados] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [termo, setTermo] = useState('');
  const [abaAtiva, setAbaAtiva] = useState('todos');
  const [etapaCheckout, setEtapaCheckout] = useState(() =>
    location.state?.iniciarCheckout && itens.length > 0 ? 'nome' : null
  );
  const [nomeCliente, setNomeCliente] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function carregar() {
      try {
        setCarregando(true);
        setErro(null);
        const dados = await buscarProdutosAgrupados(controller.signal);
        setProdutosAgrupados(dados);
      } catch (err) {
        if (err?.code === 'ERR_CANCELED') return;
        setErro('Não foi possível carregar o cardápio. Verifique se a API está rodando em ' + API_BASE_URL);
      } finally {
        if (!controller.signal.aborted) setCarregando(false);
      }
    }
    carregar();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!location.state?.iniciarCheckout) return;
    navigate('/cardapio', { replace: true, state: null });
  }, [location.state, navigate]);

  const secoes = useMemo(() => {
    const termoBusca = termo.trim().toLowerCase();

    const categorias = Object.entries(produtosAgrupados || {})
      .filter(([, produtos]) => Array.isArray(produtos))
      .map(([nomeCategoria, produtos]) => {
        const tipo = classificarCategoria(nomeCategoria);
        const produtosFiltrados = produtos
          .map(mapearProduto)
          .filter((produto) => produto.nome.toLowerCase().includes(termoBusca));
        return { nomeCategoria, tipo, produtos: produtosFiltrados };
      })
      .filter((categoria) => categoria.produtos.length > 0);

    const todos = produtosUnicos(categorias.flatMap((categoria) => categoria.produtos));
    const quentes = produtosUnicos(
      categorias.filter((categoria) => categoria.tipo === 'quentes').flatMap((categoria) => categoria.produtos)
    );
    const gelados = produtosUnicos(
      categorias.filter((categoria) => categoria.tipo === 'gelados').flatMap((categoria) => categoria.produtos)
    );

    if (abaAtiva === 'quentes') return [{ titulo: 'Quentes', produtos: quentes }];
    if (abaAtiva === 'gelados') return [{ titulo: 'Gelados', produtos: gelados }];

    const outras = categorias
      .filter((categoria) => categoria.tipo === 'outros')
      .map((categoria) => ({ titulo: categoria.nomeCategoria, produtos: categoria.produtos }));

    return [
      { titulo: 'Em alta', produtos: todos.slice(0, 3) },
      { titulo: 'Gelados', produtos: gelados },
      { titulo: 'Quentes', produtos: quentes },
      ...outras,
    ];
  }, [produtosAgrupados, termo, abaAtiva]);

  const temResultados = secoes.some((secao) => secao.produtos.length > 0);

  function handleProdutoClick(produto) {
    navigate(`/cardapio/produto/${produto.id}`);
  }

  function handleConcluirNome(nome) {
    setNomeCliente(nome);
    setEtapaCheckout('pagamento');
  }

  function handlePagamentoEfetuado() {
    limparCarrinho();
    setEtapaCheckout(null);
    setNomeCliente('');
  }

  return (
    <div className={styles.pagina}>
      <HeaderCardapio termo={termo} aoPesquisar={setTermo} />

      <AbasCategoria abaAtiva={abaAtiva} onSelecionar={setAbaAtiva} />

      <div className={styles.conteudo}>
        {carregando && <p className={styles.mensagem}>Carregando cardápio...</p>}

        {!carregando && erro && <p className={styles.mensagemErro}>{erro}</p>}

        {!carregando && !erro && !temResultados && (
          <p className={styles.mensagem}>Nenhum produto encontrado.</p>
        )}

        {!carregando && !erro && secoes.map((secao, indice) => (
          <SecaoProdutos
            key={`${secao.titulo}-${indice}`}
            titulo={secao.titulo}
            produtos={secao.produtos}
            onProdutoClick={handleProdutoClick}
          />
        ))}
      </div>

      <FooterCardapio total={total} onFinalizar={() => navigate('/cardapio/sacola')} />

      {etapaCheckout === 'nome' && (
        <ModalNomeCliente
          onConcluir={handleConcluirNome}
          onFechar={() => setEtapaCheckout(null)}
        />
      )}

      {etapaCheckout === 'pagamento' && (
        <ModalPagamento
          total={total}
          nomeCliente={nomeCliente}
          itens={itens}
          onPagamentoEfetuado={handlePagamentoEfetuado}
          onCancelar={() => setEtapaCheckout(null)}
        />
      )}
    </div>
  );
}
