import { useEffect, useState } from 'react';
import { Building2, LockKeyhole, LogOut, Moon, ShieldCheck, Sun, UserRound } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { session, logout } = useAuth();
  const [theme, setTheme] = useState(() => localStorage.getItem('loanflow-theme') || 'light');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('loanflow-theme', theme);
  }, [theme]);

  return (
    <header className="nav">
      <Link className="brand" to="/">
        <span className="brand-mark"><Building2 size={22} /></span>
        <span>
          LoanFlow
          <small>Origination Desk</small>
        </span>
      </Link>
      <nav>
        {session?.role === 'CUSTOMER' && <NavLink to="/customer">Customer Desk</NavLink>}
        {session?.role === 'OFFICER' && <NavLink to="/officer">Officer Desk</NavLink>}
      </nav>
      <div className="nav-actions">
        <button
          className="theme-toggle"
          onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          type="button"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <div className="session-pill">
          {session ? (
            <>
              {session.role === 'OFFICER' ? <ShieldCheck size={16} /> : <UserRound size={16} />}
              <span>{session.name}</span>
              <button className="icon-button" onClick={logout} title="Sign out" type="button">
                <LogOut size={17} />
              </button>
            </>
          ) : (
            <>
              <LockKeyhole size={16} />
              <span>Secure JWT Portal</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
