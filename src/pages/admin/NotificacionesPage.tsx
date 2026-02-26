import { useState, useEffect } from 'react';
import type { Notificacion, NewNotificacion, UpdateNotificacion } from '../../services/notificacion.service';
import { NotificacionService } from '../../services/notificacion.service';
import { Modal } from '../../components/ui/Modal';
import { Plus, Edit2, Trash2, Search, RefreshCw, Bell, Calendar, CheckCircle, XCircle, Users, User, Globe } from 'lucide-react';
import type { Rol } from '../../services/rol.service';
import { RolService } from '../../services/rol.service';

export function NotificacionesPage() {
    const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const [clients, setClients] = useState<{ id_cliente: number, nombre_completo: string, rol_id_rol: number, rol: { nombre_rol: string } }[]>([]);
    const [roles, setRoles] = useState<Rol[]>([]);
    const [audienceType, setAudienceType] = useState<'TODOS' | 'ROLES' | 'ESPECIFICO'>('TODOS');
    const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentNotificacion, setCurrentNotificacion] = useState<Notificacion | null>(null);
    const [formData, setFormData] = useState<Partial<NewNotificacion>>({
        titulo: '',
        mensaje: '',
        tipo: 'INFORMATIVO',
        fecha_publicacion: new Date().toISOString().split('T')[0],
        estado: true
    });

    useEffect(() => {
        loadNotificaciones();
    }, []);

    const loadNotificaciones = async () => {
        try {
            setIsLoading(true);
            const [notifData, clientData, roleData] = await Promise.all([
                NotificacionService.getAll(),
                NotificacionService.getClients(),
                RolService.getAll()
            ]);
            setNotificaciones(notifData);
            setClients(clientData as any);
            // Filter only roles that are for clients
            setRoles(roleData.filter((r: Rol) => r.nombre_rol.startsWith('CLIENTE_')));
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setCurrentNotificacion(null);
        setFormData({
            titulo: '',
            mensaje: '',
            tipo: 'INFORMATIVO',
            fecha_publicacion: new Date().toISOString().split('T')[0],
            estado: true
        });
        setAudienceType('TODOS');
        setSelectedRoleIds([]);
        setSelectedClientId(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (notificacion: Notificacion) => {
        setCurrentNotificacion(notificacion);
        setFormData({
            titulo: notificacion.titulo,
            mensaje: notificacion.mensaje,
            tipo: notificacion.tipo,
            fecha_publicacion: notificacion.fecha_publicacion,
            estado: notificacion.estado
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Estás seguro de eliminar esta notificación?')) return;
        try {
            setIsProcessing(true);
            await NotificacionService.delete(id);
            setNotificaciones(prev => prev.filter(n => n.id_notificacion !== id));
        } catch (error) {
            console.error('Error eliminando notificación:', error);
            alert('No se pudo eliminar la notificación.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsProcessing(true);

            let notifId: number;
            if (currentNotificacion) {
                await NotificacionService.update(currentNotificacion.id_notificacion, formData as UpdateNotificacion);
                notifId = currentNotificacion.id_notificacion;
            } else {
                const created = await NotificacionService.create(formData as NewNotificacion);
                notifId = created.id_notificacion;
            }

            // Distribuir si es nueva o si se desea re-enviar (en este caso lo haremos siempre para simplificar)
            let targets: number[] = [];
            if (audienceType === 'TODOS') {
                targets = clients.map(c => c.id_cliente);
            } else if (audienceType === 'ROLES') {
                targets = clients
                    .filter(c => selectedRoleIds.includes(c.rol_id_rol))
                    .map(c => c.id_cliente);
            } else if (audienceType === 'ESPECIFICO' && selectedClientId) {
                targets = [selectedClientId];
            }

            if (targets.length > 0) {
                await NotificacionService.assignToClients(notifId, targets);
            }

            loadNotificaciones();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error guardando notificación:', error);
            alert('Error al guardar la notificación.');
        } finally {
            setIsProcessing(false);
        }
    };

    const filteredNotificaciones = notificaciones.filter(notificacion =>
        notificacion.titulo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-secondary-900 tracking-tight">Centro de Notificaciones</h1>
                    <p className="text-secondary-500 mt-1">Envía avisos, comunicados y alertas a los socios del portal.</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="btn-primary flex items-center gap-2 shadow-lg shadow-crm-500/20"
                >
                    <Plus size={20} />
                    <span>Nueva Notificación</span>
                </button>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-xl border border-secondary-200 shadow-sm flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por título..."
                        className="pl-10 pr-4 py-2 w-full border border-secondary-200 rounded-lg focus:ring-2 focus:ring-crm-500 focus:border-crm-500 outline-none text-secondary-700 placeholder:text-secondary-400 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={loadNotificaciones}
                    className="p-2 text-secondary-500 hover:text-crm-600 hover:bg-crm-50 rounded-lg transition-colors"
                >
                    <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
                </button>
            </div>

            {/* Grid for Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full py-20 text-center text-secondary-500">Cargando notificaciones...</div>
                ) : filteredNotificaciones.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-secondary-500">No hay notificaciones públicas.</div>
                ) : (
                    filteredNotificaciones.map((notif) => (
                        <div key={notif.id_notificacion} className="glass-card flex flex-col group overflow-hidden border-t-4 border-t-crm-500">
                            <div className="p-6 flex-1 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${notif.tipo === 'URGENTE' ? 'bg-red-100 text-red-700' :
                                        notif.tipo === 'COMUNICADO' ? 'bg-blue-100 text-blue-700' :
                                            'bg-crm-100 text-crm-700'
                                        }`}>
                                        {notif.tipo}
                                    </div>
                                    <div className="flex gap-1 group-hover:opacity-100 opacity-0 transition-opacity">
                                        <button onClick={() => handleOpenEdit(notif)} className="p-1 hover:text-crm-600 transition-colors">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(notif.id_notificacion)} className="p-1 hover:text-red-600 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-secondary-900 group-hover:text-crm-600 transition-colors">{notif.titulo}</h3>
                                    <p className="text-xs text-secondary-400 flex items-center gap-1 mt-1">
                                        <Calendar size={12} /> {new Date(notif.fecha_publicacion).toLocaleDateString()}
                                    </p>
                                </div>

                                <p className="text-sm text-secondary-600 line-clamp-3">
                                    {notif.mensaje}
                                </p>
                            </div>

                            <div className="px-6 py-3 bg-secondary-50 border-t border-secondary-100 flex justify-between items-center">
                                <span className={`flex items-center gap-1.5 text-xs font-semibold ${notif.estado ? 'text-green-600' : 'text-red-600'}`}>
                                    {notif.estado ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                    {notif.estado ? 'Pública' : 'Borrador'}
                                </span>
                                <div className="p-2 bg-white rounded-lg border border-secondary-200 shadow-sm text-secondary-400 group-hover:text-crm-500 transition-colors">
                                    <Bell size={16} />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal Form */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentNotificacion ? 'Editar Notificación' : 'Crear Notificación'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">Título del Aviso</label>
                        <input
                            type="text" required
                            className="input-premium"
                            placeholder="Ej. Cortes por mantenimiento..."
                            value={formData.titulo || ''}
                            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">Tipo de Aviso</label>
                            <select
                                required
                                className="input-premium"
                                value={formData.tipo || 'INFORMATIVO'}
                                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                            >
                                <option value="INFORMATIVO">INFORMACIÓN</option>
                                <option value="COMUNICADO">COMUNICADO</option>
                                <option value="URGENTE">URGENTE / ALERTA</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">Fecha Publicación</label>
                            <input
                                type="date" required
                                className="input-premium"
                                value={formData.fecha_publicacion || ''}
                                onChange={(e) => setFormData({ ...formData, fecha_publicacion: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">Mensaje Detallado</label>
                        <textarea
                            required
                            className="input-premium h-32 resize-none"
                            placeholder="Escribe aquí el contenido de la noticia o aviso..."
                            value={formData.mensaje || ''}
                            onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                        />
                    </div>

                    {/* Audience Selection */}
                    <div className="p-4 bg-secondary-50 border border-secondary-200 rounded-xl space-y-4">
                        <label className="block text-sm font-bold text-secondary-900">¿A quién enviar?</label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => setAudienceType('TODOS')}
                                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${audienceType === 'TODOS' ? 'border-crm-500 bg-white text-crm-700 shadow-md' : 'border-transparent bg-secondary-100 text-secondary-500 hover:bg-secondary-200'}`}
                            >
                                <Globe size={20} />
                                <span className="text-[10px] font-bold uppercase">Todos</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setAudienceType('ROLES')}
                                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${audienceType === 'ROLES' ? 'border-crm-500 bg-white text-crm-700 shadow-md' : 'border-transparent bg-secondary-100 text-secondary-500 hover:bg-secondary-200'}`}
                            >
                                <Users size={20} />
                                <span className="text-[10px] font-bold uppercase">Por Rol</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setAudienceType('ESPECIFICO')}
                                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${audienceType === 'ESPECIFICO' ? 'border-crm-500 bg-white text-crm-700 shadow-md' : 'border-transparent bg-secondary-100 text-secondary-500 hover:bg-secondary-200'}`}
                            >
                                <User size={20} />
                                <span className="text-[10px] font-bold uppercase">Individual</span>
                            </button>
                        </div>

                        {audienceType === 'ROLES' && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <p className="text-xs font-semibold text-secondary-500 px-1">Selecciona los roles:</p>
                                <div className="flex flex-wrap gap-2">
                                    {roles.map(rol => (
                                        <label key={rol.id_rol} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-all ${selectedRoleIds.includes(rol.id_rol) ? 'bg-crm-500 text-white border-crm-600' : 'bg-white text-secondary-600 border-secondary-200 hover:border-crm-300'}`}>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={selectedRoleIds.includes(rol.id_rol)}
                                                onChange={() => setSelectedRoleIds(prev => prev.includes(rol.id_rol) ? prev.filter(id => id !== rol.id_rol) : [...prev, rol.id_rol])}
                                            />
                                            <span className="text-xs font-medium">{rol.nombre_rol.replace('CLIENTE_', '')}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {audienceType === 'ESPECIFICO' && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <p className="text-xs font-semibold text-secondary-500 px-1">Selecciona el cliente:</p>
                                <select
                                    required
                                    className="input-premium"
                                    value={selectedClientId || ''}
                                    onChange={(e) => setSelectedClientId(Number(e.target.value))}
                                >
                                    <option value="">Buscar cliente...</option>
                                    {clients.map(c => (
                                        <option key={c.id_cliente} value={c.id_cliente}>
                                            {c.nombre_completo} ({c.rol?.nombre_rol.replace('CLIENTE_', '')})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
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
                                    <span>Enviando...</span>
                                </>
                            ) : (
                                <span>{currentNotificacion ? 'Actualizar' : 'Publicar Ahora'}</span>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
