import styles from './Input.module.css';
import { useId } from 'react';

export default function Input({ label, value, onChange, placeholder, type = 'text', maxLength, max, min, step, error }) {
  const id = useId();
  return (
    <div className={styles.container}>
      <label className={styles.label} htmlFor={id}>{label}</label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
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
