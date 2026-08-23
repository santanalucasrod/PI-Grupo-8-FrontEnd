import styles from './ModalAdicionar.module.css';
import { useState, useEffect } from 'react';
import WhiteButton from '../Botoes/WhiteButton';
import GreenButton from '../Botoes/GreenButton';

export default function ModalAdicionar({ isOpen, title, onClose, onAdd, erro, salvando }) {
  const [inputValue, setInputValue] = useState('');

  // Limpa o campo sempre que o modal fecha (sucesso ou cancelamento)
  useEffect(() => {
    if (!isOpen) {
      setInputValue('');
    }
  }, [isOpen]);

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
      <div className={styles.modal}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Nome</label>
          <input
            type="text"
            className={styles.input}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          {erro && <span className={styles.erro}>{erro}</span>}
        </div>
        <div className={styles.buttons}>
          <WhiteButton onClick={handleClose}>Voltar</WhiteButton>
          <GreenButton onClick={handleAdd}>{salvando ? 'Salvando...' : 'Adicionar'}</GreenButton>
        </div>
      </div>
    </div>
  );
}
