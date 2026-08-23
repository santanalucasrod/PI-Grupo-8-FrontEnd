import styles from './WhiteButton.module.css';

export default function WhiteButton(props){
    return(
      <div className={styles.btn} onClick={props.onClick}>
        <p>{props.children}</p>
      </div>  
    );
}


