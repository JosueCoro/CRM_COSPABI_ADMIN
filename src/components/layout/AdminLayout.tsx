import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuthStore } from '../../store/authStore';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export function AdminLayout() {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="flex w-full min-h-screen bg-secondary-50 font-sans">
            {/* Mobile Header */}
            <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-secondary-200 flex items-center justify-between px-4 z-40">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-crm-600 rounded-lg flex items-center justify-center text-white font-bold">C</div>
                    <span className="font-bold text-secondary-900">COSPABI</span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-secondary-500"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            {/* Sidebar Navigation */}
            <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

            {/* Main Content Area */}
            <main className="flex-1 w-full overflow-y-auto overflow-x-hidden pt-16 md:pt-0">
                <div className="container mx-auto px-4 py-6 md:px-12 md:py-12">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

