export function interpretarRespostaPaginada(data) {
    if (Array.isArray(data)) {
        return { itens: data, paginaAtual: 0, totalPaginas: null };
    }

    if (
        data &&
        Array.isArray(data.content) &&
        Number.isInteger(data.totalPages) &&
        Number.isInteger(data.number)
    ) {
        return {
            itens: data.content,
            paginaAtual: data.number,
            totalPaginas: data.totalPages
        };
    }

    throw new Error('A resposta da API possui um formato de paginação inválido.');
}
