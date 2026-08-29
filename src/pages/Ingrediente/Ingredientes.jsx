import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../providers/axiosClient';
import ListaItens from '../../components/ListaItens/ListaItens';
import Pesquisa from '../../components/Pesquisa/Pesquisa';
import Footer from '../../components/ListarProdutos/FooterListarProdutos';
import ModalExcluir from '../../components/Modais/ModalExcluir';
import styles from './Ingredientes.module.css';
import editarIcone from '../../assets/editaricon.png';
import deletarIcone from '../../assets/lixeiraicon.png';

function Ingredientes() {
    const [ingredientes, setIngredientes] = useState([]);
    const [termo, setTermo] = useState('');
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [ingredienteExcluir, setIngredienteExcluir] = useState(null);
    const navigate = useNavigate();

    function configuracao() {
        return { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
    }

    function carregarIngredientes() {
        return api.get('/ingredientes', configuracao())
            .then((resposta) => setIngredientes(resposta.data))
            .catch(() => setErro('Nao foi possivel carregar os ingredientes.'))
            .finally(() => setCarregando(false));
    }

    useEffect(() => {
        carregarIngredientes();
    }, []);

    function confirmarExclusaoIngrediente() {
        if (!ingredienteExcluir?.id) return;

        api.delete(`/ingredientes/${ingredienteExcluir.id}`, configuracao())
            .then(() => {
                setIngredienteExcluir(null);
                carregarIngredientes();
            })
            .catch(() => setErro('Nao foi possivel excluir o ingrediente.'));
    }

    const colunas = [
        { chave: 'nome', titulo: 'Nome' },
        {
            chave: 'editar',
            titulo: 'Editar',
            componente: (item) => (
                <button className={styles.acao} onClick={() => navigate('/ingredientes/cadastro', { state: { editar: true, item } })} aria-label={`Editar ${item.nome}`} title="Editar">
                    <img src={editarIcone} alt="" className={styles.imagem} />
                </button>
            )
        },
        {
            chave: 'excluir',
            titulo: 'Excluir',
            componente: (item) => (
                <button className={`${styles.acao} ${styles.excluir}`} onClick={() => setIngredienteExcluir(item)} aria-label={`Excluir ${item.nome}`} title="Excluir">
                    <img src={deletarIcone} alt="" className={styles.imagem} />
                </button>
            )
        }
    ];

    return (
        <>
            <main className={styles.main}>
                <section className={styles.conteudo}>
                    <div className={styles.cabecalho}>
                        <div>
                            <p className={styles.eyebrow}>Gerenciamento</p>
                            <h2 className={styles.titulo}>Ingredientes</h2>
                        </div>
                        <Pesquisa valor={termo} aoPesquisar={setTermo} />
                    </div>
                    {erro ? <p className={styles.erro}>{erro}</p> : <ListaItens itens={ingredientes} colunas={colunas} carregando={carregando} />}
                </section>
            </main>
            <Footer onClickAdd={() => navigate('/ingredientes/cadastro')} texto="Adicionar Ingrediente" />
            {ingredienteExcluir && (
                <ModalExcluir
                    titulo={`Você deseja mesmo excluir ${ingredienteExcluir.nome.toLowerCase()}?`}
                    whiteButton="Voltar"
                    redButton="Excluir"
                    onCancel={() => setIngredienteExcluir(null)}
                    onConfirm={confirmarExclusaoIngrediente}
                />
            )}
        </>
    );
}

export default Ingredientes;
