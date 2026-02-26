import { useState, useEffect } from 'react';
import type { Gasto, NewGasto, UpdateGasto } from '../../services/gasto.service';
import { GastoService } from '../../services/gasto.service';
import { Modal } from '../../components/ui/Modal';
import { Plus, Edit2, Trash2, Search, RefreshCw, DollarSign, Calendar, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export function GastosPage() {
    const [gastos, setGastos] = useState<Gasto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const userAuth = useAuthStore(state => state.user);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentGasto, setCurrentGasto] = useState<Gasto | null>(null);
    const [formData, setFormData] = useState<Partial<NewGasto>>({
        concepto: '',
        monto: 0,
        fecha: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        loadGastos();
    }, []);

    const loadGastos = async () => {
        try {
            setIsLoading(true);
            const data = await GastoService.getAll();
            setGastos(data);
        } catch (error) {
            console.error('Error cargando gastos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setCurrentGasto(null);
        setFormData({
            concepto: '',
            monto: 0,
            fecha: new Date().toISOString().split('T')[0]
        });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (gasto: Gasto) => {
        setCurrentGasto(gasto);
        setFormData({
            concepto: gasto.concepto,
            monto: gasto.monto,
            fecha: gasto.fecha
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Estás seguro de eliminar este gasto?')) return;
        try {
            setIsProcessing(true);
            await GastoService.delete(id);
            setGastos(prev => prev.filter(g => g.id_gasto !== id));
        } catch (error) {
            console.error('Error eliminando gasto:', error);
            alert('No se pudo eliminar el gasto.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userAuth) return;

        try {
            setIsProcessing(true);

            if (currentGasto) {
                await GastoService.update(currentGasto.id_gasto, formData as UpdateGasto);
            } else {
                const createData: NewGasto = {
                    concepto: formData.concepto!,
                    monto: formData.monto!,
                    fecha: formData.fecha!,
                    usuario_admin_id_usuario_admin: userAuth.id_usuario_admin
                };
                await GastoService.create(createData);
            }
            loadGastos();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error guardando gasto:', error);
            alert('Error al guardar el gasto.');
        } finally {
            setIsProcessing(false);
        }
    };

    const filteredGastos = gastos.filter(gasto =>
        gasto.concepto.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalGastos = filteredGastos.reduce((acc, g) => acc + Number(g.monto), 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-secondary-900 tracking-tight">Registro de Gastos</h1>
                    <p className="text-secondary-500 mt-1">Controla los egresos y gastos operativos de la cooperativa.</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="btn-primary flex items-center gap-2 shadow-lg shadow-crm-500/20"
                >
                    <Plus size={20} />
                    <span>Nuevo Gasto</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-l-crm-500">
                    <div className="p-3 bg-crm-50 text-crm-600 rounded-xl">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-secondary-500">Total Gastos (Filtrados)</p>
                        <p className="text-2xl font-bold text-secondary-900">{totalGastos.toFixed(2)} Bs</p>
                    </div>
                </div>
                {/* Add more stats if needed */}
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-xl border border-secondary-200 shadow-sm flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por concepto..."
                        className="pl-10 pr-4 py-2 w-full border border-secondary-200 rounded-lg focus:ring-2 focus:ring-crm-500 focus:border-crm-500 outline-none text-secondary-700 placeholder:text-secondary-400 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={loadGastos}
                    className="p-2 text-secondary-500 hover:text-crm-600 hover:bg-crm-50 rounded-lg transition-colors"
                >
                    <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
                </button>
            </div>

            {/* Table */}
            <div className="bg-white border border-secondary-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-secondary-50 border-b border-secondary-200">
                                <th className="px-6 py-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Concepto</th>
                                <th className="px-6 py-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Registrado por</th>
                                <th className="px-6 py-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider text-right">Monto (Bs)</th>
                                <th className="px-6 py-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-secondary-500">Cargando gastos...</td>
                                </tr>
                            ) : filteredGastos.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-secondary-500">No se encontraron gastos.</td>
                                </tr>
                            ) : (
                                filteredGastos.map((gasto) => (
                                    <tr key={gasto.id_gasto} className="hover:bg-secondary-50/50 transition-colors group">
                                        <td className="px-6 py-4 text-sm text-secondary-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-secondary-400" />
                                                {new Date(gasto.fecha).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-secondary-900">{gasto.concepto}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-secondary-600">
                                            <div className="flex items-center gap-2">
                                                <User size={14} className="text-secondary-400" />
                                                {gasto.usuario_admin?.nombre} {gasto.usuario_admin?.apellido}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-bold text-secondary-900">
                                            {Number(gasto.monto).toFixed(2)} Bs
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => handleOpenEdit(gasto)}
                                                className="p-1.5 text-secondary-400 hover:text-crm-600 hover:bg-crm-50 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(gasto.id_gasto)}
                                                className="p-1.5 text-secondary-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Form */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentGasto ? 'Editar Gasto' : 'Registrar Nuevo Gasto'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">Concepto / Motivo</label>
                        <textarea
                            required
                            className="input-premium h-24 resize-none"
                            placeholder="Ej. Pago servicio eléctrico Octubre..."
                            value={formData.concepto || ''}
                            onChange={(e) => setFormData({ ...formData, concepto: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">Monto (Bs)</label>
                            <input
                                type="number" step="0.01" required
                                className="input-premium font-bold text-crm-700"
                                value={formData.monto || ''}
                                onChange={(e) => setFormData({ ...formData, monto: Number(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">Fecha</label>
                            <input
                                type="date" required
                                className="input-premium"
                                value={formData.fecha || ''}
                                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-5 py-2.5 rounded-xl border border-secondary-200 text-secondary-600 hover:bg-secondary-50 font-medium transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isProcessing}
                            className="btn-primary flex items-center gap-2"
                        >
                            {isProcessing ? (
                                <>
                                    <RefreshCw size={16} className="animate-spin" />
                                    <span>Guardando...</span>
                                </>
                            ) : (
                                <span>{currentGasto ? 'Actualizar Gasto' : 'Registrar Gasto'}</span>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
