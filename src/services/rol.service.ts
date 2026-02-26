import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

// Bypass type issues with Supabase client
const client = supabase as any;

export type Rol = Database['public']['Tables']['rol']['Row'];
export type NewRol = Database['public']['Tables']['rol']['Insert'];
export type UpdateRol = Database['public']['Tables']['rol']['Update'];

export const RolService = {
    async getAll() {
        const { data, error } = await client
            .from('rol')
            .select('*')
            .order('id_rol', { ascending: true });

        if (error) throw error;
        return data;
    },

    async getById(id: number) {
        const { data, error } = await client
            .from('rol')
            .select('*')
            .eq('id_rol', id)
            .single();

        if (error) throw error;
        return data;
    },

    async create(rol: NewRol) {
        const { data, error } = await client
            .from('rol')
            .insert(rol as any)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async update(id: number, rol: UpdateRol) {
        const { data, error } = await client
            .from('rol')
            .update(rol as any)
            .eq('id_rol', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id: number) {
        const { error } = await client
            .from('rol')
            .delete()
            .eq('id_rol', id);

        if (error) throw error;
    },

    // --- Gestión de Permisos ---

    async getPermisos() {
        const { data, error } = await client
            .from('permiso')
            .select('*')
            .order('codigo', { ascending: true });

        if (error) throw error;
        return data;
    },

    async getPermisosByRol(idRol: number) {
        const { data, error } = await client
            .from('rol_permiso')
            .select(`
                permiso_id_permiso,
                permiso:permiso_id_permiso (*)
            `)
            .eq('rol_id_rol', idRol);

        if (error) throw error;
        return data;
    },

    async updateRolPermisos(idRol: number, permisoIds: number[]) {
        // En un CRUD real, primero borramos los actuales y luego insertamos los nuevos
        // (Sincronización)

        // 1. Borrar permisos actuales
        const { error: deleteError } = await client
            .from('rol_permiso')
            .delete()
            .eq('rol_id_rol', idRol);

        if (deleteError) throw deleteError;

        if (permisoIds.length === 0) return;

        // 2. Insertar nuevos permisos
        const nuevosPermisos = permisoIds.map(idPermiso => ({
            rol_id_rol: idRol,
            permiso_id_permiso: idPermiso
        }));

        const { error: insertError } = await client
            .from('rol_permiso')
            .insert(nuevosPermisos);

        if (insertError) throw insertError;
    }
};

export type Permiso = Database['public']['Tables']['permiso']['Row'];
export type RolPermiso = Database['public']['Tables']['rol_permiso']['Row'];
