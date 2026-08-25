import { useEffect, useRef, useState } from 'react';
import styles from './ModalCheckout.module.css';

export default function ModalNomeCliente({ onConcluir, onFechar }) {
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState('');
  const inputRef = useRef(null);
  const painelRef = useRef(null);

  useEffect(() => {
    const elementoAnterior = document.activeElement;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    inputRef.current?.focus();

    function aoPressionarTecla(evento) {
      if (evento.key === 'Escape') onFechar();
      if (evento.key !== 'Tab') return;

      const focaveis = painelRef.current?.querySelectorAll('input, button:not(:disabled)');
      if (!focaveis?.length) return;
      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];

      if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primeiro.focus();
      }
    }

    document.addEventListener('keydown', aoPressionarTecla);
    return () => {
      document.removeEventListener('keydown', aoPressionarTecla);
      document.body.style.overflow = overflowAnterior;
      elementoAnterior?.focus?.();
    };
  }, [onFechar]);

  function handleConcluir(evento) {
    evento.preventDefault();
    if (!nome.trim()) {
      setErro('Informe o nome do cliente.');
      inputRef.current?.focus();
      return;
    }
    onConcluir(nome.trim());
  }

  return (
    <div className={styles.overlay}>
      <div ref={painelRef} className={styles.painel} role="dialog" aria-modal="true" aria-labelledby="modal-nome-titulo">
        <h2 id="modal-nome-titulo" className={styles.titulo}>Insira o nome do cliente</h2>

        <form className={styles.formulario} onSubmit={handleConcluir} noValidate>
          <input
            ref={inputRef}
            className={styles.input}
            type="text"
            value={nome}
            onChange={(evento) => {
              setNome(evento.target.value);
              if (erro) setErro('');
            }}
            aria-label="Nome do cliente"
            aria-invalid={Boolean(erro)}
            aria-describedby={erro ? 'modal-nome-erro' : undefined}
            autoComplete="name"
          />

          {erro && <p id="modal-nome-erro" className={styles.erro}>{erro}</p>}

          <button type="submit" className={styles.botao}>Concluir</button>
        </form>
      </div>
    </div>
  );
}
