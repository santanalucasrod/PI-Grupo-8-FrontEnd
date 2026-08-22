import { useState, useEffect, useRef, useMemo } from "react";
import {
  Chart,
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  DoughnutController,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import "../Dashboard/Dashboard.css";

Chart.register(
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  DoughnutController,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

function formatarDinheiro(valor) {
  return valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

function formatarDataCurta(data) {
  return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

// Formata uma data no padrão yyyy-mm-dd exigido pelo <input type="date">,
// usando o fuso horário local (evita o problema de "voltar um dia" que
// acontece usando toISOString(), que converte pra UTC).
function formatarDataInput(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

// ── Geração determinística de números "aleatórios" a partir de uma string,
// só pra podermos simular dados plausíveis para QUALQUER intervalo de datas
// escolhido pelo usuário (data início / data fim), sem precisar do backend.
//
// IMPORTANTE: essa geração é só um mock pro front. O ideal, quando integrar
// de verdade, é o BACKEND receber dataInicio/dataFim como parâmetros de query
// (ex.: GET /dashboard/resumo?inicio=2026-08-01&fim=2026-08-15) e devolver os
// números já calculados (SUM/COUNT/AVG filtrando por data no banco). Fazer
// esse filtro/agrupamento no front, buscando todos os pedidos e calculando
// aqui, não escala bem conforme o volume de pedidos cresce.
function gerarSeed(texto) {
  let hash = 0;
  for (let i = 0; i < texto.length; i++) {
    hash = (hash * 31 + texto.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function aleatorioA_partirDoSeed(seed) {
  let t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

const PRODUTOS_TOP_MOCK = ["Espresso", "Cappuccino", "Latte", "Mocha", "Chá Gelado"];

/**
 * Gera dados mockados para o intervalo [dataInicioStr, dataFimStr] (formato yyyy-mm-dd).
 * Datas iguais são tratadas como 1 dia. Intervalos com mais de 31 dias são
 * agrupados por semana no gráfico, pra não virar uma barra ilegível.
 */
function gerarDadosPersonalizados(dataInicioStr, dataFimStr) {
  const inicio = new Date(`${dataInicioStr}T00:00:00`);
  const fim = new Date(`${dataFimStr}T00:00:00`);
  const totalDias = Math.round((fim - inicio) / (1000 * 60 * 60 * 24)) + 1;

  const agruparPorSemana = totalDias > 31;
  const totalPontos = agruparPorSemana ? Math.ceil(totalDias / 7) : totalDias;
  const chaveIntervalo = `${dataInicioStr}_${dataFimStr}`;

  const labels = [];
  const faturamentoSerie = [];
  const pedidosSerie = [];
  let faturamentoTotal = 0;
  let pedidosTotal = 0;

  for (let i = 0; i < totalPontos; i++) {
    const dataPonto = new Date(inicio);
    dataPonto.setDate(inicio.getDate() + i * (agruparPorSemana ? 7 : 1));

    const rnd = aleatorioA_partirDoSeed(gerarSeed(`${chaveIntervalo}_${i}`));
    const baseFaturamento = agruparPorSemana ? 6000 : 850;
    const baseVariacao = agruparPorSemana ? 6000 : 700;
    const basePedidos = agruparPorSemana ? 380 : 45;
    const variacaoPedidos = agruparPorSemana ? 320 : 55;

    const faturamentoPonto = Math.round(baseFaturamento + rnd * baseVariacao);
    const pedidosPonto = Math.round(basePedidos + rnd * variacaoPedidos);

    labels.push(agruparPorSemana ? `Sem ${i + 1}` : formatarDataCurta(dataPonto));
    faturamentoSerie.push(faturamentoPonto);
    pedidosSerie.push(pedidosPonto);
    faturamentoTotal += faturamentoPonto;
    pedidosTotal += pedidosPonto;
  }

  const seedProduto = gerarSeed(`${chaveIntervalo}_produto`);
  const produtoTop =
    PRODUTOS_TOP_MOCK[Math.floor(aleatorioA_partirDoSeed(seedProduto) * PRODUTOS_TOP_MOCK.length)];
  const tempoMedio = Number(
    (5 + aleatorioA_partirDoSeed(gerarSeed(`${chaveIntervalo}_tempo`)) * 3).toFixed(1)
  );

  return {
    faturamento: faturamentoTotal,
    pedidos: pedidosTotal,
    tempoMedio,
    produtoTop,
    barras: { labels, faturamento: faturamentoSerie, pedidos: pedidosSerie },
    categorias: {
      labels: ["Cafés Quentes", "Bebidas Frias", "Doces & Bolos", "Salgados"],
      valores: [
        Math.round(50 + aleatorioA_partirDoSeed(seedProduto + 1) * 30),
        Math.round(35 + aleatorioA_partirDoSeed(seedProduto + 2) * 30),
        Math.round(25 + aleatorioA_partirDoSeed(seedProduto + 3) * 25),
        Math.round(15 + aleatorioA_partirDoSeed(seedProduto + 4) * 20),
      ],
    },
  };
}

// ── Gráfico de barras + linha
function GraficoBarraLinha({ barras }) {
  const refCanvas = useRef(null);
  const refGrafico = useRef(null);

  useEffect(() => {
    if (refGrafico.current) {
      refGrafico.current.destroy();
      refGrafico.current = null;
    }

    const contexto = refCanvas.current.getContext("2d");
    refGrafico.current = new Chart(contexto, {
      data: {
        labels: barras.labels,
        datasets: [
          {
            type: "bar",
            label: "Faturamento (R$)",
            data: barras.faturamento,
            backgroundColor: "rgba(141, 91, 66, 0.85)",
            borderRadius: 6,
            yAxisID: "yFaturamento",
            order: 2,
          },
          {
            type: "line",
            label: "Pedidos",
            data: barras.pedidos,
            borderColor: "rgba(160,105,78,0.9)",
            backgroundColor: "rgba(160,105,78,0.15)",
            pointBackgroundColor: "#A0694E",
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 2,
            tension: 0.4,
            fill: false,
            yAxisID: "yPedidos",
            order: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            labels: {
              color: "rgba(58,58,58,0.85)",
              font: { family: "Barlow", size: 12, weight: "600" },
              boxWidth: 12,
              boxHeight: 12,
            },
          },
          tooltip: {
            backgroundColor: "rgba(93,58,34,0.95)",
            titleFont: { family: "Barlow", weight: "700" },
            bodyFont: { family: "Barlow" },
          },
        },
        scales: {
          x: {
            ticks: { color: "rgba(58,58,58,0.75)", font: { family: "Barlow", size: 11 } },
            grid: { color: "rgba(0,0,0,0.06)" },
          },
          yFaturamento: {
            position: "left",
            ticks: { color: "rgba(141,91,66,0.9)", font: { family: "Barlow", size: 11 } },
            grid: { color: "rgba(0,0,0,0.06)" },
          },
          yPedidos: {
            position: "right",
            ticks: { color: "rgba(58,58,58,0.65)", font: { family: "Barlow", size: 11 } },
            grid: { drawOnChartArea: false },
          },
        },
      },
    });

    return () => {
      if (refGrafico.current) refGrafico.current.destroy();
    };
  }, [barras]);

  return (
    <div className="chartjs-wrap">
      <canvas ref={refCanvas} />
    </div>
  );
}

// ── Gráfico de rosca
function GraficoRosca({ categorias }) {
  const refCanvas = useRef(null);
  const refGrafico = useRef(null);

  const CORES = [
    "rgba(141,91,66,0.9)",
    "rgba(160,105,78,0.75)",
    "rgba(200,170,140,0.85)",
    "rgba(93,58,34,0.55)",
  ];

  useEffect(() => {
    if (refGrafico.current) {
      refGrafico.current.destroy();
      refGrafico.current = null;
    }

    const contexto = refCanvas.current.getContext("2d");
    refGrafico.current = new Chart(contexto, {
      type: "doughnut",
      data: {
        labels: categorias.labels,
        datasets: [
          {
            data: categorias.valores,
            backgroundColor: CORES,
            borderColor: "#EEEEEE",
            borderWidth: 2,
            hoverOffset: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "62%",
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "rgba(58,58,58,0.85)",
              font: { family: "Barlow", size: 12, weight: "600" },
              padding: 14,
              boxWidth: 12,
              boxHeight: 12,
            },
          },
          tooltip: {
            backgroundColor: "rgba(93,58,34,0.95)",
            titleFont: { family: "Barlow", weight: "700" },
            bodyFont: { family: "Barlow" },
            callbacks: {
              label: (contexto) => ` ${contexto.label}: ${contexto.parsed}%`,
            },
          },
        },
      },
    });

    return () => {
      if (refGrafico.current) refGrafico.current.destroy();
    };
  }, [categorias]);

  return (
    <div className="chartjs-wrap donut">
      <canvas ref={refCanvas} />
    </div>
  );
}

function Painel() {
  // Por padrão a tela abre mostrando os últimos 7 dias (hoje incluso), só
  // pra não abrir vazia. O usuário pode escolher qualquer outro intervalo.
  const hojeInput = formatarDataInput(new Date());
  const seteDiasAtras = new Date();
  seteDiasAtras.setDate(seteDiasAtras.getDate() - 6);

  const [dataInicio, setDataInicio] = useState(formatarDataInput(seteDiasAtras));
  const [dataFim, setDataFim] = useState(hojeInput);

  const intervaloValido = Boolean(dataInicio && dataFim && dataFim >= dataInicio);
  const erroPeriodo =
    dataInicio && dataFim && dataFim < dataInicio
      ? "A data final precisa ser igual ou posterior à data inicial."
      : "";

  const dados = useMemo(() => {
    if (!intervaloValido) return null;
    return gerarDadosPersonalizados(dataInicio, dataFim);
  }, [intervaloValido, dataInicio, dataFim]);

  const aguardandoSelecao = !dados;

  const rotuloPeriodo = intervaloValido
    ? `${formatarDataCurta(new Date(`${dataInicio}T00:00:00`))} a ${formatarDataCurta(
        new Date(`${dataFim}T00:00:00`)
      )}`
    : "";

  useEffect(() => {
    async function carregarDados() {
      try {
        const resposta = await fetch("http://localhost:8080/produtos");
        const dadosApi = await resposta.json();

        console.log(dadosApi);
      } catch (erro) {
        console.log(erro);
      }
    }

    carregarDados();
  }, []);

  return (
    <>
      <main className="dashboard-main">
        {/* Período */}
        <div className="periodo-bar">
          <span className="label">Selecione o período:</span>

          <div className="periodo-datas">
            <label className="periodo-data-campo">
              <span>De</span>
              <input
                type="date"
                value={dataInicio}
                max={dataFim || undefined}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </label>
            <label className="periodo-data-campo">
              <span>Até</span>
              <input
                type="date"
                value={dataFim}
                min={dataInicio || undefined}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </label>
            {erroPeriodo && <span className="periodo-erro">{erroPeriodo}</span>}
          </div>
        </div>

        {aguardandoSelecao ? (
          <div className="periodo-vazio">
            Selecione a data inicial e a data final para visualizar os dados do período.
          </div>
        ) : (
          <>
            {/* KPIs */}
            <div className="kpi-row">
              <div className="kpi-card">
                <span className="kpi-title">Faturamento Total (R$)</span>
                <span className="kpi-value" style={{ fontSize: "28px" }}>
                  R$ {formatarDinheiro(dados.faturamento)}
                </span>
                <span className="kpi-sub">período selecionado</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-title">Total de Pedidos</span>
                <span className="kpi-value">{dados.pedidos.toLocaleString("pt-BR")}</span>
                <span className="kpi-sub">pedidos realizados</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-title">Tempo médio de preparo (min)</span>
                <span className="kpi-value">{dados.tempoMedio}</span>
                <span className="kpi-sub">minutos por pedido</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-title">Produto Mais Vendido</span>
                <span className="kpi-value kpi-product">{dados.produtoTop}</span>
                <span className="kpi-sub">mais pedido no período</span>
              </div>
            </div>

            {/* Gráficos Chart.js */}
            <div className="charts-row">
              <div className="chart-card">
                <span className="chart-title">
                  Faturamento vs. Volume de Pedidos ({rotuloPeriodo})
                </span>
                <GraficoBarraLinha barras={dados.barras} />
              </div>
              <div className="chart-card">
                <span className="chart-title">
                  Top Categorias Mais Vendidas (Faturamento)
                </span>
                <GraficoRosca categorias={dados.categorias} />
              </div>
            </div>
          </>
        )}
      </main>
        
      <a href="/pedidos"><button className="pedidos-fab">Pedidos</button></a>
    </>
  );
}

export default Painel;