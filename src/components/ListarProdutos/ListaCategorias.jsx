import { useRef } from 'react';
import CardProduto from './CardProduto';
import styles from './ListaCategorias.module.css';

export default function ListaCategorias({ titulo, produtos, onProductClick }) {
  const trilhoRef = useRef(null);
  const rolar = (direcao) => {
    if (trilhoRef.current) {
      const quantidadeRolagem = direcao === 'esquerda' ? -300 : 300;
      
      trilhoRef.current.scrollBy({
        left: quantidadeRolagem, 
        behavior: 'smooth' 
      });
    }
  };

  return (
    <div className={styles.categoria_container}>
      <h2 className={styles.titulo_categoria}>{titulo}</h2>
      
      <div className={styles.wrapper_trilho}>
        
        <button className={`${styles.seta} ${styles.seta_esquerda}`} onClick={() => rolar('esquerda')}>
          &#10094;
        </button>

        <div className={styles.trilho_produtos} ref={trilhoRef}>
          {produtos.map((produto) => (
            <CardProduto 
              key={produto.id}
              imagem={produto.imagem}
              nome={produto.nome}
              preco={produto.preco}
              selecionado={produto.selecionado}
              onClick={() => onProductClick && onProductClick(produto)}
            />
          ))}
        </div>
        <button className={`${styles.seta} ${styles.seta_direita}`} onClick={() => rolar('direita')}>
          &#10095;
        </button>

      </div>
    </div>
  );
}
