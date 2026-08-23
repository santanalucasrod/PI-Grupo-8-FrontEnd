import styles from './Modal.module.css';

export default function TextAreaModal(props){
    return(
        <div className={styles.txta_standard}>
            <label>{props.label}</label>
            <textarea name="text_area" rows="5" defaultValue={props.valor || ''} readOnly></textarea>
        </div>
    )
}
