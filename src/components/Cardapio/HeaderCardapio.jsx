import styles from './HeaderCardapio.module.css';
import Pesquisa from '../Pesquisa/Pesquisa';

export default function HeaderCardapio({ termo, aoPesquisar }) {
  return (
    <header className={styles.header}>
      <div className={styles.buscaWrapper}>
        <Pesquisa valor={termo} aoPesquisar={aoPesquisar} placeholder="Pesquisar café" />
      </div>
    </header>
  );
}
