import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderListarProdutos from './HeaderListarProdutos';
import FooterListarProdutos from './FooterListarProdutos';
import ImagemProduto from '../../assets/img-cafe.png';
import ListaCategorias from './ListaCategorias';
import ModalProduto from '../Modais/ModalProduto';
import ModalExcluir from '../Modais/ModalExcluir';
import { authHeader } from '../../utils/authHeader';

const API_BASE_URL = 'http://localhost:8080';

function mapearProduto(produto) {
  return {
    id: produto.id,
    nome: produto.nome,
    preco: Number(produto.precoUnidade).toFixed(2).replace('.', ','),
    descricao: produto.descricao,
    categoriaNome: produto.categoria?.nome,
    imagem: produto.pathFt
      ? `${API_BASE_URL}/imagens/${produto.pathFt}`
      : ImagemProduto,
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

  const buscarProdutos = useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);

      const resposta = await fetch(`${API_BASE_URL}/produtos/agrupados`, {
        method: 'GET',
        headers: { accept: '*/*', ...authHeader() },
      });

      if (!resposta.ok) {
        throw new Error(`Erro ${resposta.status} ao buscar produtos`);
      }

      const dados = await resposta.json();
      setProdutosAgrupados(dados);
    } catch (err) {
      console.error('Erro ao buscar produtos agrupados:', err);
      setErro('Não foi possível carregar os produtos. Verifique se a API está rodando em ' + API_BASE_URL);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    buscarProdutos();
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

      const resposta = await fetch(`${API_BASE_URL}/produtos/${produtoSelecionado.id}`, {
        method: 'DELETE',
        headers: { accept: '*/*', ...authHeader() },
      });

      if (!resposta.ok) {
        let corpo = null;
        try { corpo = await resposta.json(); } catch (_) {}

        const mensagemBackend = corpo?.message || corpo?.trace || '';
        if (mensagemBackend.includes('foreign key') || mensagemBackend.includes('constraint')) {
          throw new Error('Este produto já foi usado em pedidos e não pode ser excluído.');
        }

        throw new Error(`Erro ${resposta.status} ao excluir produto`);
      }

      setMostrarModalExcluir(false);
      setProdutoSelecionado(null);

      await buscarProdutos();
    } catch (err) {
      console.error('Erro ao excluir produto:', err);
      setErroExcluir(err.message || 'Não foi possível excluir o produto. Tente novamente.');
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

  const categorias = Object.entries(produtosAgrupados);

  return (
    <div>
      <HeaderListarProdutos header_titulo="Produtos" />

      <FooterListarProdutos onClickAdd={() => navigate('/produtos/cadastro')} />

      <div style={{ backgroundColor: '#F9F9F9', minHeight: '100vh', paddingTop: '80px', paddingBottom: '80px' }}>
          {carregando && (
            <p style={{ textAlign: 'center', padding: '2rem' }}>Carregando produtos...</p>
          )}

          {!carregando && erro && (
            <p style={{ textAlign: 'center', padding: '2rem', color: '#B00020' }}>{erro}</p>
          )}

          {!carregando && !erro && categorias.length === 0 && (
            <p style={{ textAlign: 'center', padding: '2rem' }}>Nenhum produto encontrado.</p>
          )}

          {!carregando && !erro && categorias.map(([nomeCategoria, produtos]) => (
            <ListaCategorias
              key={nomeCategoria}
              titulo={nomeCategoria}
              produtos={produtos.map(mapearProduto)}
              onProductClick={handleCardClick}
            />
          ))}
      </div>

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