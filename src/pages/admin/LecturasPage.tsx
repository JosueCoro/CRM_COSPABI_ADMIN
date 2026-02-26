import { useState, useEffect } from 'react';
import type { Lectura, NewLectura } from '../../services/lectura.service';
import { LecturaService } from '../../services/lectura.service';
import { FacturaService } from '../../services/factura.service';
import type { Cliente } from '../../services/cliente.service';
import { ClienteService } from '../../services/cliente.service';
import { Modal } from '../../components/ui/Modal';
import { useAuthStore } from '../../store/authStore';
import {
    Plus,
    Search,
    RefreshCw,
    FileText,
    User,
    Calendar,
    TrendingUp,
    CheckCircle2
} from 'lucide-react';

export function LecturasPage() {
    const [lecturas, setLecturas] = useState<Lectura[]>([]);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Auth
    const currentUser = useAuthStore(state => state.user);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
    const [clienteSearch, setClienteSearch] = useState('');
    const [ultimaLectura, setUltimaLectura] = useState<number>(0);
    const [formData, setFormData] = useState({
        lectura_actual: '',
        observacion: 'LECTURA MENSUAL REGULAR',
        fecha_lectura: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [lecturasData, clientesData] = await Promise.all([
                LecturaService.getAll(),
                ClienteService.getAll()
            ]);
            setLecturas(lecturasData);
            setClientes(clientesData);
        } catch (error) {
            console.error('Error cargando lecturas:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setSelectedCliente(null);
        setClienteSearch('');
        setUltimaLectura(0);
        setFormData({
            lectura_actual: '',
            observacion: 'LECTURA MENSUAL REGULAR',
            fecha_lectura: new Date().toISOString().split('T')[0]
        });
        setIsModalOpen(true);
    };

    const handleSelectCliente = async (cliente: Cliente) => {
        setSelectedCliente(cliente);
        try {
            const ultima = await LecturaService.getUltimaLecturaByCliente(cliente.id_cliente);
            // Si no hay lectura anterior, asumimos 0 o pedimos al usuario
            setUltimaLectura(ultima ? (ultima as any).lectura_anterior + (ultima as any).consumo_m3 : 0);
        } catch (error) {
            console.error('Error obteniendo última lectura:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCliente || !currentUser) return;

        const actual = Number(formData.lectura_actual);
        if (actual < ultimaLectura) {
            alert('La lectura actual no puede ser menor a la anterior.');
            return;
        }

        try {
            setIsProcessing(true);

            const newLectura: NewLectura = {
                cliente_id_cliente: selectedCliente.id_cliente,
                usuario_admin_id_usuario_admin: currentUser.id_usuario_admin,
                fecha_lectura: formData.fecha_lectura,
                lectura_anterior: ultimaLectura,
                lectura_actual: actual,
                consumo_m3: actual - ultimaLectura,
                dias_facturados: 30,
                observacion: formData.observacion
            };

            const lecturaResp = await LecturaService.create(newLectura);

            // FASE 4: Facturación Automática
            await FacturaService.createAutoFactura(
                lecturaResp.id_lectura,
                selectedCliente.id_cliente,
                newLectura.consumo_m3 as number,
                selectedCliente.categoria
            );

            loadData();
            setIsModalOpen(false);
            alert('Lectura registrada y Factura generada con éxito.');
        } catch (error) {
            console.error('Error guardando lectura:', error);
            alert('Error al guardar la lectura.');
        } finally {
            setIsProcessing(false);
        }
    };

    const filteredLecturas = lecturas.filter(l =>
        l.cliente?.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.cliente?.codigo_fijo.includes(searchTerm)
    );

    const filteredClientes = clientes.filter(c =>
        c.nombre_completo.toLowerCase().includes(clienteSearch.toLowerCase()) ||
        c.codigo_fijo.includes(clienteSearch)
    ).slice(0, 5);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-secondary-900 tracking-tight">Registro de Lecturas</h1>
                    <p className="text-secondary-500 mt-1">Ingresa el consumo mensual de los socios.</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="btn-primary flex items-center gap-2 shadow-lg shadow-crm-500/20"
                >
                    <Plus size={20} />
                    <span>Nueva Lectura</span>
                </button>
            </div>

            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-secondary-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <FileText size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-secondary-500">Total Lecturas</p>
                            <p className="text-2xl font-bold text-secondary-900">{lecturas.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="bg-white border border-secondary-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-secondary-100 bg-secondary-50/50 flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Buscar por socio..."
                            className="pl-9 pr-4 py-2 w-full border border-secondary-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-crm-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button onClick={loadData} className="p-2 text-secondary-400 hover:text-crm-600">
                        <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-secondary-50 text-xs font-semibold text-secondary-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Fecha</th>
                                <th className="px-6 py-4">Socio</th>
                                <th className="px-6 py-4">L. Anterior</th>
                                <th className="px-6 py-4">L. Actual</th>
                                <th className="px-6 py-4">Consumo (m³)</th>
                                <th className="px-6 py-4">Registrado por</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary-100">
                            {isLoading ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-secondary-500">Cargando...</td></tr>
                            ) : filteredLecturas.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-secondary-500">No hay registros.</td></tr>
                            ) : (
                                filteredLecturas.map(lect => (
                                    <tr key={lect.id_lectura} className="hover:bg-secondary-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-secondary-700 font-medium">
                                                <Calendar size={14} className="text-secondary-400" />
                                                {lect.fecha_lectura}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-secondary-900">{lect.cliente?.nombre_completo}</span>
                                                <span className="text-xs text-crm-600">Cód: {lect.cliente?.codigo_fijo}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-secondary-600">{lect.lectura_anterior}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-secondary-900">
                                            {lect.lectura_actual}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-crm-50 text-crm-700 rounded-full text-sm font-bold border border-crm-100 flex items-center w-fit gap-1">
                                                <TrendingUp size={12} />
                                                {lect.consumo_m3} m³
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-secondary-500 italic">
                                            {lect.usuario_admin?.nombre} {lect.usuario_admin?.apellido}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Nuevo Registro de Lectura"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Búsqueda de Socio */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-secondary-700">Buscar Socio (Nombre o Código)</label>
                        {!selectedCliente ? (
                            <div className="relative">
                                <Search className="absolute left-3 top-3 text-secondary-400 w-4 h-4" />
                                <input
                                    type="text"
                                    className="input-premium pl-10"
                                    placeholder="Ej. Juan Perez..."
                                    value={clienteSearch}
                                    onChange={(e) => setClienteSearch(e.target.value)}
                                />
                                {clienteSearch.length > 0 && (
                                    <div className="absolute w-full mt-1 bg-white border border-secondary-200 rounded-xl shadow-xl z-[60] overflow-hidden">
                                        {filteredClientes.map(c => (
                                            <button
                                                key={c.id_cliente}
                                                type="button"
                                                onClick={() => handleSelectCliente(c)}
                                                className="w-full p-3 text-left hover:bg-crm-50 flex items-center justify-between border-b border-secondary-50 last:border-0"
                                            >
                                                <div>
                                                    <p className="text-sm font-bold text-secondary-900">{c.nombre_completo}</p>
                                                    <p className="text-xs text-secondary-500">Cód: {c.codigo_fijo} | {c.categoria}</p>
                                                </div>
                                                <User size={16} className="text-crm-500" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-3 bg-crm-50 border border-crm-200 rounded-xl">
                                <div>
                                    <p className="text-sm font-bold text-crm-900">{selectedCliente.nombre_completo}</p>
                                    <p className="text-xs text-crm-600">Socio Seleccionado - Cód: {selectedCliente.codigo_fijo}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedCliente(null)}
                                    className="text-xs font-bold text-crm-700 hover:underline"
                                >
                                    Cambiar
                                </button>
                            </div>
                        )}
                    </div>

                    {selectedCliente && (
                        <div className="grid grid-cols-2 gap-4 pt-2 animate-in fade-in slide-in-from-top-2">
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">Lectura Anterior</label>
                                <input
                                    type="number"
                                    className={`input-premium text-xl font-bold ${ultimaLectura === 0 ? 'text-crm-700' : 'bg-secondary-50 text-secondary-500'}`}
                                    value={ultimaLectura}
                                    onChange={(e) => setUltimaLectura(Number(e.target.value))}
                                    disabled={ultimaLectura > 0}
                                    title={ultimaLectura > 0 ? "No se puede cambiar una lectura anterior existente" : "Ingresa la lectura base inicial"}
                                />
                                {ultimaLectura === 0 && (
                                    <p className="text-[10px] text-crm-600 mt-1 font-bold italic">¡Atención! Primer registro del socio.</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">Lectura Actual</label>
                                <input
                                    type="number"
                                    required
                                    className="input-premium text-xl font-bold text-crm-700"
                                    placeholder="0"
                                    value={formData.lectura_actual}
                                    onChange={(e) => setFormData({ ...formData, lectura_actual: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    {selectedCliente && formData.lectura_actual && (
                        <div className="bg-green-50 border border-green-100 p-4 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 text-green-700 rounded-full">
                                    <CheckCircle2 size={16} />
                                </div>
                                <div>
                                    <p className="text-xs text-green-700 font-bold uppercase tracking-wider">Consumo Calculado</p>
                                    <p className="text-2xl font-black text-green-800">
                                        {Number(formData.lectura_actual) - ultimaLectura} m³
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">Fecha Registro</label>
                            <input
                                type="date"
                                className="input-premium"
                                value={formData.fecha_lectura}
                                onChange={(e) => setFormData({ ...formData, fecha_lectura: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">Días Facturados</label>
                            <input
                                type="number"
                                className="input-premium"
                                defaultValue={30}
                                disabled
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">Observación</label>
                        <input
                            type="text"
                            className="input-premium"
                            value={formData.observacion}
                            onChange={(e) => setFormData({ ...formData, observacion: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-secondary-100">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-5 py-2.5 rounded-xl border border-secondary-200 text-secondary-600 hover:bg-secondary-50 font-medium transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isProcessing || !selectedCliente}
                            className={`btn-primary flex items-center gap-2 ${!selectedCliente ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isProcessing ? (
                                <RefreshCw size={16} className="animate-spin" />
                            ) : (
                                <span>Registrar Lectura</span>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
