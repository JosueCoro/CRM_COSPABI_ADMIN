import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

const client = supabase as any;

export type Cliente = Database['public']['Tables']['cliente']['Row'] & {
    rol?: { nombre_rol: string } | null;
};
export type NewCliente = Database['public']['Tables']['cliente']['Insert'];
export type UpdateCliente = Database['public']['Tables']['cliente']['Update'];

export const ClienteService = {
    async getAll() {
        const { data, error } = await client
            .from('cliente')
            .select(`
                *,
                rol:rol_id_rol (
                    nombre_rol
                )
            `)
            .order('id_cliente', { ascending: true });

        if (error) throw error;
        return data as Cliente[];
    },

    async getById(id: number) {
        const { data, error } = await client
            .from('cliente')
            .select('*')
            .eq('id_cliente', id)
            .single();

        if (error) throw error;
        return data as Cliente;
    },

    async create(cliente: NewCliente) {
        const { data, error } = await client
            .from('cliente')
            .insert(cliente)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async update(id: number, cliente: Array<any> | UpdateCliente) {
        const { data, error } = await client
            .from('cliente')
            .update(cliente)
            .eq('id_cliente', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id: number) {
        const { error } = await client
            .from('cliente')
            .delete()
            .eq('id_cliente', id);

        if (error) throw error;
    }
};
