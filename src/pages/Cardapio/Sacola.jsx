import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ModalNomeCliente from '../../components/Cardapio/ModalNomeCliente';
import ModalPagamento from '../../components/Cardapio/ModalPagamento';
import { useCart } from '../../providers/CartContext';
import { criarPedido } from './cardapioApi';
import styles from './Sacola.module.css';

function formatarPreco(valor) {
  return Number(valor || 0).toFixed(2).replace('.', ',');
}

export default function Sacola() {
  const navigate = useNavigate();
  const { itens, removerItem, limparCarrinho, total, quantidadeItens } = useCart();
  const [etapaCheckout, setEtapaCheckout] = useState(null);
  const [nomeCliente, setNomeCliente] = useState('');

  function concluirNome(nome) {
    setNomeCliente(nome);
    setEtapaCheckout('pagamento');
  }

  async function confirmarPedido() {
    return criarPedido({ nome: nomeCliente, itens });
  }

  function concluirPedido() {
    limparCarrinho();
    setEtapaCheckout(null);
    setNomeCliente('');
    navigate('/cardapio');
  }

  return (
    <main className={styles.main}>
      <section className={styles.conteudo}>
        <div className={styles.cabecalho}>
          <div>
            <p className={styles.eyebrow}>Cardápio</p>
            <h1 className={styles.titulo}>Sacola</h1>
          </div>
          <button type="button" className={styles.voltar} onClick={() => navigate('/cardapio')}>
            Continuar comprando
          </button>
        </div>

        <div className={styles.painel}>
          {itens.length === 0 ? (
            <div className={styles.vazia}>
              <p>Sua sacola está vazia.</p>
              <button type="button" onClick={() => navigate('/cardapio')}>
                Ver cardápio
              </button>
            </div>
          ) : (
            <ul className={styles.lista} aria-label="Itens da sacola">
              {itens.map((item) => (
                <li key={item.cartItemId} className={styles.item}>
                  <div className={styles.itemDescricao}>
                    <strong>{item.nome}</strong>
                    {item.personalizacoes?.length > 0 && (
                      <span>
                        {item.personalizacoes
                          .map(
                            (personalizacao) =>
                              `${personalizacao.nome} (${personalizacao.quantidade})`
                          )
                          .join(', ')}
                      </span>
                    )}
                  </div>
                  <span className={styles.quantidade}>Qtd. {item.quantidade}</span>
                  <strong className={styles.preco}>
                    R$ {formatarPreco(item.precoUnidade * item.quantidade)}
                  </strong>
                  <button
                    type="button"
                    className={styles.remover}
                    onClick={() => removerItem(item.cartItemId)}
                    aria-label={`Remover ${item.nome}`}
                  >
                    Remover
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className={styles.resumo}>
            <div>
              <span>Quantidade de itens</span>
              <strong>{quantidadeItens}</strong>
            </div>
            <div>
              <span>Total</span>
              <strong>R$ {formatarPreco(total)}</strong>
            </div>
          </div>

          <div className={styles.acoes}>
            <button type="button" className={styles.alterar} onClick={() => navigate('/cardapio')}>
              Alterar pedido
            </button>
            <button
              type="button"
              className={styles.finalizar}
              onClick={() => setEtapaCheckout('nome')}
              disabled={itens.length === 0}
            >
              Finalizar pedido
            </button>
          </div>
        </div>
      </section>

      {etapaCheckout === 'nome' && (
        <ModalNomeCliente
          onConcluir={concluirNome}
          onFechar={() => setEtapaCheckout(null)}
        />
      )}

      {etapaCheckout === 'pagamento' && (
        <ModalPagamento
          total={total}
          onConfirmar={confirmarPedido}
          onPagamentoEfetuado={concluirPedido}
          onCancelar={() => setEtapaCheckout(null)}
        />
      )}
    </main>
  );
}
