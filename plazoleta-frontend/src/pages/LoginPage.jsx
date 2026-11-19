import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UtensilsCrossed, LogIn } from 'lucide-react';
import { usuariosApi } from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const [correo, setCorreo] = useState('');
    const [clave, setClave] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await usuariosApi.post('/auth/login', { correo, clave });
            const jwt = typeof data === 'string' ? data : data.token || data.jwt;
            login(jwt);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Credenciales incorrectas o servidor apagado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-8">
                <div className="flex flex-col items-center mb-6">
                    <div className="bg-orange-500 text-white p-3 rounded-xl mb-3">
                        <UtensilsCrossed size={28} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">Plazoleta de Comidas</h1>
                    <p className="text-sm text-slate-500">Inicia sesión con tu cuenta</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Correo</label>
                        <input
                            type="email"
                            required
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            placeholder="admin@plazoleta.com"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
                        <input
                            type="password"
                            required
                            value={clave}
                            onChange={(e) => setClave(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                    >
                        <LogIn size={18} />
                        {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <p className="text-center text-sm text-slate-600 mt-6">
                    ¿Eres cliente nuevo?{' '}
                    <Link to="/registro" className="text-orange-600 font-semibold hover:underline">
                        Regístrate aquí
                    </Link>
                </p>
            </div>
        </div>
    );
}