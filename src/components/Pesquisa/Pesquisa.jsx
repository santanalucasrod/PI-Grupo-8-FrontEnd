import styles from './Pesquisa.module.css';
import pesquisarIcone from '../../assets/pesquisarIcon.png';

function Pesquisa({ valor, aoPesquisar, placeholder = 'Pesquisar nome' }) {
    return (
        <label className={styles.container}>
            <span className={styles.icone} aria-hidden="true">  <img src={pesquisarIcone} alt="" className={styles.imagem}/></span>
            <input
                className={styles.input}
                type="search"
                value={valor}
                onChange={(evento) => aoPesquisar(evento.target.value)}
                placeholder={placeholder}
                aria-label={placeholder}
            />
        </label>
    );
}

export default Pesquisa;