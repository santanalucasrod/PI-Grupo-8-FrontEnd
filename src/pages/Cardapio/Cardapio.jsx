import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Pesquisa from '../../components/Pesquisa/Pesquisa';
import AbasCategoria from '../../components/Cardapio/AbasCategoria';
import FooterCardapio from '../../components/Cardapio/FooterCardapio';
import ModalProdutoCardapio from '../../components/Cardapio/ModalProdutoCardapio';
import SecaoProdutos from '../../components/Cardapio/SecaoProdutos';
import { useCart } from '../../providers/CartContext';
import { normalizarTexto } from '../../utils/pesquisa';
import {
  buscarIngredientesPorProduto,
  buscarPersonalizacoesPorProduto,
  buscarProdutosAgrupados,
  resolverImagemProduto,
} from './cardapioApi';
import styles from './Cardapio.module.css';

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
  const [abaAtiva, setAbaAtiva] = useState(null);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [ingredientes, setIngredientes] = useState([]);
  const [carregandoIngredientes, setCarregandoIngredientes] = useState(false);
  const [avisoIngredientes, setAvisoIngredientes] = useState('');
  const [personalizacoes, setPersonalizacoes] = useState([]);
  const [carregandoPersonalizacoes, setCarregandoPersonalizacoes] = useState(false);
  const [avisoPersonalizacoes, setAvisoPersonalizacoes] = useState('');
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

    buscarIngredientesPorProduto(produtoSelecionado.id, controller.signal)
      .then((dados) => setIngredientes(dados))
      .catch((erroRequisicao) => {
        if (erroRequisicao?.code !== 'ERR_CANCELED') {
          setAvisoIngredientes('Não foi possível carregar os ingredientes deste produto.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setCarregandoIngredientes(false);
      });

    buscarPersonalizacoesPorProduto(produtoSelecionado.id, controller.signal)
      .then((dados) => setPersonalizacoes(dados))
      .catch((erroRequisicao) => {
        if (erroRequisicao?.code !== 'ERR_CANCELED') {
          setAvisoPersonalizacoes(
            'Não foi possível carregar as personalizações deste produto.'
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setCarregandoPersonalizacoes(false);
      });

    return () => controller.abort();
  }, [produtoSelecionado]);

  const categorias = Object.keys(produtosAgrupados)
    .filter((nome) => Array.isArray(produtosAgrupados[nome]) && produtosAgrupados[nome].length > 0)
    .sort((a, b) => a.localeCompare(b, 'pt-BR'));

  const secoes = useMemo(() => {
    const busca = normalizarTexto(termo);

    return Object.entries(produtosAgrupados)
      .filter(([, produtos]) => Array.isArray(produtos))
      .map(([nomeCategoria, produtos]) => ({
        nomeCategoria,
        produtos: produtos
          .map((produto) => mapearProduto(produto, nomeCategoria))
          .filter((produto) => produto.id != null)
          .filter((produto) =>
            normalizarTexto(produto.nome).includes(busca)
          ),
      }))
      .filter((secao) => abaAtiva === null || secao.nomeCategoria === abaAtiva)
      .filter((secao) => secao.produtos.length > 0);
  }, [abaAtiva, produtosAgrupados, termo]);

  function abrirProduto(produto) {
    setIngredientes([]);
    setAvisoIngredientes('');
    setCarregandoIngredientes(true);
    setPersonalizacoes([]);
    setAvisoPersonalizacoes('');
    setCarregandoPersonalizacoes(true);
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

          <AbasCategoria categorias={categorias} abaAtiva={abaAtiva} onSelecionar={setAbaAtiva} />

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
          personalizacoesDisponiveis={personalizacoes}
          carregandoPersonalizacoes={carregandoPersonalizacoes}
          avisoPersonalizacoes={avisoPersonalizacoes}
          onAdicionar={adicionarProduto}
          onFechar={fecharProduto}
        />
      )}
    </div>
  );
}
