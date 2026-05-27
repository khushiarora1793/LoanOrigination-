import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ role, children }) {
  const { session } = useAuth();

  if (!session?.token) {
    return <Navigate to="/" replace />;
  }

  if (role && session.role !== role) {
    return <Navigate to={session.role === 'OFFICER' ? '/officer' : '/customer'} replace />;
  }

  return children;
}
