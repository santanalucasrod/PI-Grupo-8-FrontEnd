import styles from './FooterCardapio.module.css';
import carrinho from '../../assets/carrinho.png';

function formatarPreco(valor) {
  return valor.toFixed(2).replace('.', ',');
}

export default function FooterCardapio({ total, onFinalizar }) {
  return (
    <div className={styles.footer}>
      <span className={styles.total}>R$ {formatarPreco(total)}</span>
      <button type="button" className={styles.botaoFinalizar} onClick={onFinalizar}>
        <img src={carrinho} alt="" />
        Finalizar
      </button>
    </div>
  );
}
