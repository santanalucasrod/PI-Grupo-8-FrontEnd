import { useNavigate } from 'react-router-dom';
import { useCart } from '../../providers/CartContext';
import styles from './TelaSacola.module.css';

function formatarPreco(valor) {
  return Number(valor || 0).toFixed(2).replace('.', ',');
}

export default function TelaSacola() {
  const navigate = useNavigate();
  const { itens, removerItem, total, quantidadeItens } = useCart();

  function handleFinalizar() {
    if (itens.length === 0) return;
    navigate('/cardapio', { state: { iniciarCheckout: true } });
  }

  return (
    <div className={styles.pagina}>
      <header className={styles.header}>
        <h1 className={styles.titulo}>Sacola</h1>
      </header>

      <main className={styles.conteudo}>
        <h2 className={styles.subtitulo}>Itens</h2>

        {itens.length === 0 ? (
          <p className={styles.mensagem}>Sua sacola está vazia.</p>
        ) : (
          <div className={styles.tabelaContainer}>
            <table className={styles.tabela}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Qtd</th>
                  <th>Preço</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {itens.map((item) => (
                  <tr key={item.cartItemId}>
                    <td>{item.nome}</td>
                    <td>{item.quantidade}</td>
                    <td>R$ {formatarPreco(item.precoUnidade * item.quantidade)}</td>
                    <td>
                      <button
                        type="button"
                        className={styles.botaoRemover}
                        onClick={() => removerItem(item.cartItemId)}
                        aria-label={`Remover ${item.nome}`}
                        title="Remover"
                      >
                        −
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className={styles.resumo}>
          <div className={styles.resumoItem}>
            <span>Total</span>
            <strong>R$ {formatarPreco(total)}</strong>
          </div>
          <div className={styles.resumoItem}>
            <span>Itens</span>
            <strong>{quantidadeItens}</strong>
          </div>
        </div>

        <div className={styles.botoes}>
          <button type="button" className={styles.alterar} onClick={() => navigate('/cardapio')}>
            Alterar
          </button>
          <button
            type="button"
            className={styles.finalizar}
            onClick={handleFinalizar}
            disabled={itens.length === 0}
          >
            Finalizar
          </button>
        </div>
      </main>
    </div>
  );
}
