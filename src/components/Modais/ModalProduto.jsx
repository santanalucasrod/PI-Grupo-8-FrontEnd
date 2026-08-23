import styles from './Modal.module.css';
import WhiteButton from '../Botoes/WhiteButton';
import RedButton from '../Botoes/RedButton';
import ListarModal from './ListarModal';
import TextAreaModal from './TextAreaModal';
import ReturnButton from '../Botoes/ReturnButton';
import ImagemProdutoModal from './ImagemProdutoModal';

export default function ModalProduto(props){
    return(
        <div className={styles.shadow_modal}>
            <div className={styles.modal}>

                <div className={styles.topo_produto}>
                    <ReturnButton voltar={props.onClose}></ReturnButton>
                </div>

                <div className={styles.produto_img}>
                    <ImagemProdutoModal imagem={props.imagem}></ImagemProdutoModal>
                    <p>{props.nome_produto}</p>
                </div>

                <div className={styles.listar_modal_grupo}>
                    <ListarModal chave={props.chave} valor={props.valor}></ListarModal>
                    <ListarModal chave={props.chave1} valor={props.valor1}></ListarModal>
                </div>

                <TextAreaModal label={props.label} valor={props.descricao}></TextAreaModal>

                <div className={styles.ipt_buttons}>
                    <div className={styles.buttons}>
                        <RedButton onClick={props.onExcluir}>{props.redButton}</RedButton>
                        <WhiteButton onClick={props.onEditar}>{props.whiteButton}</WhiteButton>
                    </div>
                </div>
            </div>  
        </div>
    );
}