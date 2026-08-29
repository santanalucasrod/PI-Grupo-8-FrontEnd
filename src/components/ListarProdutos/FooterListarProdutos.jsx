import styles from './FooterListarProdutos.module.css';
import adicionar from '../../assets/adicionar.png';

export default function FooterListarProdutos({ onClickAdd, texto = 'Adicionar Produto' }) {
    return (
        <div className={styles.footer_grupo}>
            <button className={styles.botao_adicionar} onClick={onClickAdd}>
                <img src={adicionar} alt="Ícone Adicionar" />
            </button>
            <span className={styles.texto_adicionar}>{texto}</span>
        </div>
    );
}