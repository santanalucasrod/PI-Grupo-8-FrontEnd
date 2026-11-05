import styles from './GreenButton.module.css';

export default function GreenButton(props){
    return(
      <button type="button" className={styles.btn1} onClick={props.onClick} disabled={props.disabled}>
        <span>{props.children}</span>
      </button>
    );
}
