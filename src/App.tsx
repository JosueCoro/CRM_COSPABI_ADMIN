import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginAdmin } from './pages/auth/LoginAdmin';
import { useEffect } from 'react';
import { AdminLayout } from './components/layout/AdminLayout';
import { RolesPage } from './pages/admin/RolesPage';
import { UsuariosPage } from './pages/admin/UsuariosPage';
import { ClientesPage } from './pages/admin/ClientesPage';
import { LecturasPage } from './pages/admin/LecturasPage';
import { PagosPage } from './pages/admin/PagosPage';
import { FacturasPage } from './pages/admin/FacturasPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { GastosPage } from './pages/admin/GastosPage';
import { NotificacionesPage } from './pages/admin/NotificacionesPage';
import { TarifasPage } from './pages/admin/TarifasPage';
import { MultasPage } from './pages/admin/MultasPage';

import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { UnauthorizedPage } from './pages/admin/UnauthorizedPage';

function App() {

    useEffect(() => {
        document.title = "COSPABI | Admin";
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                {/* Login Admin */}
                <Route path="/" element={<LoginAdmin />} />
                <Route path="/login" element={<Navigate to="/" replace />} />

                {/* Rutas Protegidas - Admin */}
                <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="unauthorized" element={<UnauthorizedPage />} />

                    <Route path="socios" element={<ProtectedRoute permission="G_CLIENTE"><ClientesPage /></ProtectedRoute>} />
                    <Route path="lecturas" element={<ProtectedRoute permission="G_LECTURA"><LecturasPage /></ProtectedRoute>} />
                    <Route path="facturas" element={<ProtectedRoute permission="G_FACTURA_GENERAR"><FacturasPage /></ProtectedRoute>} />
                    <Route path="pagos" element={<ProtectedRoute permission="G_PAGO"><PagosPage /></ProtectedRoute>} />
                    <Route path="roles" element={<ProtectedRoute permission="G_ROL"><RolesPage /></ProtectedRoute>} />
                    <Route path="usuarios" element={<ProtectedRoute permission="G_USUARIOS_ADMIN"><UsuariosPage /></ProtectedRoute>} />
                    <Route path="gastos" element={<ProtectedRoute permission="V_GASTOS"><GastosPage /></ProtectedRoute>} />
                    <Route path="notificaciones" element={<ProtectedRoute permission="G_NOTIFICACION"><NotificacionesPage /></ProtectedRoute>} />
                    <Route path="tarifas" element={<ProtectedRoute permission="G_TARIFAS"><TarifasPage /></ProtectedRoute>} />
                    <Route path="multas" element={<ProtectedRoute permission="G_CARGOS_EXTRAS"><MultasPage /></ProtectedRoute>} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}


export default App;
