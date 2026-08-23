import styles from './Modal.module.css';
import WhiteButton from '../Botoes/WhiteButton';
import InputModal from './InputModal';
import TituloModal from './TituloModal';
import RedButton from '../Botoes/RedButton';

export default function Modal(props){
    return(
        <div className={styles.shadow_modal}>
            <div className={styles.modal}>
                    <TituloModal>{props.titulo}</TituloModal>
                    <div className={styles.ipt_buttons}>
                        <div className={styles.buttons}>
                            <WhiteButton onClick={props.onCancel}>{props.whiteButton}</WhiteButton>
                            <RedButton onClick={props.onConfirm}>{props.redButton}</RedButton>
                        </div>
                    </div>
            </div>  
        </div>
    );
}