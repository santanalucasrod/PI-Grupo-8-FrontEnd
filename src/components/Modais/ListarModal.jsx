import styles from './Modal.module.css';

export default function ListarModal(props){
    return(
        <div className={styles.listar_modal}>
            <p>{props.chave}</p>
            <p>{props.valor}</p>
        </div>
    );
}