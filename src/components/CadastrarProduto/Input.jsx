import styles from './Input.module.css';

export default function Input({ label, value, onChange, placeholder, type = 'text', maxLength, max, min, step, error }) {
  return (
    <div className={styles.container}>
      <label className={styles.label}>{label}</label>
      <input
        type={type}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        max={max}
        min={min}
        step={step}
      />
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}
