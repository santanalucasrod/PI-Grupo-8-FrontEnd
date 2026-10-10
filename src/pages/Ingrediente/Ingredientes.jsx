import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../providers/axiosClient';
import ListaItens from '../../components/ListaItens/ListaItens';
import Pesquisa from '../../components/Pesquisa/Pesquisa';
import { normalizarTexto } from '../../utils/pesquisa';
import { authHeader } from '../../utils/authHeader';
import { interpretarRespostaPaginada } from '../../utils/respostaPaginada';
import Footer from '../../components/ListarProdutos/FooterListarProdutos';
import ModalExcluir from '../../components/Modais/ModalExcluir';
import styles from './Ingredientes.module.css';
import editarIcone from '../../assets/editaricon.png';
import deletarIcone from '../../assets/lixeiraicon.png';

function Ingredientes() {
    const [ingredientes, setIngredientes] = useState([]);
    const [paginaAtual, setPaginaAtual] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(null);
    const [termo, setTermo] = useState('');
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [ingredienteExcluir, setIngredienteExcluir] = useState(null);
    const navigate = useNavigate();

    const carregarIngredientes = useCallback(() => {
        setCarregando(true);
        return api.get('/ingredientes', {
            headers: authHeader(),
            params: { page: paginaAtual, size: 7 }
        })
            .then((resposta) => {
                const pagina = interpretarRespostaPaginada(resposta.data);
                setIngredientes(pagina.itens);
                setTotalPaginas(pagina.totalPaginas);
                if (pagina.totalPaginas !== null) {
                    const ultimaPagina = Math.max(pagina.totalPaginas - 1, 0);
                    const paginaValida = Math.min(pagina.paginaAtual, ultimaPagina);
                    if (paginaValida !== paginaAtual) setPaginaAtual(paginaValida);
                }
                setErro('');
            })
            .catch(() => setErro('Não foi possível carregar os ingredientes.'))
            .finally(() => setCarregando(false));
    }, [paginaAtual]);

    useEffect(() => {
        carregarIngredientes();
    }, [carregarIngredientes]);

    function confirmarExclusaoIngrediente() {
        if (!ingredienteExcluir?.id) return;

        api.delete(`/ingredientes/${ingredienteExcluir.id}`, { headers: authHeader() })
            .then(() => {
                setIngredienteExcluir(null);
                carregarIngredientes();
            })
            .catch(() => setErro('Não foi possível excluir o ingrediente.'));
    }

    const ingredientesFiltrados = ingredientes.filter((ingrediente) =>
        normalizarTexto(ingrediente.nome).includes(normalizarTexto(termo))
    );

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
                        <Pesquisa
                            valor={termo}
                            aoPesquisar={(valor) => {
                                setTermo(valor);
                                setPaginaAtual(0);
                            }}
                        />
                    </div>
                    {erro ? <p className={styles.erro}>{erro}</p> : (
                        <ListaItens
                            key={termo}
                            itens={ingredientesFiltrados}
                            colunas={colunas}
                            carregando={carregando}
                            paginaAtualExterna={paginaAtual}
                            totalPaginasExterno={totalPaginas}
                            aoMudarPagina={setPaginaAtual}
                            mensagemVazia={normalizarTexto(termo) ? 'Nenhum ingrediente encontrado para esta pesquisa.' : 'Nenhum ingrediente cadastrado.'} />
                    )}
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
