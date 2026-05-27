import { useEffect, useMemo, useState } from 'react';
import { BadgeIndianRupee, BriefcaseBusiness, Calculator, Clock3, FileCheck2, IndianRupee, RefreshCw, Send, ServerCog, ShieldCheck, TrendingUp, UserRound } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/client.js';
import Metric from '../components/Metric.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function CustomerDashboard() {
  const [form, setForm] = useState({ amountRequested: 500000, tenureMonths: 24 });
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);

  const emiPreview = useMemo(() => {
    const principal = Number(form.amountRequested || 0);
    const months = Number(form.tenureMonths || 1);
    const monthlyRate = 0.115 / 12;
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
    return Number.isFinite(emi) ? Math.round(emi) : 0;
  }, [form.amountRequested, form.tenureMonths]);

  async function loadLoans() {
    setLoading(true);
    try {
      const { data } = await api.get('/loans/mine');
      setLoans(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load loans');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLoans();
  }, []);

  async function submit(event) {
    event.preventDefault();
    try {
      const { data } = await api.post('/loans/apply', form);
      toast.success(`${data.message} Recommendation: ${data.recommendation}`);
      await loadLoans();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Application failed');
    }
  }

  const pending = loans.filter((loan) => loan.status === 'PENDING').length;
  const approved = loans.filter((loan) => loan.status === 'APPROVED').length;
  const latestLoan = loans[0];

  return (
    <section className="dashboard">
      <div className="dashboard-hero dashboard-hero-customer">
        <div>
          <span className="eyebrow">Customer workspace</span>
          <h1>Apply and track loan decisions</h1>
          <p className="dashboard-copy">Submit a request, preview your EMI and follow officer decisions from one secure customer desk.</p>
          <div className="hero-actions">
            <button className="ghost-button" onClick={loadLoans} type="button">
              <RefreshCw size={17} /> Refresh
            </button>
            <span><ShieldCheck size={16} /> Bank-grade workflow</span>
          </div>
        </div>
        <div className="dashboard-visual customer-visual" aria-hidden="true">
          <div className="visual-card visual-card-main">
            <BadgeIndianRupee size={22} />
            <span>Eligible amount</span>
            <strong>Rs. 8.2L</strong>
          </div>
          <div className="visual-card visual-card-float">
            <TrendingUp size={18} />
            <span>Score trend</span>
            <strong>+12%</strong>
          </div>
        </div>
      </div>

      <div className="metrics-row">
        <Metric label="Applications" value={loans.length} helper="Total submitted" />
        <Metric label="Pending review" value={pending} tone="warn" helper="Awaiting officer" />
        <Metric label="Approved" value={approved} tone="good" helper="Cleared cases" />
        <Metric label="Preview EMI" value={`Rs. ${emiPreview.toLocaleString('en-IN')}`} helper="At 11.5% annual" />
      </div>

      <div className="workflow-band">
        <div>
          <UserRound size={19} />
          <span>Customer submits loan request</span>
        </div>
        <div>
          <ServerCog size={19} />
          <span>Platform calculates score</span>
        </div>
        <div>
          <BriefcaseBusiness size={19} />
          <span>Officer records final decision</span>
        </div>
      </div>

      {latestLoan && (
        <div className="insight-strip">
          <div>
            <FileCheck2 size={20} />
            <span>Latest application</span>
            <strong>Rs. {latestLoan.amountRequested.toLocaleString('en-IN')}</strong>
          </div>
          <div>
            <TrendingUp size={20} />
            <span>Eligibility score</span>
            <strong>{Math.round((latestLoan.eligibilityScore || 0) * 100)}%</strong>
          </div>
          <div>
            <Clock3 size={20} />
            <span>Current status</span>
            <strong>{latestLoan.status}</strong>
          </div>
        </div>
      )}

      <div className="work-grid">
        <form className="panel application-panel" onSubmit={submit}>
          <div className="panel-title">
            <Calculator size={22} />
            <div>
              <h2>New loan application</h2>
              <p>Score is calculated immediately and officer review stays trackable.</p>
            </div>
          </div>
          <label>
            Amount requested
            <div className="input-icon">
              <IndianRupee size={16} />
              <input type="number" min="1000" value={form.amountRequested} onChange={(event) => setForm({ ...form, amountRequested: Number(event.target.value) })} />
            </div>
          </label>
          <label>
            Tenure months
            <input type="range" min="6" max="84" value={form.tenureMonths} onChange={(event) => setForm({ ...form, tenureMonths: Number(event.target.value) })} />
            <strong>{form.tenureMonths} months</strong>
          </label>
          <div className="emi-box">
            <span>Estimated EMI at 11.5%</span>
            <strong>Rs. {emiPreview.toLocaleString('en-IN')}</strong>
          </div>
          <button className="primary-button" type="submit">
            <Send size={17} /> Submit application
          </button>
        </form>

        <div className="panel list-panel">
          <div className="panel-title">
            <div>
              <h2>Application timeline</h2>
              <p>{loading ? 'Loading latest decisions...' : 'Newest applications appear first.'}</p>
            </div>
          </div>
          <div className="loan-list">
            {loans.map((loan) => (
              <article className="loan-card" key={loan._id}>
                <div>
                  <strong>Rs. {loan.amountRequested.toLocaleString('en-IN')}</strong>
                  <span>{loan.tenureMonths} months</span>
                </div>
                <StatusBadge status={loan.status} />
                <div className="score-ring" style={{ '--score': `${Math.round((loan.eligibilityScore || 0) * 100)}%` }}>
                  <span>{Math.round((loan.eligibilityScore || 0) * 100)}%</span>
                </div>
              </article>
            ))}
            {!loans.length && <p className="empty">No applications yet. Submit one to start the workflow.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
