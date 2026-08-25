import styles from './AbasCategoria.module.css';

const ABAS = [
  { chave: 'todos', rotulo: 'Todos' },
  { chave: 'quentes', rotulo: 'Quentes' },
  { chave: 'gelados', rotulo: 'Gelados' },
];

export default function AbasCategoria({ abaAtiva, onSelecionar }) {
  return (
    <nav className={styles.abas} aria-label="Filtro de categorias">
      {ABAS.map((aba) => (
        <button
          key={aba.chave}
          type="button"
          className={`${styles.aba} ${abaAtiva === aba.chave ? styles.abaAtiva : ''}`}
          onClick={() => onSelecionar(aba.chave)}
        >
          {aba.rotulo}
        </button>
      ))}
    </nav>
  );
}
