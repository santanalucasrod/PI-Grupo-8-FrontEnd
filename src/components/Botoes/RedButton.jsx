import styles from './RedButton.module.css';
import iconeLixo from '../../assets/lixo.png';

export default function RedButton(props){
    return(
      <div className={styles.btn2} onClick={props.onClick}>
        <img src={iconeLixo} alt="lixeira" />
        <p>{props.children}</p>
      </div>  
    );
}