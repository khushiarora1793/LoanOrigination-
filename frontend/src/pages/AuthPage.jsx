import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeCheck, BriefcaseBusiness, Landmark, LockKeyhole, ServerCog, Sparkles, UserPlus, UserRound } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext.jsx';

const initialForm = {
  name: '',
  email: '',
  password: '',
  role: 'CUSTOMER',
  income: '',
  creditScore: '',
  branch: ''
};

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(initialForm);
  const [busy, setBusy] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const previewScore = useMemo(() => {
    const incomeNorm = Math.min(Number(form.income || 0) / 150000, 1);
    const creditNorm = Math.min(Math.max((Number(form.creditScore || 300) - 300) / 600, 0), 1);
    return Math.round(((0.6 * creditNorm) + (0.4 * incomeNorm)) * 100);
  }, [form.income, form.creditScore]);

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);

    try {
      if (mode === 'register') {
        await register(form);
        toast.success('Registration complete. Signing you in.');
      }

      const session = await login({ email: form.email, password: form.password });
      navigate(session.role === 'OFFICER' ? '/officer' : '/customer');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Authentication failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-shell">
      <div className="auth-hero">
        <div className="hero-icon"><Landmark size={30} /></div>
        <span className="hero-kicker">Enterprise lending operations</span>
        <h1>LoanFlow Approval Suite</h1>
        <p>Apply, evaluate, approve and track loan decisions through one secure workflow built for customers and branch officers.</p>
        <div className="hero-proof">
          <div>
            <span>Eligibility</span>
            <strong>{previewScore}%</strong>
          </div>
          <div>
            <span>Review SLA</span>
            <strong>24h</strong>
          </div>
          <div>
            <span>Access</span>
            <strong>JWT</strong>
          </div>
        </div>
        <div className="hero-grid">
          <div><strong>Scoring model</strong><span>Income, credit score and amount pressure</span></div>
          <div><strong>Role access</strong><span>Separate customer and officer desks</span></div>
        </div>
        <div className="actor-strip">
          <article>
            <UserRound size={20} />
            <strong>Customer</strong>
            <span>Registers, applies and tracks loan approval status.</span>
          </article>
          <article>
            <BriefcaseBusiness size={20} />
            <strong>Loan Officer</strong>
            <span>Reviews scoring evidence and approves or rejects applications.</span>
          </article>
          <article>
            <ServerCog size={20} />
            <strong>Platform System</strong>
            <span>Authenticates users, stores data and keeps eligibility logic consistent.</span>
          </article>
        </div>
      </div>

      <form className="auth-card" onSubmit={submit}>
        <div className="form-title">
          <LockKeyhole size={22} />
          <div>
            <h2>{mode === 'login' ? 'Sign in' : 'Create account'}</h2>
            <p>{mode === 'login' ? 'Use seed credentials or your own account.' : 'Register a customer or officer profile.'}</p>
          </div>
        </div>

        <div className="segmented">
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Login</button>
          <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Register</button>
        </div>

        {mode === 'register' && (
          <label>
            Name
            <input placeholder="Enter your full name" value={form.name} onChange={(event) => update('name', event.target.value)} required />
          </label>
        )}

        <label>
          Email
          <input type="email" placeholder="Enter your email address" value={form.email} onChange={(event) => update('email', event.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" placeholder="Enter your password" value={form.password} onChange={(event) => update('password', event.target.value)} required />
        </label>

        {mode === 'register' && (
          <>
            <label>
              Role
              <select value={form.role} onChange={(event) => update('role', event.target.value)}>
                <option value="CUSTOMER">Customer</option>
                <option value="OFFICER">Loan Officer</option>
              </select>
            </label>

            {form.role === 'CUSTOMER' ? (
              <div className="score-panel">
                <label>
                  Monthly income
                  <input type="number" placeholder="Enter your monthly income" value={form.income} onChange={(event) => update('income', event.target.value)} />
                </label>
                <label>
                  Credit score
                  <input type="number" min="300" max="900" placeholder="Enter your credit score" value={form.creditScore} onChange={(event) => update('creditScore', event.target.value)} />
                </label>
                <div className="score-meter">
                  <span style={{ width: `${previewScore}%` }} />
                </div>
                <small><Sparkles size={14} /> Profile strength preview: {previewScore}%</small>
              </div>
            ) : (
              <label>
                Branch
                <input placeholder="Enter your branch name" value={form.branch} onChange={(event) => update('branch', event.target.value)} />
              </label>
            )}
          </>
        )}

        <button className="primary-button" disabled={busy} type="submit">
          {mode === 'login' ? <BadgeCheck size={17} /> : <UserPlus size={17} />}
          {busy ? 'Please wait...' : mode === 'login' ? 'Enter dashboard' : 'Create and enter'}
        </button>

        <div className="security-note">
          <ServerCog size={17} />
          <span>JWT authentication, role-based routing and MongoDB-backed records are active in this workflow.</span>
        </div>
      </form>
    </section>
  );
}
