import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../providers/axiosClient';
import ListaItens from '../../components/ListaItens/ListaItens';
import Pesquisa from '../../components/Pesquisa/Pesquisa'; 
import { normalizarTexto } from '../../utils/pesquisa';
import { authHeader } from '../../utils/authHeader';
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

    const carregarPersonalizacoes = useCallback(() => {
        return api.get('/personalizacoes', { headers: authHeader() })
            .then((resposta) => {
                setPersonalizacoes(Array.isArray(resposta.data) ? resposta.data : []);
                setErro('');
            })
            .catch(() => setErro('Não foi possível carregar as personalizações.'))
            .finally(() => setCarregando(false));
    }, []);

    useEffect(() => {
        carregarPersonalizacoes();
    }, [carregarPersonalizacoes]);

    function confirmarExclusaoPersonalizacao() {
        if (!personalizacaoExcluir?.id) return;

        api.delete(`/personalizacoes/${personalizacaoExcluir.id}`, { headers: authHeader() })
            .then(() => {
                setPersonalizacaoExcluir(null);
                carregarPersonalizacoes();
            })
            .catch(() => setErro('Não foi possível excluir a personalização.'));
    }

    const personalizacoesFiltradas = personalizacoes.filter((personalizacao) =>
        normalizarTexto(personalizacao.nome).includes(normalizarTexto(termo))
    );

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
                            <h2 className={styles.titulo}>Personalizações</h2>
                        </div>
                        <Pesquisa valor={termo} aoPesquisar={setTermo} />
                    </div>
                    {erro ? <p className={styles.erro}>{erro}</p> : (
                        <ListaItens itens={personalizacoesFiltradas} colunas={colunas} carregando={carregando}
                            mensagemVazia={normalizarTexto(termo) ? 'Nenhuma personalização encontrada para esta pesquisa.' : 'Nenhuma personalização cadastrada.'} />
                    )}
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
