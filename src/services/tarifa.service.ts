import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

const client = supabase as any;

export type Tarifa = Database['public']['Tables']['tarifa']['Row'];
export type UpdateTarifa = Database['public']['Tables']['tarifa']['Update'];

export const TarifaService = {
    async getAll() {
        const { data, error } = await client
            .from('tarifa')
            .select('*')
            .order('categoria', { ascending: true });

        if (error) throw error;
        return data as Tarifa[];
    },

    async getByCategoria(categoria: string) {
        const { data, error } = await client
            .from('tarifa')
            .select('*')
            .eq('categoria', categoria)
            .eq('estado', true)
            .maybeSingle();

        if (error) throw error;
        return data as Tarifa;
    },

    async update(id: number, tarifa: UpdateTarifa) {
        const { data, error } = await client
            .from('tarifa')
            .update(tarifa)
            .eq('id_tarifa', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async create(tarifa: Database['public']['Tables']['tarifa']['Insert']) {
        const { data, error } = await client
            .from('tarifa')
            .insert(tarifa)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
