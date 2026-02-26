import { supabase } from '../lib/supabase';
import type { UserAdmin } from './usuario.service';
import bcrypt from 'bcryptjs';

export const AuthService = {
    async login(usuario: string, contraseñaInput: string): Promise<{ user: UserAdmin, permissions: string[] }> {
        // Obtenemos el usuario por su login
        const { data, error } = await supabase
            .from('usuario_admin')
            .select(`
                *,
                rol:rol_id_rol (
                    id_rol,
                    nombre_rol
                )
            `)
            .eq('usuario', usuario)
            .single();

        if (error) {
            // PGRST116 es "no rows found"
            if (error.code === 'PGRST116') {
                throw new Error('Usuario o contraseña incorrectos.');
            }
            throw error;
        }

        const user = data as UserAdmin;

        // Verificar si la cuenta está activa
        if (!user.estado) {
            throw new Error('La cuenta se encuentra desactivada.');
        }

        // Comparar contraseña ingresada con la encriptada
        const isMatch = await bcrypt.compare(contraseñaInput, user.contraseña);

        if (!isMatch) {
            throw new Error('Usuario o contraseña incorrectos.');
        }

        // Obtener códigos de permisos del rol
        const { data: permisosData, error: permsError } = await supabase
            .from('rol_permiso')
            .select(`
                permiso:permiso_id_permiso (
                    codigo
                )
            `)
            .eq('rol_id_rol', user.rol_id_rol);

        if (permsError) throw permsError;

        const permissions = (permisosData as any[]).map(p => p.permiso.codigo);

        return { user, permissions };
    }
};
