import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../providers/axiosClient';
import ListaItens from '../../components/ListaItens/ListaItens';
import Pesquisa from '../../components/Pesquisa/Pesquisa';
import styles from './Ingredientes.module.css';
import editarIcone from '../../assets/editaricon.png';
import deletarIcone from '../../assets/lixeiraicon.png';

function Ingredientes() {
    const [ingredientes, setIngredientes] = useState([]);
    const [termo, setTermo] = useState('');
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
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

    function excluirIngrediente(ingrediente) {
        if (!ingrediente.id || !window.confirm(`Excluir o ingrediente ${ingrediente.nome}?`)) return;
        api.delete(`/ingredientes/${ingrediente.id}`, configuracao())
            .then(carregarIngredientes)
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
                <button className={`${styles.acao} ${styles.excluir}`} onClick={() => excluirIngrediente(item)} aria-label={`Excluir ${item.nome}`} title="Excluir">
                    <img src={deletarIcone} alt="" className={styles.imagem} />
                </button>
            )
        }
    ];

    return (
        <main className={styles.main}>
            <section className={styles.conteudo}>
                <div className={styles.cabecalho}>
                    <div>
                        <p className={styles.eyebrow}>Gerenciamento</p>
                        <h2 className={styles.titulo}>Ingredientes</h2>
                    </div>
                    <div className={styles.acoesCabecalho}>
                        <Pesquisa valor={termo} aoPesquisar={setTermo} />
                        <button className={styles.botaoAdicionar} onClick={() => navigate('/ingredientes/cadastro')}>Adicionar</button>
                    </div>
                </div>
                {erro ? <p className={styles.erro}>{erro}</p> : <ListaItens itens={ingredientes} colunas={colunas} carregando={carregando} />}
            </section>
        </main>
    );
}

export default Ingredientes;
