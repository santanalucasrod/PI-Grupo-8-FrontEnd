import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../providers/axiosClient';
import ListaItens from '../../components/ListaItens/ListaItens';
import Pesquisa from '../../components/Pesquisa/Pesquisa';
import styles from './Categorias.module.css';
import editarIcone from '../../assets/editaricon.png';
import deletarIcone from '../../assets/lixeiraicon.png';

function Categorias() {
    const [categorias, setCategorias] = useState([]);
    const [termo, setTermo] = useState('');
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const navigate = useNavigate();

    function configuracao() {
        return { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
    }

    function carregarCategorias() {
        return api.get('/categorias', configuracao())
            .then((resposta) => setCategorias(resposta.data))
            .catch(() => setErro('Nao foi possivel carregar as categorias.'))
            .finally(() => setCarregando(false));
    }

    useEffect(() => {
        carregarCategorias();
    }, []);

    function excluirCategoria(categoria) {
        if (!categoria.id || !window.confirm(`Excluir a categoria ${categoria.nome}?`)) return;
        api.delete(`/categorias/${categoria.id}`, configuracao())
            .then(carregarCategorias)
            .catch(() => setErro('Nao foi possivel excluir a categoria.'));
    }

    const colunas = [
        { chave: 'nome', titulo: 'Nome' },
        {
            chave: 'editar',
            titulo: 'Editar',
            componente: (item) => (
                <button className={styles.acao} onClick={() => navigate('/categorias/cadastro', { state: { editar: true, item } })} aria-label={`Editar ${item.nome}`} title="Editar">
                    <img src={editarIcone} alt="" className={styles.imagem} />
                </button>
            )
        },
        {
            chave: 'excluir',
            titulo: 'Excluir',
            componente: (item) => (
                <button className={`${styles.acao} ${styles.excluir}`} onClick={() => excluirCategoria(item)} aria-label={`Excluir ${item.nome}`} title="Excluir">
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
                        <h2 className={styles.titulo}>Categorias</h2>
                    </div>
                    <div className={styles.acoesCabecalho}>
                        <Pesquisa valor={termo} aoPesquisar={setTermo} />
                        <button className={styles.botaoAdicionar} onClick={() => navigate('/categorias/cadastro')}>Adicionar</button>
                    </div>
                </div>
                {erro ? <p className={styles.erro}>{erro}</p> : <ListaItens itens={categorias} colunas={colunas} carregando={carregando} />}
            </section>
        </main>
    );
}

export default Categorias;
