import ImagemPadrao from '../../assets/img-cafe.png';
import styles from './SecaoProdutos.module.css';

function formatarPreco(valor) {
  return Number(valor || 0).toFixed(2).replace('.', ',');
}

export default function SecaoProdutos({ titulo, produtos, onProdutoClick }) {
  if (produtos.length === 0) return null;

  return (
    <section className={styles.secao}>
      <h2 className={styles.titulo}>{titulo}</h2>
      <div className={styles.grid}>
        {produtos.map((produto) => (
          <button
            key={produto.id}
            type="button"
            className={styles.card}
            onClick={() => onProdutoClick(produto)}
            aria-label={`${produto.nome}, R$ ${formatarPreco(produto.precoUnidade)}`}
          >
            <span className={styles.imagemContainer}>
              <img
                src={produto.imagem || ImagemPadrao}
                alt=""
                onError={(evento) => {
                  evento.currentTarget.onerror = null;
                  evento.currentTarget.src = ImagemPadrao;
                }}
              />
            </span>
            <span className={styles.nome}>{produto.nome}</span>
            <span className={styles.preco}>R${formatarPreco(produto.precoUnidade)}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
