export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            rol: {
                Row: {
                    id_rol: number
                    nombre_rol: string
                    descripcion: string | null
                    estado: boolean
                }
                Insert: {
                    id_rol?: number
                    nombre_rol: string
                    descripcion?: string | null
                    estado: boolean
                }
                Update: {
                    id_rol?: number
                    nombre_rol?: string
                    descripcion?: string | null
                    estado?: boolean
                }
            }
            usuario_admin: {
                Row: {
                    id_usuario_admin: number
                    nombre: string
                    apellido: string
                    usuario: string
                    contraseña: string
                    estado: boolean
                    fecha_creacion: string
                    rol_id_rol: number
                }
                Insert: {
                    id_usuario_admin?: number
                    nombre: string
                    apellido: string
                    usuario: string
                    contraseña: string
                    estado: boolean
                    fecha_creacion: string
                    rol_id_rol: number
                }
                Update: {
                    id_usuario_admin?: number
                    nombre?: string
                    apellido?: string
                    usuario?: string
                    contraseña?: string
                    estado?: boolean
                    fecha_creacion?: string
                    rol_id_rol?: number
                }
            }
            cliente: {
                Row: {
                    id_cliente: number
                    codigo_fijo: string
                    codigo_ubicacion: string
                    nombre_completo: string
                    ci: string
                    direccion: string
                    categoria: string
                    actividad: string
                    fecha_registro: string
                    estado: boolean
                    rol_id_rol: number
                }
                Insert: {
                    id_cliente?: number
                    codigo_fijo: string
                    codigo_ubicacion: string
                    nombre_completo: string
                    ci: string
                    direccion: string
                    categoria: string
                    actividad: string
                    fecha_registro: string
                    estado: boolean
                    rol_id_rol: number
                }
                Update: {
                    id_cliente?: number
                    codigo_fijo?: string
                    codigo_ubicacion?: string
                    nombre_completo?: string
                    ci?: string
                    direccion?: string
                    categoria?: string
                    actividad?: string
                    fecha_registro?: string
                    estado?: boolean
                    rol_id_rol?: number
                }
            }
            lectura: {
                Row: {
                    id_lectura: number
                    fecha_lectura: string
                    lectura_anterior: number
                    lectura_actual: number
                    consumo_m3: number
                    dias_facturados: number
                    observacion: string
                    cliente_id_cliente: number
                    usuario_admin_id_usuario_admin: number
                }
                Insert: {
                    id_lectura?: number
                    fecha_lectura: string
                    lectura_anterior: number
                    lectura_actual: number
                    consumo_m3: number
                    dias_facturados: number
                    observacion: string
                    cliente_id_cliente: number
                    usuario_admin_id_usuario_admin: number
                }
                Update: {
                    id_lectura?: number
                    fecha_lectura?: string
                    lectura_anterior?: number
                    lectura_actual?: number
                    consumo_m3?: number
                    dias_facturados?: number
                    observacion?: string
                    cliente_id_cliente?: number
                    usuario_admin_id_usuario_admin?: number
                }
            }
            factura: {
                Row: {
                    id_factura: number
                    periodo: string
                    fecha_emision: string
                    fecha_vencimiento: string
                    total_consumo: number
                    total_factura: number
                    estado: string
                    deuda_actual: number
                    cliente_id_cliente: number
                    lectura_id_lectura: number
                }
                Insert: {
                    id_factura?: number
                    periodo: string
                    fecha_emision: string
                    fecha_vencimiento: string
                    total_consumo: number
                    total_factura: number
                    estado: string
                    deuda_actual: number
                    cliente_id_cliente: number
                    lectura_id_lectura: number
                }
                Update: {
                    id_factura?: number
                    periodo?: string
                    fecha_emision?: string
                    fecha_vencimiento?: string
                    total_consumo?: number
                    total_factura?: number
                    estado?: string
                    deuda_actual?: number
                    cliente_id_cliente?: number
                    lectura_id_lectura?: number
                }
            }
            detalle_factura: {
                Row: {
                    id_detalle: number
                    concepto: string
                    importe: number
                    monto_unitario: number
                    sub_total: number
                    factura_id_factura: number
                }
                Insert: {
                    id_detalle?: number
                    concepto: string
                    importe: number
                    monto_unitario: number
                    sub_total: number
                    factura_id_factura: number
                }
                Update: {
                    id_detalle?: number
                    concepto?: string
                    importe?: number
                    monto_unitario?: number
                    sub_total?: number
                    factura_id_factura?: number
                }
            }
            pago: {
                Row: {
                    id_pago: number
                    fecha_pago: string
                    metodo_pago: string
                    monto_pagado: number
                    numero_recibo: number
                    cajero: string
                    estado: boolean
                    factura_id_factura: number
                }
                Insert: {
                    id_pago?: number
                    fecha_pago: string
                    metodo_pago: string
                    monto_pagado: number
                    numero_recibo: number
                    cajero: string
                    estado: boolean
                    factura_id_factura: number
                }
                Update: {
                    id_pago?: number
                    fecha_pago?: string
                    metodo_pago?: string
                    monto_pagado?: number
                    numero_recibo?: number
                    cajero?: string
                    estado?: boolean
                    factura_id_factura?: number
                }
            }
            cuenta_cliente: {
                Row: {
                    id_cuenta: number
                    usuario: string
                    contraseña: string
                    ultimo_acceso: string
                    estado: boolean
                    cliente_id_cliente: number
                }
                Insert: {
                    id_cuenta?: number
                    usuario: string
                    contraseña: string
                    ultimo_acceso?: string
                    estado: boolean
                    cliente_id_cliente: number
                }
                Update: {
                    id_cuenta?: number
                    usuario?: string
                    contraseña?: string
                    ultimo_acceso?: string
                    estado?: boolean
                    cliente_id_cliente?: number
                }
            },
            permiso: {
                Row: {
                    id_permiso: number
                    codigo: string
                    descripcion: string
                }
                Insert: {
                    id_permiso?: number
                    codigo: string
                    descripcion: string
                }
                Update: {
                    id_permiso?: number
                    codigo?: string
                    descripcion?: string
                }
            },
            rol_permiso: {
                Row: {
                    id_rol_permiso: number
                    permiso_id_permiso: number
                    rol_id_rol: number
                }
                Insert: {
                    id_rol_permiso?: number
                    permiso_id_permiso: number
                    rol_id_rol: number
                }
                Update: {
                    id_rol_permiso?: number
                    permiso_id_permiso?: number
                    rol_id_rol?: number
                }
            },
            tarifa: {
                Row: {
                    id_tarifa: number
                    categoria: string
                    consumo_minimo_m3: number
                    monto_minimo_bs: number
                    precio_m3_extra: number
                    cargo_fijo: number
                    estado: boolean
                }
                Insert: {
                    id_tarifa?: number
                    categoria: string
                    consumo_minimo_m3: number
                    monto_minimo_bs: number
                    precio_m3_extra: number
                    cargo_fijo: number
                    estado: boolean
                }
                Update: {
                    id_tarifa?: number
                    categoria?: string
                    consumo_minimo_m3?: number
                    monto_minimo_bs?: number
                    precio_m3_extra?: number
                    cargo_fijo?: number
                    estado?: boolean
                }
            }
            tipo_cargo: {
                Row: {
                    id_tipo: number
                    nombre: string
                    monto_defecto: number
                    estado: boolean
                }
                Insert: {
                    id_tipo?: number
                    nombre: string
                    monto_defecto: number
                    estado: boolean
                }
                Update: {
                    id_tipo?: number
                    nombre?: string
                    monto_defecto?: number
                    estado?: boolean
                }
            }
            cargo_extra: {
                Row: {
                    id_cargo_extra: number
                    cliente_id_cliente: number
                    tipo_cargo_id: number
                    monto: number
                    descripcion: string | null
                    fecha_registro: string
                    estado: string
                    factura_id_factura: number | null
                }
                Insert: {
                    id_cargo_extra?: number
                    cliente_id_cliente: number
                    tipo_cargo_id: number
                    monto: number
                    descripcion?: string | null
                    fecha_registro?: string
                    estado?: string
                    factura_id_factura?: number | null
                }
                Update: {
                    id_cargo_extra?: number
                    cliente_id_cliente?: number
                    tipo_cargo_id?: number
                    monto?: number
                    descripcion?: string | null
                    fecha_registro?: string
                    estado?: string
                    factura_id_factura?: number | null
                }
            },
            gasto: {
                Row: {
                    id_gasto: number
                    concepto: string
                    monto: number
                    fecha: string
                    usuario_admin_id_usuario_admin: number
                }
                Insert: {
                    id_gasto?: number
                    concepto: string
                    monto: number
                    fecha: string
                    usuario_admin_id_usuario_admin: number
                }
                Update: {
                    id_gasto?: number
                    concepto?: string
                    monto?: number
                    fecha?: string
                    usuario_admin_id_usuario_admin?: number
                }
            },
            notificacion: {
                Row: {
                    id_notificacion: number
                    titulo: string
                    mensaje: string
                    tipo: string
                    fecha_publicacion: string
                    estado: boolean
                }
                Insert: {
                    id_notificacion?: number
                    titulo: string
                    mensaje: string
                    tipo: string
                    fecha_publicacion: string
                    estado: boolean
                }
                Update: {
                    id_notificacion?: number
                    titulo?: string
                    mensaje?: string
                    tipo?: string
                    fecha_publicacion?: string
                    estado?: boolean
                }
            },
            notificacion_cliente: {
                Row: {
                    id_notificacion_cliente: number
                    fecha_lectura: string
                    leido: boolean
                    notificacion_id_notificacion: number
                    cliente_id_cliente: number
                }
                Insert: {
                    id_notificacion_cliente?: number
                    fecha_lectura: string
                    leido: boolean
                    notificacion_id_notificacion: number
                    cliente_id_cliente: number
                }
                Update: {
                    id_notificacion_cliente?: number
                    fecha_lectura?: string
                    leido?: boolean
                    notificacion_id_notificacion?: number
                    cliente_id_cliente?: number
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
