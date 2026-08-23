import styles from './Header.module.css';
import setaBranca from '../../assets/seta-esquerda-branca.png';

export default function Header({ title, onCancel }) {
  return (
    <header className={styles.header}>
      <button className={styles.backButton} onClick={onCancel}>
        <img src={setaBranca} alt="Voltar" />
      </button>
      <h1 className={styles.title}>{title}</h1>
    </header>
  );
}
