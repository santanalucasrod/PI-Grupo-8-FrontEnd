import styles from './WhiteButton.module.css';

export default function WhiteButton(props){
    return(
      <button type="button" className={styles.btn} onClick={props.onClick} disabled={props.disabled}>
        <span>{props.children}</span>
      </button>
    );
}


