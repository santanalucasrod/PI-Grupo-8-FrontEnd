import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Pesquisa from '../../components/Pesquisa/Pesquisa';
import AbasCategoria from '../../components/Cardapio/AbasCategoria';
import FooterCardapio from '../../components/Cardapio/FooterCardapio';
import ModalProdutoCardapio from '../../components/Cardapio/ModalProdutoCardapio';
import SecaoProdutos from '../../components/Cardapio/SecaoProdutos';
import { useCart } from '../../providers/CartContext';
import {
  buscarIngredientesPorProduto,
  buscarProdutosAgrupados,
  resolverImagemProduto,
} from './cardapioApi';
import styles from './Cardapio.module.css';

function normalizarTexto(valor) {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('pt-BR');
}

function classificarTemperatura(nomeCategoria) {
  const palavras = normalizarTexto(nomeCategoria).split(/[^a-z]+/).filter(Boolean);

  if (palavras.some((palavra) => ['quente', 'quentes'].includes(palavra))) {
    return 'quentes';
  }

  if (
    palavras.some((palavra) =>
      ['frio', 'frios', 'fria', 'frias', 'gelado', 'gelados', 'gelada', 'geladas'].includes(
        palavra
      )
    )
  ) {
    return 'gelados';
  }

  return 'outros';
}

function mapearProduto(produto, nomeCategoria) {
  const precoUnidade = Number(produto?.precoUnidade);

  return {
    id: produto?.id,
    nome: String(produto?.nome || 'Produto'),
    precoUnidade: Number.isFinite(precoUnidade) ? precoUnidade : 0,
    descricao: String(produto?.descricao || ''),
    categoriaNome: produto?.categoria?.nome || nomeCategoria,
    imagem: resolverImagemProduto(produto?.pathFt),
  };
}

export default function Cardapio() {
  const navigate = useNavigate();
  const { adicionarItem, total, quantidadeItens } = useCart();
  const [produtosAgrupados, setProdutosAgrupados] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [termo, setTermo] = useState('');
  const [abaAtiva, setAbaAtiva] = useState('todos');
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [ingredientes, setIngredientes] = useState([]);
  const [carregandoIngredientes, setCarregandoIngredientes] = useState(false);
  const [avisoIngredientes, setAvisoIngredientes] = useState('');
  const fecharProduto = useCallback(() => setProdutoSelecionado(null), []);

  useEffect(() => {
    const controller = new AbortController();

    async function carregarProdutos() {
      try {
        const dados = await buscarProdutosAgrupados(controller.signal);
        setProdutosAgrupados(dados);
        setErro('');
      } catch (erroRequisicao) {
        if (erroRequisicao?.code !== 'ERR_CANCELED') {
          setErro('Não foi possível carregar o cardápio. Tente novamente mais tarde.');
        }
      } finally {
        if (!controller.signal.aborted) setCarregando(false);
      }
    }

    carregarProdutos();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!produtoSelecionado) return undefined;

    const controller = new AbortController();

    async function carregarIngredientes() {
      try {
        const dados = await buscarIngredientesPorProduto(
          produtoSelecionado.id,
          controller.signal
        );
        setIngredientes(dados);
      } catch (erroRequisicao) {
        if (erroRequisicao?.code !== 'ERR_CANCELED') {
          setAvisoIngredientes('Não foi possível carregar os ingredientes deste produto.');
        }
      } finally {
        if (!controller.signal.aborted) setCarregandoIngredientes(false);
      }
    }

    carregarIngredientes();
    return () => controller.abort();
  }, [produtoSelecionado]);

  const secoes = useMemo(() => {
    const busca = normalizarTexto(termo);

    return Object.entries(produtosAgrupados)
      .filter(([, produtos]) => Array.isArray(produtos))
      .map(([nomeCategoria, produtos]) => ({
        nomeCategoria,
        temperatura: classificarTemperatura(nomeCategoria),
        produtos: produtos
          .map((produto) => mapearProduto(produto, nomeCategoria))
          .filter((produto) => produto.id != null)
          .filter((produto) =>
            normalizarTexto(produto.nome).includes(busca)
          ),
      }))
      .filter((secao) => abaAtiva === 'todos' || secao.temperatura === abaAtiva)
      .filter((secao) => secao.produtos.length > 0);
  }, [abaAtiva, produtosAgrupados, termo]);

  function abrirProduto(produto) {
    setIngredientes([]);
    setAvisoIngredientes('');
    setCarregandoIngredientes(true);
    setProdutoSelecionado(produto);
  }

  function adicionarProduto({ quantidade, personalizacoes }) {
    if (!produtoSelecionado) return;

    adicionarItem({
      produtoId: Number(produtoSelecionado.id),
      nome: produtoSelecionado.nome,
      imagem: produtoSelecionado.imagem,
      precoUnidade: Number(produtoSelecionado.precoUnidade || 0),
      quantidade,
      personalizacoes,
    });

    setProdutoSelecionado(null);
  }

  return (
    <div className={styles.pagina}>
      <main className={styles.main}>
        <section className={styles.conteudo}>
          <div className={styles.cabecalho}>
            <div>
              <p className={styles.eyebrow}>Atendimento</p>
              <h2 className={styles.titulo}>Cardápio</h2>
            </div>
            <Pesquisa
              valor={termo}
              aoPesquisar={setTermo}
              placeholder="Pesquisar produto"
            />
          </div>

          <AbasCategoria abaAtiva={abaAtiva} onSelecionar={setAbaAtiva} />

          <div className={styles.listaSecoes} aria-live="polite">
            {carregando && <p className={styles.mensagem}>Carregando cardápio...</p>}
            {!carregando && erro && <p className={styles.mensagemErro}>{erro}</p>}
            {!carregando && !erro && secoes.length === 0 && (
              <p className={styles.mensagem}>Nenhum produto encontrado.</p>
            )}
            {!carregando && !erro &&
              secoes.map((secao) => (
                <SecaoProdutos
                  key={secao.nomeCategoria}
                  titulo={secao.nomeCategoria}
                  produtos={secao.produtos}
                  onProdutoClick={abrirProduto}
                />
              ))}
          </div>
        </section>
      </main>

      <FooterCardapio
        total={total}
        quantidadeItens={quantidadeItens}
        onFinalizar={() => navigate('/cardapio/sacola')}
      />

      {produtoSelecionado && (
        <ModalProdutoCardapio
          key={produtoSelecionado.id}
          produto={produtoSelecionado}
          ingredientes={ingredientes}
          carregandoIngredientes={carregandoIngredientes}
          avisoIngredientes={avisoIngredientes}
          onAdicionar={adicionarProduto}
          onFechar={fecharProduto}
        />
      )}
    </div>
  );
}
