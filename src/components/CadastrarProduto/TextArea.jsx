import styles from './TextArea.module.css';
import { useId } from 'react';

export default function TextArea({ label, value, onChange, placeholder, rows = 3, maxLength, error }) {
  const id = useId();
  return (
    <div className={styles.container}>
      <label className={styles.label} htmlFor={id}>{label}</label>
      <textarea
        id={id}
        aria-invalid={Boolean(error)}
        className={`${styles.textarea} ${error ? styles.textareaError : ''}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
      />
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}
