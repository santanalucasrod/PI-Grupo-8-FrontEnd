import styles from './HeaderListarProdutos.module.css';
import setaBranca from '../../assets/seta-esquerda-branca.png'
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HeaderListarProdutos(props){
 const [escondido, setEscondido] = useState(false);
  const [ultimoScroll, setUltimoScroll] = useState(0);
  const navigate = useNavigate();

  const handleVoltar = () => {
    navigate('/dashboard');
  };

  useEffect(() => {
    const controlarScroll = () => {
      const scrollAtual = window.scrollY;

      if (scrollAtual > ultimoScroll && scrollAtual > 50) {
        setEscondido(true);
      } else {
        setEscondido(false);
      }

      setUltimoScroll(scrollAtual);
    };

    window.addEventListener('scroll', controlarScroll);

    return () => {
      window.removeEventListener('scroll', controlarScroll);
    };
  }, [ultimoScroll]);

  return (
    <header className={`${styles.header} ${escondido ? styles.oculto : ''}`}>
      <img src={setaBranca} alt="seta voltar" onClick={handleVoltar} style={{ cursor: 'pointer' }} />
      <h1 className={styles.titulo}>Produtos</h1>
    </header>
  );
}