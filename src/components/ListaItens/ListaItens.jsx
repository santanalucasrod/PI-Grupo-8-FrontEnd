import styles from './ListaItens.module.css';
import { useEffect, useRef, useState } from 'react';

function ListaItens({ itens, colunas, mensagemVazia = 'Nenhum item encontrado.' }) {

    const tabelaRef = useRef(null);
    const scrollSuperiorRef = useRef(null);
    const [larguraTabela, setLarguraTabela] = useState(0);

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
                        {itens.map((item, indice) => (
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

        </div>
    );
}

export default ListaItens;