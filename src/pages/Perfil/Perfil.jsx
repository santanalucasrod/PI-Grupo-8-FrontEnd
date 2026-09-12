import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider.jsx';
import styles from './Perfil.module.css';

function Perfil() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <h2 className={styles.titulo}>Perfil</h2>
        <button type="button" className={styles.botao} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </main>
  );
}

export default Perfil;
