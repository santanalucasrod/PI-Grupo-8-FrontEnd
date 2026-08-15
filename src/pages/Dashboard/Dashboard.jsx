import { useState, useEffect, useRef } from "react";
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

// dados reais
const dadosReais = {
  Hoje: {
    faturamento: 1240.5,
    pedidos: 87,
    tempoMedio: 5.8,
    produtoTop: "Espresso",
    barras: {
      labels: ["08h", "10h", "12h", "14h", "16h", "18h"],
      faturamento: [600, 950, 1200, 800, 700, 500],
      pedidos: [30, 55, 80, 45, 40, 28],
    },
    categorias: {
      labels: ["Cafés Quentes", "Bebidas Frias", "Doces & Bolos", "Salgados"],
      valores: [72, 48, 35, 22],
    },
  },
  "Esta Semana": {
    faturamento: 8730.0,
    pedidos: 2000,
    tempoMedio: 6.5,
    produtoTop: "Cappuccino",
    barras: {
      labels: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
      faturamento: [800, 1100, 950, 1300, 1200, 1400, 1000],
      pedidos: [45, 70, 60, 90, 85, 110, 65],
    },
    categorias: {
      labels: ["Cafés Quentes", "Bebidas Frias", "Doces & Bolos", "Salgados"],
      valores: [68, 54, 42, 30],
    },
  },
  "Este Mês": {
    faturamento: 32400.0,
    pedidos: 7840,
    tempoMedio: 6.2,
    produtoTop: "Latte",
    barras: {
      labels: ["Semana 1", "Semana 2", "Semana 3", "Semana 4"],
      faturamento: [7000, 10000, 13000, 11500],
      pedidos: [400, 650, 900, 750],
    },
    categorias: {
      labels: ["Cafés Quentes", "Bebidas Frias", "Doces & Bolos", "Salgados"],
      valores: [65, 58, 46, 28],
    },
  },
  Personalizado: {
    faturamento: 15200.0,
    pedidos: 3620,
    tempoMedio: 7.1,
    produtoTop: "Mocha",
    barras: {
      labels: ["Dia 1", "Dia 2", "Dia 3", "Dia 4", "Dia 5"],
      faturamento: [900, 1050, 850, 1200, 950],
      pedidos: [55, 68, 50, 80, 60],
    },
    categorias: {
      labels: ["Cafés Quentes", "Bebidas Frias", "Doces & Bolos", "Salgados"],
      valores: [70, 45, 38, 25],
    },
  },
};

// dados simulados (usados enquanto a API real não está conectada)
const dadosSimulados = {
  Hoje: {
    faturamento: 1240.5,
    pedidos: 87,
    tempoMedio: 5.8,
    produtoTop: "Espresso",
    barras: {
      labels: ["08h", "10h", "12h", "14h", "16h", "18h"],
      faturamento: [600, 950, 1200, 800, 700, 500],
      pedidos: [30, 55, 80, 45, 40, 28],
    },
    categorias: {
      labels: ["Cafés Quentes", "Bebidas Frias", "Doces & Bolos", "Salgados"],
      valores: [72, 48, 35, 22],
    },
  },
  "Esta Semana": {
    faturamento: 8730.0,
    pedidos: 2000,
    tempoMedio: 6.5,
    produtoTop: "Cappuccino",
    barras: {
      labels: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
      faturamento: [800, 1100, 950, 1300, 1200, 1400, 1000],
      pedidos: [45, 70, 60, 90, 85, 110, 65],
    },
    categorias: {
      labels: ["Cafés Quentes", "Bebidas Frias", "Doces & Bolos", "Salgados"],
      valores: [68, 54, 42, 30],
    },
  },
  "Este Mês": {
    faturamento: 32400.0,
    pedidos: 7840,
    tempoMedio: 6.2,
    produtoTop: "Latte",
    barras: {
      labels: ["Semana 1", "Semana 2", "Semana 3", "Semana 4"],
      faturamento: [7000, 10000, 13000, 11500],
      pedidos: [400, 650, 900, 750],
    },
    categorias: {
      labels: ["Cafés Quentes", "Bebidas Frias", "Doces & Bolos", "Salgados"],
      valores: [65, 58, 46, 28],
    },
  },
  Personalizado: {
    faturamento: 15200.0,
    pedidos: 3620,
    tempoMedio: 7.1,
    produtoTop: "Mocha",
    barras: {
      labels: ["Dia 1", "Dia 2", "Dia 3", "Dia 4", "Dia 5"],
      faturamento: [900, 1050, 850, 1200, 950],
      pedidos: [55, 68, 50, 80, 60],
    },
    categorias: {
      labels: ["Cafés Quentes", "Bebidas Frias", "Doces & Bolos", "Salgados"],
      valores: [70, 45, 38, 25],
    },
  },
};

const periodos = ["Hoje", "Esta Semana", "Este Mês", "Personalizado"];

function formatarDinheiro(valor) {
  return valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
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
  const [periodo, setPeriodo] = useState("Esta Semana");
  const dados = dadosSimulados[periodo] || dadosSimulados["Esta Semana"];

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
          <span className="label">Selecione o Periodo:</span>
          <div className="periodo-options">
            {periodos.map((opcao) => (
              <button
                key={opcao}
                className={`periodo-btn ${periodo === opcao ? "active" : ""}`}
                onClick={() => setPeriodo(opcao)}
              >
                {opcao === "Personalizado" ? "Personalizado (Calendário)" : opcao}
              </button>
            ))}
          </div>
        </div>

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
              Faturamento vs. Volume de Pedidos ({periodo})
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
      </main>

      <button className="pedidos-fab">Pedidos</button>
    </>
  );
}

export default Painel;