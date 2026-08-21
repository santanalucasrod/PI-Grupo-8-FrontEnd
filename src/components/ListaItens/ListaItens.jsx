import styles from './ListaItens.module.css';

function ListaItens({ itens, colunas, mensagemVazia = 'Nenhum item encontrado.' }) {
 

    if (!itens.length) {
        return <p className={styles.estado}>{mensagemVazia}</p>;
    }

    return (
        <div className={styles.componente}>
            <table className={styles.tabela}>
                <thead>
                    <tr>
                        {colunas.map((coluna) => <th key={coluna.chave}>{coluna.titulo}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {itens.map((item, indice) => (
                        <tr key={item.id ?? item.email ?? indice}>
                            {colunas.map((coluna) => (
                                <td key={coluna.chave}>
                                    {coluna.renderizar
                                        ? coluna.renderizar(item)
                                        : item[coluna.chave] ?? '-'}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ListaItens;