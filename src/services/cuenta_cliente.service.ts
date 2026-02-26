import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

const client = supabase as any;

export type CuentaCliente = Database['public']['Tables']['cuenta_cliente']['Row'];
export type NewCuentaCliente = Database['public']['Tables']['cuenta_cliente']['Insert'];
export type UpdateCuentaCliente = Database['public']['Tables']['cuenta_cliente']['Update'];

export const CuentaClienteService = {
    async getByClienteId(clienteId: number) {
        const { data, error } = await client
            .from('cuenta_cliente')
            .select('*')
            .eq('cliente_id_cliente', clienteId)
            .maybeSingle();

        if (error) throw error;
        return data as CuentaCliente | null;
    },

    async create(cuenta: NewCuentaCliente) {
        const { data, error } = await client
            .from('cuenta_cliente')
            .insert({
                ...cuenta,
                ultimo_acceso: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data as CuentaCliente;
    },

    async update(id: number, cuenta: UpdateCuentaCliente) {
        const { data, error } = await client
            .from('cuenta_cliente')
            .update(cuenta)
            .eq('id_cuenta', id)
            .select()
            .single();

        if (error) throw error;
        return data as CuentaCliente;
    },

    async delete(id: number) {
        const { error } = await client
            .from('cuenta_cliente')
            .delete()
            .eq('id_cuenta', id);

        if (error) throw error;
    },

    async toggleEstado(id: number, estado: boolean) {
        const { data, error } = await client
            .from('cuenta_cliente')
            .update({ estado })
            .eq('id_cuenta', id)
            .select()
            .single();

        if (error) throw error;
        return data as CuentaCliente;
    }
};
