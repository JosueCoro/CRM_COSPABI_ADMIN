import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
    permission?: string;
    children?: ReactNode;
}

export function ProtectedRoute({ permission, children }: ProtectedRouteProps) {
    const { isAuthenticated, permissions } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (permission && !permissions.includes(permission)) {
        return <Navigate to="/admin/unauthorized" replace />;
    }

    return children ? <>{children}</> : <Outlet />;
}
