import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../providers/axiosClient';
import ListaItens from '../../components/ListaItens/ListaItens';
import Pesquisa from '../../components/Pesquisa/Pesquisa';
import { interpretarRespostaPaginada } from '../../utils/respostaPaginada';
import Footer from '../../components/ListarProdutos/FooterListarProdutos';
import ModalExcluir from '../../components/Modais/ModalExcluir';
import styles from './Funcionarios.module.css';
import editarIcone from '../../assets/editaricon.png';
import deletarIcone from '../../assets/lixeiraicon.png';

function Funcionarios() {
    const [funcionarios, setFuncionarios] = useState([]);
    const [paginaAtual, setPaginaAtual] = useState(0);
    const [totalPaginas, setTotalPaginas] = useState(null);
    const [termo, setTermo] = useState('');
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [funcionarioExcluir, setFuncionarioExcluir] = useState(null);
    const navigate = useNavigate();

    function configuracao() {
        return {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        };
    }

    function carregarFuncionarios() {

        setCarregando(true);
        return api.get('/funcionarios/crud', {
            ...configuracao(),
            params: { page: paginaAtual, size: 7 }
        })
            .then((resposta) => {
                const pagina = interpretarRespostaPaginada(resposta.data);
                const funcionariosAtivos = pagina.itens.filter(
                    (funcionario) => funcionario.ativo === true
                );

                setFuncionarios(funcionariosAtivos);
                setTotalPaginas(pagina.totalPaginas);
                if (pagina.totalPaginas !== null) {
                    const ultimaPagina = Math.max(pagina.totalPaginas - 1, 0);
                    const paginaValida = Math.min(pagina.paginaAtual, ultimaPagina);
                    if (paginaValida !== paginaAtual) setPaginaAtual(paginaValida);
                }
            })
            .catch(() => {
                setErro('Nao foi possivel carregar os funcionarios.');
            })
            .finally(() => {
                setCarregando(false);
            });
    }

    useEffect(() => {
        carregarFuncionarios();
    }, [paginaAtual]);

    function editarFuncionario(funcionario) {
        navigate('/funcionarios/cadastro', { state: { editar: true, funcionario } });
    }

    function confirmarExclusaoFuncionario() {
        if (!funcionarioExcluir?.id) return;

        api.delete(`/funcionarios/crud/${funcionarioExcluir.id}`, configuracao())
            .then(() => {
                setFuncionarioExcluir(null);
                carregarFuncionarios();
            })
            .catch(() => setErro('Nao foi possivel excluir o funcionario.'));
    }

    const funcionariosFiltrados = funcionarios.filter((funcionario) =>
        String(funcionario.nome ?? '').toLowerCase().includes(termo.toLowerCase())
    );

    const colunas = [
        { chave: 'nome', titulo: 'Nome' },
        { chave: 'email', titulo: 'Email' },
        {
            chave: 'editar',
            titulo: 'Editar',
            componente: (item) => (
                <button className={styles.acao} onClick={() => editarFuncionario(item)} aria-label={`Editar ${item.nome}`} title="Editar">
                    <img src={editarIcone} alt="" className={styles.imagem} />
                </button>
            )
        },
        {
            chave: 'excluir',
            titulo: 'Excluir',
            componente: (item) => (
                <button className={`${styles.acao} ${styles.excluir}`} onClick={() => setFuncionarioExcluir(item)} aria-label={`Excluir ${item.nome}`} title="Excluir">
                    <img src={deletarIcone} alt="" className={styles.imagem} />
                </button>
            )
        }
    ];

    return (
        <><main className={styles.main}>
            <section className={styles.conteudo}>
                <div className={styles.cabecalho}>
                    <div>
                        <p className={styles.eyebrow}>Gerenciamento</p>
                        <h2 className={styles.titulo}>Funcionarios</h2>
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
                        itens={funcionariosFiltrados}
                        colunas={colunas}
                        carregando={carregando}
                        paginaAtualExterna={paginaAtual}
                        totalPaginasExterno={totalPaginas}
                        aoMudarPagina={setPaginaAtual}
                    />
                )}
            </section>
        </main>
            <Footer onClickAdd={() => navigate('/funcionarios/cadastro')} texto="Adicionar Funcionário" />
            {funcionarioExcluir && (
                <ModalExcluir
                    titulo={`Você deseja mesmo excluir ${funcionarioExcluir.nome.toLowerCase()}?`}
                    whiteButton="Voltar"
                    redButton="Excluir"
                    onCancel={() => setFuncionarioExcluir(null)}
                    onConfirm={confirmarExclusaoFuncionario}
                />
            )}
        </>
    );
}

export default Funcionarios;