import styles from './ModalAdicionar.module.css';
import { useId, useState } from 'react';
import WhiteButton from '../Botoes/WhiteButton';
import GreenButton from '../Botoes/GreenButton';

export default function ModalAdicionar({ isOpen, title, onClose, onAdd, erro, salvando, maxLength }) {
  const id = useId();
  const [inputValue, setInputValue] = useState('');

  if (!isOpen) return null;

  const handleAdd = () => {
    if (salvando || !inputValue.trim()) return;
    onAdd(inputValue);
  };

  const handleClose = () => {
    if (salvando) return;
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby={`${id}-titulo`}>
        <h2 id={`${id}-titulo`} className={styles.title}>{title}</h2>
        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor={id}>Nome</label>
          <input
            id={id}
            autoFocus
            maxLength={maxLength}
            disabled={salvando}
            type="text"
            className={styles.input}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          {erro && <span className={styles.erro}>{erro}</span>}
        </div>
        <div className={styles.buttons}>
          <WhiteButton onClick={handleClose} disabled={salvando}>Voltar</WhiteButton>
          <GreenButton onClick={handleAdd} disabled={salvando || !inputValue.trim()}>{salvando ? 'Salvando...' : 'Adicionar'}</GreenButton>
        </div>
      </div>
    </div>
  );
}
