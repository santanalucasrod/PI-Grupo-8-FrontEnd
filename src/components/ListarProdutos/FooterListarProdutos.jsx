import styles from './FooterListarProdutos.module.css';
import adicionar from '../../assets/adicionar.png';

export default function FooterListarProdutos(props){
    return (
        <div className={styles.footer_grupo}>
            <button className={styles.botao_adicionar} onClick={props.onClickAdd}>
                <img src={adicionar} alt="Ícone Adicionar" />
            </button>
            <span className={styles.texto_adicionar}>Adicionar Produto</span>
        </div>
    );
}