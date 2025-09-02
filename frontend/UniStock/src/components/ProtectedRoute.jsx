import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ element }) {
  const token = localStorage.getItem('token');
  return token ? element : <Navigate to="/login" />;
}