import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Header.module.css";

const LINKS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/pedidos", label: "Pedidos" },
  { to: "/categorias", label: "Categorias" },
  { to: "/funcionarios", label: "Funcionarios" },
  { to: "/ingredientes", label: "Ingredientes" },
  { to: "/personalizacoes", label: "Personalizações" },
  { to: "/cadastro", label: "Cadastro" },
  { to: "/login", label: "Login" },
];

/**
 * Header com menu hambúrguer.
 *
 * O site é pensado só para tablet e mobile (sem versão desktop), então o menu
 * hambúrguer é usado em qualquer largura de tela — não existe uma barra de
 * navegação horizontal alternativa para telas grandes.
 *
 * Comportamento do painel (drawer):
 *  - No mobile (até 600px de largura): ocupa a tela inteira.
 *  - No tablet (acima de 600px): ocupa uma faixa lateral com menos de 25% da
 *    largura da tela (ver .drawer no Header.module.css), com o restante da
 *    tela escurecido (overlay) e clicável para fechar o menu.
 */
function Header() {
  const [menuAberto, setMenuAberto] = useState(false);
  const location = useLocation();

  // fecha o menu automaticamente ao navegar para outra tela
  useEffect(() => {
    setMenuAberto(false);
  }, [location.pathname]);

  // permite fechar o menu com a tecla Esc
  useEffect(() => {
    function aoPressionarTecla(evento) {
      if (evento.key === "Escape") setMenuAberto(false);
    }
    document.addEventListener("keydown", aoPressionarTecla);
    return () => document.removeEventListener("keydown", aoPressionarTecla);
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <div className={styles.logoCircle}>K</div>
        <h1 className={styles.companyName}>Kento Café</h1>
      </div>

      <button
        type="button"
        className={styles.botaoMenu}
        onClick={() => setMenuAberto(true)}
        aria-label="Abrir menu de navegação"
        aria-expanded={menuAberto}
      >
        <span className={styles.linhaHamburguer} />
        <span className={styles.linhaHamburguer} />
        <span className={styles.linhaHamburguer} />
      </button>

      {menuAberto && (
        <div className={styles.overlay} onClick={() => setMenuAberto(false)}>
          <nav
            className={styles.drawer}
            aria-label="Menu de navegação"
            onClick={(evento) => evento.stopPropagation()}
          >
            <div className={styles.drawerHeader}>
              <span className={styles.drawerTitulo}>Menu</span>
              <button
                type="button"
                className={styles.botaoFechar}
                onClick={() => setMenuAberto(false)}
                aria-label="Fechar menu"
              >
                ×
              </button>
            </div>

            <ul className={styles.listaLinks}>
              {LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={`${styles.link} ${
                      location.pathname === link.to ? styles.linkAtivo : ""
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;