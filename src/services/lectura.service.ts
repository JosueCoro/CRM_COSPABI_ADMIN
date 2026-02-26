import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

const client = supabase as any;

export type Lectura = Database['public']['Tables']['lectura']['Row'] & {
    cliente?: { nombre_completo: string, codigo_fijo: string };
    usuario_admin?: { nombre: string, apellido: string };
};
export type NewLectura = Database['public']['Tables']['lectura']['Insert'];

export const LecturaService = {
    async getAll() {
        const { data, error } = await client
            .from('lectura')
            .select(`
                *,
                cliente:cliente_id_cliente (
                    nombre_completo,
                    codigo_fijo
                ),
                usuario_admin:usuario_admin_id_usuario_admin (
                    nombre,
                    apellido
                )
            `)
            .order('fecha_lectura', { ascending: false });

        if (error) throw error;
        return data as Lectura[];
    },

    async getUltimaLecturaByCliente(clienteId: number) {
        const { data, error } = await client
            .from('lectura')
            .select('*')
            .eq('cliente_id_cliente', clienteId)
            .order('id_lectura', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) throw error;
        return data; // returns null if no readings yet
    },

    async create(lectura: NewLectura) {
        const { data, error } = await client
            .from('lectura')
            .insert(lectura)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
