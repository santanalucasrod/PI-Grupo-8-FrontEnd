import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../providers/axiosClient';
import ListaItens from '../../components/ListaItens/ListaItens';
import Pesquisa from '../../components/Pesquisa/Pesquisa';
import styles from './Funcionarios.module.css';
import editarIcone from '../../assets/editaricon.png';
import deletarIcone from '../../assets/lixeiraicon.png';

function extrairFuncionarios(resposta) {
    const corpo = resposta?.data;
    if (Array.isArray(corpo)) return corpo;
    if (Array.isArray(corpo?.data)) return corpo.data;
    if (Array.isArray(corpo?.funcionarios)) return corpo.funcionarios;
    return [];
}

function Funcionarios() {
    const [funcionarios, setFuncionarios] = useState([]);
    const [termo, setTermo] = useState('');
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const navigate = useNavigate();

    function configuracao() {
        return {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        };
    }

    function carregarFuncionarios() {

        return api.get('/funcionario/crud', configuracao())
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
        navigate('/cadastro', { state: { editar: true, funcionario } });
    }

    function excluirFuncionario(funcionario) {
        if (!funcionario.id || !window.confirm(`Excluir o funcionario ${funcionario.nome}?`)) return;

        api.delete(`/funcionario/crud/${funcionario.id}`, configuracao())
            .then(carregarFuncionarios)
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
            renderizar: (item) => (
                <button className={styles.acao} onClick={() => editarFuncionario(item)} aria-label={`Editar ${item.nome}`} title="Editar">
                    <img src={editarIcone} alt="" className={styles.imagem} />
                </button>
            )
        },
        {
            chave: 'excluir',
            titulo: 'Excluir',
            renderizar: (item) => (
                <button className={`${styles.acao} ${styles.excluir}`} onClick={() => excluirFuncionario(item)} aria-label={`Excluir ${item.nome}`} title="Excluir">
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
                        <h2 className={styles.titulo}>Funcionarios</h2>
                    </div>
                    <Pesquisa valor={termo} aoPesquisar={setTermo} />
                </div>
                {erro ? <p className={styles.erro}>{erro}</p> : (
                    <ListaItens itens={funcionariosFiltrados} colunas={colunas} carregando={carregando} />
                )}
            </section>
        </main>
    );
}

export default Funcionarios;