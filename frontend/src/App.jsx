import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AuthPage from './pages/AuthPage.jsx';
import CustomerDashboard from './pages/CustomerDashboard.jsx';
import OfficerDashboard from './pages/OfficerDashboard.jsx';
import { useAuth } from './context/AuthContext.jsx';

export default function App() {
  const { session } = useAuth();

  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route
            path="/"
            element={
              session?.token ? (
                <Navigate to={session.role === 'OFFICER' ? '/officer' : '/customer'} replace />
              ) : (
                <AuthPage />
              )
            }
          />
          <Route
            path="/customer"
            element={
              <ProtectedRoute role="CUSTOMER">
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/officer"
            element={
              <ProtectedRoute role="OFFICER">
                <OfficerDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </>
  );
}
