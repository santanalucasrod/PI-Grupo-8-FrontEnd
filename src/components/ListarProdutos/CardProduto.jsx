import styles from './CardProduto.module.css';
import ImagemPadrao from '../../assets/img-cafe.png';

export default function CardProduto({ imagem, nome, preco, selecionado, onClick }) {
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.container_img}>
        <img
          src={imagem || ImagemPadrao}
          alt={nome}
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = ImagemPadrao; }}
        />
      </div>
      <p className={styles.nome}>{nome}</p>
      <p className={styles.preco}>R${preco}</p>
    </div>
  );
}
