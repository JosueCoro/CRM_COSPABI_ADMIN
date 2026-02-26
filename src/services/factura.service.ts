import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { TarifaService } from './tarifa.service';

const client = supabase as any;

export type Factura = Database['public']['Tables']['factura']['Row'];
export type NewFactura = Database['public']['Tables']['factura']['Insert'];
export type DetalleFactura = Database['public']['Tables']['detalle_factura']['Row'];
export type NewDetalleFactura = Database['public']['Tables']['detalle_factura']['Insert'];

export const FacturaService = {
    async createAutoFactura(lecturaId: number, clienteId: number, consumo: number, categoria: string) {
        // 1. Obtener Tarifas desde la Base de Datos
        let CONSUMO_MINIMO_M3 = 8;
        let MONTO_MINIMO_BS = 15.00;
        let PRECIO_M3_EXTRA = 1.70;
        let cargoFijo = 5; // Cargo administrativo base (puedes ajustarlo)

        try {
            const tarifa = await TarifaService.getByCategoria(categoria);
            if (tarifa) {
                CONSUMO_MINIMO_M3 = tarifa.consumo_minimo_m3;
                MONTO_MINIMO_BS = tarifa.monto_minimo_bs;
                PRECIO_M3_EXTRA = tarifa.precio_m3_extra;
                cargoFijo = tarifa.cargo_fijo;
            }
        } catch (error) {
            console.error('Error al obtener tarifas, usando valores por defecto:', error);
        }

        console.log(`Generando factura para categoría: ${categoria}`);

        let totalConsumoBs = 0;

        if (consumo <= CONSUMO_MINIMO_M3) {
            totalConsumoBs = MONTO_MINIMO_BS;
        } else {
            // Según el requerimiento del usuario, si excede el mínimo se calcula
            // sobre el total del consumo para mayor claridad.
            totalConsumoBs = Math.max(consumo * PRECIO_M3_EXTRA, MONTO_MINIMO_BS);
        }

        const totalFactura = totalConsumoBs + cargoFijo;

        // 1.5. Buscar Cargos Extras Pendientes
        let cargosExtras: any[] = [];
        try {
            const { CargoService } = await import('./cargo.service');
            cargosExtras = await CargoService.getPendientesByCliente(clienteId);
        } catch (error) {
            console.error('Error al obtener cargos extras:', error);
        }

        const montoExtras = cargosExtras.reduce((acc, c) => acc + Number(c.monto), 0);
        const granTotal = totalFactura + montoExtras;

        const hoy = new Date();
        const fechaVencimiento = new Date();
        fechaVencimiento.setDate(hoy.getDate() + 15);

        // 2. Crear Factura
        const facturaData: NewFactura = {
            periodo: new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0],
            fecha_emision: hoy.toISOString().split('T')[0],
            fecha_vencimiento: fechaVencimiento.toISOString().split('T')[0],
            total_consumo: totalConsumoBs,
            total_factura: granTotal, // Monto total con extras
            estado: 'PENDIENTE',
            deuda_actual: granTotal,
            cliente_id_cliente: clienteId,
            lectura_id_lectura: lecturaId
        };

        const { data: factura, error: fError } = await client
            .from('factura')
            .insert(facturaData)
            .select()
            .single();

        if (fError) throw fError;

        // 3. Crear Detalle Factura
        const detalles: NewDetalleFactura[] = [
            {
                concepto: consumo <= CONSUMO_MINIMO_M3
                    ? `CONSUMO MÍNIMO (0-${CONSUMO_MINIMO_M3} m³)`
                    : `CONSUMO DE AGUA (${consumo} m³)`,
                importe: totalConsumoBs,
                monto_unitario: totalConsumoBs / (consumo || 1),
                sub_total: totalConsumoBs,
                factura_id_factura: factura.id_factura
            }
        ];


        // Agregar los cargos extras al detalle
        cargosExtras.forEach(cargo => {
            detalles.push({
                concepto: cargo.tipo_cargo?.nombre || 'CARGO EXTRA',
                importe: cargo.monto,
                monto_unitario: cargo.monto,
                sub_total: cargo.monto,
                factura_id_factura: factura.id_factura
            });
        });

        const { error: dError } = await client
            .from('detalle_factura')
            .insert(detalles);

        if (dError) throw dError;

        // 4. Marcar cargos extras como facturados
        if (cargosExtras.length > 0) {
            const { CargoService } = await import('./cargo.service');
            await CargoService.markAsFactured(
                cargosExtras.map(c => c.id_cargo_extra),
                factura.id_factura
            );
        }

        return factura;
    },

    async getAll() {
        const { data, error } = await client
            .from('factura')
            .select(`
                *,
                cliente:cliente_id_cliente (
                    nombre_completo,
                    codigo_fijo
                )
            `)
            .order('fecha_emision', { ascending: false });

        if (error) throw error;
        return data;
    },

    async getById(id: number) {
        const { data, error } = await client
            .from('factura')
            .select(`
                *,
                cliente:cliente_id_cliente (*),
                detalles:detalle_factura (*),
                lectura:lectura_id_lectura (*)
            `)
            .eq('id_factura', id)
            .single();

        if (error) throw error;
        return data;
    }
};
