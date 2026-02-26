import { useState, useEffect } from 'react';
import { FacturaService } from '../../services/factura.service';
import {
    Receipt,
    Search,
    Download,
    FileText,
    Calendar,
    User,
    CheckCircle2,
    Clock,
    RefreshCw,
    ArrowUpRight
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { PdfService } from '../../services/pdf.service';

export function FacturasPage() {
    const [facturas, setFacturas] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'TODOS' | 'PENDIENTE' | 'PAGADO'>('TODOS');

    // Modal for details
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedFactura, setSelectedFactura] = useState<any | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    useEffect(() => {
        loadFacturas();
    }, []);

    const loadFacturas = async () => {
        try {
            setIsLoading(true);
            const data = await FacturaService.getAll();
            setFacturas(data);
        } catch (error) {
            console.error('Error cargando facturas:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewDetails = async (id: number) => {
        try {
            setIsLoadingDetails(true);
            setIsDetailsModalOpen(true);
            const data = await FacturaService.getById(id);
            setSelectedFactura(data);
        } catch (error) {
            console.error('Error cargando detalles:', error);
            alert('No se pudo cargar la información de la factura.');
            setIsDetailsModalOpen(false);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const handleDownloadFullFactura = async (id: number) => {
        try {
            const data = await FacturaService.getById(id);
            PdfService.generateAvisoCobranza(data);
        } catch (error) {
            console.error('Error generando PDF:', error);
            alert('No se pudo generar el PDF.');
        }
    };

    const filteredFacturas = facturas.filter(f => {
        const matchesSearch =
            f.cliente?.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.cliente?.codigo_fijo.includes(searchTerm);

        const matchesStatus = statusFilter === 'TODOS' || f.estado === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-secondary-900 tracking-tight flex items-center gap-3">
                        <Receipt className="text-crm-600" />
                        Registro de Facturación
                    </h1>
                    <p className="text-secondary-500 mt-1">Consulta y gestiona todos los avisos de cobranza generados.</p>
                </div>

                <div className="flex bg-white p-1 rounded-xl border border-secondary-200 shadow-sm">
                    {(['TODOS', 'PENDIENTE', 'PAGADO'] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${statusFilter === status ? 'bg-crm-600 text-white shadow-md' : 'text-secondary-500 hover:text-secondary-900'}`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-secondary-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-crm-50 rounded-xl">
                        <FileText className="text-crm-600" size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] text-secondary-500 font-bold uppercase tracking-wider">Total Facturas</p>
                        <p className="text-xl font-black text-secondary-900">{facturas.length}</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-secondary-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-red-50 rounded-xl">
                        <Clock className="text-red-600" size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] text-secondary-500 font-bold uppercase tracking-wider">Pendientes</p>
                        <p className="text-xl font-black text-secondary-900">
                            {facturas.filter(f => f.estado === 'PENDIENTE').length}
                        </p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-secondary-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-50 rounded-xl">
                        <CheckCircle2 className="text-green-600" size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] text-secondary-500 font-bold uppercase tracking-wider">Pagadas</p>
                        <p className="text-xl font-black text-secondary-900">
                            {facturas.filter(f => f.estado === 'PAGADO').length}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-secondary-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-secondary-100 bg-secondary-50/50 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Buscar por socio o código..."
                            className="input-premium pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={loadFacturas}
                        className="p-2 text-secondary-400 hover:text-crm-600 hover:bg-crm-50 rounded-xl transition-all"
                    >
                        <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-secondary-50 text-[10px] font-black text-secondary-500 uppercase tracking-[0.2em]">
                                <th className="px-6 py-4">Socio / Código</th>
                                <th className="px-6 py-4">Periodo</th>
                                <th className="px-6 py-4">Emisión</th>
                                <th className="px-6 py-4 text-right">Total Bs</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary-100">
                            {isLoading ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-secondary-400">Cargando facturación...</td></tr>
                            ) : filteredFacturas.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-secondary-400">No se encontraron facturas.</td></tr>
                            ) : (
                                filteredFacturas.map(f => (
                                    <tr key={f.id_factura} className="hover:bg-secondary-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-secondary-900 group-hover:text-crm-600 transition-colors">{f.cliente?.nombre_completo}</span>
                                                <span className="text-xs text-secondary-500 font-mono">#{f.cliente?.codigo_fijo}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-secondary-700 bg-secondary-100 px-2 py-1 rounded-lg uppercase">{f.periodo}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-secondary-500">
                                                <Calendar size={14} />
                                                {f.fecha_emision}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-lg font-black text-secondary-900">{f.total_factura} Bs</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${f.estado === 'PAGADO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {f.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleViewDetails(f.id_factura)}
                                                    className="p-2 text-secondary-400 hover:text-crm-600 hover:bg-crm-50 rounded-lg transition-all"
                                                    title="Ver detalles"
                                                >
                                                    <ArrowUpRight size={20} />
                                                </button>
                                                <button
                                                    onClick={() => handleDownloadFullFactura(f.id_factura)}
                                                    className="p-2 text-secondary-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Descargar PDF"
                                                >
                                                    <Download size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Detalles */}
            <Modal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                title="Detalle del Aviso de Cobranza"
            >
                {isLoadingDetails ? (
                    <div className="flex flex-col items-center justify-center p-12 gap-4">
                        <RefreshCw className="animate-spin text-crm-600" size={40} />
                        <p className="text-sm text-secondary-500 font-medium">Buscando información...</p>
                    </div>
                ) : selectedFactura ? (
                    <div className="space-y-6">
                        {/* Cabecera Modal */}
                        <div className="bg-secondary-900 rounded-2xl p-6 text-white overflow-hidden relative">
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <p className="text-secondary-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Aviso de Cobranza</p>
                                        <h3 className="text-2xl font-black uppercase">{selectedFactura.periodo}</h3>
                                    </div>
                                    <div className={`px-4 py-1 rounded-full text-[10px] font-black border ${selectedFactura.estado === 'PAGADO' ? 'border-green-500/50 text-green-400 bg-green-500/10' : 'border-red-500/50 text-red-400 bg-red-500/10'}`}>
                                        {selectedFactura.estado}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/10 rounded-lg"><User size={16} /></div>
                                        <div>
                                            <p className="text-white/40 text-[10px] uppercase font-bold">Titular</p>
                                            <p className="text-sm font-bold truncate max-w-[150px]">{selectedFactura.cliente?.nombre_completo}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/10 rounded-lg"><Calendar size={16} /></div>
                                        <div>
                                            <p className="text-white/40 text-[10px] uppercase font-bold">Vencimiento</p>
                                            <p className="text-sm font-bold">{selectedFactura.fecha_vencimiento}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Receipt className="absolute -right-12 -bottom-12 text-white/5 w-64 h-64" />
                        </div>

                        {/* Detalles de Lectura */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-secondary-50 p-4 rounded-xl border border-secondary-100">
                                <p className="text-[10px] text-secondary-500 font-bold uppercase tracking-wider mb-1">L. Anterior</p>
                                <p className="text-lg font-black text-secondary-900">{selectedFactura.lectura?.lectura_anterior} m³</p>
                            </div>
                            <div className="bg-secondary-50 p-4 rounded-xl border border-secondary-100">
                                <p className="text-[10px] text-secondary-500 font-bold uppercase tracking-wider mb-1">L. Actual</p>
                                <p className="text-lg font-black text-secondary-900">{selectedFactura.lectura?.lectura_actual} m³</p>
                            </div>
                            <div className="bg-crm-50 p-4 rounded-xl border border-crm-100">
                                <p className="text-[10px] text-crm-600 font-bold uppercase tracking-wider mb-1">Consumo</p>
                                <p className="text-lg font-black text-crm-900">{selectedFactura.lectura?.consumo_m3} m³</p>
                            </div>
                        </div>

                        {/* Detalle de Conceptos */}
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black text-secondary-500 uppercase tracking-widest px-1">Detalle de Cobros</h4>
                            <div className="bg-white border border-secondary-100 rounded-xl overflow-hidden">
                                {selectedFactura.detalles?.map((det: any, idx: number) => (
                                    <div key={idx} className={`p-4 flex justify-between items-center ${idx % 2 === 0 ? 'bg-white' : 'bg-secondary-50/30'}`}>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-secondary-900">{det.concepto}</span>
                                            <span className="text-[10px] text-secondary-500 italic">Monto Unitario: {det.monto_unitario} Bs</span>
                                        </div>
                                        <span className="text-sm font-black text-secondary-900">{det.sub_total} Bs</span>
                                    </div>
                                ))}
                                <div className="p-4 bg-crm-600 text-white flex justify-between items-center">
                                    <span className="text-xs font-black uppercase tracking-wider">Total a Pagar</span>
                                    <span className="text-xl font-black">{selectedFactura.total_factura} Bs</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setIsDetailsModalOpen(false)}
                                className="flex-1 px-5 py-3 rounded-xl border border-secondary-200 text-secondary-600 font-bold hover:bg-secondary-50 transition-all"
                            >
                                Cerrar
                            </button>
                            <button
                                onClick={() => PdfService.generateAvisoCobranza(selectedFactura)}
                                className="flex-1 px-5 py-3 rounded-xl bg-secondary-900 text-white font-bold hover:bg-black transition-all flex items-center justify-center gap-2"
                            >
                                <Download size={18} />
                                Imprimir
                            </button>
                        </div>
                    </div>
                ) : null}
            </Modal>
        </div>
    );
}
