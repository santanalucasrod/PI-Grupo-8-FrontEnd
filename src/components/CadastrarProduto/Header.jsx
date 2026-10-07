import styles from './Header.module.css';
import setaBranca from '../../assets/seta-esquerda-branca.png';

export default function Header({ title, onCancel }) {
  return (
    <header className={styles.header}>
      <div className={styles.conteudo}>
        <button type="button" className={styles.backButton} onClick={onCancel} aria-label="Voltar">
          <img src={setaBranca} alt="" />
        </button>
        <h1 className={styles.title}>{title}</h1>
      </div>
    </header>
  );
}
