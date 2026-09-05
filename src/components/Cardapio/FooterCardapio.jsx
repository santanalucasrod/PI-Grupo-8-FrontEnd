import styles from './FooterCardapio.module.css';
import carrinho from '../../assets/carrinho.png';

function formatarPreco(valor) {
  return valor.toFixed(2).replace('.', ',');
}

export default function FooterCardapio({ total, quantidadeItens, onFinalizar }) {
  return (
    <div className={styles.footer}>
      <div className={styles.resumo}>
        <span className={styles.rotulo}>Total da sacola</span>
        <strong className={styles.total}>R$ {formatarPreco(total)}</strong>
      </div>
      <button type="button" className={styles.botaoFinalizar} onClick={onFinalizar}>
        <img src={carrinho} alt="" />
        Sacola{quantidadeItens > 0 ? ` (${quantidadeItens})` : ''}
      </button>
    </div>
  );
}
