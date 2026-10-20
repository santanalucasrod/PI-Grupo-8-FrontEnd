import styles from './CardProduto.module.css';
import ImagemProduto from '../ImagemProduto';

export default function CardProduto({ id, pathFt, nome, preco, onClick }) {
  return (
    <button type="button" id={`produto-${id}`} className={styles.card} onClick={onClick}>
      <div className={styles.container_img}>
        <ImagemProduto produtoId={id} pathFt={pathFt} alt={nome} />
      </div>
      <p className={styles.nome}>{nome}</p>
      <p className={styles.preco}>R${preco}</p>
    </button>
  );
}
