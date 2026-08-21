import styles from "./Header.module.css";
import { Link } from "react-router-dom";

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <div className={styles.logoCircle}>K</div>
        <h1 className={styles.companyName}>Kento Café</h1>
      </div>

      <nav className={styles.navigation}>
        <Link to="/cadastro" className={styles.link}>
          Cadastro
        </Link>

        <Link to="/login" className={styles.link}>
          Login
        </Link>

        <Link to="/dashboard" className={styles.link}>
          Dashboard
        </Link>

        <Link to="/pedidos" className={styles.link}>
          Pedidos
        </Link>
      </nav>
    </header>
  );
}

export default Header;
