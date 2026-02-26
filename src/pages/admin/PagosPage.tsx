import { useState, useEffect } from 'react';
import { PagoService, type Pago, type NewPago } from '../../services/pago.service';
import { useAuthStore } from '../../store/authStore';
import { Modal } from '../../components/ui/Modal';
import {
    CreditCard,
    Search,
    RefreshCw,
    Calendar,
    DollarSign,
    CheckCircle2,
    ArrowRightLeft,
    History,
    Download
} from 'lucide-react';
import { PdfService } from '../../services/pdf.service';

export function PagosPage() {
    const [facturasPendientes, setFacturasPendientes] = useState<any[]>([]);
    const [pagos, setPagos] = useState<Pago[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'pendientes' | 'historial'>('pendientes');
    const [searchTerm, setSearchTerm] = useState('');

    // Auth
    const currentUser = useAuthStore(state => state.user);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFactura, setSelectedFactura] = useState<any | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [metodoPago, setMetodoPago] = useState('EFECTIVO');

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        try {
            setIsLoading(true);
            if (activeTab === 'pendientes') {
                const data = await PagoService.getFacturasPendientes();
                setFacturasPendientes(data);
            } else {
                const data = await PagoService.getAllPagos();
                setPagos(data);
            }
        } catch (error) {
            console.error('Error cargando pagos/facturas:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenCobro = (factura: any) => {
        setSelectedFactura(factura);
        setMetodoPago('EFECTIVO');
        setIsModalOpen(true);
    };

    const handleConfirmarPago = async () => {
        if (!selectedFactura || !currentUser) return;

        try {
            setIsProcessing(true);
            const numRecibo = Math.floor(100000 + Math.random() * 900000);

            const newPago: NewPago = {
                factura_id_factura: selectedFactura.id_factura,
                monto_pagado: selectedFactura.total_factura,
                metodo_pago: metodoPago,
                fecha_pago: new Date().toISOString().split('T')[0],
                numero_recibo: numRecibo,
                cajero: `${currentUser.nombre} ${currentUser.apellido}`,
                estado: true
            };

            await PagoService.registrarPago(newPago);

            // Generar PDF del recibo automáticamente o preguntar? 
            // Hagámoslo disponible vía botón, pero también intentemos generarlo de una vez.
            if (window.confirm(`¡Pago registrado con éxito! Recibo N° ${numRecibo}\n\n¿Desea descargar el recibo ahora?`)) {
                PdfService.generateReciboPago({ ...newPago, factura: selectedFactura });
            }

            setIsModalOpen(false);
            loadData();
        } catch (error) {
            console.error('Error al registrar pago:', error);
            alert('Error al registrar el pago.');
        } finally {
            setIsProcessing(false);
        }
    };

    const filteredPendientes = facturasPendientes.filter(f =>
        f.cliente?.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.cliente?.codigo_fijo.includes(searchTerm)
    );

    const filteredPagos = pagos.filter(p =>
        p.factura?.cliente.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.factura?.cliente.codigo_fijo.includes(searchTerm) ||
        p.numero_recibo.toString().includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-secondary-900 tracking-tight flex items-center gap-3">
                        <CreditCard className="text-crm-600" />
                        Caja y Cobranzas
                    </h1>
                    <p className="text-secondary-500 mt-1">Registra cobros de facturas y visualiza el historial de caja.</p>
                </div>

                <div className="flex bg-white p-1 rounded-xl border border-secondary-200 shadow-sm">
                    <button
                        onClick={() => setActiveTab('pendientes')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'pendientes' ? 'bg-crm-600 text-white shadow-md' : 'text-secondary-500 hover:text-secondary-900'}`}
                    >
                        Pendientes
                    </button>
                    <button
                        onClick={() => setActiveTab('historial')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'historial' ? 'bg-crm-600 text-white shadow-md' : 'text-secondary-500 hover:text-secondary-900'}`}
                    >
                        Historial Pagos
                    </button>
                </div>
            </div>

            {/* Content List */}
            <div className="bg-white border border-secondary-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-secondary-100 bg-secondary-50/50 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder={activeTab === 'pendientes' ? "Buscar socio o código..." : "Buscar por socio o N° Recibo..."}
                            className="pl-9 pr-4 py-2 w-full border border-secondary-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-crm-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-secondary-500 font-medium">
                        <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                        <span>Actualizado hace un momento</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {activeTab === 'pendientes' ? (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-secondary-50 text-xs font-semibold text-secondary-500 uppercase tracking-wider">
                                    <th className="px-6 py-4">Socio</th>
                                    <th className="px-6 py-4">Periodo</th>
                                    <th className="px-6 py-4">Vencimiento</th>
                                    <th className="px-6 py-4 text-right">Monto Total</th>
                                    <th className="px-6 py-4 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-secondary-100">
                                {isLoading ? (
                                    <tr><td colSpan={5} className="px-6 py-12 text-center text-secondary-400">Cargando facturas...</td></tr>
                                ) : filteredPendientes.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-12 text-center text-secondary-400">No hay facturas pendientes.</td></tr>
                                ) : (
                                    filteredPendientes.map(f => (
                                        <tr key={f.id_factura} className="hover:bg-secondary-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-secondary-900">{f.cliente?.nombre_completo}</span>
                                                    <span className="text-xs text-crm-600">Cód: {f.cliente?.codigo_fijo}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-secondary-600">{f.periodo}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-red-600 font-bold">
                                                    <Calendar size={14} />
                                                    {f.fecha_vencimiento}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-lg font-black text-secondary-900">{f.total_factura} Bs</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleOpenCobro(f)}
                                                    className="bg-crm-600 hover:bg-crm-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-crm-500/20 transition-all flex items-center gap-2 mx-auto"
                                                >
                                                    <DollarSign size={16} />
                                                    Cobrar
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-secondary-50 text-xs font-semibold text-secondary-500 uppercase tracking-wider">
                                    <th className="px-6 py-4">Fecha / Recibo</th>
                                    <th className="px-6 py-4">Socio</th>
                                    <th className="px-6 py-4">Metodo</th>
                                    <th className="px-6 py-4">Monto Pagado</th>
                                    <th className="px-6 py-4">Cajero</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-secondary-100">
                                {isLoading ? (
                                    <tr><td colSpan={5} className="px-6 py-12 text-center text-secondary-400">Cargando historial...</td></tr>
                                ) : filteredPagos.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-12 text-center text-secondary-400">No hay pagos registrados.</td></tr>
                                ) : (
                                    filteredPagos.map(p => (
                                        <tr key={p.id_pago} className="hover:bg-secondary-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-secondary-900">#{p.numero_recibo}</span>
                                                    <span className="text-[10px] text-secondary-500 uppercase tracking-widest font-bold">{p.fecha_pago}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-secondary-900">{p.factura?.cliente.nombre_completo}</span>
                                                    <span className="text-xs text-secondary-500">Periodo: {p.factura?.periodo}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${p.metodo_pago === 'EFECTIVO' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {p.metodo_pago}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-lg font-black text-green-700">{p.monto_pagado} Bs</span>
                                            </td>
                                            <td className="px-6 py-4 flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-secondary-100 flex items-center justify-center text-[10px] font-bold text-secondary-600">
                                                        {p.cajero[0]}
                                                    </div>
                                                    <span className="text-xs text-secondary-500 italic">{p.cajero}</span>
                                                </div>
                                                <button
                                                    onClick={() => PdfService.generateReciboPago(p)}
                                                    className="p-1.5 text-secondary-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Descargar Recibo"
                                                >
                                                    <Download size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal de Cobro */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Confirmar Cobro de Factura"
            >
                {selectedFactura && (
                    <div className="space-y-6">
                        {/* Summary Card */}
                        <div className="bg-secondary-900 rounded-2xl p-6 text-white relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-secondary-400 text-xs font-bold uppercase tracking-widest mb-1">Monto a Cobrar</p>
                                <h3 className="text-4xl font-black mb-4">{selectedFactura.total_factura} Bs</h3>

                                <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                                    <div>
                                        <p className="text-white/40 text-[10px] font-bold uppercase">Socio</p>
                                        <p className="text-sm font-bold truncate">{selectedFactura.cliente?.nombre_completo}</p>
                                    </div>
                                    <div>
                                        <p className="text-white/40 text-[10px] font-bold uppercase">Código Fijo</p>
                                        <p className="text-sm font-bold">{selectedFactura.cliente?.codigo_fijo}</p>
                                    </div>
                                </div>
                            </div>
                            <DollarSign className="absolute -right-8 -bottom-8 text-white/5 w-40 h-40" />
                        </div>

                        {/* Payment Options */}
                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-secondary-700">Método de Pago</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setMetodoPago('EFECTIVO')}
                                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${metodoPago === 'EFECTIVO' ? 'border-crm-500 bg-crm-50' : 'border-secondary-100 hover:border-secondary-200'}`}
                                >
                                    <ArrowRightLeft className={metodoPago === 'EFECTIVO' ? 'text-crm-600' : 'text-secondary-400'} />
                                    <span className={`text-xs font-bold ${metodoPago === 'EFECTIVO' ? 'text-crm-700' : 'text-secondary-500'}`}>EFECTIVO</span>
                                </button>
                                <button
                                    onClick={() => setMetodoPago('TRANSFERENCIA')}
                                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${metodoPago === 'TRANSFERENCIA' ? 'border-crm-500 bg-crm-50' : 'border-secondary-100 hover:border-secondary-200'}`}
                                >
                                    <History className={metodoPago === 'TRANSFERENCIA' ? 'text-crm-600' : 'text-secondary-400'} />
                                    <span className={`text-xs font-bold ${metodoPago === 'TRANSFERENCIA' ? 'text-crm-700' : 'text-secondary-500'}`}>TRANSFERENCIA</span>
                                </button>
                            </div>
                        </div>

                        <div className="bg-secondary-50 border border-secondary-100 rounded-xl p-4 space-y-3">
                            <p className="text-[10px] font-black text-secondary-400 uppercase tracking-widest border-b border-secondary-200 pb-2">Desglose de Factura</p>
                            {selectedFactura.detalles?.map((det: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-secondary-700 font-medium">{det.concepto}</span>
                                        <span className="text-[10px] text-secondary-400">Unitario: {det.monto_unitario} Bs</span>
                                    </div>
                                    <span className="font-bold text-secondary-900">{det.importe} Bs</span>
                                </div>
                            ))}

                            <div className="pt-3 border-t border-secondary-200 flex justify-between items-center bg-white/50 -mx-4 px-4 py-2 mt-2">
                                <span className="text-xs font-bold text-secondary-500 uppercase">Periodo: {selectedFactura.periodo}</span>
                                <div className="text-right">
                                    <span className="text-[10px] text-secondary-400 block uppercase font-bold">Total a Cobrar</span>
                                    <span className="text-xl font-black text-crm-700">{selectedFactura.total_factura} Bs</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 px-5 py-4 rounded-2xl border border-secondary-200 text-secondary-600 hover:bg-secondary-50 font-bold transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmarPago}
                                disabled={isProcessing}
                                className="flex-[2] bg-crm-600 hover:bg-crm-700 text-white px-5 py-4 rounded-2xl font-black shadow-xl shadow-crm-600/30 transition-all flex items-center justify-center gap-2"
                            >
                                {isProcessing ? (
                                    <RefreshCw className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <CheckCircle2 size={20} />
                                        <span>CONFIRMAR COBRO</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
