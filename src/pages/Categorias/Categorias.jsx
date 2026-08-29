import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../providers/axiosClient';
import ListaItens from '../../components/ListaItens/ListaItens';
import Pesquisa from '../../components/Pesquisa/Pesquisa';
import Footer from '../../components/ListarProdutos/FooterListarProdutos';
import ModalExcluir from '../../components/Modais/ModalExcluir';
import styles from './Categorias.module.css';
import editarIcone from '../../assets/editaricon.png';
import deletarIcone from '../../assets/lixeiraicon.png';

function Categorias() {
    const [categorias, setCategorias] = useState([]);
    const [termo, setTermo] = useState('');
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [categoriaExcluir, setCategoriaExcluir] = useState(null);
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

    function confirmarExclusaoCategoria() {
        if (!categoriaExcluir?.id) return;

        api.delete(`/categorias/${categoriaExcluir.id}`, configuracao())
            .then(() => {
                setCategoriaExcluir(null);
                carregarCategorias();
            })
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
                <button className={`${styles.acao} ${styles.excluir}`} onClick={() => setCategoriaExcluir(item)} aria-label={`Excluir ${item.nome}`} title="Excluir">
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
                            <h2 className={styles.titulo}>Categorias</h2>
                        </div>
                        <Pesquisa valor={termo} aoPesquisar={setTermo} />
                    </div>
                    {erro ? <p className={styles.erro}>{erro}</p> : <ListaItens itens={categorias} colunas={colunas} carregando={carregando} />}
                </section>
            </main>
            <Footer onClickAdd={() => navigate('/categorias/cadastro')} texto="Adicionar Categoria" />
            {categoriaExcluir && (
                <ModalExcluir
                    titulo={`Você deseja mesmo excluir ${categoriaExcluir.nome.toLowerCase()}?`}
                    whiteButton="Voltar"
                    redButton="Excluir"
                    onCancel={() => setCategoriaExcluir(null)}
                    onConfirm={confirmarExclusaoCategoria}
                />
            )}
        </>
    );
}

export default Categorias;
