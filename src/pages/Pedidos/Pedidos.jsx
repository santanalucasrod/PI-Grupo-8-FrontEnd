import { useState, useEffect, useRef } from "react";
 import axios from "axios";
 import styles from "./Pedidos.module.css";
 
 const API_URL = "http://localhost:8080";
 const INTERVALO_ATUALIZACAO_MS = 5000;
 
 // ---------------------------------------------------------------------------
 // MODO MOCK: deixe true para visualizar o estilo da página com dados falsos,
 // sem precisar do backend rodando. Volte para false quando for integrar de verdade.
 // ---------------------------------------------------------------------------
 const USAR_DADOS_MOCK = true;

 const PEDIDOS_MOCK = [
   {
     id: 101,
     nome: "Ana Beatriz",
     status: "EM_PREPARO",
     descricao: "Sem chantilly",
     preferenciaIndividual: "Sem açúcar",
     itens: [
       { id: 1, nomeProduto: "Cappuccino", quantidade: 1, pronto: true },
       { id: 2, nomeProduto: "Pão de queijo", quantidade: 2, pronto: true },
       { id: 3, nomeProduto: "Água com gás", quantidade: 1, pronto: false },
     ],
   },
   {
     id: 102,
     nome: "Marcos Vinícius",
     status: "EM_PREPARO",
     descricao: "",
     preferenciaIndividual: "",
     itens: [
       { id: 4, nomeProduto: "Espresso duplo", quantidade: 1, pronto: false },
       { id: 5, nomeProduto: "Croissant", quantidade: 1, pronto: false },
     ],
   },
   {
     id: 103,
     nome: "Juliana Prado",
     status: "EM_PREPARO",
     descricao: "Alergia a lactose",
     preferenciaIndividual: "Leite de aveia",
     itens: [
       { id: 6, nomeProduto: "Latte", quantidade: 1, pronto: true },
     ],
   },
   {
     id: 104,
     nome: "Pedro Henrique",
     status: "PENDENTE",
     descricao: "",
     preferenciaIndividual: "",
     itens: [
       { id: 7, nomeProduto: "Mocha", quantidade: 1, pronto: false },
       { id: 8, nomeProduto: "Bolo de cenoura", quantidade: 1, pronto: false },
     ],
   },
   {
     id: 105,
     nome: "Camila Souza",
     status: "PENDENTE",
     descricao: "Sem observações",
     preferenciaIndividual: "",
     itens: [
       { id: 9, nomeProduto: "Chá gelado", quantidade: 2, pronto: false },
     ],
   },
   {
     id: 106,
     nome: "",
     status: "PENDENTE",
     descricao: "",
     preferenciaIndividual: "",
     itens: [
       { id: 10, nomeProduto: "Café coado", quantidade: 1, pronto: false },
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
  *
  * Observação sobre o modelo de dados: a observação/preferência ("Sem açúcar" etc.)
  * é salva por PEDIDO (info_adicional), não por item. Por isso o ícone de observação
  * fica no cabeçalho do card, não em cada item da lista.
  */
 function Pedidos() {
   const [pedidos, setPedidos] = useState([]);
   const [carregando, setCarregando] = useState(true);
   const [erro, setErro] = useState("");
   const [popoverAberto, setPopoverAberto] = useState(null); // id do pedido
   const primeiraCargaFeita = useRef(false);
 
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

     let cancelado = false;
 
     async function carregarPedidos() {
       try {
         const resposta = await axios.get(`${API_URL}/pedidos`, {
           params: { ativos: true },
         });
         if (cancelado) return;
         setPedidos(resposta.data);
         setErro("");
       } catch (e) {
         console.log(e);
         if (!cancelado) setErro("Não foi possível carregar os pedidos.");
       } finally {
         if (!cancelado) {
           setCarregando(false);
           primeiraCargaFeita.current = true;
         }
       }
     }
 
     carregarPedidos();
     const intervalo = setInterval(carregarPedidos, INTERVALO_ATUALIZACAO_MS);
 
     return () => {
       cancelado = true;
       clearInterval(intervalo);
     };
   }, []);
 
   async function alternarItemPronto(itemId, prontoAtual) {
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
 
     try {
       await axios.patch(`${API_URL}/pedidos/itens/${itemId}/pronto`, {
         pronto: !prontoAtual,
       });
     } catch (e) {
       console.log(e);
       setErro("Não foi possível atualizar o item. Recarregando...");
       // desfaz a atualização otimista buscando o estado real do servidor
       try {
         const resposta = await axios.get(`${API_URL}/pedidos`, {
           params: { ativos: true },
         });
         setPedidos(resposta.data);
       } catch (e2) {
         console.log(e2);
       }
     }
   }
 
   async function iniciarPreparo(pedidoId) {
     setPedidos((atual) =>
       atual.map((p) => (p.id === pedidoId ? { ...p, status: "EM_PREPARO" } : p))
     );

     if (USAR_DADOS_MOCK) return;
 
     try {
       await axios.patch(`${API_URL}/pedidos/${pedidoId}/status`, {
         status: "EM_PREPARO",
       });
     } catch (e) {
       console.log(e);
       setErro("Não foi possível iniciar o preparo do pedido.");
     }
   }
 
   async function concluirPedido(pedidoId) {
     if (USAR_DADOS_MOCK) {
       setPedidos((atual) => atual.filter((p) => p.id !== pedidoId));
       return;
     }

     try {
       await axios.patch(`${API_URL}/pedidos/${pedidoId}/status`, {
         status: "PRONTO",
       });
       setPedidos((atual) => atual.filter((p) => p.id !== pedidoId));
     } catch (e) {
       console.log(e);
       setErro("Não foi possível concluir o pedido.");
     }
   }
 
   // Só exibimos 2 pedidos em preparo por vez na tela principal (cards grandes,
   // pensados pra visualização de longe pelo barista). Os demais continuam em
   // preparo "por baixo dos panos" e vão aparecendo conforme os 2 primeiros são concluídos.
   const MAX_CARDS_ATIVOS = 2;
   const todosEmPreparo = pedidos.filter((p) => p.status === "EM_PREPARO");
   const emPreparo = todosEmPreparo.slice(0, MAX_CARDS_ATIVOS);
   const fila = pedidos.filter((p) => p.status === "PENDENTE");
 
   return (
     <main className={styles.main}>
       <h2 className={styles.titulo}>Gestão e controle de pedidos</h2>
 
       {erro && <div className={styles.avisoErro}>{erro}</div>}
 
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
                 onIniciar={() => iniciarPreparo(pedido.id)}
               />
             ))}
           </section>
         </>
       )}
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
 }) {
   const total = pedido.itens.length;
   const feitos = pedido.itens.filter((i) => i.pronto).length;
   const progresso = total === 0 ? 0 : Math.round((feitos / total) * 100);
   const temObservacao = Boolean(pedido.descricao || pedido.preferenciaIndividual);
   const tudoPronto = total > 0 && feitos === total;
 
   return (
     <div className={styles.card}>
       <div className={styles.cardHeader}>
         <button
           type="button"
           className={`${styles.checkGrande} ${tudoPronto ? styles.checkGrandeAtivo : ""}`}
           title={tudoPronto ? "Concluir pedido" : "Finalize todos os itens para concluir"}
           disabled={!tudoPronto}
           onClick={onConcluir}
         >
           {tudoPronto && "✓"}
         </button>
         <span className={styles.nomeCliente}>{pedido.nome || `Pedido #${pedido.id}`}</span>
 
         {temObservacao && (
           <button
             type="button"
             className={styles.iconeObs}
             onClick={onAbrirPopover}
             aria-label="Ver observações do pedido"
             title="Ver observações do pedido"
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
               <strong>Observações:</strong>
               <button className={styles.popoverFechar} onClick={onFecharPopover}>
                 ×
               </button>
             </div>
             <p>{pedido.descricao || "Sem observações"}</p>
             {pedido.preferenciaIndividual && (
               <p className={styles.preferencia}>{pedido.preferenciaIndividual}</p>
             )}
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
               aria-label={item.pronto ? "Desmarcar item" : "Marcar item como pronto"}
             >
               {item.pronto && "✓"}
             </button>
             <span className={item.pronto ? styles.itemFeito : styles.itemNome}>
               {item.nomeProduto} {item.quantidade > 1 ? `x${item.quantidade}` : ""}
             </span>
           </li>
         ))}
       </ul>
     </div>
   );
 }
 
 function CardPedidoFila({ pedido, onIniciar }) {
   return (
     <button type="button" className={styles.cardFila} onClick={onIniciar}>
       <div className={styles.cardFilaHeader}>{pedido.nome || `Pedido #${pedido.id}`}</div>
       <ul className={styles.listaFila}>
         {pedido.itens.map((item) => (
           <li key={item.id}>
             {item.nomeProduto} {item.quantidade > 1 ? `x${item.quantidade}` : ""}
           </li>
         ))}
       </ul>
     </button>
   );
 }
 
 export default Pedidos;