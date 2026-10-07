import { useEffect, useRef, useState } from 'react';
import ImagemProduto from '../../assets/img-cafe.png';
import Stepper from './Stepper';
import styles from './ModalProdutoCardapio.module.css';

function formatarPreco(valor) {
  return Number(valor || 0).toFixed(2).replace('.', ',');
}

export default function ModalProdutoCardapio({
  produto,
  ingredientes,
  carregandoIngredientes,
  avisoIngredientes,
  personalizacoesDisponiveis = [],
  carregandoPersonalizacoes,
  avisoPersonalizacoes,
  tamanhos = [],
  carregandoTamanhos,
  avisoTamanhos,
  onAdicionar,
  onFechar,
}) {
  const painelRef = useRef(null);
  const [quantidade, setQuantidade] = useState(1);
  const [quantidadesPersonalizacoes, setQuantidadesPersonalizacoes] = useState({});
  const [tamanhoId, setTamanhoId] = useState(null);

  const tamanhoSelecionado = tamanhos.find((tamanho) => tamanho.id === tamanhoId) || null;
  // Produto com tamanhos cadastrados só pode ir para a sacola com um tamanho escolhido.
  const exigeTamanho = tamanhos.length > 0;
  const podeAdicionar = !carregandoTamanhos && (!exigeTamanho || tamanhoSelecionado);
  const precoExibido = tamanhoSelecionado ? tamanhoSelecionado.precoUnidade : produto.precoUnidade;

  useEffect(() => {
    const elementoAnterior = document.activeElement;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    painelRef.current?.focus();

    function aoPressionarTecla(evento) {
      if (evento.key === 'Escape') onFechar();
      if (evento.key !== 'Tab') return;

      const focaveis = painelRef.current?.querySelectorAll('button:not(:disabled)');
      if (!focaveis?.length) return;
      const primeiro = focaveis[0];
      const ultimo = focaveis[focaveis.length - 1];

      if (evento.shiftKey && (document.activeElement === primeiro || document.activeElement === painelRef.current)) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primeiro.focus();
      }
    }

    document.addEventListener('keydown', aoPressionarTecla);
    return () => {
      document.removeEventListener('keydown', aoPressionarTecla);
      document.body.style.overflow = overflowAnterior;
      elementoAnterior?.focus?.();
    };
  }, [onFechar]);

  function alterarPersonalizacao(id, delta) {
    setQuantidadesPersonalizacoes((quantidadesAtuais) => ({
      ...quantidadesAtuais,
      // O backend atual recebe uma lista de IDs, sem quantidade por personalização.
      [id]: Math.min(1, Math.max(0, (quantidadesAtuais[id] || 0) + delta)),
    }));
  }

  function adicionarNaSacola() {
    if (!podeAdicionar) return;

    const personalizacoes = personalizacoesDisponiveis
      .map((item) => ({
        ...item,
        quantidade: quantidadesPersonalizacoes[item.id] || 0,
      }))
      .filter((item) => item.quantidade > 0);

    onAdicionar({
      quantidade,
      personalizacoes,
      tamanho: tamanhoSelecionado,
    });
  }

  return (
    <div
      className={styles.overlay}
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) onFechar();
      }}
    >
      <section
        ref={painelRef}
        className={styles.painel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="produto-modal-titulo"
        tabIndex={-1}
      >
        <header className={styles.cabecalho}>
          <div>
            <p className={styles.eyebrow}>Cardápio</p>
            <h2 id="produto-modal-titulo" className={styles.nome}>{produto.nome}</h2>
          </div>
          <button
            type="button"
            className={styles.fechar}
            onClick={onFechar}
            aria-label="Fechar detalhes do produto"
          >
            ×
          </button>
        </header>

        <div className={styles.corpo}>
          <div className={styles.imagemContainer}>
            <img
              src={produto.imagem || ImagemProduto}
              alt={produto.nome}
              onError={(evento) => {
                evento.currentTarget.onerror = null;
                evento.currentTarget.src = ImagemProduto;
              }}
            />
          </div>

          <div className={styles.informacoes}>
            <dl className={styles.dados}>
              <div className={styles.linhaDado}>
                <dt>Categoria</dt>
                <dd>{produto.categoriaNome || 'Não informada'}</dd>
              </div>
              <div className={styles.linhaDado}>
                <dt>Preço</dt>
                <dd>
                  {exigeTamanho && !tamanhoSelecionado
                    ? `a partir de R$ ${formatarPreco(Math.min(...tamanhos.map((t) => t.precoUnidade)))}`
                    : `R$ ${formatarPreco(precoExibido)}`}
                </dd>
              </div>
            </dl>

            <div className={styles.descricao}>
              <h3>Descrição</h3>
              <p>{produto.descricao || 'Sem descrição.'}</p>
            </div>

            {(carregandoTamanhos || avisoTamanhos || exigeTamanho) && (
              <section className={styles.tamanhos}>
                <h3>Tamanho</h3>
                {carregandoTamanhos && <p>Carregando tamanhos...</p>}
                {!carregandoTamanhos && avisoTamanhos && (
                  <p className={styles.aviso}>{avisoTamanhos}</p>
                )}
                {!carregandoTamanhos && exigeTamanho && (
                  <div className={styles.opcoesTamanho} role="radiogroup" aria-label="Tamanho">
                    {tamanhos.map((tamanho) => (
                      <button
                        key={tamanho.id}
                        type="button"
                        role="radio"
                        aria-checked={tamanho.id === tamanhoId}
                        className={`${styles.opcaoTamanho} ${
                          tamanho.id === tamanhoId ? styles.opcaoTamanhoAtiva : ''
                        }`}
                        onClick={() => setTamanhoId(tamanho.id)}
                      >
                        <strong>{tamanho.nome}</strong>
                        {tamanho.volumeMl && <span>{tamanho.volumeMl} ml</span>}
                        <span>R$ {formatarPreco(tamanho.precoUnidade)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}

            <div className={styles.linhaControle}>
              <span>Quantidade</span>
              <Stepper
                valor={quantidade}
                min={1}
                podeIncrementar={quantidade < 99}
                onDecrementar={() => setQuantidade((valor) => Math.max(1, valor - 1))}
                onIncrementar={() => setQuantidade((valor) => Math.min(99, valor + 1))}
              />
            </div>

            <section className={styles.ingredientes}>
              <h3>Ingredientes</h3>
              {carregandoIngredientes && <p>Carregando ingredientes...</p>}
              {!carregandoIngredientes && avisoIngredientes && (
                <p className={styles.aviso}>{avisoIngredientes}</p>
              )}
              {!carregandoIngredientes && !avisoIngredientes && ingredientes.length === 0 && (
                <p>Nenhum ingrediente foi informado para este produto.</p>
              )}
              {!carregandoIngredientes && ingredientes.length > 0 && (
                <ul className={styles.listaIngredientes}>
                  {ingredientes.map((item) => <li key={item.id}>{item.nome}</li>)}
                </ul>
              )}
            </section>

            <section className={styles.personalizacoes}>
              <h3>Personalizações</h3>
              {carregandoPersonalizacoes && <p>Carregando personalizações...</p>}
              {!carregandoPersonalizacoes && avisoPersonalizacoes && (
                <p className={styles.aviso}>{avisoPersonalizacoes}</p>
              )}
              {!carregandoPersonalizacoes &&
                !avisoPersonalizacoes &&
                personalizacoesDisponiveis.length === 0 && (
                  <p>Nenhuma personalização está disponível para este produto.</p>
                )}
              {!carregandoPersonalizacoes && personalizacoesDisponiveis.map((item) => {
                const quantidadePersonalizacao = quantidadesPersonalizacoes[item.id] || 0;

                return (
                  <div key={item.id} className={styles.linhaPersonalizacao}>
                    <span>{item.nome}</span>
                    <Stepper
                      valor={quantidadePersonalizacao}
                      min={0}
                      podeIncrementar={quantidadePersonalizacao < 1}
                      onDecrementar={() => alterarPersonalizacao(item.id, -1)}
                      onIncrementar={() => alterarPersonalizacao(item.id, 1)}
                    />
                  </div>
                );
              })}
            </section>

            <button
              type="button"
              className={styles.adicionar}
              onClick={adicionarNaSacola}
              disabled={!podeAdicionar}
              title={podeAdicionar ? undefined : 'Escolha um tamanho'}
            >
              {exigeTamanho && !tamanhoSelecionado ? 'Escolha um tamanho' : 'Adicionar à sacola'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
