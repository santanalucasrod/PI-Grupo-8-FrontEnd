import { useRef } from 'react';
import styles from './ImageUpload.module.css';

export default function ImageUpload({ imageSrc, title = "Cadastrar produtos", onFileSelect }) {
  const inputRef = useRef(null);

  const handleClick = () => {
    if (onFileSelect) inputRef.current?.click();
  };

  const handleChange = (e) => {
    const arquivo = e.target.files?.[0];
    if (arquivo && onFileSelect) {
      onFileSelect(arquivo);
    }
    e.target.value = ''; // permite escolher o mesmo arquivo de novo depois, se precisar
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.uploadArea}>
        <div className={styles.imageWrapper}>
          {imageSrc ? (
            <img src={imageSrc} alt="Produto" className={styles.image} />
          ) : (
            <div className={styles.placeholder}>
              {/* Fallback space if no image */}
            </div>
          )}
        </div>

        {onFileSelect && (
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleChange}
          />
        )}

        <button className={styles.btnNovaFoto} type="button" onClick={handleClick}>Nova foto</button>
      </div>
    </div>
  );
}
