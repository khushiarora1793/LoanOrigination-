import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ClipboardList, FileSearch, RefreshCw, Scale, ShieldCheck, UserRound, UsersRound, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/client.js';
import Metric from '../components/Metric.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function OfficerDashboard() {
  const [loans, setLoans] = useState([]);
  const [filter, setFilter] = useState('PENDING');
  const [loading, setLoading] = useState(false);

  async function loadLoans() {
    setLoading(true);
    try {
      const { data } = await api.get('/officer/loans');
      setLoans(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load officer queue');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLoans();
  }, []);

  async function review(id, decision) {
    try {
      const { data } = await api.post(`/officer/loans/${id}/review`, { decision });
      toast.success(`${data.message}. System suggested ${data.systemRecommendation}.`);
      await loadLoans();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Review failed');
    }
  }

  const visibleLoans = useMemo(
    () => loans.filter((loan) => filter === 'ALL' || loan.status === filter),
    [loans, filter]
  );

  const counts = {
    pending: loans.filter((loan) => loan.status === 'PENDING').length,
    approved: loans.filter((loan) => loan.status === 'APPROVED').length,
    rejected: loans.filter((loan) => loan.status === 'REJECTED').length
  };

  return (
    <section className="dashboard">
      <div className="dashboard-hero dashboard-hero-officer">
        <div>
          <span className="eyebrow">Officer workspace</span>
          <h1>Review applications with scoring evidence</h1>
          <p className="dashboard-copy">Prioritize pending cases, compare score signals and record decisions with a clear audit trail.</p>
          <div className="hero-actions">
            <button className="ghost-button" onClick={loadLoans} type="button">
              <RefreshCw size={17} /> Refresh
            </button>
            <span><ShieldCheck size={16} /> Verified reviewer access</span>
          </div>
        </div>
        <div className="dashboard-visual officer-visual" aria-hidden="true">
          <div className="visual-card visual-card-main">
            <FileSearch size={22} />
            <span>Risk queue</span>
            <strong>{counts.pending} pending</strong>
          </div>
          <div className="visual-card visual-card-float">
            <UsersRound size={18} />
            <span>Cases</span>
            <strong>{loans.length}</strong>
          </div>
        </div>
      </div>

      <div className="metrics-row">
        <Metric label="Pending" value={counts.pending} tone="warn" helper="Needs action" />
        <Metric label="Approved" value={counts.approved} tone="good" helper="Completed" />
        <Metric label="Rejected" value={counts.rejected} tone="danger" helper="Declined" />
        <Metric label="Total cases" value={loans.length} helper="All applications" />
      </div>

      <div className="evidence-band">
        <div>
          <UserRound size={19} />
          <strong>Borrower profile</strong>
          <span>Income, credit score and application details are available for review.</span>
        </div>
        <div>
          <Scale size={19} />
          <strong>Eligibility score</strong>
          <span>Credit score, income and requested amount inform priority.</span>
        </div>
        <div>
          <ShieldCheck size={19} />
          <strong>Officer decision</strong>
          <span>Approval or rejection is saved with authenticated reviewer context.</span>
        </div>
      </div>

      <div className="panel">
        <div className="panel-toolbar">
          <div className="panel-title">
            <ClipboardList size={22} />
            <div>
              <h2>Loan review queue</h2>
              <p>{loading ? 'Refreshing cases...' : 'Inspect borrower profile, score and amount pressure.'}</p>
            </div>
          </div>
          <div className="segmented compact">
            {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((item) => (
              <button className={filter === item ? 'active' : ''} key={item} onClick={() => setFilter(item)} type="button">
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="review-list">
          {visibleLoans.map((loan) => {
            const score = Math.round((loan.eligibilityScore || 0) * 100);
            return (
              <article className="review-card" key={loan._id}>
                <div className="borrower">
                  <strong>{loan.customerId?.userId?.name || 'Customer'}</strong>
                  <span>{loan.customerId?.userId?.email}</span>
                </div>
                <div>
                  <span className="label">Amount</span>
                  <strong>Rs. {loan.amountRequested.toLocaleString('en-IN')}</strong>
                </div>
                <div>
                  <span className="label">Tenure</span>
                  <strong>{loan.tenureMonths} mo</strong>
                </div>
                <div className="score-bar">
                  <span style={{ width: `${score}%` }} />
                  <strong>{score}%</strong>
                </div>
                <div className="recommendation">
                  <ShieldCheck size={15} />
                  <span>{score >= 60 ? 'Strong' : score >= 45 ? 'Review' : 'Risk'}</span>
                </div>
                <StatusBadge status={loan.status} />
                <div className="actions">
                  <button className="approve" disabled={loan.status !== 'PENDING'} onClick={() => review(loan._id, 'APPROVED')} title="Approve loan" type="button">
                    <CheckCircle2 size={18} />
                  </button>
                  <button className="reject" disabled={loan.status !== 'PENDING'} onClick={() => review(loan._id, 'REJECTED')} title="Reject loan" type="button">
                    <XCircle size={18} />
                  </button>
                </div>
              </article>
            );
          })}
          {!visibleLoans.length && <p className="empty">No cases in this view.</p>}
        </div>
      </div>
    </section>
  );
}
