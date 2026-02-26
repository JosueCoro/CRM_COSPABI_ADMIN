import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    LogOut,
    Receipt,
    CreditCard,
    FileText,
    Menu,
    ChevronLeft,
    UserCircle,
    Settings,
    ShieldCheck,
    Wallet,
    Megaphone,
    Tag
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(true);
    const logout = useAuthStore(state => state.logout);
    const userAuth = useAuthStore(state => state.user);
    const permissions = useAuthStore(state => state.permissions);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/socios', label: 'Gestión Socios', icon: Users, permission: 'G_CLIENTE' },
        { path: '/admin/lecturas', label: 'Lecturas Ag.', icon: FileText, permission: 'G_LECTURA' },
        { path: '/admin/facturas', label: 'Facturación', icon: Receipt, permission: 'G_FACTURA_GENERAR' },
        { path: '/admin/pagos', label: 'Pagos / Caja', icon: CreditCard, permission: 'G_PAGO' },
        { path: '/admin/usuarios', label: 'Personal', icon: UserCircle, permission: 'G_USUARIOS_ADMIN' },
        { path: '/admin/roles', label: 'Roles y Permisos', icon: ShieldCheck, permission: 'G_ROL' },
        { path: '/admin/gastos', label: 'Gastos / Egresos', icon: Wallet, permission: 'V_GASTOS' },
        { path: '/admin/notificaciones', label: 'Notificaciones', icon: Megaphone, permission: 'G_NOTIFICACION' },
        { path: '/admin/tarifas', label: 'Tarifas', icon: Settings, permission: 'G_TARIFAS' },
        { path: '/admin/multas', label: 'Multas y Servicios', icon: Tag, permission: 'G_CARGOS_EXTRAS' },
    ];

    const filteredNavItems = navItems.filter(item =>
        !item.permission || permissions.includes(item.permission)
    );


    return (
        <>
            {/* Backdrop for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden animate-in fade-in duration-300"
                    onClick={onClose}
                />
            )}

            <aside className={`
                fixed inset-y-0 left-0 z-50 bg-white border-r border-secondary-200 flex flex-col transition-all duration-300
                md:relative md:translate-x-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                ${isExpanded ? 'w-64' : 'w-20'}
            `}>
                {/* Toggle Button (Desktop only) */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="absolute -right-3 top-20 bg-white border border-secondary-200 rounded-full p-1 hover:text-crm-600 transition-colors shadow-sm z-50 text-secondary-400 hidden md:block"
                >
                    {isExpanded ? <ChevronLeft size={16} /> : <Menu size={16} />}
                </button>

                {/* Close Button (Mobile only) */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 p-2 text-secondary-400 hover:text-crm-600 md:hidden"
                >
                    <ChevronLeft size={24} />
                </button>

                <div className="p-6 flex items-center justify-center border-b border-secondary-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-tr from-crm-600 to-crm-400 rounded-xl flex items-center justify-center shadow-lg shadow-crm-500/30">
                            <span className="text-white font-bold text-xl">C</span>
                        </div>
                        {(isExpanded || (isOpen && !isExpanded)) && (
                            <span className="font-bold text-xl text-secondary-900 tracking-tight">COSPABI</span>
                        )}
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
                    {filteredNavItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => {
                                if (window.innerWidth < 768) onClose?.();
                            }}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                                ${isActive
                                    ? 'bg-crm-50 text-crm-700 font-semibold shadow-sm'
                                    : 'text-secondary-500 hover:bg-secondary-50 hover:text-secondary-900'
                                }
                            `}
                        >
                            <item.icon className="w-5 h-5 transition-colors shrink-0" />
                            <span className={`truncate ${(isExpanded || (isOpen && !isExpanded)) ? 'opacity-100' : 'md:opacity-0 md:w-0'} Transition-opacity duration-300`}>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-secondary-100 space-y-2">
                    {(isExpanded || (isOpen && !isExpanded)) && userAuth && (
                        <div className="flex items-center gap-3 px-4 py-2 bg-secondary-50 rounded-xl mb-2">
                            <div className="w-8 h-8 rounded-full bg-crm-100 flex items-center justify-center text-crm-700 text-xs font-bold shrink-0">
                                {userAuth.nombre[0]}{userAuth.apellido[0]}
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-xs font-bold text-secondary-900 truncate">{userAuth.nombre} {userAuth.apellido}</span>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleLogout}
                        className={`
                            w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200
                            ${(isExpanded || (isOpen && !isExpanded)) ? '' : 'justify-center'}
                        `}
                    >
                        <LogOut className="w-5 h-5 shrink-0" />
                        {(isExpanded || (isOpen && !isExpanded)) && <span className="font-medium">Cerrar Sesión</span>}
                    </button>
                </div>

            </aside>
        </>
    );
}

