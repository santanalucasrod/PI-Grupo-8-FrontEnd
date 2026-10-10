import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../providers/axiosClient';
import ListaItens from '../../components/ListaItens/ListaItens';
import Pesquisa from '../../components/Pesquisa/Pesquisa';
import { normalizarTexto } from '../../utils/pesquisa';
import { authHeader } from '../../utils/authHeader';
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

    const carregarCategorias = useCallback(() => {
        setCarregando(true);
        return api.get('/categorias', { headers: authHeader() })
            .then((resposta) => {
                setCategorias(Array.isArray(resposta.data) ? resposta.data : []);
                setErro('');
            })
            .catch(() => setErro('Não foi possível carregar as categorias.'))
            .finally(() => setCarregando(false));
    }, []);

    useEffect(() => {
        carregarCategorias();
    }, [carregarCategorias]);

    function confirmarExclusaoCategoria() {
        if (!categoriaExcluir?.id) return;

        api.delete(`/categorias/${categoriaExcluir.id}`, { headers: authHeader() })
            .then(() => {
                setCategoriaExcluir(null);
                carregarCategorias();
            })
            .catch(() => setErro('Não foi possível excluir a categoria.'));
    }

    const categoriasFiltradas = categorias.filter((categoria) =>
        normalizarTexto(categoria.nome).includes(normalizarTexto(termo))
    );

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
                        <Pesquisa
                            valor={termo}
                            aoPesquisar={setTermo}
                        />
                    </div>
                    {erro ? <p className={styles.erro}>{erro}</p> : (
                        <ListaItens
                            key={termo}
                            itens={categoriasFiltradas}
                            colunas={colunas}
                            carregando={carregando}
                            mensagemVazia={normalizarTexto(termo) ? 'Nenhuma categoria encontrada para esta pesquisa.' : 'Nenhuma categoria cadastrada.'} />
                    )}
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
