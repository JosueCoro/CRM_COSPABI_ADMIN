import { useState, useEffect } from 'react';
import type { UserAdmin, NewUserAdmin, UpdateUserAdmin } from '../../services/usuario.service';
import { UsuarioService } from '../../services/usuario.service';
import type { Rol } from '../../services/rol.service';
import { RolService } from '../../services/rol.service';
import { Modal } from '../../components/ui/Modal';
import { Plus, Edit2, Trash2, Search, CheckCircle, XCircle, RefreshCw, UserPlus } from 'lucide-react';

export function UsuariosPage() {
    const [users, setUsers] = useState<UserAdmin[]>([]);
    const [roles, setRoles] = useState<Rol[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<UserAdmin | null>(null);
    const [formData, setFormData] = useState<Partial<NewUserAdmin>>({
        nombre: '',
        apellido: '',
        usuario: '',
        rol_id_rol: 0,
        estado: true,
        contraseña: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [usersData, rolesData] = await Promise.all([
                UsuarioService.getAll(),
                RolService.getAll()
            ]);
            setUsers(usersData);
            setRoles(rolesData);
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setCurrentUser(null);
        setFormData({
            nombre: '',
            apellido: '',
            usuario: '',
            rol_id_rol: roles.length > 0 ? roles[0].id_rol : 0,
            estado: true,
            contraseña: '' // Empty for create
        });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (user: UserAdmin) => {
        setCurrentUser(user);
        setFormData({
            nombre: user.nombre,
            apellido: user.apellido,
            usuario: user.usuario,
            rol_id_rol: user.rol_id_rol,
            estado: user.estado,
            contraseña: '' // Don't show password
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;
        try {
            setIsProcessing(true);
            await UsuarioService.delete(id);
            setUsers(prev => prev.filter(u => u.id_usuario_admin !== id));
        } catch (error) {
            console.error('Error eliminando usuario:', error);
            alert('No se pudo eliminar el usuario.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsProcessing(true);

            // Validate
            if (!formData.rol_id_rol) {
                alert('Debe seleccionar un rol.');
                return;
            }

            if (currentUser) {
                // Update
                const updateData: UpdateUserAdmin = {
                    ...formData,
                };
                // Remove password if empty (don't update it)
                if (!updateData.contraseña) delete updateData.contraseña;

                const updated = await UsuarioService.update(currentUser.id_usuario_admin, updateData);
                // Refresh list to get role name joined
                loadData();
            } else {
                // Create
                if (!formData.contraseña) {
                    alert('La contraseña es obligatoria para nuevos usuarios.');
                    return;
                }
                const createData: NewUserAdmin = {
                    nombre: formData.nombre!,
                    apellido: formData.apellido!,
                    usuario: formData.usuario!,
                    rol_id_rol: formData.rol_id_rol!,
                    estado: formData.estado || true,
                    contraseña: formData.contraseña,
                    fecha_creacion: new Date().toISOString().split('T')[0]
                };
                await UsuarioService.create(createData);
                loadData();
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error guardando usuario:', error);
            alert('Error al guardar el usuario. Verifique los datos.');
        } finally {
            setIsProcessing(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.usuario.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-secondary-900 tracking-tight">Gestión de Usuarios</h1>
                    <p className="text-secondary-500 mt-1">Administra los usuarios del sistema y sus roles.</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="btn-primary flex items-center gap-2 shadow-lg shadow-crm-500/20"
                >
                    <UserPlus size={20} />
                    <span>Nuevo Usuario</span>
                </button>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-xl border border-secondary-200 shadow-sm flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, apellido o usuario..."
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
                                <th className="px-6 py-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Usuario</th>
                                <th className="px-6 py-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Nombre Completo</th>
                                <th className="px-6 py-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider">Cargo / Rol</th>
                                <th className="px-6 py-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider text-center">Estado</th>
                                <th className="px-6 py-4 text-xs font-semibold text-secondary-500 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-secondary-500">Cargando usuarios...</td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-secondary-500">No se encontraron usuarios.</td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id_usuario_admin} className="hover:bg-secondary-50/50 transition-colors group">
                                        <td className="px-6 py-4 text-sm font-medium text-secondary-900">
                                            {user.usuario}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-secondary-600">
                                            {user.nombre} {user.apellido}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-secondary-800">Acceso Administrativo</span>
                                                <span className="text-xs text-crm-600 bg-crm-50 px-2 py-0.5 rounded-full w-fit mt-1 border border-crm-100">
                                                    {user.rol?.nombre_rol || 'Sin Rol'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {user.estado ? (
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
                                                onClick={() => handleOpenEdit(user)}
                                                className="p-1.5 text-secondary-400 hover:text-crm-600 hover:bg-crm-50 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id_usuario_admin)}
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
                title={currentUser ? 'Editar Usuario' : 'Crear Usuario'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">Nombre</label>
                            <input
                                type="text" required
                                className="input-premium"
                                value={formData.nombre || ''}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">Apellido</label>
                            <input
                                type="text" required
                                className="input-premium"
                                value={formData.apellido || ''}
                                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">Nombre de Usuario (Login)</label>
                        <input
                            type="text" required
                            className="input-premium"
                            value={formData.usuario || ''}
                            onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">
                            {currentUser ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}
                        </label>
                        <input
                            type="password"
                            className="input-premium"
                            placeholder={currentUser ? 'Dejar en blanco para no cambiar' : '********'}
                            value={formData.contraseña || ''}
                            onChange={(e) => setFormData({ ...formData, contraseña: e.target.value })}
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-secondary-700 mb-1">Rol de Acceso</label>
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

                    <div className="flex items-center gap-3 p-3 border border-secondary-200 rounded-xl bg-secondary-50/50">
                        <input
                            type="checkbox"
                            id="estadoUser"
                            className="w-5 h-5 text-crm-600 rounded focus:ring-crm-500 border-gray-300"
                            checked={formData.estado || false}
                            onChange={(e) => setFormData({ ...formData, estado: e.target.checked })}
                        />
                        <label htmlFor="estadoUser" className="text-sm font-medium text-secondary-700 cursor-pointer select-none">
                            Usuario Activo
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
                                <span>{currentUser ? 'Actualizar Usuario' : 'Crear Usuario'}</span>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
