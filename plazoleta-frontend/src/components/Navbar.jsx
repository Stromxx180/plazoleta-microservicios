import { UtensilsCrossed, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-3">
                <div className="bg-orange-500 text-white p-2 rounded-lg">
                    <UtensilsCrossed size={20} />
                </div>
                <div>
                    <h1 className="font-bold text-slate-800 leading-tight">Plazoleta de Comidas</h1>
                    <p className="text-xs text-slate-500">{user?.sub}</p>
                </div>
            </div>

            <div className="flex items-center gap-4">
        <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
          {user?.rol}
        </span>
                <button
                    onClick={logout}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-lg text-sm cursor-pointer transition"
                >
                    <LogOut size={16} />
                    Salir
                </button>
            </div>
        </header>
    );
}