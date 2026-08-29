import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../providers/axiosClient';
import ListaItens from '../../components/ListaItens/ListaItens';
import Pesquisa from '../../components/Pesquisa/Pesquisa'; 
import Footer from '../../components/ListarProdutos/FooterListarProdutos';
import ModalExcluir from '../../components/Modais/ModalExcluir';
import styles from './Personalizacoes.module.css';
import editarIcone from '../../assets/editaricon.png';
import deletarIcone from '../../assets/lixeiraicon.png';

function Personalizacoes() {
    const [personalizacoes, setPersonalizacoes] = useState([]);
    const [termo, setTermo] = useState('');
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [personalizacaoExcluir, setPersonalizacaoExcluir] = useState(null);
    const navigate = useNavigate();

    function configuracao() {
        return { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
    }

    function carregarPersonalizacoes() {
        return api.get('/personalizacoes', configuracao())
            .then((resposta) => setPersonalizacoes(resposta.data))
            .catch(() => setErro('Nao foi possivel carregar as personalizacoes.'))
            .finally(() => setCarregando(false));
    }

    useEffect(() => {
        carregarPersonalizacoes();
    }, []);

    function confirmarExclusaoPersonalizacao() {
        if (!personalizacaoExcluir?.id) return;

        api.delete(`/personalizacoes/${personalizacaoExcluir.id}`, configuracao())
            .then(() => {
                setPersonalizacaoExcluir(null);
                carregarPersonalizacoes();
            })
            .catch(() => setErro('Nao foi possivel excluir a personalizacao.'));
    }


    const colunas = [
        { chave: 'nome', titulo: 'Nome' },
        {
            chave: 'editar',
            titulo: 'Editar',
            componente: (item) => (
                <button className={styles.acao} onClick={() => navigate('/personalizacoes/cadastro', { state: { editar: true, item } })} aria-label={`Editar ${item.nome}`} title="Editar">
                    <img src={editarIcone} alt="" className={styles.imagem} />
                </button>
            )
        },
        {
            chave: 'excluir',
            titulo: 'Excluir',
            componente: (item) => (
                <button className={`${styles.acao} ${styles.excluir}`} onClick={() => setPersonalizacaoExcluir(item)} aria-label={`Excluir ${item.nome}`} title="Excluir">
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
                            <h2 className={styles.titulo}>Personalizacoes</h2>
                        </div>
                        <Pesquisa valor={termo} aoPesquisar={setTermo} />
                    </div>
                    {erro ? <p className={styles.erro}>{erro}</p> : <ListaItens itens={personalizacoes} colunas={colunas} carregando={carregando} />}
                </section>
            </main>
            <Footer onClickAdd={() => navigate('/personalizacoes/cadastro')} texto="Adicionar Personalização" />
            {personalizacaoExcluir && (
                <ModalExcluir
                    titulo={`Você deseja mesmo excluir ${personalizacaoExcluir.nome.toLowerCase()}?`}
                    whiteButton="Voltar"
                    redButton="Excluir"
                    onCancel={() => setPersonalizacaoExcluir(null)}
                    onConfirm={confirmarExclusaoPersonalizacao}
                />
            )}
        </>
    );
}

export default Personalizacoes;
