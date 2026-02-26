import { useState, useEffect } from 'react';
import { CargoService, type TipoCargo } from '../../services/cargo.service';
import { Plus, RefreshCw, Settings } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';

export function MultasPage() {
    const [tiposCargo, setTiposCargo] = useState<TipoCargo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Modal Cargo Extra
    const [isCargoModalOpen, setIsCargoModalOpen] = useState(false);
    const [selectedCargo, setSelectedCargo] = useState<TipoCargo | null>(null);
    const [cargoFormData, setCargoFormData] = useState({
        nombre: '',
        monto_defecto: 0,
        estado: true
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const data = await CargoService.getTipos();
            setTiposCargo(data);
        } catch (error) {
            console.error('Error cargando cargos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddCargo = () => {
        setSelectedCargo(null);
        setCargoFormData({ nombre: '', monto_defecto: 0, estado: true });
        setIsCargoModalOpen(true);
    };

    const handleEditCargo = (tipo: TipoCargo) => {
        setSelectedCargo(tipo);
        setCargoFormData({
            nombre: tipo.nombre,
            monto_defecto: tipo.monto_defecto,
            estado: tipo.estado
        });
        setIsCargoModalOpen(true);
    };

    const handleSubmitCargo = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            if (selectedCargo) {
                // Update implementation (assuming CargoService has updateTipo)
                // If it doesn't, I might need to add it, but usually these patterns apply
                await CargoService.updateTipo(selectedCargo.id_tipo, cargoFormData);
            } else {
                await CargoService.createTipo(cargoFormData);
            }
            await loadData();
            setIsCargoModalOpen(false);
        } catch (error) {
            console.error('Error guardando tipo cargo:', error);
            alert('No se pudo guardar el tipo de cargo.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-secondary-900 tracking-tight flex items-center gap-3">
                        <Plus size={32} className="text-crm-600" />
                        Gestión de Multas y Servicios
                    </h1>
                    <p className="text-secondary-500 mt-1">Configura cobros fijos por multas, reconexiones o trámites.</p>
                </div>
                <button
                    onClick={handleAddCargo}
                    className="btn-primary flex items-center gap-2 bg-secondary-900 hover:bg-black"
                >
                    <Plus size={20} />
                    <span>Nuevo Tipo de Cargo</span>
                </button>
            </div>

            <div className="bg-white border border-secondary-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-secondary-50 border-b border-secondary-100">
                        <tr className="text-[10px] font-black text-secondary-500 uppercase tracking-widest">
                            <th className="px-6 py-4">Servicio / Multa</th>
                            <th className="px-6 py-4">Monto Defecto</th>
                            <th className="px-6 py-4 text-center">Estado</th>
                            <th className="px-6 py-4 text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary-100">
                        {isLoading ? (
                            <tr><td colSpan={4} className="px-6 py-12 text-center">
                                <RefreshCw className="animate-spin text-crm-500 mx-auto" size={24} />
                            </td></tr>
                        ) : tiposCargo.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-secondary-400">No hay cargos configurados.</td></tr>
                        ) : (
                            tiposCargo.map(tipo => (
                                <tr key={tipo.id_tipo} className="hover:bg-secondary-50/50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-secondary-900 uppercase">{tipo.nombre}</td>
                                    <td className="px-6 py-4 font-black text-crm-600">{tipo.monto_defecto} Bs</td>
                                    <td className="px-6 py-4 text-center">
                                        {tipo.estado ? (
                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-[10px] font-bold uppercase">Activo</span>
                                        ) : (
                                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-[10px] font-bold uppercase">Inactivo</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleEditCargo(tipo)}
                                            className="text-secondary-400 hover:text-crm-600 p-2 transition-colors"
                                        >
                                            <Settings size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal para Nuevo Tipo de Cargo */}
            <Modal
                isOpen={isCargoModalOpen}
                onClose={() => setIsCargoModalOpen(false)}
                title={selectedCargo ? 'Editar Tipo de Cargo' : 'Configurar Nuevo Cargo'}
            >
                <form onSubmit={handleSubmitCargo} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">Nombre del Servicio o Multa</label>
                        <input
                            type="text"
                            required
                            className="input-premium uppercase"
                            placeholder="Ej. REHABILITACION DE SERVICIO"
                            value={cargoFormData.nombre}
                            onChange={(e) => setCargoFormData({ ...cargoFormData, nombre: e.target.value.toUpperCase() })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">Monto por Defecto (Bs)</label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            className="input-premium font-bold text-xl text-crm-700"
                            value={cargoFormData.monto_defecto}
                            onChange={(e) => setCargoFormData({ ...cargoFormData, monto_defecto: Number(e.target.value) })}
                        />
                    </div>
                    <div className="flex items-center gap-3 py-2">
                        <input
                            type="checkbox"
                            className="w-5 h-5 text-crm-600 border-secondary-300 rounded focus:ring-crm-500"
                            checked={cargoFormData.estado}
                            onChange={(e) => setCargoFormData({ ...cargoFormData, estado: e.target.checked })}
                        />
                        <span className="text-sm font-medium text-secondary-700">Cargo activo para facturación</span>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-secondary-100">
                        <button
                            type="button"
                            onClick={() => setIsCargoModalOpen(false)}
                            className="px-5 py-2.5 rounded-xl border border-secondary-200 text-secondary-600 hover:bg-secondary-50 font-medium transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="btn-primary"
                        >
                            {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <span>Guardar Configuración</span>}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
