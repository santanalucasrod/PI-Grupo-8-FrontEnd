import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Stepper from './Stepper';
import { buscarProdutoPorId, buscarPersonalizacoesPorProduto, API_BASE_URL } from './cardapioApi';
import { useCart } from '../../providers/CartContext';
import ImagemProduto from '../../assets/img-cafe.png';
import setaEsquerda from '../../assets/seta-esquerda.png';
import styles from './TelaProdutoDetalhe.module.css';

const TAMANHOS = ['200mL', '300mL', '400mL'];
const TAMANHO_PADRAO_INDICE = 1;

function formatarPreco(valor) {
  return Number(valor || 0).toFixed(2).replace('.', ',');
}

export default function TelaProdutoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { adicionarItem } = useCart();
  const adicionandoRef = useRef(false);

  const [produto, setProduto] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const [indiceTamanho, setIndiceTamanho] = useState(TAMANHO_PADRAO_INDICE);
  const [quantidade, setQuantidade] = useState(1);
  const [personalizacoes, setPersonalizacoes] = useState([]);

  useEffect(() => {
    const controller = new AbortController();

    async function carregar() {
      try {
        setCarregando(true);
        setErro(null);
        const [dadosProduto, nomesPersonalizacao] = await Promise.all([
          buscarProdutoPorId(id, controller.signal),
          buscarPersonalizacoesPorProduto(id, controller.signal),
        ]);
        setProduto(dadosProduto);
        setPersonalizacoes(nomesPersonalizacao.map((nome) => ({ nome, quantidade: 1 })));
      } catch (err) {
        if (err?.code === 'ERR_CANCELED') return;
        setErro('Não foi possível carregar o produto. Verifique se a API está rodando em ' + API_BASE_URL);
      } finally {
        if (!controller.signal.aborted) setCarregando(false);
      }
    }
    carregar();

    return () => controller.abort();
  }, [id]);

  function alterarPersonalizacao(indice, delta) {
    setPersonalizacoes((atual) =>
      atual.map((item, i) =>
        i === indice ? { ...item, quantidade: Math.max(0, item.quantidade + delta) } : item
      )
    );
  }

  function handleAdicionar() {
    if (!produto || adicionandoRef.current) return;
    adicionandoRef.current = true;

    adicionarItem({
      produtoId: produto.id,
      nome: produto.nome,
      imagem: produto.pathFt ? `${API_BASE_URL}/imagens/${produto.pathFt}` : ImagemProduto,
      precoUnidade: Number(produto.precoUnidade || 0),
      quantidade,
      tamanho: TAMANHOS[indiceTamanho],
      personalizacoes: personalizacoes.filter((item) => item.quantidade > 0),
    });

    navigate('/cardapio');
  }

  if (carregando) {
    return <p className={styles.mensagem}>Carregando produto...</p>;
  }

  if (erro || !produto) {
    return <p className={styles.mensagemErro}>{erro || 'Produto não encontrado.'}</p>;
  }

  const imagem = produto.pathFt ? `${API_BASE_URL}/imagens/${produto.pathFt}` : ImagemProduto;

  return (
    <div className={styles.pagina}>
      <div className={styles.topo}>
        <button
          type="button"
          className={styles.voltar}
          onClick={() => navigate('/cardapio')}
          aria-label="Voltar ao cardápio"
        >
          <img src={setaEsquerda} alt="" />
        </button>
      </div>

      <div className={styles.imagemContainer}>
        <img
          src={imagem}
          alt={produto.nome}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = ImagemProduto;
          }}
        />
      </div>

      <div className={styles.conteudo}>
        <h1 className={styles.nome}>{produto.nome}</h1>

        <div className={styles.linha}>
          <span className={styles.chave}>Categoria</span>
          <span className={styles.valor}>{produto.categoria?.nome || '-'}</span>
        </div>

        <div className={styles.linha}>
          <span className={styles.chave}>Preço</span>
          <span className={styles.valor}>R$ {formatarPreco(produto.precoUnidade)}</span>
        </div>

        <div className={styles.descricaoBloco}>
          <span className={styles.chave}>Descrição</span>
          <p className={styles.descricao}>{produto.descricao || 'Sem descrição.'}</p>
        </div>

        <div className={styles.linha}>
          <span className={styles.chave}>Tamanho</span>
          <Stepper
            valor={TAMANHOS[indiceTamanho]}
            podeDecrementar={indiceTamanho > 0}
            podeIncrementar={indiceTamanho < TAMANHOS.length - 1}
            onDecrementar={() => setIndiceTamanho((atual) => Math.max(0, atual - 1))}
            onIncrementar={() =>
              setIndiceTamanho((atual) => Math.min(TAMANHOS.length - 1, atual + 1))
            }
          />
        </div>

        <div className={styles.linha}>
          <span className={styles.chave}>Quantidade</span>
          <Stepper
            valor={quantidade}
            min={1}
            onDecrementar={() => setQuantidade((atual) => Math.max(1, atual - 1))}
            onIncrementar={() => setQuantidade((atual) => atual + 1)}
          />
        </div>

        <div className={styles.personalizacaoBloco}>
          <h2 className={styles.subtitulo}>Personalização</h2>
          {personalizacoes.map((item, indice) => (
            <div key={item.nome} className={styles.linha}>
              <span className={styles.chave}>{item.nome}</span>
              <Stepper
                valor={item.quantidade}
                min={0}
                onDecrementar={() => alterarPersonalizacao(indice, -1)}
                onIncrementar={() => alterarPersonalizacao(indice, 1)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.footer}>
        <button type="button" className={styles.adicionar} onClick={handleAdicionar}>
          Adicionar
        </button>
      </div>
    </div>
  );
}
