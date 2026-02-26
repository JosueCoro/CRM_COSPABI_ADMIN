import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Droplets, User, Lock, Leaf } from 'lucide-react';
import { AuthService } from '../../services/auth.service';
import { useAuthStore } from '../../store/authStore';

export const LoginAdmin = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [credentials, setCredentials] = useState({
        usuario: '',
        contraseña: ''
    });

    const navigate = useNavigate();
    const setAuth = useAuthStore(state => state.setAuth);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { user, permissions } = await AuthService.login(credentials.usuario, credentials.contraseña);
            setAuth(user, permissions);
            navigate('/admin');
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-crm-600 skew-y-6 transform -translate-y-24 z-0 origin-top-left shadow-2xl"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-crm-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 left-0 w-64 h-64 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="flex justify-center mb-6">
                    <div className="bg-white p-4 rounded-3xl shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                        <Droplets className="h-12 w-12 text-crm-600" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
                    Administración COSPABI
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Acceso autorizado para gestión de servicios
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="bg-white py-10 px-6 shadow-xl rounded-2xl border border-gray-100 sm:px-12 backdrop-blur-sm bg-white/90">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm animate-pulse">
                                {error}
                            </div>
                        )}

                        <div>
                            <Input
                                label="Credencial de Acceso"
                                placeholder="usuario.sistema"
                                leftIcon={<User className="text-crm-500 w-5 h-5" />}
                                className="border-gray-200 focus:border-crm-500 focus:ring-crm-200"
                                value={credentials.usuario}
                                onChange={(e) => setCredentials({ ...credentials, usuario: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <Input
                                type="password"
                                label="Contraseña Maestra"
                                placeholder="••••••••••••"
                                leftIcon={<Lock className="text-crm-500 w-5 h-5" />}
                                className="border-gray-200 focus:border-crm-500 focus:ring-crm-200"
                                value={credentials.contraseña}
                                onChange={(e) => setCredentials({ ...credentials, contraseña: e.target.value })}
                                required
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-crm-600 focus:ring-crm-500 border-gray-300 rounded cursor-pointer"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                                    Mantener sesión
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-medium text-crm-600 hover:text-crm-500 transition-colors">
                                    ¿Olvidó su clave?
                                </a>
                            </div>
                        </div>

                        <div>
                            <Button
                                type="submit"
                                className="w-full flex justify-center bg-crm-600 hover:bg-crm-700 text-white shadow-lg shadow-crm-500/30 transition-all transform hover:-translate-y-0.5"
                                isLoading={loading}
                                rightIcon={!loading && <Leaf className="w-4 h-4 ml-1" />}
                            >
                                Ingresar al Sistema
                            </Button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500 rounded-full border border-gray-100 shadow-sm">
                                    Sistema Seguro v2.0
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer simple */}
                <p className="mt-8 text-center text-xs text-gray-500">
                    &copy; 2024 Cooperativa de Servicios Públicos y Agua Potable. <br />Todos los derechos reservados.
                </p>
            </div>
        </div>
    );
};

