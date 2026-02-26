import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

const client = supabase as any;

export type TipoCargo = Database['public']['Tables']['tipo_cargo']['Row'];
export type NewTipoCargo = Database['public']['Tables']['tipo_cargo']['Insert'];
export type CargoExtra = Database['public']['Tables']['cargo_extra']['Row'] & {
    tipo_cargo?: TipoCargo;
};
export type NewCargoExtra = Database['public']['Tables']['cargo_extra']['Insert'];

export const CargoService = {
    // --- Tipo Cargo Methods ---
    async getTipos() {
        const { data, error } = await client
            .from('tipo_cargo')
            .select('*')
            .order('nombre', { ascending: true });
        if (error) throw error;
        return data as TipoCargo[];
    },

    async createTipo(tipo: NewTipoCargo) {
        const { data, error } = await client
            .from('tipo_cargo')
            .insert(tipo)
            .select()
            .single();
        if (error) throw error;
        return data as TipoCargo;
    },

    async updateTipo(id: number, tipo: Partial<NewTipoCargo>) {
        const { data, error } = await client
            .from('tipo_cargo')
            .update(tipo)
            .eq('id_tipo', id)
            .select()
            .single();
        if (error) throw error;
        return data as TipoCargo;
    },

    // --- Cargo Extra Methods ---
    async getPendientesByCliente(clienteId: number) {
        const { data, error } = await client
            .from('cargo_extra')
            .select(`
                *,
                tipo_cargo:tipo_cargo_id (*)
            `)
            .eq('cliente_id_cliente', clienteId)
            .eq('estado', 'PENDIENTE');
        if (error) throw error;
        return data as CargoExtra[];
    },

    async createCargoExtra(cargo: NewCargoExtra) {
        const { data, error } = await client
            .from('cargo_extra')
            .insert({
                ...cargo,
                estado: 'PENDIENTE',
                fecha_registro: new Date().toISOString().split('T')[0]
            })
            .select()
            .single();
        if (error) throw error;
        return data as CargoExtra;
    },

    async markAsFactured(cargoIds: number[], facturaId: number) {
        const { error } = await client
            .from('cargo_extra')
            .update({
                estado: 'FACTURADO',
                factura_id_factura: facturaId
            })
            .in('id_cargo_extra', cargoIds);
        if (error) throw error;
    }
};
