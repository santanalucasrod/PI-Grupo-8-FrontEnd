import { useState, useEffect, useRef, useCallback } from "react";
 import axios from "axios";
 import { authHeader } from "../../utils/authHeader";
 import { api } from "../../providers/axiosClient";
 import styles from "./Pedidos.module.css";
 
 const INTERVALO_ATUALIZACAO_MS = 5000;

 // Só exibimos 2 pedidos em preparo por vez na tela principal (cards grandes,
 // pensados pra visualização de longe pelo barista). Os demais continuam em
 // preparo "por baixo dos panos" e vão aparecendo conforme os 2 primeiros são concluídos.
 const MAX_CARDS_ATIVOS = 2;
 const MAX_FILA_EXIBIDA = 6;
 const STATUS_EXIBIDOS = ["PENDENTE", "EM_PREPARO"];

 // Nome do cliente que fez o pedido (campo "nomeCliente" do PedidoResponse).
 function nomePedido(pedido) {
   return pedido.nomeCliente?.trim() || "Cliente sem nome";
 }

 // Padroniza o status vindo do backend ("Pendente", " em_preparo " etc.) e avisa no
 // console sobre pedidos com status que esta tela não exibe, pra não sumirem em silêncio.
 function normalizarPedidos(lista) {
   return lista.map((pedido) => {
     const status =
       typeof pedido.status === "string" ? pedido.status.trim().toUpperCase() : pedido.status;
     if (!STATUS_EXIBIDOS.includes(status)) {
       console.warn(`Pedido #${pedido.id} com status "${pedido.status}" não é exibido nesta tela.`);
     }
     return { ...pedido, status, itens: pedido.itens ?? [] };
   });
 }

 const USAR_DADOS_MOCK = false;

 const PEDIDOS_MOCK = [
   {
     id: 101,
     nomeCliente: "Ana Beatriz",
     status: "EM_PREPARO",
     descricao: "Cliente vai retirar no balcão",
     itens: [
       { id: 1, nomeProduto: "Cappuccino", quantidade: 1, pronto: true, volumeMl: 300, observacao: "Sem açúcar" },
       { id: 2, nomeProduto: "Pão de queijo", quantidade: 2, pronto: true },
       { id: 3, nomeProduto: "Água com gás", quantidade: 1, pronto: false, volumeMl: 500 },
     ],
   },
   {
     id: 102,
     nomeCliente: "Marcos Vinícius",
     status: "EM_PREPARO",
     descricao: "",
     itens: [
       { id: 4, nomeProduto: "Espresso duplo", quantidade: 1, pronto: false, volumeMl: 60 },
       { id: 5, nomeProduto: "Croissant", quantidade: 1, pronto: false },
     ],
   },
   {
     id: 103,
     nomeCliente: "Juliana Prado",
     status: "EM_PREPARO",
     descricao: "Alergia a lactose",
     itens: [
       { id: 6, nomeProduto: "Latte", quantidade: 1, pronto: true, volumeMl: 350, observacao: "Leite de aveia" },
     ],
   },
   {
     id: 104,
     nomeCliente: "Pedro Henrique",
     status: "PENDENTE",
     descricao: "",
     itens: [
       { id: 7, nomeProduto: "Mocha", quantidade: 1, pronto: false, volumeMl: 400 },
       { id: 8, nomeProduto: "Bolo de cenoura", quantidade: 1, pronto: false },
     ],
   },
   {
     id: 105,
     nomeCliente: "Camila Souza",
     status: "PENDENTE",
     descricao: "",
     itens: [
       { id: 9, nomeProduto: "Chá gelado", quantidade: 2, pronto: false, volumeMl: 400, observacao: "Menos gelo" },
     ],
   },
   {
     id: 106,
     nomeCliente: "",
     status: "PENDENTE",
     descricao: "",
     itens: [
       { id: 10, nomeProduto: "Café coado", quantidade: 1, pronto: false, volumeMl: 300 },
       { id: 11, nomeProduto: "Torrada", quantidade: 1, pronto: false },
     ],
   },
 ];
 
 /**
  * Tela de visualização da fila de pedidos, feita para o barista.
  *
  * Endpoints usados (alinhados com o backend):
  *  - GET   /pedidos?ativos=true            -> lista pedidos PENDENTE/EM_PREPARO
  *  - PATCH /pedidos/itens/{itemId}/pronto  -> marca/desmarca um item como pronto
  *  - PATCH /pedidos/{id}/status            -> move o pedido entre PENDENTE/EM_PREPARO/PRONTO
  *  - PATCH /pedidos/{id}/cancelar          -> cancela o pedido (some da fila)
  *
  * ItemResponse retorna personalizacoes (lista de nomes) e observacao por item.
  * PedidoResponse.descricao contém as observações gerais do pedido.
  */
 function Pedidos() {
   const [pedidos, setPedidos] = useState([]);
   const [carregando, setCarregando] = useState(true);
   const [erro, setErro] = useState("");
   const [atualizando, setAtualizando] = useState(false);
   const [popoverAberto, setPopoverAberto] = useState(null); // id do pedido
   const primeiraCargaFeita = useRef(false);

   // Controle de concorrência entre o polling e as atualizações otimistas:
   //  - versaoMutacao: incrementa a cada mutação; um GET iniciado antes dela é descartado,
   //    senão a resposta antiga sobrescreveria o clique (item "desmarcando sozinho",
   //    pedido concluído voltando pra tela).
   //  - mutacoesEmAndamento: enquanto houver PATCH pendente, o polling fica pausado.
   //  - controllerAtual: aborta o GET anterior para evitar respostas fora de ordem.
   const versaoMutacao = useRef(0);
   const mutacoesEmAndamento = useRef(0);
   const controllerAtual = useRef(null);

   const carregarPedidos = useCallback(async () => {
     if (USAR_DADOS_MOCK) return;
     if (mutacoesEmAndamento.current > 0) return;

     controllerAtual.current?.abort();
     const controller = new AbortController();
     controllerAtual.current = controller;
     const versaoNoInicio = versaoMutacao.current;

     try {
       const resposta = await api.get('/pedidos', {
         params: { ativos: true },
         headers: authHeader(),
         signal: controller.signal,
       });
       if (controller.signal.aborted || versaoNoInicio !== versaoMutacao.current) return;
       // 204 (nenhum pedido ativo) vem sem corpo
       const novosPedidos = normalizarPedidos(Array.isArray(resposta.data) ? resposta.data : []);
       setPedidos(novosPedidos);
       // se o pedido com o popover aberto saiu da lista, limpa o id órfão
       setPopoverAberto((aberto) =>
         novosPedidos.some((p) => p.id === aberto) ? aberto : null
       );
       setErro("");
     } catch (e) {
       if (axios.isCancel(e)) return;
       setErro("Não foi possível carregar os pedidos.");
     } finally {
       if (controllerAtual.current === controller) {
         controllerAtual.current = null;
         setCarregando(false);
         primeiraCargaFeita.current = true;
       }
     }
   }, []);

   useEffect(() => {
     if (USAR_DADOS_MOCK) {
       // simula um pequeno delay de rede pra ver o "Carregando..." também
       const timeout = setTimeout(() => {
         setPedidos(PEDIDOS_MOCK);
         setCarregando(false);
         primeiraCargaFeita.current = true;
       }, 400);
       return () => clearTimeout(timeout);
     }

     const primeiraCarga = setTimeout(carregarPedidos, 0);
     const intervalo = setInterval(carregarPedidos, INTERVALO_ATUALIZACAO_MS);

     return () => {
       clearTimeout(primeiraCarga);
       clearInterval(intervalo);
       controllerAtual.current?.abort();
     };
   }, [carregarPedidos]);

   // Envolve um PATCH: invalida GETs em voo, pausa o polling durante a requisição
   // e, se falhar, recarrega o estado real do servidor para desfazer o otimismo.
   async function executarMutacao(requisicao, mensagemErro) {
     if (mutacoesEmAndamento.current > 0) return;
     versaoMutacao.current += 1;
     mutacoesEmAndamento.current += 1;
     setAtualizando(true);
     controllerAtual.current?.abort();

     let falhou = false;
     try {
       await requisicao();
       setErro("");
     } catch {
       falhou = true;
     } finally {
       mutacoesEmAndamento.current -= 1;
     }

     if (falhou) {
       await carregarPedidos();
       setErro(mensagemErro);
     }
     setAtualizando(false);
   }

   async function alternarItemPronto(itemId, prontoAtual) {
     if (mutacoesEmAndamento.current > 0) return;
     // atualização otimista: reflete na tela antes da resposta do servidor
     setPedidos((atual) =>
       atual.map((pedido) => ({
         ...pedido,
         itens: pedido.itens.map((item) =>
           item.id === itemId ? { ...item, pronto: !prontoAtual } : item
         ),
       }))
     );

     if (USAR_DADOS_MOCK) return; // no mock, a atualização otimista já basta

     await executarMutacao(
       () =>
         api.patch(`/pedidos/itens/${itemId}/pronto`, {
           pronto: !prontoAtual,
         }, { headers: authHeader() }),
       "Não foi possível atualizar o item. Recarregando..."
     );
   }

   async function iniciarPreparo(pedidoId) {
     if (mutacoesEmAndamento.current > 0) return;
     // calculado a partir do estado do render, e não dentro do updater do setPedidos
     // (o React não garante que o updater rode de forma síncrona)
     const totalEmPreparo = pedidos.filter((p) => p.status === "EM_PREPARO").length;
     if (totalEmPreparo >= MAX_CARDS_ATIVOS) return;

     setPedidos((atual) =>
       atual.map((p) => (p.id === pedidoId ? { ...p, status: "EM_PREPARO" } : p))
     );

     if (USAR_DADOS_MOCK) return;

     await executarMutacao(
       () =>
         api.patch(`/pedidos/${pedidoId}/status`, {
           status: "EM_PREPARO",
         }, { headers: authHeader() }),
       "Não foi possível iniciar o preparo do pedido."
     );
   }

   async function concluirPedido(pedidoId) {
     if (mutacoesEmAndamento.current > 0) return;
     if (USAR_DADOS_MOCK) {
       setPedidos((atual) => atual.filter((p) => p.id !== pedidoId));
       setPopoverAberto((aberto) => (aberto === pedidoId ? null : aberto));
       return;
     }

     await executarMutacao(async () => {
       await api.patch(`/pedidos/${pedidoId}/status`, {
         status: "PRONTO",
       }, { headers: authHeader() });
       setPedidos((atual) => atual.filter((p) => p.id !== pedidoId));
       setPopoverAberto((aberto) => (aberto === pedidoId ? null : aberto));
     }, "Não foi possível concluir o pedido.");
   }

   async function cancelarPedido(pedido) {
     if (mutacoesEmAndamento.current > 0) return;
     if (!window.confirm(`Cancelar o pedido de ${nomePedido(pedido)}?`)) return;

     const removerDaTela = () => {
       setPedidos((atual) => atual.filter((p) => p.id !== pedido.id));
       setPopoverAberto((aberto) => (aberto === pedido.id ? null : aberto));
     };

     if (USAR_DADOS_MOCK) {
       removerDaTela();
       return;
     }

     await executarMutacao(async () => {
       await api.patch(`/pedidos/${pedido.id}/cancelar`, null, {
         headers: authHeader(),
       });
       removerDaTela();
     }, "Não foi possível cancelar o pedido.");
   }

   async function devolverParaFila(pedidoId) {
     if (mutacoesEmAndamento.current > 0) return;
     if (USAR_DADOS_MOCK) {
       setPedidos((atual) => atual.map((pedido) =>
         pedido.id === pedidoId ? { ...pedido, status: 'PENDENTE' } : pedido
       ));
       return;
     }

     await executarMutacao(async () => {
       const resposta = await api.patch(`/pedidos/${pedidoId}/status`, {
         status: 'PENDENTE',
       }, { headers: authHeader() });
       const [pedidoAtualizado] = normalizarPedidos([resposta.data]);
       setPedidos((atual) => atual.map((pedido) =>
         pedido.id === pedidoId ? pedidoAtualizado : pedido
       ));
       setPopoverAberto((aberto) => aberto === pedidoId ? null : aberto);
     }, 'Não foi possível devolver o pedido para a fila.');
   }

   const todosEmPreparo = pedidos.filter((p) => p.status === "EM_PREPARO");
   const emPreparo = todosEmPreparo.slice(0, MAX_CARDS_ATIVOS);
   // Pedidos que já estão "Em preparo" mas não couberam nos cards grandes —
   // ficam visíveis aqui, de forma resumida, até que uma vaga se abra.
   const emPreparoOculto = todosEmPreparo.slice(MAX_CARDS_ATIVOS);
   const pendentes = pedidos.filter((p) => p.status === "PENDENTE");
   const filaCompleta = [...emPreparoOculto, ...pendentes];
   const fila = filaCompleta.slice(0, MAX_FILA_EXIBIDA);
   const restanteNaFila = filaCompleta.length - fila.length;
 
   return (
     <main className={styles.main}>
       <div className={styles.conteudo}>
         <h2 className={styles.titulo}>Gestão e controle de pedidos</h2>
 
         {erro && <div className={styles.avisoErro} role="alert">{erro}</div>}
 
         {carregando ? (
           <p className={styles.vazio}>Carregando pedidos...</p>
         ) : (
           <>
             <section className={styles.linhaAtivos}>
               {emPreparo.length === 0 && (
                 <p className={styles.vazio}>Nenhum pedido em preparo no momento.</p>
               )}
               {emPreparo.map((pedido) => (
                 <CardPedidoAtivo
                   key={pedido.id}
                   pedido={pedido}
                   popoverAberto={popoverAberto === pedido.id}
                   onAbrirPopover={() =>
                     setPopoverAberto(popoverAberto === pedido.id ? null : pedido.id)
                   }
                   onFecharPopover={() => setPopoverAberto(null)}
                   onAlternarItem={alternarItemPronto}
                   onConcluir={() => concluirPedido(pedido.id)}
                   onCancelar={() => cancelarPedido(pedido)}
                   onDevolver={() => devolverParaFila(pedido.id)}
                   atualizando={atualizando}
                 />
               ))}
             </section>
 
             <h3 className={styles.subtitulo}>Próximos na fila</h3>
             <section className={styles.linhaFila}>
               {fila.length === 0 && (
                 <p className={styles.vazio}>Nenhum pedido aguardando na fila.</p>
               )}
               {fila.map((pedido) => (
                 <CardPedidoFila
                   key={pedido.id}
                   pedido={pedido}
                   // pedidos "Em preparo" escondidos já estão ativos: não têm ação de
                   // iniciar, só aguardam vaga nos cards grandes.
                   jaEmPreparo={pedido.status === "EM_PREPARO"}
                   bloqueado={atualizando || pedido.status === "EM_PREPARO" || todosEmPreparo.length >= MAX_CARDS_ATIVOS}
                   onIniciar={() => iniciarPreparo(pedido.id)}
                   onCancelar={() => cancelarPedido(pedido)}
                   onDevolver={() => devolverParaFila(pedido.id)}
                   atualizando={atualizando}
                 />
               ))}
               {restanteNaFila > 0 && (
                 <div className={styles.contadorFila}>+{restanteNaFila} na fila</div>
               )}
             </section>
           </>
         )}
       </div>
     </main>
   );
 }
 
 function CardPedidoAtivo({
   pedido,
   popoverAberto,
   onAbrirPopover,
   onFecharPopover,
   onAlternarItem,
   onConcluir,
   onCancelar,
   onDevolver,
   atualizando,
 }) {
   const total = pedido.itens.length;
   const feitos = pedido.itens.filter((i) => i.pronto).length;
   const progresso = total === 0 ? 0 : Math.round((feitos / total) * 100);
   const temObservacaoGeral = Boolean(pedido.descricao);
   const tudoPronto = total > 0 && feitos === total;
 
   return (
     <div className={styles.card}>
       <div className={styles.cardHeader}>
         <button
           type="button"
           className={`${styles.checkGrande} ${tudoPronto ? styles.checkGrandeAtivo : ""}`}
           title={tudoPronto ? "Concluir pedido" : "Finalize todos os itens para concluir"}
           disabled={atualizando || !tudoPronto}
           aria-label="Concluir pedido"
           onClick={onConcluir}
         >
           {tudoPronto && "✓"}
         </button>
         <span className={styles.nomeCliente}>{nomePedido(pedido)}</span>

         <button
           type="button"
           className={styles.botaoCancelar}
           onClick={onCancelar}
           disabled={atualizando}
           title="Cancelar pedido"
         >
           Cancelar
         </button>
 
         {temObservacaoGeral && (
           <button
             type="button"
             className={styles.iconeObs}
             onClick={onAbrirPopover}
             aria-label="Ver observações gerais do pedido"
             title="Ver observações gerais do pedido"
           >
             <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path
                 d="M6 2h9l5 5v15H6V2z"
                 stroke="currentColor"
                 strokeWidth="2"
                 strokeLinejoin="round"
               />
               <path d="M14 2v6h6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
               <path d="M9 13h6M9 17h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
             </svg>
           </button>
         )}
 
         {popoverAberto && (
           <div className={styles.popover}>
             <div className={styles.popoverHeader}>
               <strong>Observações gerais:</strong>
               <button className={styles.popoverFechar} onClick={onFecharPopover}>
                 ×
               </button>
             </div>
             <p>{pedido.descricao || "Sem observações"}</p>
           </div>
         )}
       </div>
 
       <div className={styles.barraProgresso} style={{ width: `${progresso}%` }} />
 
       <ul className={styles.listaItens}>
         {pedido.itens.map((item, idx) => (
           <li key={item.id} className={styles.itemLinha}>
             {idx !== 0 && <span className={styles.linhaConectora} />}
             <button
               type="button"
               className={`${styles.checkbox} ${item.pronto ? styles.checkboxMarcado : ""}`}
               onClick={() => onAlternarItem(item.id, item.pronto)}
               disabled={atualizando}
               aria-pressed={Boolean(item.pronto)}
               aria-label={item.pronto ? "Desmarcar item" : "Marcar item como pronto"}
             >
               {item.pronto && "✓"}
             </button>
             <span className={styles.itemTextos}>
               <span className={item.pronto ? styles.itemFeito : styles.itemNome}>
                 {item.nomeProduto} {item.quantidade > 1 ? `x${item.quantidade}` : ""}
                 {item.volumeMl > 0 && <span className={styles.itemVolume}> · {item.volumeMl}ml</span>}
               </span>
               {item.personalizacoes?.length > 0 && (
                 <span className={styles.itemPersonalizacoes}>Personalizações: {item.personalizacoes.join(', ')}</span>
               )}
               {item.observacao && (
                 <span className={styles.itemObservacao}>⚠ {item.observacao}</span>
               )}
             </span>
           </li>
         ))}
       </ul>
       <button type="button" className={styles.botaoDevolver} onClick={onDevolver} disabled={atualizando}>
         Voltar para a fila
       </button>
     </div>
   );
 }
 
 function CardPedidoFila({ pedido, bloqueado, jaEmPreparo, onIniciar, onCancelar, onDevolver, atualizando }) {
   return (
     <div className={styles.cardFila}>
       <button
         type="button"
         className={`${styles.iniciarFila} ${bloqueado ? styles.cardFilaBloqueado : ""}`}
         onClick={jaEmPreparo ? undefined : onIniciar}
         disabled={bloqueado}
         title={
           jaEmPreparo
             ? "Pedido já em preparo, aguardando vaga nos cards ativos"
             : bloqueado
             ? "Conclua um pedido em preparo para liberar espaço"
             : "Iniciar preparo deste pedido"
         }
       >
         <div className={styles.cardFilaHeader}>{nomePedido(pedido)}</div>
         <ul className={styles.listaFila}>
           {pedido.itens.map((item) => (
             <li key={item.id}>
               {item.nomeProduto} {item.quantidade > 1 ? `x${item.quantidade}` : ""}
               {item.volumeMl > 0 && <span className={styles.itemVolumeFila}> · {item.volumeMl}ml</span>}
               {item.personalizacoes?.length > 0 && (
                 <span className={styles.itemPersonalizacoes}>Personalizações: {item.personalizacoes.join(', ')}</span>
               )}
               {item.observacao && (
                 <span className={styles.itemObservacaoFila}> · {item.observacao}</span>
               )}
             </li>
           ))}
         </ul>
         {bloqueado && (
           <div className={styles.cardFilaAvisoBloqueio}>
             {jaEmPreparo ? "☕ Em preparo · aguardando vaga" : "🔒 Aguardando vaga"}
           </div>
         )}
       </button>
       <button type="button" className={styles.botaoCancelarFila} onClick={onCancelar} disabled={atualizando}>
         Cancelar pedido
       </button>
       {jaEmPreparo && (
         <button type="button" className={styles.botaoDevolver} onClick={onDevolver} disabled={atualizando}>
           Voltar para a fila
         </button>
       )}
     </div>
   );
 }
 
 export default Pedidos;
