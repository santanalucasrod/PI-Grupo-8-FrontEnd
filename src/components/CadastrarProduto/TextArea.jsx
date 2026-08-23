import styles from './TextArea.module.css';

export default function TextArea({ label, value, onChange, placeholder, rows = 3, maxLength, error }) {
  return (
    <div className={styles.container}>
      <label className={styles.label}>{label}</label>
      <textarea
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
