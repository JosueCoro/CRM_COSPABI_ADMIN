import { useState, useEffect } from 'react';
import type { Cliente, NewCliente, UpdateCliente } from '../../services/cliente.service';
import { ClienteService } from '../../services/cliente.service';
import type { Rol } from '../../services/rol.service';
import { RolService } from '../../services/rol.service';
import { Modal } from '../../components/ui/Modal';
import { Edit2, Trash2, Search, CheckCircle, XCircle, RefreshCw, UserPlus, DollarSign, AlertCircle, Key } from 'lucide-react';
import { CargoService, type TipoCargo } from '../../services/cargo.service';
import { CuentaClienteService, type CuentaCliente } from '../../services/cuenta_cliente.service';

export function ClientesPage() {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [roles, setRoles] = useState<Rol[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCliente, setCurrentCliente] = useState<Cliente | null>(null);
    const [formData, setFormData] = useState<Partial<NewCliente>>({
        codigo_fijo: '',
        codigo_ubicacion: '',
        nombre_completo: '',
        ci: '',
        direccion: '',
        categoria: 'DOMESTICO',
        actividad: 'VIVIENDA',
        estado: true,
        rol_id_rol: 0
    });

    // Cargo Modal State
    const [isCargoModalOpen, setIsCargoModalOpen] = useState(false);
    const [tiposCargo, setTiposCargo] = useState<TipoCargo[]>([]);
    const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
    const [cargoFormData, setCargoFormData] = useState({
        tipo_cargo_id: 0,
        monto: 0,
        descripcion: ''
    });

    // Account Modal State
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [currentCuenta, setCurrentCuenta] = useState<CuentaCliente | null>(null);
    const [accountFormData, setAccountFormData] = useState({
        usuario: '',
        contraseña: '',
        estado: true
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [clientesData, rolesData, tiposData] = await Promise.all([
                ClienteService.getAll(),
                RolService.getAll(),
                CargoService.getTipos()
            ]);
            setClientes(clientesData);
            setRoles(rolesData);
            setTiposCargo(tiposData);
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenCargoModal = (cliente: Cliente) => {
        setSelectedCliente(cliente);
        setCargoFormData({
            tipo_cargo_id: tiposCargo.length > 0 ? tiposCargo[0].id_tipo : 0,
            monto: tiposCargo.length > 0 ? tiposCargo[0].monto_defecto : 0,
            descripcion: ''
        });
        setIsCargoModalOpen(true);
    };

    const handleTipoCargoChange = (id: number) => {
        const tipo = tiposCargo.find(t => t.id_tipo === id);
        if (tipo) {
            setCargoFormData({
                ...cargoFormData,
                tipo_cargo_id: id,
                monto: tipo.monto_defecto
            });
        }
    };

    const handleSubmitCargo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCliente) return;

        try {
            setIsProcessing(true);
            await CargoService.createCargoExtra({
                cliente_id_cliente: selectedCliente.id_cliente,
                tipo_cargo_id: cargoFormData.tipo_cargo_id,
                monto: cargoFormData.monto,
                descripcion: cargoFormData.descripcion
            });
            alert('¡Cargo extra registrado! Se añadirá a la siguiente factura del socio.');
            setIsCargoModalOpen(false);
        } catch (error) {
            console.error('Error guardando cargo:', error);
            alert('No se pudo registrar el cargo.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleOpenAccountModal = async (cliente: Cliente) => {
        try {
            setIsProcessing(true);
            setSelectedCliente(cliente);
            const cuenta = await CuentaClienteService.getByClienteId(cliente.id_cliente);
            setCurrentCuenta(cuenta);

            if (cuenta) {
                setAccountFormData({
                    usuario: cuenta.usuario,
                    contraseña: cuenta.contraseña,
                    estado: cuenta.estado
                });
            } else {
                setAccountFormData({
                    usuario: cliente.codigo_fijo, // Default username as fixed code
                    contraseña: cliente.ci,       // Default password as CI
                    estado: true
                });
            }
            setIsAccountModalOpen(true);
        } catch (error) {
            console.error('Error al cargar cuenta:', error);
            alert('No se pudo cargar la información de la cuenta.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSubmitAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCliente) return;

        try {
            setIsProcessing(true);
            if (currentCuenta) {
                await CuentaClienteService.update(currentCuenta.id_cuenta, {
                    usuario: accountFormData.usuario,
                    contraseña: accountFormData.contraseña,
                    estado: accountFormData.estado
                });
            } else {
                await CuentaClienteService.create({
                    cliente_id_cliente: selectedCliente.id_cliente,
                    usuario: accountFormData.usuario,
                    contraseña: accountFormData.contraseña,
                    estado: accountFormData.estado
                });
            }
            alert('¡Cuenta configurada correctamente!');
            setIsAccountModalOpen(false);
        } catch (error) {
            console.error('Error al guardar cuenta:', error);
            alert('Error al guardar los accesos del cliente.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleOpenCreate = () => {
        setCurrentCliente(null);
        setFormData({
            codigo_fijo: '',
            codigo_ubicacion: '',
            nombre_completo: '',
            ci: '',
            direccion: '',
            categoria: 'DOMESTICO',
            actividad: 'VIVIENDA',
            estado: true,
            rol_id_rol: roles.find(r => r.nombre_rol.toLowerCase().includes('cliente'))?.id_rol || (roles.length > 0 ? roles[0].id_rol : 0)
        });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (cliente: Cliente) => {
        setCurrentCliente(cliente);
        setFormData({
            codigo_fijo: cliente.codigo_fijo,
            codigo_ubicacion: cliente.codigo_ubicacion,
            nombre_completo: cliente.nombre_completo,
            ci: cliente.ci,
            direccion: cliente.direccion,
            categoria: cliente.categoria,
            actividad: cliente.actividad,
            estado: cliente.estado,
            rol_id_rol: cliente.rol_id_rol
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Estás seguro de eliminar este socio?')) return;
        try {
            setIsProcessing(true);
            await ClienteService.delete(id);
            setClientes(prev => prev.filter(c => c.id_cliente !== id));
        } catch (error) {
            console.error('Error eliminando socio:', error);
            alert('No se pudo eliminar el socio.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsProcessing(true);

            if (currentCliente) {
                await ClienteService.update(currentCliente.id_cliente, formData as UpdateCliente);
                loadData();
            } else {
                const createData: NewCliente = {
                    ...(formData as NewCliente),
                    fecha_registro: new Date().toISOString().split('T')[0]
                };
                await ClienteService.create(createData);
                loadData();
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error guardando socio:', error);
            alert('Error al guardar el socio.');
        } finally {
            setIsProcessing(false);
        }
    };

    const filteredClientes = clientes.filter(cliente =>
        cliente.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.codigo_fijo.includes(searchTerm) ||
        cliente.ci.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-secondary-900 tracking-tight">Gestión de Socios</h1>
                    <p className="text-secondary-500 mt-1">Administra los clientes de la cooperativa.</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="btn-primary flex items-center gap-2 shadow-lg shadow-crm-500/20"
                >
                    <UserPlus size={20} />
                    <span>Nuevo Socio</span>
                </button>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-xl border border-secondary-200 shadow-sm flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, código o CI..."
                        className="pl-10 pr-4 py-2 w-full border border-secondary-200 rounded-lg focus:ring-2 focus:ring-crm-500 focus:border-crm-500 outline-none text-secondary-700 placeholder:text-secondary-400 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={loadData}
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
                                <th className="px-6 py-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Cód. / CI</th>
                                <th className="px-6 py-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Socio</th>
                                <th className="px-6 py-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Dirección / Ubicación</th>
                                <th className="px-6 py-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Categoría</th>
                                <th className="px-6 py-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider text-center">Estado</th>
                                <th className="px-6 py-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-secondary-500">Cargando socios...</td>
                                </tr>
                            ) : filteredClientes.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-secondary-500">No se encontraron socios.</td>
                                </tr>
                            ) : (
                                filteredClientes.map((cliente) => (
                                    <tr key={cliente.id_cliente} className="hover:bg-secondary-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-secondary-900">{cliente.codigo_fijo}</span>
                                                <span className="text-xs text-secondary-500">CI: {cliente.ci}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-secondary-600">
                                            {cliente.nombre_completo}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-secondary-600">
                                            <div className="flex flex-col">
                                                <span>{cliente.direccion}</span>
                                                <span className="text-xs text-crm-600 font-medium">Ubicación: {cliente.codigo_ubicacion}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-700">
                                                {cliente.categoria}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {cliente.estado ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                    <CheckCircle size={12} /> Activo
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                                    <XCircle size={12} /> Inactivo
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => handleOpenCargoModal(cliente)}
                                                className="p-1.5 text-secondary-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                                title="Añadir Cargo Extra / Multa"
                                            >
                                                <DollarSign size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleOpenAccountModal(cliente)}
                                                className="p-1.5 text-secondary-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-100"
                                                title="Accesos Portal Cliente"
                                            >
                                                <Key size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleOpenEdit(cliente)}
                                                className="p-1.5 text-secondary-400 hover:text-crm-600 hover:bg-crm-50 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cliente.id_cliente)}
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
                title={currentCliente ? 'Editar Socio' : 'Crear Socio'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">Código Fijo</label>
                            <input
                                type="text" required
                                className="input-premium"
                                value={formData.codigo_fijo || ''}
                                onChange={(e) => setFormData({ ...formData, codigo_fijo: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">Código Ubicación</label>
                            <input
                                type="text" required
                                className="input-premium"
                                value={formData.codigo_ubicacion || ''}
                                onChange={(e) => setFormData({ ...formData, codigo_ubicacion: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">Nombre Completo</label>
                        <input
                            type="text" required
                            className="input-premium"
                            value={formData.nombre_completo || ''}
                            onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">CI / NIT</label>
                            <input
                                type="text" required
                                className="input-premium"
                                value={formData.ci || ''}
                                onChange={(e) => setFormData({ ...formData, ci: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">Categoría</label>
                            <select
                                required
                                className="input-premium"
                                value={formData.categoria || ''}
                                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                            >
                                <option value="DOMESTICO">DOMESTICO</option>
                                <option value="COMERCIAL">COMERCIAL</option>
                                <option value="INDUSTRIAL">INDUSTRIAL</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">Dirección</label>
                        <input
                            type="text" required
                            className="input-premium"
                            value={formData.direccion || ''}
                            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">Actividad</label>
                            <input
                                type="text" required
                                className="input-premium"
                                value={formData.actividad || ''}
                                onChange={(e) => setFormData({ ...formData, actividad: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">Rol</label>
                            <select
                                required
                                className="input-premium"
                                value={formData.rol_id_rol || ''}
                                onChange={(e) => setFormData({ ...formData, rol_id_rol: Number(e.target.value) })}
                            >
                                <option value="">Seleccionar Rol...</option>
                                {roles.map(rol => (
                                    <option key={rol.id_rol} value={rol.id_rol}>
                                        {rol.nombre_rol}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 border border-secondary-200 rounded-xl bg-secondary-50/50">
                        <input
                            type="checkbox"
                            id="estadoCliente"
                            className="w-5 h-5 text-crm-600 rounded focus:ring-crm-500 border-gray-300"
                            checked={formData.estado || false}
                            onChange={(e) => setFormData({ ...formData, estado: e.target.checked })}
                        />
                        <label htmlFor="estadoCliente" className="text-sm font-medium text-secondary-700 cursor-pointer select-none">
                            Socio Activo
                        </label>
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
                                <span>{currentCliente ? 'Actualizar Socio' : 'Crear Socio'}</span>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal de Cargo Extra */}
            <Modal
                isOpen={isCargoModalOpen}
                onClose={() => setIsCargoModalOpen(false)}
                title="Asignar Cargo Extra / Multa"
            >
                {selectedCliente && (
                    <form onSubmit={handleSubmitCargo} className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                            <AlertCircle size={20} className="text-blue-600 mt-1" />
                            <div>
                                <p className="text-sm font-bold text-blue-900">{selectedCliente.nombre_completo}</p>
                                <p className="text-xs text-blue-700">Cód: {selectedCliente.codigo_fijo}</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">Tipo de Cargo</label>
                            <select
                                required
                                className="input-premium"
                                value={cargoFormData.tipo_cargo_id}
                                onChange={(e) => handleTipoCargoChange(Number(e.target.value))}
                            >
                                <option value="">Seleccione un motivo...</option>
                                {tiposCargo.map(tipo => (
                                    <option key={tipo.id_tipo} value={tipo.id_tipo}>
                                        {tipo.nombre} ({tipo.monto_defecto} Bs)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">Monto a Cobrar (Bs)</label>
                            <input
                                type="number"
                                required
                                className="input-premium font-bold text-xl text-crm-700"
                                value={cargoFormData.monto}
                                onChange={(e) => setCargoFormData({ ...cargoFormData, monto: Number(e.target.value) })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">Motivo / Descripción</label>
                            <input
                                type="text"
                                className="input-premium"
                                placeholder="Ej. Multa reunión Octubre"
                                value={cargoFormData.descripcion}
                                onChange={(e) => setCargoFormData({ ...cargoFormData, descripcion: e.target.value })}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-secondary-100">
                            <button
                                type="button"
                                onClick={() => setIsCargoModalOpen(false)}
                                className="text-sm font-bold text-secondary-500"
                            >
                                Cancelar
                            </button>
                            <button type="submit" disabled={isProcessing} className="btn-primary">
                                {isProcessing ? <RefreshCw className="animate-spin" size={18} /> : <span>Confirmar Cargo</span>}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Modal de Cuenta Cliente */}
            <Modal
                isOpen={isAccountModalOpen}
                onClose={() => setIsAccountModalOpen(false)}
                title="Accesos Portal Cliente"
            >
                {selectedCliente && (
                    <form onSubmit={handleSubmitAccount} className="space-y-4">
                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-start gap-3">
                            <Key size={20} className="text-amber-600 mt-1" />
                            <div>
                                <p className="text-sm font-bold text-amber-900">{selectedCliente.nombre_completo}</p>
                                <p className="text-xs text-amber-700">Configura el usuario y contraseña para que el socio acceda a su portal.</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">Nombre de Usuario</label>
                            <input
                                type="text"
                                required
                                className="input-premium"
                                value={accountFormData.usuario}
                                onChange={(e) => setAccountFormData({ ...accountFormData, usuario: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">Contraseña</label>
                            <input
                                type="text"
                                required
                                className="input-premium"
                                value={accountFormData.contraseña}
                                onChange={(e) => setAccountFormData({ ...accountFormData, contraseña: e.target.value })}
                            />
                            <p className="text-[10px] text-secondary-400 mt-1 italic">* Nota: Se recomienda usar el CI o el Código Fijo como valores iniciales.</p>
                        </div>

                        <div className="flex items-center gap-3 p-3 border border-secondary-200 rounded-xl bg-secondary-50/50">
                            <input
                                type="checkbox"
                                id="estadoCuenta"
                                className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500 border-gray-300"
                                checked={accountFormData.estado}
                                onChange={(e) => setAccountFormData({ ...accountFormData, estado: e.target.checked })}
                            />
                            <label htmlFor="estadoCuenta" className="text-sm font-medium text-secondary-700 cursor-pointer select-none">
                                Cuenta Habilitada
                            </label>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-secondary-100">
                            <button
                                type="button"
                                onClick={() => setIsAccountModalOpen(false)}
                                className="text-sm font-bold text-secondary-500"
                            >
                                Cancelar
                            </button>
                            <button type="submit" disabled={isProcessing} className="btn-primary bg-amber-600 hover:bg-amber-700 shadow-amber-500/20">
                                {isProcessing ? <RefreshCw className="animate-spin" size={18} /> : <span>{currentCuenta ? 'Actualizar Accesos' : 'Crear Accesos'}</span>}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
}
