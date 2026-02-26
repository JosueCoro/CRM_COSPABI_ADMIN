import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

const client = supabase as any;

export type Pago = Database['public']['Tables']['pago']['Row'] & {
    factura?: {
        periodo: string;
        total_factura: number;
        cliente: {
            nombre_completo: string;
            codigo_fijo: string;
        };
    };
};

export type NewPago = Database['public']['Tables']['pago']['Insert'];

export const PagoService = {
    async getFacturasPendientes() {
        const { data, error } = await client
            .from('factura')
            .select(`
                *,
                cliente:cliente_id_cliente (
                    nombre_completo,
                    codigo_fijo
                ),
                detalles:detalle_factura (*)
            `)
            .eq('estado', 'PENDIENTE')
            .order('fecha_emision', { ascending: false });

        if (error) throw error;
        return data;
    },

    async registrarPago(pago: NewPago) {
        // 1. Iniciar transacción manual (Supabase no tiene transacciones en cliente de forma directa fácil sin RPC)
        // Pero podemos hacer el insert del pago y el update de la factura.

        const { data: dataPago, error: errorPago } = await client
            .from('pago')
            .insert(pago)
            .select()
            .single();

        if (errorPago) throw errorPago;

        // 2. Actualizar estado de la factura
        const { error: errorFactura } = await client
            .from('factura')
            .update({
                estado: 'PAGADO',
                deuda_actual: 0
            })
            .eq('id_factura', pago.factura_id_factura);

        if (errorFactura) {
            // Revertir pago si falla? En una app real usaríamos un RPC de Postgres
            console.error('Error actualizando factura, el pago se registró pero la factura sigue pendiente:', errorFactura);
            throw errorFactura;
        }

        return dataPago;
    },

    async getAllPagos() {
        const { data, error } = await client
            .from('pago')
            .select(`
                *,
                factura:factura_id_factura (
                    periodo,
                    total_factura,
                    cliente:cliente_id_cliente (
                        nombre_completo,
                        codigo_fijo
                    )
                )
            `)
            .order('fecha_pago', { ascending: false });

        if (error) throw error;
        return data as Pago[];
    }
};
