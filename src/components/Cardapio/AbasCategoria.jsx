import styles from './AbasCategoria.module.css';

export default function AbasCategoria({ categorias, abaAtiva, onSelecionar }) {
  return (
    <nav className={styles.abas} aria-label="Filtrar produtos por categoria">
      <button
        type="button"
        className={`${styles.aba} ${abaAtiva === null ? styles.abaAtiva : ''}`}
        onClick={() => onSelecionar(null)}
        aria-pressed={abaAtiva === null}
      >
        Todos
      </button>
      {categorias.map((categoria) => (
        <button
          key={categoria}
          type="button"
          className={`${styles.aba} ${abaAtiva === categoria ? styles.abaAtiva : ''}`}
          onClick={() => onSelecionar(categoria)}
          aria-pressed={abaAtiva === categoria}
        >
          {categoria}
        </button>
      ))}
    </nav>
  );
}
