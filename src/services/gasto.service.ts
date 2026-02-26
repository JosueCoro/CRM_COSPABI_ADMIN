import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

const client = supabase as any;

export type Gasto = Database['public']['Tables']['gasto']['Row'] & {
    usuario_admin?: { nombre: string, apellido: string } | null;
};
export type NewGasto = Database['public']['Tables']['gasto']['Insert'];
export type UpdateGasto = Database['public']['Tables']['gasto']['Update'];

export const GastoService = {
    async getAll() {
        const { data, error } = await client
            .from('gasto')
            .select(`
                *,
                usuario_admin:usuario_admin_id_usuario_admin (
                    nombre,
                    apellido
                )
            `)
            .order('fecha', { ascending: false });

        if (error) throw error;
        return data as Gasto[];
    },

    async create(gasto: NewGasto) {
        const { data, error } = await client
            .from('gasto')
            .insert(gasto as any)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async update(id: number, gasto: UpdateGasto) {
        const { data, error } = await client
            .from('gasto')
            .update(gasto as any)
            .eq('id_gasto', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id: number) {
        const { error } = await client
            .from('gasto')
            .delete()
            .eq('id_gasto', id);

        if (error) throw error;
    }
};
