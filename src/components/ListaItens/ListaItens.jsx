import styles from './ListaItens.module.css';
import { useEffect, useRef, useState } from 'react';

const ITENS_POR_PAGINA = 7;

function ListaItens({
    itens,
    colunas,
    carregando = false,
    mensagemVazia = 'Nenhum item encontrado.',
    paginaAtualExterna,
    totalPaginasExterno,
    aoMudarPagina
}) {

    const tabelaRef = useRef(null);
    const scrollSuperiorRef = useRef(null);
    const [larguraTabela, setLarguraTabela] = useState(0);
    const [paginaLocal, setPaginaLocal] = useState(0);
    const paginacaoExterna = Number.isInteger(totalPaginasExterno);
    const paginaAtual = paginacaoExterna ? paginaAtualExterna : paginaLocal;
    const totalPaginas = paginacaoExterna
        ? totalPaginasExterno
        : Math.ceil(itens.length / ITENS_POR_PAGINA);
    const itensDaPagina = paginacaoExterna
        ? itens
        : itens.slice(paginaAtual * ITENS_POR_PAGINA, (paginaAtual + 1) * ITENS_POR_PAGINA);

    function mudarPagina(pagina) {
        if (paginacaoExterna) {
            aoMudarPagina(pagina);
        } else {
            setPaginaLocal(pagina);
        }
    }

    useEffect(() => {
        function atualizarLargura() {
            if (tabelaRef.current) {
                setLarguraTabela(tabelaRef.current.scrollWidth);
            }
        }

        atualizarLargura();

        window.addEventListener('resize', atualizarLargura);

        return () => {
            window.removeEventListener('resize', atualizarLargura);
        };
    }, [itens, colunas]);

    function sincronizarScrollSuperior(e) {
        if (tabelaRef.current) {
            tabelaRef.current.scrollLeft = e.target.scrollLeft;
        }
    }

    function sincronizarScrollTabela(e) {
        if (scrollSuperiorRef.current) {
            scrollSuperiorRef.current.scrollLeft = e.target.scrollLeft;
        }
    }

    if (carregando) {
        return <p className={styles.estado}>Carregando...</p>;
    }

    if (!itens.length) {
        return <p className={styles.estado}>{mensagemVazia}</p>;
    }

    return (
        <div className={styles.componente}>

            <div
                className={styles.scrollSuperior}
                ref={scrollSuperiorRef}
                onScroll={sincronizarScrollSuperior}
            >
                <div
                    className={styles.scrollSuperiorConteudo}
                    style={{ width: `${larguraTabela}px` }}
                />
            </div>

            <div
                className={styles.tabelaContainer}
                ref={tabelaRef}
                onScroll={sincronizarScrollTabela}
            >
                <table className={styles.tabela}>
                    <thead>
                        <tr>
                            {colunas.map((coluna) => (
                                <th key={coluna.chave}>
                                    {coluna.titulo}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {itensDaPagina.map((item, indice) => (
                            <tr key={item.id ?? item.email ?? indice}>
                                {colunas.map((coluna) => (
                                    <td key={coluna.chave}>
                                        {coluna.componente
                                            ? coluna.componente(item)
                                            : item[coluna.chave] ?? '-'}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPaginas > 1 && (
                <nav className={styles.paginacao} aria-label="Paginação da lista">
                    <button
                        type="button"
                        className={styles.botaoPagina}
                        onClick={() => mudarPagina(0)}
                        disabled={paginaAtual === 0}
                        aria-label="Ir para a primeira página"
                        title="Primeira página"
                    >
                        «
                    </button>
                    <button
                        type="button"
                        className={styles.botaoPagina}
                        onClick={() => mudarPagina(paginaAtual - 1)}
                        disabled={paginaAtual === 0}
                        aria-label="Página anterior"
                        title="Página anterior"
                    >
                        ‹
                    </button>
                    <span className={styles.statusPagina} aria-live="polite">
                        Página {paginaAtual + 1} de {totalPaginas}
                    </span>
                    <button
                        type="button"
                        className={styles.botaoPagina}
                        onClick={() => mudarPagina(paginaAtual + 1)}
                        disabled={paginaAtual === totalPaginas - 1}
                        aria-label="Próxima página"
                        title="Próxima página"
                    >
                        ›
                    </button>
                    <button
                        type="button"
                        className={styles.botaoPagina}
                        onClick={() => mudarPagina(totalPaginas - 1)}
                        disabled={paginaAtual === totalPaginas - 1}
                        aria-label="Ir para a última página"
                        title="Última página"
                    >
                        »
                    </button>
                </nav>
            )}

        </div>
    );
}

export default ListaItens;