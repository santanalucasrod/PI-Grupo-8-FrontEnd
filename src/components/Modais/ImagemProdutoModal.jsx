import styles from './Modal.module.css';
import img from '../../assets/img-cafe.png'

export default function ImagemProdutoModal(props){
    return(
        <div className={styles.imagem_modal}>
            <img
                src={props.imagem || img}
                alt="Imagem do produto"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = img; }}
            />
        </div>
    );
}