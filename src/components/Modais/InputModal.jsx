import styles from './Modal.module.css';

function InputModal(props){
    return(
        <div className={styles.ipt_standard}>
            <label>{props.titulo}</label>
            <input type="text"></input>
        </div>
    )
}

export default InputModal; 