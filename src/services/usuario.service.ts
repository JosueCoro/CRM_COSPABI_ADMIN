import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

import bcrypt from 'bcryptjs';

// Bypass type issues with Supabase client
const client = supabase as any;

export type UserAdmin = Database['public']['Tables']['usuario_admin']['Row'] & {
    rol?: { nombre_rol: string } | null;
};
export type NewUserAdmin = Database['public']['Tables']['usuario_admin']['Insert'];
export type UpdateUserAdmin = Database['public']['Tables']['usuario_admin']['Update'];

export const UsuarioService = {
    async getAll() {
        const { data, error } = await client
            .from('usuario_admin')
            .select(`
                *,
                rol:rol_id_rol (
                    nombre_rol
                )
            `)
            .order('id_usuario_admin', { ascending: true });

        if (error) throw error;
        return data as UserAdmin[];
    },

    async getById(id: number) {
        const { data, error } = await client
            .from('usuario_admin')
            .select('*')
            .eq('id_usuario_admin', id)
            .single();

        if (error) throw error;
        return data;
    },

    async create(user: NewUserAdmin) {
        // Encriptar contraseña si existe
        if (user.contraseña) {
            const salt = await bcrypt.genSalt(10);
            user.contraseña = await bcrypt.hash(user.contraseña, salt);
        }

        const { data, error } = await client
            .from('usuario_admin')
            .insert(user as any)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async update(id: number, user: UpdateUserAdmin) {
        // Encriptar contraseña si se está actualizando
        if (user.contraseña) {
            const salt = await bcrypt.genSalt(10);
            user.contraseña = await bcrypt.hash(user.contraseña, salt);
        }

        const { data, error } = await client
            .from('usuario_admin')
            .update(user as any)
            .eq('id_usuario_admin', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },


    async delete(id: number) {
        const { error } = await client
            .from('usuario_admin')
            .delete()
            .eq('id_usuario_admin', id);

        if (error) throw error;
    }
};
