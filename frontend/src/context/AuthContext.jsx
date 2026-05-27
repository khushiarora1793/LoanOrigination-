import { createContext, useContext, useMemo, useState } from 'react';
import api from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => JSON.parse(localStorage.getItem('loanSession') || 'null'));

  async function login(credentials) {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem('loanSession', JSON.stringify(data));
    setSession(data);
    return data;
  }

  async function register(payload) {
    const { data } = await api.post('/auth/register', payload);
    return data;
  }

  function logout() {
    localStorage.removeItem('loanSession');
    setSession(null);
  }

  const value = useMemo(
    () => ({
      session,
      isAuthenticated: Boolean(session?.token),
      login,
      register,
      logout
    }),
    [session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
