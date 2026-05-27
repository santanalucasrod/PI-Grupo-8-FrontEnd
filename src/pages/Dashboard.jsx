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
import "../pages/Dashboard.css";

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

// Mock data
const mockData = {
  Hoje: {
    faturamento: 1240.5,
    pedidos: 87,
    tempoMedio: 5.8,
    produtoTop: "Espresso",
    barras: {
      labels: ["08h", "10h", "12h", "14h", "16h", "18h"],
      fat:    [600,   950,  1200,  800,   700,   500],
      ped:    [30,    55,   80,    45,    40,    28],
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
      fat:    [800,  1100,  950,  1300, 1200, 1400, 1000],
      ped:    [45,   70,   60,   90,   85,   110,  65],
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
      fat:    [7000, 10000, 13000, 11500],
      ped:    [400,  650,   900,   750],
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
      fat:    [900,  1050,  850,  1200,  950],
      ped:    [55,   68,    50,   80,    60],
    },
    categorias: {
      labels: ["Cafés Quentes", "Bebidas Frias", "Doces & Bolos", "Salgados"],
      valores: [70, 45, 38, 25],
    },
  },
};

const periodos = ["Hoje", "Esta Semana", "Este Mês", "Personalizado"];

function formatMoney(val) {
  return val.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

// ── Gráfico de barras + linha
function BarLineChart({ barras, periodo }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const ctx = canvasRef.current.getContext("2d");
    chartRef.current = new Chart(ctx, {
      data: {
        labels: barras.labels,
        datasets: [
          {
            type: "bar",
            label: "Faturamento (R$)",
            data: barras.fat,
            backgroundColor: "rgba(238, 229, 210, 0.85)",
            borderRadius: 6,
            yAxisID: "yFat",
            order: 2,
          },
          {
            type: "line",
            label: "Pedidos",
            data: barras.ped,
            borderColor: "rgba(255,255,255,0.9)",
            backgroundColor: "rgba(255,255,255,0.15)",
            pointBackgroundColor: "#fff",
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 2,
            tension: 0.4,
            fill: false,
            yAxisID: "yPed",
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
              color: "rgba(255,255,255,0.85)",
              font: { family: "Barlow", size: 12, weight: "600" },
              boxWidth: 12,
              boxHeight: 12,
            },
          },
          tooltip: {
            backgroundColor: "rgba(93,58,34,0.95)",
            titleFont: { family: "Barlow", weight: "700" },
            bodyFont:  { family: "Barlow" },
          },
        },
        scales: {
          x: {
            ticks: { color: "rgba(255,255,255,0.75)", font: { family: "Barlow", size: 11 } },
            grid:  { color: "rgba(255,255,255,0.07)" },
          },
          yFat: {
            position: "left",
            ticks: { color: "rgba(238,229,210,0.85)", font: { family: "Barlow", size: 11 } },
            grid:  { color: "rgba(255,255,255,0.07)" },
          },
          yPed: {
            position: "right",
            ticks: { color: "rgba(255,255,255,0.65)", font: { family: "Barlow", size: 11 } },
            grid:  { drawOnChartArea: false },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [barras]);

  return (
    <div className="chartjs-wrap">
      <canvas ref={canvasRef} />
    </div>
  );
}

// ── Gráfico de rosca
function DonutChart({ categorias }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  const COLORS = [
    "rgba(238,229,210,0.9)",
    "rgba(255,255,255,0.55)",
    "rgba(200,170,140,0.8)",
    "rgba(255,255,255,0.3)",
  ];

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const ctx = canvasRef.current.getContext("2d");
    chartRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: categorias.labels,
        datasets: [
          {
            data: categorias.valores,
            backgroundColor: COLORS,
            borderColor: "rgba(155,99,71,0.4)",
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
              color: "rgba(255,255,255,0.85)",
              font: { family: "Barlow", size: 12, weight: "600" },
              padding: 14,
              boxWidth: 12,
              boxHeight: 12,
            },
          },
          tooltip: {
            backgroundColor: "rgba(93,58,34,0.95)",
            titleFont: { family: "Barlow", weight: "700" },
            bodyFont:  { family: "Barlow" },
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${ctx.parsed}%`,
            },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [categorias]);

  return (
    <div className="chartjs-wrap donut">
      <canvas ref={canvasRef} />
    </div>
  );
}

function Dashboard() {
  const [periodo, setPeriodo] = useState("Esta Semana");
  const data = mockData[periodo] || mockData["Esta Semana"];

  return (
    <>
      <header className="dashboard-header">
        <div className="logo-circle">K</div>
        <h1>Kento Café</h1>
      </header>

      <main className="dashboard-main">
        {/* Período */}
        <div className="periodo-bar">
          <span className="label">Selecione o Periodo:</span>
          <div className="periodo-options">
            {periodos.map((p) => (
              <button
                key={p}
                className={`periodo-btn ${periodo === p ? "active" : ""}`}
                onClick={() => setPeriodo(p)}
              >
                {p === "Personalizado" ? "Personalizado (Calendário)" : p}
              </button>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div className="kpi-row">
          <div className="kpi-card">
            <span className="kpi-title">Faturamento Total (R$)</span>
            <span className="kpi-value" style={{ fontSize: "28px" }}>
              R$ {formatMoney(data.faturamento)}
            </span>
            <span className="kpi-sub">período selecionado</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-title">Total de Pedidos</span>
            <span className="kpi-value">{data.pedidos.toLocaleString("pt-BR")}</span>
            <span className="kpi-sub">pedidos realizados</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-title">Tempo médio de preparo (min)</span>
            <span className="kpi-value">{data.tempoMedio}</span>
            <span className="kpi-sub">minutos por pedido</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-title">Produto Mais Vendido</span>
            <span className="kpi-value kpi-product">{data.produtoTop}</span>
            <span className="kpi-sub">mais pedido no período</span>
          </div>
        </div>

        {/* Gráficos Chart.js */}
        <div className="charts-row">
          <div className="chart-card">
            <span className="chart-title">
              Faturamento vs. Volume de Pedidos ({periodo})
            </span>
            <BarLineChart barras={data.barras} periodo={periodo} />
          </div>
          <div className="chart-card">
            <span className="chart-title">
              Top Categorias Mais Vendidas (Faturamento)
            </span>
            <DonutChart categorias={data.categorias} />
          </div>
        </div>
      </main>

      <button className="pedidos-fab">
        Pedidos
      </button>
    </>
  );
}

export default Dashboard;