import styles from './Stepper.module.css';

export default function Stepper({
  valor,
  onDecrementar,
  onIncrementar,
  min = 0,
  podeDecrementar,
  podeIncrementar = true,
}) {
  const decrementoDesabilitado =
    podeDecrementar === false ||
    (podeDecrementar == null && typeof valor === 'number' && valor <= min);

  return (
    <div className={styles.stepper}>
      <button
        type="button"
        className={styles.botao}
        onClick={onDecrementar}
        disabled={decrementoDesabilitado}
        aria-label="Diminuir"
      >
        −
      </button>
      <span className={styles.valor} aria-live="polite">{valor}</span>
      <button
        type="button"
        className={styles.botao}
        onClick={onIncrementar}
        disabled={!podeIncrementar}
        aria-label="Aumentar"
      >
        +
      </button>
    </div>
  );
}
