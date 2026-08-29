import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../providers/axiosClient';
import ListaItens from '../../components/ListaItens/ListaItens';
import Pesquisa from '../../components/Pesquisa/Pesquisa';
import Footer from '../../components/ListarProdutos/FooterListarProdutos';
import ModalExcluir from '../../components/Modais/ModalExcluir';
import styles from './Funcionarios.module.css';
import editarIcone from '../../assets/editaricon.png';
import deletarIcone from '../../assets/lixeiraicon.png';

function Funcionarios() {
    const [funcionarios, setFuncionarios] = useState([]);
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

        return api.get('/funcionarios/crud', configuracao())
            .then((resposta) => {
                setFuncionarios(resposta.data);
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
    }, []);

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
                        <Pesquisa valor={termo} aoPesquisar={setTermo} />
                    </div>
                    {erro ? <p className={styles.erro}>{erro}</p> : (
                        <ListaItens itens={funcionariosFiltrados} colunas={colunas} carregando={carregando} />
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