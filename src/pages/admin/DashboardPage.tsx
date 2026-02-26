import { useState, useEffect } from 'react';
import {
    Users,
    FileText,
    Receipt,
    DollarSign,
    TrendingUp,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    Activity
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const client = supabase as any;

export function DashboardPage() {
    const [stats, setStats] = useState({
        totalSocios: 0,
        lecturasMes: 0,
        facturadoMes: 0,
        recaudadoMes: 0,
        pendientesCobro: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setIsLoading(true);

            // Mocking some stats or fetching from real data if possible
            const { count: sociosCount } = await client.from('cliente').select('*', { count: 'exact', head: true });
            const { count: lecturasCount } = await client.from('lectura').select('*', { count: 'exact', head: true });
            const { data: facturas } = await client.from('factura').select('total_factura, estado, monto_pagado');

            const totalFacturado = facturas?.reduce((acc: number, f: any) => acc + (f.total_factura || 0), 0) || 0;
            const facturasPagadas = facturas?.filter((f: any) => f.estado === 'PAGADO') || [];
            const totalRecaudado = facturasPagadas.reduce((acc: number, f: any) => acc + (f.total_factura || 0), 0) || 0;
            const pendientes = facturas?.filter((f: any) => f.estado === 'PENDIENTE').length || 0;

            setStats({
                totalSocios: sociosCount || 0,
                lecturasMes: lecturasCount || 0,
                facturadoMes: totalFacturado,
                recaudadoMes: totalRecaudado,
                pendientesCobro: pendientes
            });
        } catch (error) {
            console.error('Error cargando stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const cards = [
        {
            label: 'Total Socios',
            value: stats.totalSocios,
            icon: Users,
            color: 'bg-blue-500',
            trend: '+2% este mes',
            trendUp: true
        },
        {
            label: 'Lecturas Realizadas',
            value: stats.lecturasMes,
            icon: FileText,
            color: 'bg-crm-600',
            trend: 'Al día',
            trendUp: true
        },
        {
            label: 'Total Facturado',
            value: `${stats.facturadoMes.toFixed(2)} Bs`,
            icon: Receipt,
            color: 'bg-purple-600',
            trend: 'Periodo Actual',
            trendUp: true
        },
        {
            label: 'Recaudado (Caja)',
            value: `${stats.recaudadoMes.toFixed(2)} Bs`,
            icon: DollarSign,
            color: 'bg-green-600',
            trend: '85% del total',
            trendUp: true
        }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-secondary-900 tracking-tight">Panel de Control</h1>
                <p className="text-secondary-500 mt-1 text-sm font-medium flex items-center gap-2">
                    <Activity size={16} className="text-green-500" />
                    Resumen general del sistema COSPABI
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl border border-secondary-200 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${card.color} text-white shadow-lg shadow-current/20`}>
                                <card.icon size={24} />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-bold ${card.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                                {card.trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {card.trend}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-black text-secondary-400 uppercase tracking-widest">{card.label}</p>
                            <h3 className="text-3xl font-black text-secondary-900 mt-1">{isLoading ? '...' : card.value}</h3>
                        </div>
                        {/* Subtle background decoration */}
                        <card.icon className="absolute -right-4 -bottom-4 text-secondary-50 w-24 h-24 group-hover:scale-110 transition-transform" />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Alerts / Pending tasks */}
                <div className="bg-white rounded-2xl border border-secondary-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-secondary-100 bg-secondary-50/30 flex justify-between items-center">
                        <h3 className="font-bold text-secondary-900 flex items-center gap-2">
                            <AlertCircle size={18} className="text-crm-600" />
                            Avisos y Tareas Pendientes
                        </h3>
                        <button className="text-xs font-bold text-crm-600 hover:underline">Ver todo</button>
                    </div>
                    <div className="p-4 space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-red-50 rounded-xl border border-red-100">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                <Receipt size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-red-900 text-balance">Tienes {stats.pendientesCobro} facturas pendientes de cobro.</p>
                                <p className="text-xs text-red-700">Asegúrate de realizar el seguimiento de cobranza.</p>
                            </div>
                            <ArrowRightIcon className="text-red-400" />
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <Users size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-blue-900">Nuevos socios sin lectura inicial</p>
                                <p className="text-xs text-blue-700">Hay 3 socios registrados que aún no tienen su primera lectura.</p>
                            </div>
                            <ArrowRightIcon className="text-blue-400" />
                        </div>
                    </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="bg-white rounded-2xl border border-secondary-200 shadow-sm p-6">
                    <h3 className="font-bold text-secondary-900 mb-6 flex items-center gap-2">
                        <TrendingUp size={18} className="text-crm-600" />
                        Accesos Directos
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-secondary-100 hover:border-crm-200 hover:bg-crm-50 transition-all group">
                            <div className="p-4 bg-secondary-50 rounded-2xl group-hover:bg-white group-hover:shadow-md transition-all">
                                <FileText className="text-secondary-600 group-hover:text-crm-600" />
                            </div>
                            <span className="text-xs font-bold text-secondary-600 group-hover:text-crm-700">Registrar Lecturas</span>
                        </button>
                        <button className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-secondary-100 hover:border-crm-200 hover:bg-crm-50 transition-all group">
                            <div className="p-4 bg-secondary-50 rounded-2xl group-hover:bg-white group-hover:shadow-md transition-all">
                                <DollarSign className="text-secondary-600 group-hover:text-crm-600" />
                            </div>
                            <span className="text-xs font-bold text-secondary-600 group-hover:text-crm-700">Realizar Cobros</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ArrowRightIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    );
}
