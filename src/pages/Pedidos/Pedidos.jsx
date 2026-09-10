import { useState, useEffect, useRef } from "react";
import { api } from "../../providers/axiosClient";
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

// Cabeçalho Authorization com o token salvo no login (localStorage).
function configuracao() {
  return { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } };
}

// Converte a resposta de GET /dashboard/resumo no formato que os
// componentes de KPI e de gráfico já esperam.
function mapearRespostaApi(dadosApi) {
  const serieDiaria = dadosApi.serieDiaria ?? [];
  const faturamentoPorCategoria = dadosApi.faturamentoPorCategoria ?? [];

  return {
    faturamento: Number(dadosApi.faturamentoTotal) || 0,
    pedidos: Number(dadosApi.totalPedidos) || 0,
    tempoMedio: Number(dadosApi.tempoMedioPreparoMinutos) || 0,
    produtoTop: dadosApi.produtoMaisVendido || "—",
    barras: {
      labels: serieDiaria.map((ponto) =>
        formatarDataCurta(new Date(`${ponto.data}T00:00:00`))
      ),
      faturamento: serieDiaria.map((ponto) => Number(ponto.faturamento) || 0),
      pedidos: serieDiaria.map((ponto) => Number(ponto.totalPedidos) || 0),
    },
    categorias: {
      labels: faturamentoPorCategoria.map((c) => c.categoria),
      valores: faturamentoPorCategoria.map((c) => Number(c.faturamento) || 0),
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
              // antes era percentual (mock); agora é faturamento real por categoria (R$)
              label: (contexto) => ` ${contexto.label}: R$ ${formatarDinheiro(contexto.parsed)}`,
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
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const intervaloValido = Boolean(dataInicio && dataFim && dataFim >= dataInicio);
  const erroPeriodo =
    dataInicio && dataFim && dataFim < dataInicio
      ? "A data final precisa ser igual ou posterior à data inicial."
      : "";

  const rotuloPeriodo = intervaloValido
    ? `${formatarDataCurta(new Date(`${dataInicio}T00:00:00`))} a ${formatarDataCurta(
        new Date(`${dataFim}T00:00:00`)
      )}`
    : "";

  // Busca o resumo real no backend (GET /dashboard/resumo?inicio=...&fim=...)
  // toda vez que o período selecionado mudar.
  useEffect(() => {
    if (!intervaloValido) {
      setDados(null);
      return;
    }

    let cancelado = false;

    async function carregarResumo() {
      setCarregando(true);
      setErro("");
      try {
        const resposta = await api.get(
          `/dashboard/resumo?inicio=${dataInicio}&fim=${dataFim}`,
          configuracao()
        );
        if (!cancelado) {
          setDados(mapearRespostaApi(resposta.data));
        }
      } catch (erroRequisicao) {
        if (!cancelado) {
          console.error(erroRequisicao);
          setErro("Não foi possível carregar os dados do período. Tente novamente.");
          setDados(null);
        }
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }

    carregarResumo();

    return () => {
      cancelado = true;
    };
  }, [intervaloValido, dataInicio, dataFim]);

  const aguardandoSelecao = !intervaloValido;

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
        ) : carregando ? (
          <div className="periodo-vazio">Carregando dados do período...</div>
        ) : erro ? (
          <div className="periodo-vazio">{erro}</div>
        ) : dados ? (
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
        ) : null}
      </main>

      <a href="/pedidos"><button className="pedidos-fab">Pedidos</button></a>
    </>
  );
}

export default Painel;