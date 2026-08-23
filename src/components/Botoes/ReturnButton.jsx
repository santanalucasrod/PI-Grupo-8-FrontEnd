import styles from './ReturnButton.module.css';
import iconeSeta from '../../assets/seta-esquerda.png';

export default function ReturnButton(props){
    return(
      <div className={styles.btn3}>
        <img src={iconeSeta} alt="Voltar" onClick={props.voltar}/>
      </div>  
    );
}