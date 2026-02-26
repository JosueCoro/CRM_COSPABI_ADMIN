import { useState, useEffect } from 'react';
import type { Rol, NewRol, UpdateRol, Permiso } from '../../services/rol.service';
import { RolService } from '../../services/rol.service';
import { Modal } from '../../components/ui/Modal';
import { Plus, Edit2, Trash2, Search, CheckCircle, XCircle, RefreshCw, ShieldCheck, Lock, AlertCircle } from 'lucide-react';

export function RolesPage() {
    const [roles, setRoles] = useState<Rol[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRol, setCurrentRol] = useState<Rol | null>(null);
    const [formData, setFormData] = useState<Partial<NewRol>>({
        nombre_rol: '',
        descripcion: '',
        estado: true
    });

    // Permissions Modal State
    const [isPermodalOpen, setIsPermodalOpen] = useState(false);
    const [selectedRol, setSelectedRol] = useState<Rol | null>(null);
    const [allPermisos, setAllPermisos] = useState<Permiso[]>([]);
    const [selectedPermisoIds, setSelectedPermisoIds] = useState<number[]>([]);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            setIsLoading(true);
            const [rolesData, permisosData] = await Promise.all([
                RolService.getAll(),
                RolService.getPermisos()
            ]);
            setRoles(rolesData);
            setAllPermisos(permisosData);
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadRoles = async () => {
        try {
            setIsLoading(true);
            const data = await RolService.getAll();
            setRoles(data);
        } catch (error) {
            console.error('Error cargando roles:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setCurrentRol(null);
        setFormData({ nombre_rol: '', descripcion: '', estado: true });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (rol: Rol) => {
        setCurrentRol(rol);
        setFormData({
            nombre_rol: rol.nombre_rol,
            descripcion: rol.descripcion || '',
            estado: rol.estado
        });
        setIsModalOpen(true);
    };

    const handleOpenPermissions = async (rol: Rol) => {
        try {
            setIsProcessing(true);
            setSelectedRol(rol);
            const rolePerms = await RolService.getPermisosByRol(rol.id_rol);
            setSelectedPermisoIds(rolePerms.map((rp: any) => rp.permiso_id_permiso));
            setIsPermodalOpen(true);
        } catch (error) {
            console.error('Error cargando permisos del rol:', error);
            alert('No se pudieron cargar los permisos del rol.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleTogglePermiso = (id: number) => {
        setSelectedPermisoIds(prev =>
            prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
        );
    };

    const handleSavePermissions = async () => {
        if (!selectedRol) return;
        try {
            setIsProcessing(true);
            await RolService.updateRolPermisos(selectedRol.id_rol, selectedPermisoIds);
            alert('¡Permisos actualizados correctamente!');
            setIsPermodalOpen(false);
        } catch (error) {
            console.error('Error guardando permisos:', error);
            alert('No se pudieron guardar los cambios.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Estás seguro de eliminar este rol?')) return;
        try {
            setIsProcessing(true);
            await RolService.delete(id);
            setRoles(prev => prev.filter(r => r.id_rol !== id));
        } catch (error) {
            console.error('Error eliminando rol:', error);
            alert('No se pudo eliminar el rol. Puede que tenga usuarios asociados.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsProcessing(true);

            if (currentRol) {
                // Update
                const updateData: UpdateRol = {
                    ...formData,
                    id_rol: currentRol.id_rol
                };
                const updated = await RolService.update(currentRol.id_rol, updateData);
                setRoles(prev => prev.map(r => r.id_rol === updated.id_rol ? updated : r));
            } else {
                // Create
                const createData: NewRol = {
                    nombre_rol: formData.nombre_rol!,
                    descripcion: formData.descripcion || null,
                    estado: formData.estado || true
                };
                const created = await RolService.create(createData);
                setRoles(prev => [...prev, created]);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error guardando rol:', error);
            alert('Error al guardar el rol. Verifique los datos.');
        } finally {
            setIsProcessing(false);
        }
    };

    const filteredRoles = roles.filter(role =>
        role.nombre_rol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (role.descripcion && role.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-secondary-900 tracking-tight">Gestión de Roles</h1>
                    <p className="text-secondary-500 mt-1">Administra los roles y permisos de acceso al sistema.</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="btn-primary flex items-center gap-2 shadow-lg shadow-crm-500/20"
                >
                    <Plus size={20} />
                    <span>Nuevo Rol</span>
                </button>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-xl border border-secondary-200 shadow-sm flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o descripción..."
                        className="pl-10 pr-4 py-2 w-full border border-secondary-200 rounded-lg focus:ring-2 focus:ring-crm-500 focus:border-crm-500 outline-none text-secondary-700 placeholder:text-secondary-400 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={loadRoles}
                    className="p-2 text-secondary-500 hover:text-crm-600 hover:bg-crm-50 rounded-lg transition-colors"
                    title="Recargar datos"
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
                                <th className="px-6 py-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Nombre del Rol</th>
                                <th className="px-6 py-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Descripción</th>
                                <th className="px-6 py-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider text-center">Estado</th>
                                <th className="px-6 py-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-secondary-500">Cargando roles...</td>
                                </tr>
                            ) : filteredRoles.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-secondary-500">No se encontraron roles.</td>
                                </tr>
                            ) : (
                                filteredRoles.map((rol) => (
                                    <tr key={rol.id_rol} className="hover:bg-secondary-50/50 transition-colors group">
                                        <td className="px-6 py-4 text-sm text-secondary-500 font-mono">#{rol.id_rol}</td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-semibold text-secondary-900 bg-crm-50 text-crm-700 px-3 py-1 rounded-full border border-crm-100">
                                                {rol.nombre_rol}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-secondary-600 max-w-xs truncate" title={rol.descripcion || ''}>
                                            {rol.descripcion || <span className="text-secondary-400 italic">Sin descripción</span>}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {rol.estado ? (
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
                                                onClick={() => handleOpenPermissions(rol)}
                                                className="p-1.5 text-secondary-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                                title="Gestionar Permisos"
                                            >
                                                <ShieldCheck size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleOpenEdit(rol)}
                                                className="p-1.5 text-secondary-400 hover:text-crm-600 hover:bg-crm-50 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(rol.id_rol)}
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
                <div className="px-6 py-4 border-t border-secondary-200 bg-secondary-50 flex justify-between items-center text-sm text-secondary-500">
                    <span>Mostrando {filteredRoles.length} roles</span>
                    <span>Total: {roles.length}</span>
                </div>
            </div>

            {/* Modal Form */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentRol ? 'Editar Rol' : 'Crear Nuevo Rol'}
            >
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">Nombre del Rol <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            required
                            className="input-premium"
                            placeholder="Ej. Administrador, Cajero..."
                            value={formData.nombre_rol || ''}
                            onChange={(e) => setFormData({ ...formData, nombre_rol: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">Descripción</label>
                        <textarea
                            className="input-premium resize-none h-24"
                            placeholder="Descripción de las responsabilidades..."
                            value={formData.descripcion || ''}
                            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        />
                    </div>

                    <div className="flex items-center gap-3 p-3 border border-secondary-200 rounded-xl bg-secondary-50/50">
                        <input
                            type="checkbox"
                            id="estado"
                            className="w-5 h-5 text-crm-600 rounded focus:ring-crm-500 border-gray-300"
                            checked={formData.estado || false}
                            onChange={(e) => setFormData({ ...formData, estado: e.target.checked })}
                        />
                        <label htmlFor="estado" className="text-sm font-medium text-secondary-700 cursor-pointer select-none">
                            Rol Activo
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
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
                            className="px-6 py-2.5 bg-crm-600 hover:bg-crm-700 text-white rounded-xl font-medium shadow-md shadow-crm-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
                        >
                            {isProcessing ? (
                                <>
                                    <RefreshCw size={16} className="animate-spin" />
                                    <span>Guardando...</span>
                                </>
                            ) : (
                                <span>{currentRol ? 'Actualizar Rol' : 'Crear Rol'}</span>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Permissions Modal */}
            <Modal
                isOpen={isPermodalOpen}
                onClose={() => setIsPermodalOpen(false)}
                title="Configurar Permisos de Acceso"
                maxWidth="2xl"
            >
                {selectedRol && (
                    <div className="space-y-6">
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                            <Lock size={20} className="text-blue-600 mt-1" />
                            <div>
                                <p className="text-sm font-bold text-blue-900">Configurando: {selectedRol.nombre_rol}</p>
                                <p className="text-xs text-blue-700">Selecciona las acciones que este rol tiene permitido realizar.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {allPermisos.length === 0 ? (
                                <div className="col-span-2 text-center py-8 text-secondary-400">
                                    No hay permisos registrados en la base de datos.
                                </div>
                            ) : (
                                allPermisos.map(permiso => (
                                    <label
                                        key={permiso.id_permiso}
                                        className={`flex items-center gap-3 p-3 rounded-xl border border-secondary-200 cursor-pointer transition-all hover:border-crm-300 hover:bg-crm-50/30 ${selectedPermisoIds.includes(permiso.id_permiso) ? 'bg-crm-50 border-crm-500 shadow-sm' : ''}`}
                                    >
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 text-crm-600 rounded focus:ring-crm-500 border-gray-300 cursor-pointer"
                                            checked={selectedPermisoIds.includes(permiso.id_permiso)}
                                            onChange={() => handleTogglePermiso(permiso.id_permiso)}
                                        />
                                        <div>
                                            <p className="text-sm font-bold text-secondary-800">{permiso.codigo}</p>
                                            <p className="text-xs text-secondary-500 line-clamp-1">{permiso.descripcion}</p>
                                        </div>
                                    </label>
                                ))
                            )}
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-secondary-100">
                            <div className="flex items-center gap-2 text-xs text-secondary-500 italic">
                                <AlertCircle size={14} />
                                <span>{selectedPermisoIds.length} seleccionados</span>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsPermodalOpen(false)}
                                    className="text-sm font-bold text-secondary-500 hover:text-secondary-700 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSavePermissions}
                                    disabled={isProcessing}
                                    className="btn-primary"
                                >
                                    {isProcessing ? <RefreshCw className="animate-spin" size={18} /> : <span>Guardar Cambios</span>}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
