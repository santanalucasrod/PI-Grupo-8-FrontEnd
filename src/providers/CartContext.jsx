import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);

const CHAVE_STORAGE = 'kentocafe_carrinho';

function carregarCarrinhoInicial() {
  try {
    const salvo = localStorage.getItem(CHAVE_STORAGE);
    const itens = salvo ? JSON.parse(salvo) : [];
    if (!Array.isArray(itens)) return [];

    return itens
      .filter(
        (item) =>
          item &&
          typeof item.cartItemId === 'string' &&
          typeof item.nome === 'string' &&
          Number.isInteger(Number(item.produtoId)) &&
          Number(item.produtoId) > 0 &&
          Number.isFinite(Number(item.precoUnidade)) &&
          Number.isInteger(Number(item.quantidade)) &&
          Number(item.quantidade) > 0
      )
      .map((item) => ({
        ...item,
        produtoId: Number(item.produtoId),
        precoUnidade: Number(item.precoUnidade),
        quantidade: Number(item.quantidade),
      }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [itens, setItens] = useState(carregarCarrinhoInicial);

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE_STORAGE, JSON.stringify(itens));
    } catch {
      // O carrinho segue em memória quando o armazenamento do navegador está indisponível.
    }
  }, [itens]);

  function adicionarItem(item) {
    setItens((atual) => [
      ...atual,
      {
        cartItemId: `${item.produtoId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        ...item,
      },
    ]);
  }

  function removerItem(cartItemId) {
    setItens((atual) => atual.filter((item) => item.cartItemId !== cartItemId));
  }

  function limparCarrinho() {
    setItens([]);
  }

  const total = useMemo(
    () =>
      itens.reduce(
        (soma, item) => soma + Number(item.precoUnidade) * Number(item.quantidade),
        0
      ),
    [itens]
  );

  const quantidadeItens = useMemo(
    () => itens.reduce((soma, item) => soma + Number(item.quantidade), 0),
    [itens]
  );

  const valor = {
    itens,
    adicionarItem,
    removerItem,
    limparCarrinho,
    total,
    quantidadeItens,
  };

  return <CartContext.Provider value={valor}>{children}</CartContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- hook precisa ficar junto do provider/context
export function useCart() {
  const contexto = useContext(CartContext);
  if (!contexto) {
    throw new Error('useCart precisa ser usado dentro de um CartProvider');
  }
  return contexto;
}
