import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../providers/AuthProvider.jsx";
import styles from "./Header.module.css";

const LINKS_GERENTE = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/pedidos", label: "Pedidos" },
  { to: "/produtos", label: "Produtos" },
  { to: "/cardapio", label: "Cardápio" },
  { to: "/categorias", label: "Categorias" },
  { to: "/funcionarios", label: "Funcionários" },
  { to: "/ingredientes", label: "Ingredientes" },
  { to: "/personalizacoes", label: "Personalizações" },
  { to: "/perfil", label: "Perfil" },
];

const LINKS_FUNCIONARIO = [
  { to: "/cardapio", label: "Cardápio" },
  { to: "/pedidos", label: "Pedidos" },
  { to: "/perfil", label: "Perfil" },
];

function Header() {
  const [menuAberto, setMenuAberto] = useState(false);
  const botaoMenuRef = useRef(null);
  const drawerRef = useRef(null);
  const location = useLocation();
  const { isGerente, isAuthenticated } = useAuth();
  const links = isAuthenticated
    ? (isGerente ? LINKS_GERENTE : LINKS_FUNCIONARIO)
    : [{ to: '/login', label: 'Login' }];
  const paginaAtual = links.find((link) => location.pathname === link.to || location.pathname.startsWith(`${link.to}/`));

  useEffect(() => {
    if (!menuAberto) return undefined;

    const botaoMenu = botaoMenuRef.current;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    drawerRef.current?.querySelector('button')?.focus();

    function aoPressionarTecla(evento) {
      if (evento.key === "Escape") setMenuAberto(false);
      if (evento.key !== 'Tab') return;
      const elementos = drawerRef.current?.querySelectorAll('button, a[href]');
      if (!elementos?.length) return;
      const primeiro = elementos[0];
      const ultimo = elementos[elementos.length - 1];
      if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primeiro.focus();
      }
    }
    document.addEventListener("keydown", aoPressionarTecla);
    return () => {
      document.removeEventListener("keydown", aoPressionarTecla);
      document.body.style.overflow = overflowAnterior;
      botaoMenu?.focus();
    };
  }, [menuAberto]);

  return (
    <header className={styles.header}>
      <div className={styles.conteudo}>
        <Link to={isAuthenticated ? (isGerente ? '/dashboard' : '/cardapio') : '/login'} className={styles.logo}>
          <div className={styles.logoCircle} aria-hidden="true">K</div>
          <h1 className={styles.companyName}>Kento Café</h1>
        </Link>

        <span className={styles.paginaAtual}>{paginaAtual?.label}</span>

        <button
          type="button"
          className={styles.botaoMenu}
          ref={botaoMenuRef}
          onClick={() => setMenuAberto(true)}
          aria-label="Abrir menu de navegação"
          aria-expanded={menuAberto}
          aria-controls={menuAberto ? 'menu-navegacao' : undefined}
        >
          <span className={styles.linhaHamburguer} />
          <span className={styles.linhaHamburguer} />
          <span className={styles.linhaHamburguer} />
        </button>
      </div>

      {menuAberto && (
        <div className={styles.overlay} onClick={() => setMenuAberto(false)}>
          <div
            id="menu-navegacao"
            className={styles.drawer}
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
            onClick={(evento) => evento.stopPropagation()}
          >
            <div className={styles.drawerHeader}>
              <span className={styles.drawerTitulo}>Kento Café · Menu</span>
              <button
                type="button"
                className={styles.botaoFechar}
                onClick={() => setMenuAberto(false)}
                aria-label="Fechar menu"
              >
                ×
              </button>
            </div>

            <nav aria-label="Páginas da aplicação" className={styles.navegacao}>
              <ul className={styles.listaLinks}>
                {links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      onClick={() => setMenuAberto(false)}
                      aria-current={paginaAtual?.to === link.to ? 'page' : undefined}
                      className={`${styles.link} ${
                        paginaAtual?.to === link.to ? styles.linkAtivo : ""
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}

              </ul>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
