import { useEffect, useRef, useState } from 'react';
import styles from './ThemeToggle.module.css';

const CHAVE_TEMA = 'kentocafe_tema';

function preferenciaSalva() {
  try {
    const tema = localStorage.getItem(CHAVE_TEMA);
    return tema === 'dark' || tema === 'light' ? tema : null;
  } catch {
    return null;
  }
}

export default function ThemeToggle() {
  const [tema, setTema] = useState(() => document.documentElement.dataset.theme);
  const preferencia = useRef(preferenciaSalva());

  useEffect(() => {
    const sistema = window.matchMedia('(prefers-color-scheme: dark)');
    function atualizar() {
      const novoTema = preferencia.current || (sistema.matches ? 'dark' : 'light');
      document.documentElement.dataset.theme = novoTema;
      setTema(novoTema);
    }
    function aoMudarStorage(evento) {
      if (evento.key !== CHAVE_TEMA && evento.key !== null) return;
      preferencia.current = preferenciaSalva();
      atualizar();
    }
    sistema.addEventListener('change', atualizar);
    window.addEventListener('storage', aoMudarStorage);
    return () => {
      sistema.removeEventListener('change', atualizar);
      window.removeEventListener('storage', aoMudarStorage);
    };
  }, []);

  function alternarTema() {
    const novoTema = tema === 'dark' ? 'light' : 'dark';
    preferencia.current = novoTema;
    document.documentElement.dataset.theme = novoTema;
    setTema(novoTema);
    try {
      localStorage.setItem(CHAVE_TEMA, novoTema);
    } catch {
      // Mantém a escolha nesta sessão se o armazenamento estiver bloqueado.
    }
  }

  return (
    <button
      type="button"
      className={styles.controle}
      onClick={alternarTema}
      aria-label="Modo escuro"
      aria-pressed={tema === 'dark'}
      title={tema === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        {tema === 'dark' ? (
          <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></>
        ) : <path d="M20.5 14A9 9 0 0 1 10 3.5 9 9 0 1 0 20.5 14Z" />}
      </svg>
    </button>
  );
}
