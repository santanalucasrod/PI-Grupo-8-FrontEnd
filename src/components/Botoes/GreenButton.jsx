import styles from './GreenButton.module.css';

export default function GreenButton(props){
    return(
      <div className={styles.btn1} onClick={props.onClick}>
        <p>{props.children}</p>
      </div>  
    );
}