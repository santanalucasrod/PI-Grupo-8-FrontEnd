import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import FooterListarProdutos from './FooterListarProdutos';
import ImagemProduto from '../../assets/img-cafe.png';
import ListaCategorias from './ListaCategorias';
import ModalProduto from '../Modais/ModalProduto';
import ModalExcluir from '../Modais/ModalExcluir';
import { authHeader } from '../../utils/authHeader';
import { api } from '../../providers/axiosClient';
import Pesquisa from '../Pesquisa/Pesquisa';
import AbasCategoria from '../Cardapio/AbasCategoria';
import { buscarProdutosAgrupados, resolverImagemProduto } from '../../pages/Cardapio/cardapioApi';
import { normalizarTexto } from '../../utils/pesquisa';
import styles from './TelaListarProdutos.module.css';

function mapearProduto(produto, nomeCategoria) {
  return {
    id: produto.id,
    nome: produto.nome,
    preco: Number(produto.precoUnidade).toFixed(2).replace('.', ','),
    descricao: produto.descricao,
    categoriaNome: produto.categoria?.nome || nomeCategoria,
    imagem: resolverImagemProduto(produto.pathFt) || ImagemProduto,
  };
}

export default function TelaListarProdutos() {
  const navigate = useNavigate();

  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [mostrarModalExcluir, setMostrarModalExcluir] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExcluir, setErroExcluir] = useState(null);

  const [produtosAgrupados, setProdutosAgrupados] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [termo, setTermo] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState(null);

  const buscarProdutos = useCallback(async (signal) => {
    try {
      const dados = await buscarProdutosAgrupados(signal);
      setProdutosAgrupados(dados);
      setErro(null);
    } catch (err) {
      if (err?.code !== 'ERR_CANCELED') {
        setErro('Não foi possível carregar os produtos. Tente novamente mais tarde.');
      }
    } finally {
      if (!signal?.aborted) setCarregando(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const primeiraCarga = setTimeout(() => buscarProdutos(controller.signal), 0);
    return () => {
      clearTimeout(primeiraCarga);
      controller.abort();
    };
  }, [buscarProdutos]);

  const handleCardClick = (produto) => {
    setProdutoSelecionado(produto);
  };

  const handleCloseModalProduto = () => {
    setProdutoSelecionado(null);
  };

  const handleExcluirClick = () => {
    setErroExcluir(null);
    setMostrarModalExcluir(true);
  };

  const handleConfirmarExcluir = async () => {
    if (!produtoSelecionado) return;

    try {
      setExcluindo(true);
      setErroExcluir(null);

      await api.delete(`/produtos/${produtoSelecionado.id}`, { headers: authHeader() });

      setMostrarModalExcluir(false);
      setProdutoSelecionado(null);

      setCategoriaAtiva(null);
      setCarregando(true);
      await buscarProdutos();
    } catch (err) {
      setErroExcluir(err.response?.data?.message || 'Não foi possível excluir o produto. Tente novamente.');
    } finally {
      setExcluindo(false);
    }
  };

  const handleCancelarExcluir = () => {
    setMostrarModalExcluir(false);
    setErroExcluir(null);
  };

  const handleEditarClick = () => {
    navigate(`/produtos/editar/${produtoSelecionado.id}`);
  };

  const categorias = Object.keys(produtosAgrupados)
    .filter((nome) => Array.isArray(produtosAgrupados[nome]) && produtosAgrupados[nome].length > 0)
    .sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const categoriasFiltradas = categorias
    .filter((nome) => categoriaAtiva === null || nome === categoriaAtiva)
    .map((nome) => [nome, produtosAgrupados[nome].filter((produto) =>
      normalizarTexto(produto.nome).includes(normalizarTexto(termo))
    )])
    .filter(([, produtos]) => produtos.length > 0);

  return (
    <div className={styles.pagina}>

      <FooterListarProdutos onClickAdd={() => navigate('/produtos/cadastro')} />

      <main className={styles.main}>
        <section className={styles.conteudo}>
          <div className={styles.cabecalho}>
            <div>
              <p className={styles.eyebrow}>Gerenciamento</p>
              <h2 className={styles.titulo}>Produtos</h2>
            </div>
            <Pesquisa valor={termo} aoPesquisar={setTermo} placeholder="Pesquisar produto" />
          </div>
          <AbasCategoria categorias={categorias} abaAtiva={categoriaAtiva} onSelecionar={setCategoriaAtiva} />
          <div aria-live="polite">
            {carregando && (
              <p className={styles.mensagem}>Carregando produtos...</p>
            )}

            {!carregando && erro && (
              <p className={styles.erro}>{erro}</p>
            )}

            {!carregando && !erro && categoriasFiltradas.length === 0 && (
              <p className={styles.mensagem}>{termo.trim() || categoriaAtiva !== null
                ? 'Nenhum produto encontrado para esta pesquisa e categoria.'
                : 'Nenhum produto cadastrado.'}</p>
            )}

            {!carregando && !erro && categoriasFiltradas.map(([nomeCategoria, produtos]) => (
              <ListaCategorias
                key={nomeCategoria}
                titulo={nomeCategoria}
                produtos={produtos.map((produto) => mapearProduto(produto, nomeCategoria))}
                onProductClick={handleCardClick}
              />
            ))}
          </div>
        </section>
      </main>

      {produtoSelecionado && !mostrarModalExcluir && (
        <ModalProduto
          nome_produto={produtoSelecionado.nome}
          valor1={`R$${produtoSelecionado.preco}`}
          chave1="Preço"
          chave="Categoria"
          valor={produtoSelecionado.categoriaNome}
          label="Descrição"
          descricao={produtoSelecionado.descricao}
          redButton="Excluir"
          whiteButton="Editar"
          onClose={handleCloseModalProduto}
          onExcluir={handleExcluirClick}
          onEditar={handleEditarClick}
          imagem={produtoSelecionado.imagem}
        />
      )}

      {mostrarModalExcluir && (
        <ModalExcluir
          titulo={
            erroExcluir
              ? erroExcluir
              : `Você deseja mesmo excluir ${produtoSelecionado?.nome.toLowerCase()}?`
          }
          redButton={excluindo ? 'Excluindo...' : 'Excluir'}
          whiteButton="Voltar"
          onConfirm={excluindo ? undefined : handleConfirmarExcluir}
          onCancel={handleCancelarExcluir}
        />
      )}
    </div>
  );
}
