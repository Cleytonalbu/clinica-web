import {
  formatCurrency,
} from "@/pages/Financeiro/financeRules";

export interface FinancialReportDocumentMovement {
  id: string;
  sourceId: number;
  type: "Receita" | "Despesa";
  description: string;
  person: string;
  date: string;
  amount: number;
  status: string;
  detail: string;
}

interface FinancialReportDocumentProps {
  startDate: string;
  endDate: string;
  movementType: string;
  status: string;
  billingType: string;
  movements: FinancialReportDocumentMovement[];
  received: number;
  receivable: number;
  paidExpenses: number;
  payable: number;
  paidPayouts: number;
  pendingPayouts: number;
  result: number;
}

export function FinancialReportDocument({
  startDate,
  endDate,
  movementType,
  status,
  billingType,
  movements,
  received,
  receivable,
  paidExpenses,
  payable,
  paidPayouts,
  pendingPayouts,
  result,
}: FinancialReportDocumentProps) {
  const generatedAt = new Date();
  const totalIncome = received + receivable;
  const totalOutflow = paidExpenses + paidPayouts;
  const margin = received > 0 ? Math.round((result / received) * 100) : 0;

  const revenueMovements = movements.filter((item) => item.type === "Receita");
  const expenseMovements = movements.filter((item) => item.type === "Despesa");

  return (
    <article className="financial-report-document">
      <header className="fin-header">
        <div className="fin-brand">
          <div className="fin-mark">EA</div>
          <div>
            <p className="fin-kicker">CLÍNICA INTEGRADA</p>
            <p className="fin-brand-name">Entre Afetos</p>
          </div>
        </div>
        <div className="fin-meta">
          <p>Relatório gerencial</p>
          <strong>Financeiro</strong>
        </div>
      </header>

      <section className="fin-title">
        <div>
          <p className="fin-eyebrow">GESTÃO FINANCEIRA</p>
          <h1>Relatório Financeiro</h1>
          <p className="fin-subtitle">
            Consolidado de receitas, despesas, repasses profissionais e resultado realizado no período.
          </p>
        </div>
        <div className="fin-period">
          <span>Período analisado</span>
          <strong>{formatDate(startDate)} a {formatDate(endDate)}</strong>
          <small>Gerado em {generatedAt.toLocaleString("pt-BR")}</small>
        </div>
      </section>

      <section className="fin-filters">
        <span><strong>Movimentos:</strong> {movementType}</span>
        <span><strong>Status:</strong> {status}</span>
        <span><strong>Cobrança:</strong> {billingType}</span>
      </section>

      <section className="fin-section">
        <SectionTitle number="01" title="Resumo executivo" subtitle="Principais indicadores financeiros do período." />
        <div className="fin-metrics">
          <Metric label="Recebido" value={formatCurrency(received)} note="receitas efetivamente recebidas" />
          <Metric label="A receber" value={formatCurrency(receivable)} note="receitas ainda pendentes" />
          <Metric label="Despesas pagas" value={formatCurrency(paidExpenses)} note="custos efetivamente pagos" />
          <Metric label="Repasses pagos" value={formatCurrency(paidPayouts)} note="pagamentos aos profissionais" />
          <Metric label="Resultado líquido" value={formatCurrency(result)} note={`${margin}% sobre o recebido`} />
          <Metric label="Saídas realizadas" value={formatCurrency(totalOutflow)} note="despesas + repasses pagos" />
        </div>
      </section>

      <section className="fin-section fin-two">
        <div>
          <SectionTitle number="02" title="Receitas × saídas" subtitle="Comparação dos valores efetivamente realizados." />
          <ValueBars
            items={[
              { label: "Recebido", value: received },
              { label: "Despesas", value: paidExpenses },
              { label: "Repasses", value: paidPayouts },
              { label: "Resultado", value: Math.max(0, result) },
            ]}
          />
        </div>
        <div>
          <SectionTitle number="03" title="Composição das saídas" subtitle="Participação de despesas e repasses." />
          <OutflowComposition expenses={paidExpenses} payouts={paidPayouts} />
        </div>
      </section>

      <section className="fin-section">
        <SectionTitle number="04" title="Análise financeira" subtitle="Leitura automática dos indicadores do período." />
        <div className="fin-analysis">
          <p>
            No período analisado, a clínica registrou <strong>{formatCurrency(totalIncome)}</strong> em receitas
            previstas, das quais <strong>{formatCurrency(received)}</strong> já foram recebidas e{" "}
            <strong>{formatCurrency(receivable)}</strong> permanecem a receber.
          </p>
          <p>
            As saídas efetivamente realizadas totalizaram <strong>{formatCurrency(totalOutflow)}</strong>, sendo{" "}
            <strong>{formatCurrency(paidExpenses)}</strong> em despesas e{" "}
            <strong>{formatCurrency(paidPayouts)}</strong> em repasses profissionais.
          </p>
          <p>
            Após considerar somente valores efetivamente recebidos, despesas pagas e repasses pagos, o resultado
            líquido realizado foi de <strong>{formatCurrency(result)}</strong>
            {received > 0 ? `, equivalente a ${margin}% do valor recebido` : ""}.
          </p>
          <p>
            Ainda existem <strong>{formatCurrency(payable)}</strong> em despesas pendentes e{" "}
            <strong>{formatCurrency(pendingPayouts)}</strong> em repasses profissionais pendentes.
          </p>
        </div>
      </section>

      <section className="fin-section fin-two">
        <div>
          <SectionTitle number="05" title="Valores pendentes" subtitle="Compromissos e recebimentos ainda não realizados." />
          <div className="fin-small-metrics">
            <Metric label="A receber" value={formatCurrency(receivable)} note="receitas pendentes" />
            <Metric label="Contas a pagar" value={formatCurrency(payable)} note="despesas pendentes" />
            <Metric label="Repasses pendentes" value={formatCurrency(pendingPayouts)} note="profissionais" />
          </div>
        </div>
        <div>
          <SectionTitle number="06" title="Movimentação filtrada" subtitle="Distribuição dos lançamentos exibidos." />
          <MovementSummary revenue={revenueMovements.length} expense={expenseMovements.length} />
        </div>
      </section>

      <section className="fin-section fin-detail">
        <SectionTitle number="07" title="Detalhamento financeiro" subtitle="Movimentações de acordo com os filtros selecionados." />
        <table className="fin-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Tipo</th>
              <th>Descrição</th>
              <th>Paciente / fornecedor</th>
              <th>Detalhe</th>
              <th>Status</th>
              <th className="money">Valor</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((item) => (
              <tr key={item.id}>
                <td>{formatDate(item.date)}</td>
                <td><strong>{item.type}</strong></td>
                <td>{item.description}</td>
                <td>{item.person}</td>
                <td>{item.detail}</td>
                <td>{item.status}</td>
                <td className="money">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <footer className="fin-footer">
        <div><strong>Clínica Integrada Entre Afetos</strong><span>Relatório Financeiro</span></div>
        <div className="right"><span>AC Software</span><span>Documento gerado pelo sistema</span></div>
      </footer>
    </article>
  );
}

function SectionTitle({ number, title, subtitle }: { number: string; title: string; subtitle: string }) {
  return (
    <div className="fin-section-title">
      <span className="fin-number">{number}</span>
      <div><h2>{title}</h2><p>{subtitle}</p></div>
    </div>
  );
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return <div className="fin-metric"><span>{label}</span><strong>{value}</strong><small>{note}</small></div>;
}

function ValueBars({ items }: { items: { label: string; value: number }[] }) {
  const max = Math.max(1, ...items.map((item) => item.value));
  return (
    <div className="fin-chart">
      {items.map((item) => (
        <div className="fin-bar-row" key={item.label}>
          <span>{item.label}</span>
          <div className="fin-track"><div className="fin-fill" style={{ width: `${(item.value / max) * 100}%` }} /></div>
          <strong>{formatCurrency(item.value)}</strong>
        </div>
      ))}
    </div>
  );
}

function OutflowComposition({ expenses, payouts }: { expenses: number; payouts: number }) {
  const total = Math.max(1, expenses + payouts);
  const exp = Math.round((expenses / total) * 100);
  const pay = Math.round((payouts / total) * 100);
  return (
    <div className="fin-composition">
      <div className="fin-composition-bar">
        <div className="fin-expenses" style={{ width: `${exp}%` }} />
        <div className="fin-payouts" style={{ width: `${pay}%` }} />
      </div>
      <div className="fin-legend">
        <div><span className="dot expenses" /><span>Despesas</span><strong>{exp}%</strong></div>
        <div><span className="dot payouts" /><span>Repasses</span><strong>{pay}%</strong></div>
      </div>
      <div className="fin-outflow-total"><span>Total de saídas</span><strong>{formatCurrency(expenses + payouts)}</strong></div>
    </div>
  );
}

function MovementSummary({ revenue, expense }: { revenue: number; expense: number }) {
  const total = Math.max(1, revenue + expense);
  return (
    <div className="fin-movement-summary">
      <div><span>Receitas</span><strong>{revenue}</strong><small>{Math.round((revenue / total) * 100)}% dos lançamentos</small></div>
      <div><span>Despesas</span><strong>{expense}</strong><small>{Math.round((expense / total) * 100)}% dos lançamentos</small></div>
    </div>
  );
}

function formatDate(value: string) {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

export const FINANCIAL_REPORT_DOCUMENT_STYLES = `
  .financial-report-document { display: none; }

  @media print {
    @page { size: A4 portrait; margin: 12mm 12mm 13mm; }
    html, body { background: #fff !important; overflow: visible !important; }
    body * { visibility: hidden !important; }
    .financial-report-document, .financial-report-document * { visibility: visible !important; }
    .financial-report-document {
      display: block !important; position: absolute !important; inset: 0 auto auto 0 !important;
      width: 100% !important; background: #fff !important; color: #172033 !important;
      font-family: Arial, Helvetica, sans-serif !important; font-size: 9pt !important; line-height: 1.45 !important;
    }
    .financial-report-document * { box-sizing: border-box !important; }
    .fin-header,.fin-brand,.fin-filters,.fin-footer { display:flex; }
    .fin-header { align-items:center; justify-content:space-between; gap:20px; padding-bottom:12px; border-bottom:2px solid #10235f; }
    .fin-brand { align-items:center; gap:10px; }
    .fin-mark { display:flex; width:38px; height:38px; align-items:center; justify-content:center; border-radius:10px; background:#6543ef !important; color:#fff !important; font-weight:800; font-size:11pt; }
    .fin-kicker { margin:0; color:#6543ef !important; font-size:6.5pt; font-weight:800; letter-spacing:1.2px; }
    .fin-brand-name { margin:1px 0 0; color:#10235f !important; font-size:15pt; font-weight:800; }
    .fin-meta { text-align:right; color:#64748b !important; font-size:7.5pt; }
    .fin-meta p { margin:0; } .fin-meta strong { display:block; color:#10235f !important; font-size:10pt; }
    .fin-title { display:grid; grid-template-columns:1fr 210px; gap:22px; align-items:end; padding:18px 0 12px; }
    .fin-eyebrow { margin:0 0 4px; color:#6543ef !important; font-size:7pt; font-weight:800; letter-spacing:1.1px; }
    .financial-report-document h1 { margin:0; color:#10235f !important; font-size:23pt !important; line-height:1.05 !important; }
    .fin-subtitle { max-width:520px; margin:6px 0 0; color:#66728f !important; font-size:8.5pt; }
    .fin-period { padding:10px 12px; border:1px solid #dfe4f2; border-radius:8px; background:#f7f8fc !important; }
    .fin-period span,.fin-period small { display:block; color:#7c879f !important; font-size:6.8pt; }
    .fin-period strong { display:block; margin:3px 0; color:#10235f !important; font-size:8.5pt; }
    .fin-filters { gap:20px; margin-bottom:17px; padding:8px 10px; border-left:3px solid #6543ef; background:#f7f5ff !important; color:#5e6983 !important; font-size:7.5pt; }
    .fin-filters strong { color:#2c3754 !important; }
    .fin-section { margin-top:16px; break-inside:avoid; page-break-inside:avoid; }
    .fin-two { display:grid; grid-template-columns:1fr 1fr; gap:18px; align-items:start; }
    .fin-section-title { display:flex; align-items:flex-start; gap:9px; margin-bottom:10px; }
    .fin-number { display:flex; width:25px; height:25px; align-items:center; justify-content:center; border-radius:7px; background:#eeeaff !important; color:#6543ef !important; font-size:7pt; font-weight:800; }
    .fin-section-title h2 { margin:0; color:#10235f !important; font-size:11pt !important; line-height:1.2 !important; }
    .fin-section-title p { margin:2px 0 0; color:#7a859e !important; font-size:7pt; }
    .fin-metrics { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
    .fin-metric { padding:10px; border:1px solid #e2e6f0; border-radius:8px; background:#fff !important; }
    .fin-metric>span { display:block; color:#7b869d !important; font-size:6.8pt; font-weight:700; text-transform:uppercase; letter-spacing:.5px; }
    .fin-metric>strong { display:block; margin-top:3px; color:#10235f !important; font-size:13pt; line-height:1.1; }
    .fin-metric small { display:block; margin-top:3px; color:#98a1b5 !important; font-size:6.5pt; }
    .fin-chart,.fin-composition { padding:12px; border:1px solid #e4e8f2; border-radius:9px; background:#fbfbfd !important; }
    .fin-bar-row { display:grid; grid-template-columns:72px 1fr 82px; gap:8px; align-items:center; margin:9px 0; color:#66728b !important; font-size:7pt; }
    .fin-track { height:8px; overflow:hidden; border-radius:999px; background:#eceff5 !important; }
    .fin-fill { height:100%; border-radius:999px; background:#6543ef !important; }
    .fin-bar-row strong { text-align:right; color:#26324d !important; }
    .fin-composition-bar { display:flex; height:18px; overflow:hidden; border-radius:999px; background:#eceff5 !important; margin-bottom:14px; }
    .fin-expenses { background:#f59e0b !important; } .fin-payouts { background:#6543ef !important; }
    .fin-legend { display:grid; gap:8px; }
    .fin-legend>div { display:grid; grid-template-columns:8px 1fr auto; gap:7px; align-items:center; color:#66728b !important; font-size:7pt; }
    .fin-legend strong { color:#26324d !important; } .dot { width:7px; height:7px; border-radius:50%; }
    .dot.expenses { background:#f59e0b !important; } .dot.payouts { background:#6543ef !important; }
    .fin-outflow-total { display:flex; justify-content:space-between; margin-top:12px; padding-top:9px; border-top:1px solid #e1e5ef; color:#68748c !important; font-size:7pt; }
    .fin-outflow-total strong { color:#10235f !important; font-size:9pt; }
    .fin-analysis { padding:12px 14px; border:1px solid #dfe4f2; border-left:4px solid #6543ef; border-radius:8px; background:#faf9ff !important; color:#536078 !important; font-size:8pt; }
    .fin-analysis p { margin:0 0 7px; } .fin-analysis p:last-child { margin-bottom:0; } .fin-analysis strong { color:#27334f !important; }
    .fin-small-metrics { display:grid; grid-template-columns:repeat(3,1fr); gap:7px; }
    .fin-movement-summary { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
    .fin-movement-summary>div { padding:14px; border:1px solid #e4e8f2; border-radius:9px; background:#fbfbfd !important; }
    .fin-movement-summary span,.fin-movement-summary strong,.fin-movement-summary small { display:block; }
    .fin-movement-summary span { color:#7b869d !important; font-size:7pt; } .fin-movement-summary strong { color:#10235f !important; font-size:18pt; margin:3px 0; } .fin-movement-summary small { color:#98a1b5 !important; font-size:6.5pt; }
    .fin-detail { break-before:page; page-break-before:always; }
    .fin-table { width:100%; border-collapse:collapse; font-size:7pt; }
    .fin-table thead { display:table-header-group; }
    .fin-table th { padding:7px 6px; border-bottom:1.5px solid #10235f; background:#f4f5f9 !important; color:#36415c !important; text-align:left; font-size:6.5pt; text-transform:uppercase; letter-spacing:.3px; }
    .fin-table td { padding:7px 6px; border-bottom:1px solid #e6e9f1; color:#556179 !important; }
    .fin-table td strong { color:#26324e !important; } .fin-table .money { text-align:right; white-space:nowrap; }
    .fin-table tr { break-inside:avoid; page-break-inside:avoid; }
    .fin-footer { justify-content:space-between; gap:20px; margin-top:20px; padding-top:9px; border-top:1px solid #d9deea; color:#8a94a9 !important; font-size:6.5pt; }
    .fin-footer strong,.fin-footer span { display:block; } .fin-footer strong { color:#10235f !important; } .fin-footer .right { text-align:right; }
    * { -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
  }
`;