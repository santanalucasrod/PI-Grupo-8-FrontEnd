import { useEffect, useMemo, useState } from "react";
import {
  Chart,
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { api } from "../../providers/axiosClient";
import { authHeader } from "../../utils/authHeader";
import "../Dashboard/Dashboard.css";

Chart.register(
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

Chart.defaults.font.family = "Barlow, sans-serif";
Chart.defaults.color = "rgba(58,58,58,0.8)";

const CORES = {
  marrom: "#8D5B42",
  marromEscuro: "#5C3A22",
  creme: "#C8AA8C",
  alerta: "#D9822B",
  grade: "rgba(0,0,0,0.06)",
};

// Horas com esse volume aparecem no gráfico de espera só se aconteceram pelo menos 3 vezes
// (mesmo critério que o backend usa para calcular o limite).
const MIN_HORAS_POR_VOLUME = 3;
const PERCENTUAL_TOLERADO = 20;
const DIAS_PARA_AGRUPAR_POR_SEMANA = 62;
const DIAS_SEMANA = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]; // 1 = segunda no backend

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const numero = (valor, casas = 0) =>
  Number(valor ?? 0).toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });

// yyyy-mm-dd no fuso local (toISOString converteria para UTC e poderia voltar um dia)
function paraInput(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function deInput(texto) {
  return new Date(`${texto}T00:00:00`);
}

function dataCurta(texto) {
  return deInput(texto).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function diasAtras(dias) {
  const data = new Date();
  data.setDate(data.getDate() - dias);
  return data;
}

const ATALHOS = [
  { rotulo: "Hoje", periodo: () => [new Date(), new Date()] },
  { rotulo: "7 dias", periodo: () => [diasAtras(6), new Date()] },
  { rotulo: "30 dias", periodo: () => [diasAtras(29), new Date()] },
  {
    rotulo: "Este mês",
    periodo: () => {
      const hoje = new Date();
      return [new Date(hoje.getFullYear(), hoje.getMonth(), 1), hoje];
    },
  },
  {
    rotulo: "Mês passado",
    periodo: () => {
      const hoje = new Date();
      return [
        new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1),
        new Date(hoje.getFullYear(), hoje.getMonth(), 0),
      ];
    },
  },
];

function variacaoPercentual(atual, anterior) {
  const a = Number(atual);
  const b = Number(anterior);
  if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) return null;
  return ((a - b) / b) * 100;
}

function Variacao({ valor, unidade = "%" }) {
  if (valor == null) return <span className="kpi-variacao neutra">sem base de comparação</span>;
  const classe = valor > 0.05 ? "positiva" : valor < -0.05 ? "negativa" : "neutra";
  const seta = classe === "positiva" ? "▲" : classe === "negativa" ? "▼" : "■";
  return (
    <span className={`kpi-variacao ${classe}`}>
      {seta} {numero(Math.abs(valor), 1)}
      {unidade} vs. período anterior
    </span>
  );
}

function CardKpi({ titulo, valor, detalhe, variacao }) {
  return (
    <div className="kpi-card">
      <span className="kpi-title">{titulo}</span>
      <span className="kpi-value">{valor}</span>
      {detalhe && <span className="kpi-sub">{detalhe}</span>}
      {variacao}
    </div>
  );
}

function CardGrafico({ titulo, subtitulo, alto = false, children }) {
  return (
    <div className="chart-card">
      <div>
        <span className="chart-title">{titulo}</span>
        {subtitulo && <p className="chart-subtitle">{subtitulo}</p>}
      </div>
      <div className={`chartjs-wrap ${alto ? "alto" : ""}`}>{children}</div>
    </div>
  );
}

function opcoesBase({ horizontal = false, legenda = false, tooltip = {}, eixoValor = {} } = {}) {
  const eixoCategoria = { grid: { display: false }, ticks: { autoSkip: !horizontal } };
  const eixoNumerico = { beginAtZero: true, grid: { color: CORES.grade }, ...eixoValor };
  return {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: horizontal ? "y" : "x",
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: legenda, labels: { boxWidth: 12, boxHeight: 12, font: { weight: "600" } } },
      tooltip: {
        backgroundColor: "rgba(93,58,34,0.95)",
        titleFont: { weight: "700" },
        ...tooltip,
      },
    },
    scales: horizontal ? { x: eixoNumerico, y: eixoCategoria } : { x: eixoCategoria, y: eixoNumerico },
  };
}

// ── Gráficos ───────────────────────────────────────────────────────────────

function GraficoMovimentoHora({ movimento }) {
  const data = {
    labels: movimento.map((m) => `${m.hora}h`),
    datasets: [
      {
        label: "Segunda a sexta",
        data: movimento.map((m) => m.mediaDiasUteis),
        backgroundColor: CORES.marrom,
        borderRadius: 4,
      },
      {
        label: "Sábado e domingo",
        data: movimento.map((m) => m.mediaFimDeSemana),
        backgroundColor: CORES.creme,
        borderRadius: 4,
      },
    ],
  };
  const options = opcoesBase({
    legenda: true,
    tooltip: {
      callbacks: {
        title: (itens) => `Das ${itens[0].label} às ${parseInt(itens[0].label, 10) + 1}h`,
        label: (ctx) => ` ${ctx.dataset.label}: ${numero(ctx.parsed.y, 1)} pedidos em média`,
      },
    },
  });
  return <Bar data={data} options={options} />;
}

function GraficoEsperaPorVolume({ espera, meta }) {
  const pontos = espera.filter((p) => p.quantidadeHoras >= MIN_HORAS_POR_VOLUME);
  const data = {
    labels: pontos.map((p) => p.pedidosNaHora),
    datasets: [
      {
        type: "line",
        label: `Tolerância (${PERCENTUAL_TOLERADO}%)`,
        data: pontos.map(() => PERCENTUAL_TOLERADO),
        borderColor: CORES.alerta,
        borderDash: [6, 4],
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 0,
      },
      {
        type: "bar",
        label: `Pedidos acima de ${meta} min`,
        data: pontos.map((p) => p.percentualAcimaDaMeta),
        backgroundColor: pontos.map((p) =>
          p.percentualAcimaDaMeta >= PERCENTUAL_TOLERADO ? CORES.alerta : CORES.marrom
        ),
        borderRadius: 4,
      },
    ],
  };
  const options = opcoesBase({
    legenda: true,
    eixoValor: { max: 100, ticks: { callback: (v) => `${v}%` } },
    tooltip: {
      filter: (item) => item.dataset.type === "bar",
      callbacks: {
        title: (itens) => `Horas com ${itens[0].label} pedidos`,
        label: (ctx) => {
          const p = pontos[ctx.dataIndex];
          return [
            ` ${numero(p.percentualAcimaDaMeta, 1)}% dos pedidos passaram de ${meta} min`,
            ` Espera mediana: ${numero(p.esperaMedianaMinutos, 1)} min`,
            ` Aconteceu em ${p.quantidadeHoras} horas do período`,
          ];
        },
      },
    },
  });
  options.scales.x.title = { display: true, text: "Pedidos feitos na mesma hora" };
  return <Bar data={data} options={options} />;
}

function GraficoPedidosPorDia({ serie }) {
  const agrupar = serie.length > DIAS_PARA_AGRUPAR_POR_SEMANA;

  const pontos = useMemo(() => {
    if (!agrupar) {
      return serie.map((d) => {
        const dia = deInput(d.data);
        return {
          rotulo: `${dataCurta(d.data)} ${dia.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")}`,
          pedidos: d.totalPedidos,
          faturamento: Number(d.faturamento),
          fimDeSemana: dia.getDay() === 0 || dia.getDay() === 6,
        };
      });
    }
    const semanas = [];
    serie.forEach((d, i) => {
      if (i % 7 === 0) semanas.push({ rotulo: `Sem. ${dataCurta(d.data)}`, pedidos: 0, faturamento: 0 });
      const semana = semanas[semanas.length - 1];
      semana.pedidos += d.totalPedidos;
      semana.faturamento += Number(d.faturamento);
    });
    return semanas;
  }, [serie, agrupar]);

  const data = {
    labels: pontos.map((p) => p.rotulo),
    datasets: [
      {
        label: "Pedidos",
        data: pontos.map((p) => p.pedidos),
        backgroundColor: pontos.map((p) => (p.fimDeSemana ? CORES.marromEscuro : CORES.marrom)),
        borderRadius: 3,
      },
    ],
  };
  const options = opcoesBase({
    tooltip: {
      callbacks: {
        label: (ctx) => {
          const p = pontos[ctx.dataIndex];
          return [` ${numero(p.pedidos)} pedidos`, ` ${moeda.format(p.faturamento)}`];
        },
      },
    },
  });
  options.scales.x.ticks = { maxRotation: 0, autoSkip: true, maxTicksLimit: 12 };
  return <Bar data={data} options={options} />;
}

function GraficoBarrasHorizontais({ itens, rotulo, valor, cor, formatarTooltip, formatarEixo }) {
  const data = {
    labels: itens.map(rotulo),
    datasets: [{ data: itens.map(valor), backgroundColor: cor, borderRadius: 4, maxBarThickness: 22 }],
  };
  const options = opcoesBase({
    horizontal: true,
    eixoValor: formatarEixo ? { ticks: { callback: formatarEixo } } : {},
    tooltip: { callbacks: { label: (ctx) => formatarTooltip(itens[ctx.dataIndex]) } },
  });
  return <Bar data={data} options={options} />;
}

// ── Alerta de equipe ───────────────────────────────────────────────────────

function AlertaCapacidade({ dados }) {
  const { limitePedidosPorHora: limite, metaMinutos: meta, horariosCriticos } = dados;

  if (limite == null) {
    return (
      <div className="alerta-capacidade ok">
        <strong>Atendimento dentro da meta.</strong> Neste período nenhum volume de pedidos por hora
        fez mais de 1 em cada 5 clientes esperar mais de {meta} minutos.
      </div>
    );
  }

  return (
    <div className="alerta-capacidade atencao">
      <strong>
        A partir de {limite} pedidos na mesma hora, 1 em cada 5 clientes espera mais de {meta} minutos.
      </strong>{" "}
      {horariosCriticos.length > 0 && (
        <>
          Horários em que isso mais aconteceu no período e que pedem um funcionário a mais:{" "}
          {horariosCriticos.map((h, i) => (
            <span key={`${h.diaSemana}-${h.hora}`}>
              {i > 0 && " · "}
              <span className="alerta-horas">
                {DIAS_SEMANA[h.diaSemana - 1]} {h.hora}h ({h.ocorrencias}×)
              </span>
            </span>
          ))}
        </>
      )}
    </div>
  );
}

// ── Página ─────────────────────────────────────────────────────────────────

function Painel() {
  const [dataInicio, setDataInicio] = useState(paraInput(diasAtras(29)));
  const [dataFim, setDataFim] = useState(paraInput(new Date()));
  // Guarda a última resposta junto com o período a que ela se refere: enquanto o período
  // escolhido for diferente do carregado, a tela mostra os dados antigos esmaecidos.
  const [resultado, setResultado] = useState({ chave: null, dados: null, erro: "" });

  const intervaloValido = Boolean(dataInicio && dataFim && dataFim >= dataInicio);
  const chave = `${dataInicio}_${dataFim}`;
  const dados = resultado.dados;
  const carregando = intervaloValido && resultado.chave !== chave;
  const erro = resultado.chave === chave ? resultado.erro : "";

  useEffect(() => {
    if (!intervaloValido) return undefined;
    const controller = new AbortController();

    api
      .get("/dashboard/resumo", {
        params: { inicio: dataInicio, fim: dataFim },
        headers: authHeader(),
        signal: controller.signal,
      })
      .then((resposta) => setResultado({ chave, dados: resposta.data, erro: "" }))
      .catch((e) => {
        if (e?.code === "ERR_CANCELED") return;
        setResultado((anterior) => ({
          chave,
          dados: anterior.dados,
          erro: e?.response?.data?.message || "Não foi possível carregar os dados do período.",
        }));
      });

    return () => controller.abort();
  }, [dataInicio, dataFim, intervaloValido, chave]);

  function aplicarAtalho(atalho) {
    const [inicio, fim] = atalho.periodo();
    setDataInicio(paraInput(inicio));
    setDataFim(paraInput(fim));
  }

  const atalhoAtivo = ATALHOS.find((a) => {
    const [inicio, fim] = a.periodo();
    return paraInput(inicio) === dataInicio && paraInput(fim) === dataFim;
  });

  const atual = dados?.atual;
  const anterior = dados?.anterior;
  const semPedidos = atual && atual.pedidos === 0 && atual.cancelados === 0;

  return (
    <>
      <main className="dashboard-main">
        <div className="periodo-bar">
          <span className="label">Período:</span>
          <div className="periodo-atalhos">
            {ATALHOS.map((atalho) => (
              <button
                key={atalho.rotulo}
                type="button"
                className={`atalho ${atalhoAtivo === atalho ? "atalho-ativo" : ""}`}
                onClick={() => aplicarAtalho(atalho)}
              >
                {atalho.rotulo}
              </button>
            ))}
          </div>
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
          </div>
          {!intervaloValido && (
            <span className="periodo-erro">A data final precisa ser igual ou posterior à inicial.</span>
          )}
          {dados && intervaloValido && (
            <span className="periodo-comparacao">
              Comparando com {dataCurta(dados.inicioAnterior)} a {dataCurta(dados.fimAnterior)}
            </span>
          )}
        </div>

        {erro && <div className="periodo-vazio dash-erro">{erro}</div>}

        {!dados && !erro && <div className="periodo-vazio">Carregando dados do período...</div>}

        {dados && semPedidos && (
          <div className="periodo-vazio">
            Nenhum pedido registrado entre {dataCurta(dados.inicio)} e {dataCurta(dados.fim)}.
          </div>
        )}

        {dados && !semPedidos && (
          <div className={`dashboard-conteudo ${carregando ? "carregando" : ""}`}>
            <div className="kpi-row">
              <CardKpi
                titulo="Faturamento"
                valor={moeda.format(atual.faturamento)}
                variacao={<Variacao valor={variacaoPercentual(atual.faturamento, anterior.faturamento)} />}
              />
              <CardKpi
                titulo="Pedidos"
                valor={numero(atual.pedidos)}
                detalhe={`${numero(atual.cancelados)} cancelado${atual.cancelados === 1 ? "" : "s"}`}
                variacao={<Variacao valor={variacaoPercentual(atual.pedidos, anterior.pedidos)} />}
              />
              <CardKpi
                titulo="Ticket médio"
                valor={moeda.format(atual.ticketMedio)}
                detalhe={`${numero(atual.itensPorPedido, 2)} itens por pedido`}
                variacao={<Variacao valor={variacaoPercentual(atual.ticketMedio, anterior.ticketMedio)} />}
              />
              <CardKpi
                titulo={`Prontos em até ${dados.metaMinutos} min`}
                valor={atual.percentualNoPrazo == null ? "—" : `${numero(atual.percentualNoPrazo, 1)}%`}
                detalhe={
                  atual.tempoMedianoMinutos == null
                    ? "sem pedidos concluídos"
                    : `metade dos pedidos sai em até ${numero(atual.tempoMedianoMinutos, 1)} min`
                }
                variacao={
                  <Variacao
                    valor={
                      atual.percentualNoPrazo == null || anterior.percentualNoPrazo == null
                        ? null
                        : atual.percentualNoPrazo - anterior.percentualNoPrazo
                    }
                    unidade=" p.p."
                  />
                }
              />
            </div>

            <AlertaCapacidade dados={dados} />

            <div className="charts-row">
              <CardGrafico
                titulo="Movimento médio por hora"
                subtitulo="Quantos pedidos chegam, em média, em cada hora do dia"
              >
                <GraficoMovimentoHora movimento={dados.movimentoPorHora} />
              </CardGrafico>
              <CardGrafico
                titulo={`Quando a espera passa de ${dados.metaMinutos} minutos`}
                subtitulo="% de pedidos atrasados conforme o número de pedidos feitos na mesma hora"
              >
                <GraficoEsperaPorVolume espera={dados.esperaPorVolume} meta={dados.metaMinutos} />
              </CardGrafico>
            </div>

            <div className="charts-row uma-coluna">
              <CardGrafico
                titulo="Pedidos por dia"
                subtitulo={
                  dados.serieDiaria.length > DIAS_PARA_AGRUPAR_POR_SEMANA
                    ? "Agrupado por semana · passe o mouse para ver o faturamento"
                    : "Barras escuras são sábados e domingos · passe o mouse para ver o faturamento"
                }
              >
                <GraficoPedidosPorDia serie={dados.serieDiaria} />
              </CardGrafico>
            </div>

            <div className="charts-row tres-colunas">
              <CardGrafico titulo="10 produtos mais vendidos" subtitulo="Unidades vendidas" alto>
                <GraficoBarrasHorizontais
                  itens={dados.topProdutos}
                  rotulo={(p) => p.produto}
                  valor={(p) => p.quantidade}
                  cor={CORES.marrom}
                  formatarTooltip={(p) => [
                    ` ${numero(p.quantidade)} unidades`,
                    ` ${moeda.format(p.faturamento)} (${numero(p.percentualFaturamento, 1)}% do faturamento)`,
                  ]}
                />
              </CardGrafico>
              <CardGrafico titulo="Faturamento por categoria" subtitulo="Participação no total vendido" alto>
                <GraficoBarrasHorizontais
                  itens={dados.faturamentoPorCategoria}
                  rotulo={(c) => c.categoria}
                  valor={(c) => c.percentual}
                  cor={CORES.creme}
                  formatarEixo={(v) => `${v}%`}
                  formatarTooltip={(c) => ` ${numero(c.percentual, 1)}% · ${moeda.format(c.faturamento)}`}
                />
              </CardGrafico>
              <CardGrafico
                titulo="Personalizações mais pedidas"
                subtitulo="Ajuda a planejar insumos (leites, adoçante etc.)"
                alto
              >
                <GraficoBarrasHorizontais
                  itens={dados.personalizacoes}
                  rotulo={(p) => p.nome}
                  valor={(p) => p.quantidade}
                  cor={CORES.marromEscuro}
                  formatarTooltip={(p) => ` ${numero(p.quantidade)} unidades`}
                />
              </CardGrafico>
            </div>
          </div>
        )}
      </main>

      <a href="/pedidos">
        <button className="pedidos-fab">Pedidos</button>
      </a>
    </>
  );
}

export default Painel;
