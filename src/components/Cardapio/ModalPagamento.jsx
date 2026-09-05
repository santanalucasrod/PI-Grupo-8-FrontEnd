import { useEffect, useRef, useState } from 'react';
import modalStyles from './ModalCheckout.module.css';
import styles from './ModalPagamento.module.css';

function formatarPreco(valor) {
  return Number(valor || 0).toFixed(2).replace('.', ',');
}

export default function ModalPagamento({ total, onConfirmar, onPagamentoEfetuado, onCancelar }) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);
  const painelRef = useRef(null);
  const enviandoRef = useRef(false);

  useEffect(() => {
    const elementoAnterior = document.activeElement;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    painelRef.current?.focus();

    function aoPressionarTecla(evento) {
      if (evento.key === 'Escape' && !enviandoRef.current) onCancelar();
      if (evento.key !== 'Tab') return;

      const focaveis = painelRef.current?.querySelectorAll('button:not(:disabled)');
      if (!focaveis?.length) return;
      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];

      if (evento.shiftKey && (document.activeElement === primeiro || document.activeElement === painelRef.current)) {
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
  }, [onCancelar]);

  async function handlePagamentoEfetuado() {
    if (enviandoRef.current) return;
    enviandoRef.current = true;
    let pagamentoConfirmado = false;

    try {
      setEnviando(true);
      setErro(null);
      await onConfirmar();
      pagamentoConfirmado = true;
    } catch (err) {
      setErro(err.message || 'Não foi possível confirmar o pagamento. Tente novamente.');
    } finally {
      enviandoRef.current = false;
      setEnviando(false);
    }

    if (pagamentoConfirmado) onPagamentoEfetuado();
  }

  return (
    <div className={modalStyles.overlay}>
      <div
        ref={painelRef}
        className={`${modalStyles.painel} ${styles.painel}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-pagamento-titulo"
        tabIndex={-1}
      >
        <p id="modal-pagamento-titulo" className={styles.texto}>
          Efetue o pagamento do pedido de <strong>R$ {formatarPreco(total)}</strong>
        </p>

        {erro && <p className={styles.erro}>{erro}</p>}

        <div className={styles.botoes}>
          <button
            type="button"
            className={styles.botaoEscuro}
            onClick={handlePagamentoEfetuado}
            disabled={enviando}
          >
            {enviando ? 'Confirmando...' : 'Pagamento efetuado'}
          </button>
          <button
            type="button"
            className={styles.botaoSalmao}
            onClick={onCancelar}
            disabled={enviando}
          >
            Cancelar pedido
          </button>
        </div>
      </div>
    </div>
  );
}
