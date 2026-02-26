import { useState, useEffect } from 'react';
import { TarifaService, type Tarifa } from '../../services/tarifa.service';
import { Settings, Save, AlertTriangle, RefreshCw, Plus } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';

export function TarifasPage() {
    const [tarifas, setTarifas] = useState<Tarifa[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Modal Tarifa
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTarifa, setSelectedTarifa] = useState<Tarifa | null>(null);
    const [formData, setFormData] = useState({
        categoria: '',
        consumo_minimo_m3: 8,
        monto_minimo_bs: 15,
        precio_m3_extra: 1.7,
        cargo_fijo: 5,
        estado: true
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const data = await TarifaService.getAll();
            setTarifas(data);
        } catch (error) {
            console.error('Error cargando tarifas:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (tarifa: Tarifa) => {
        setSelectedTarifa(tarifa);
        setFormData({
            categoria: tarifa.categoria,
            consumo_minimo_m3: tarifa.consumo_minimo_m3,
            monto_minimo_bs: tarifa.monto_minimo_bs,
            precio_m3_extra: tarifa.precio_m3_extra,
            cargo_fijo: tarifa.cargo_fijo,
            estado: tarifa.estado
        });
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedTarifa(null);
        setFormData({
            categoria: '',
            consumo_minimo_m3: 8,
            monto_minimo_bs: 15,
            precio_m3_extra: 1.7,
            cargo_fijo: 5,
            estado: true
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            if (selectedTarifa) {
                await TarifaService.update(selectedTarifa.id_tarifa, formData);
            } else {
                await TarifaService.create(formData as any);
            }
            await loadData();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error guardando tarifa:', error);
            alert('Error al guardar la tarifa.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-secondary-900 tracking-tight flex items-center gap-3">
                        <Settings className="text-crm-600" />
                        Configuración de Tarifas
                    </h1>
                    <p className="text-secondary-500 mt-1">Gestiona los precios base y consumos mínimos por categoría.</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={20} />
                    <span>Nueva Tarifa</span>
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {isLoading ? (
                    <div className="flex justify-center p-12">
                        <RefreshCw className="animate-spin text-crm-500" size={32} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tarifas.map(tarifa => (
                            <div key={tarifa.id_tarifa} className="bg-white border border-secondary-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                {!tarifa.estado && (
                                    <div className="absolute top-0 right-0 bg-red-100 text-red-600 px-3 py-1 text-[10px] font-bold rounded-bl-xl uppercase">Inactivo</div>
                                )}
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-secondary-900 uppercase tracking-tight">{tarifa.categoria}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`w-2 h-2 rounded-full ${tarifa.estado ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                            <span className="text-xs text-secondary-500 font-medium">
                                                {tarifa.estado ? 'Tarifa Activa' : 'Tarifa Inactiva'}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleEdit(tarifa)}
                                        className="p-2 text-secondary-400 hover:text-crm-600 hover:bg-crm-50 rounded-lg transition-colors"
                                    >
                                        <Settings size={20} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-secondary-50 p-3 rounded-xl border border-secondary-100">
                                            <p className="text-[10px] text-secondary-500 font-bold uppercase tracking-wider">Mínimo (m³)</p>
                                            <p className="text-lg font-bold text-secondary-900">{tarifa.consumo_minimo_m3} m³</p>
                                        </div>
                                        <div className="bg-crm-50 p-3 rounded-xl border border-crm-100">
                                            <p className="text-[10px] text-crm-600 font-bold uppercase tracking-wider">Monto (Bs)</p>
                                            <p className="text-lg font-bold text-crm-900">{tarifa.monto_minimo_bs} Bs</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between py-2 border-b border-secondary-50">
                                        <span className="text-sm text-secondary-600 font-medium">Precio m³ Extra</span>
                                        <span className="text-sm font-black text-secondary-900">{tarifa.precio_m3_extra} Bs</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b border-secondary-50">
                                        <span className="text-sm text-secondary-600 font-medium">Mantenimiento/Corte</span>
                                        <span className="text-sm font-black text-secondary-900">{tarifa.cargo_fijo} Bs</span>
                                    </div>
                                </div>

                                <div className="mt-6 p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start gap-3">
                                    <AlertTriangle size={16} className="text-blue-600 mt-0.5" />
                                    <p className="text-[11px] text-blue-700 leading-tight">
                                        Los cambios aplicarán a todas las facturas generadas a partir de ahora.
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedTarifa ? `Editar Tarifa: ${selectedTarifa.categoria}` : 'Nueva Tarifa'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">Categoría</label>
                        <input
                            type="text"
                            required
                            className="input-premium uppercase"
                            placeholder="Ej. DOMESTICO"
                            value={formData.categoria}
                            onChange={(e) => setFormData({ ...formData, categoria: e.target.value.toUpperCase() })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">Consumo Mínimo (m³)</label>
                            <input
                                type="number"
                                required
                                className="input-premium"
                                value={formData.consumo_minimo_m3}
                                onChange={(e) => setFormData({ ...formData, consumo_minimo_m3: Number(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">Monto Mínimo (Bs)</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                className="input-premium"
                                value={formData.monto_minimo_bs}
                                onChange={(e) => setFormData({ ...formData, monto_minimo_bs: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">Precio m³ Extra (Bs)</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                className="input-premium font-bold text-crm-700"
                                value={formData.precio_m3_extra}
                                onChange={(e) => setFormData({ ...formData, precio_m3_extra: Number(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">Mantenimiento (Bs)</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                className="input-premium"
                                value={formData.cargo_fijo}
                                onChange={(e) => setFormData({ ...formData, cargo_fijo: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 py-2">
                        <input
                            type="checkbox"
                            role="checkbox"
                            className="w-5 h-5 text-crm-600 border-secondary-300 rounded focus:ring-crm-500"
                            checked={formData.estado}
                            onChange={(e) => setFormData({ ...formData, estado: e.target.checked })}
                        />
                        <span className="text-sm font-medium text-secondary-700">Esta tarifa se encuentra activa</span>
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
                            disabled={isSaving}
                            className="btn-primary flex items-center gap-2"
                        >
                            {isSaving ? (
                                <RefreshCw size={16} className="animate-spin" />
                            ) : (
                                <>
                                    <Save size={18} />
                                    <span>Guardar Tarifa</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
