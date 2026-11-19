import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import ClientDashboard from './pages/ClientDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';

function RoleRouter() {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;

    if (user.rol === 'ROLE_ADMINISTRADOR') return <AdminDashboard />;
    if (user.rol === 'ROLE_PROPIETARIO') return <OwnerDashboard />;
    if (user.rol === 'ROLE_CLIENTE') return <ClientDashboard />;
    if (user.rol === 'ROLE_EMPLEADO') return <EmployeeDashboard />;

    return <Navigate to="/login" />;
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/registro" element={<RegisterPage />} />
                    <Route path="/dashboard" element={<RoleRouter />} />
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}