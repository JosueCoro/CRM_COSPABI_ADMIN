import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

const client = supabase as any;

export type Notificacion = Database['public']['Tables']['notificacion']['Row'];
export type NewNotificacion = Database['public']['Tables']['notificacion']['Insert'];
export type UpdateNotificacion = Database['public']['Tables']['notificacion']['Update'];

export type NotificacionCliente = Database['public']['Tables']['notificacion_cliente']['Row'];

export const NotificacionService = {
    async getAll() {
        const { data, error } = await client
            .from('notificacion')
            .select('*')
            .order('fecha_publicacion', { ascending: false });

        if (error) throw error;
        return data as Notificacion[];
    },

    async create(notificacion: NewNotificacion) {
        const { data, error } = await client
            .from('notificacion')
            .insert(notificacion as any)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async update(id: number, notificacion: UpdateNotificacion) {
        const { data, error } = await client
            .from('notificacion')
            .update(notificacion as any)
            .eq('id_notificacion', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id: number) {
        const { error } = await client
            .from('notificacion')
            .delete()
            .eq('id_notificacion', id);

        if (error) throw error;
    },

    // Distribución de notificaciones
    async getClients() {
        const { data, error } = await client
            .from('cliente')
            .select('id_cliente, nombre_completo, rol_id_rol, rol:rol_id_rol(nombre_rol)')
            .eq('estado', true);

        if (error) throw error;
        return data;
    },

    async assignToClients(notificacionId: number, clienteIds: number[]) {
        const asignaciones = clienteIds.map(id => ({
            notificacion_id_notificacion: notificacionId,
            cliente_id_cliente: id,
            leido: false,
            fecha_lectura: new Date().toISOString().split('T')[0] // Default today if required
        }));

        const { error } = await client
            .from('notificacion_cliente')
            .insert(asignaciones as any);

        if (error) throw error;
    }
};
