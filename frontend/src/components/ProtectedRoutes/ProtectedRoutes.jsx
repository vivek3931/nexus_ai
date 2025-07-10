// components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ isAuthenticated, redirectPath = '/login' }) => {
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }
  return <Outlet />; // Renders the child routes
};
export default ProtectedRoute;