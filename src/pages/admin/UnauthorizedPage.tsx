import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';

export function UnauthorizedPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
            <div className="relative mb-8">
                <div className="w-32 h-32 bg-red-50 rounded-full flex items-center justify-center animate-pulse">
                    <ShieldAlert size={64} className="text-red-500" />
                </div>
                <div className="absolute -right-2 -bottom-2 bg-white p-2 rounded-xl shadow-lg border border-secondary-100">
                    <Lock size={24} className="text-secondary-400" />
                </div>
            </div>

            <h1 className="text-4xl font-black text-secondary-900 mb-4 tracking-tight">
                Acceso No Autorizado
            </h1>

            <p className="text-secondary-500 max-w-md mx-auto mb-10 text-lg leading-relaxed">
                Lo sentimos, tu rol actual no cuenta con los permisos necesarios para acceder a esta sección.
                Si crees que esto es un error, contacta con el administrador del sistema.
            </p>

            <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 px-8 py-4 bg-secondary-900 text-white rounded-2xl font-bold shadow-xl hover:bg-black transition-all hover:-translate-y-1 active:scale-95"
            >
                <ArrowLeft size={20} />
                Volver al Panel Principal
            </button>

            <div className="mt-12 pt-12 border-t border-secondary-100 w-full max-w-xs">
                <p className="text-xs font-bold text-secondary-400 uppercase tracking-widest">
                    Seguridad COSPABI v2.0
                </p>
            </div>
        </div>
    );
}
