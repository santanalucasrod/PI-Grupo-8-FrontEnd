import styles from './Footer.module.css';

import carrinho from '../../assets/carrinho.png';

export default function Footer({ onCadastrar, text = "Cadastrar", disabled = false }) {
  return (
    <footer className={styles.footer}>
      <button className={styles.button} onClick={onCadastrar} disabled={disabled}>
        <img src={carrinho} alt="Carrinho" className={styles.icon} />
        {text}
      </button>
    </footer>
  );
}
