import styles from './Modal.module.css';

export default function TituloModal(props){
    return(
      <div className={styles.titulo_modal}>
        <p>{props.children}</p>
      </div>  
    );
}