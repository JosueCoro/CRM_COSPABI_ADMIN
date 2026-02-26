import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Droplets,
    Receipt,
    CreditCard,
    BarChart3,
    Settings,
    LogOut,
    Bell
} from 'lucide-react';
import { Button } from '../ui/Button';

export const DashboardLayout = () => {
    const navigate = useNavigate();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Inicio', path: '/admin/dashboard' },
        { icon: Users, label: 'Socios', path: '/admin/socios' },
        { icon: Droplets, label: 'Lecturas', path: '/admin/lecturas' },
        { icon: Receipt, label: 'Facturación', path: '/admin/facturas' },
        { icon: CreditCard, label: 'Cajas', path: '/admin/caja' },
        { icon: BarChart3, label: 'Reportes', path: '/admin/reportes' },
    ];

    const handleLogout = () => {
        // Limpiar sesión aquí
        navigate('/');
    };

    return (
        <div className="flex h-screen bg-secondary-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-secondary-200 hidden md:flex flex-col">
                <div className="p-6 border-b border-secondary-100 flex items-center gap-3">
                    <div className="bg-crm-100 p-2 rounded-lg">
                        <Droplets className="w-6 h-6 text-crm-600" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 tracking-tight">COSPABI</h1>
                        <p className="text-xs text-gray-500 font-medium tracking-wide">PANEL ADMIN</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                                ${isActive
                                    ? 'bg-crm-50 text-crm-700 shadow-sm ring-1 ring-crm-200'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }
                            `}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-secondary-100">
                    <NavLink
                        to="/admin/configuracion"
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl mb-1"
                    >
                        <Settings className="w-5 h-5" />
                        Configuración
                    </NavLink>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Topbar */}
                <header className="h-16 bg-white border-b border-secondary-200 flex items-center justify-between px-6 shadow-sm z-10">
                    <h2 className="text-lg font-semibold text-gray-800">
                        Bienvenido de nuevo, Administrador
                    </h2>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="h-8 w-8 rounded-full bg-crm-100 flex items-center justify-center text-crm-700 font-bold border border-crm-200">
                            AD
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6 bg-secondary-50">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
