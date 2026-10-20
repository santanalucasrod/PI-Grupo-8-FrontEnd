import styles from './Modal.module.css';
import ImagemProduto from '../ImagemProduto';

export default function ImagemProdutoModal(props){
    return(
        <div className={styles.imagem_modal}>
            <ImagemProduto produtoId={props.produtoId} pathFt={props.pathFt} alt={props.nome} />
        </div>
    );
}
