import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { usuariosApi } from '../api/axiosConfig';

export default function RegisterPage() {
    const [form, setForm] = useState({
        nombre: '',
        apellido: '',
        documentoDeIdentidad: '',
        celular: '',
        fechaNacimiento: '',
        correo: '',
        clave: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await usuariosApi.post('/usuarios/cliente', form);
            setSuccess('Cuenta creada con éxito. Redirigiendo al login...');
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al registrar el cliente. Verifica los datos.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-lg p-8">
                <h1 className="text-2xl font-bold text-slate-800 mb-1">Registro de Cliente</h1>
                <p className="text-sm text-slate-500 mb-6">Crea tu cuenta para pedir en la plazoleta</p>

                {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg mb-4">{error}</div>}
                {success && <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded-lg mb-4">{success}</div>}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input name="nombre" placeholder="Nombre" required onChange={handleChange} className="px-3 py-2 border border-slate-300 rounded-lg" />
                    <input name="apellido" placeholder="Apellido" required onChange={handleChange} className="px-3 py-2 border border-slate-300 rounded-lg" />
                    <input name="documentoDeIdentidad" placeholder="Documento (solo números)" required onChange={handleChange} className="px-3 py-2 border border-slate-300 rounded-lg" />
                    <input name="celular" placeholder="Celular (+573001234567)" required onChange={handleChange} className="px-3 py-2 border border-slate-300 rounded-lg" />
                    <input name="fechaNacimiento" type="date" required onChange={handleChange} className="px-3 py-2 border border-slate-300 rounded-lg" />
                    <input name="correo" type="email" placeholder="Correo electrónico" required onChange={handleChange} className="px-3 py-2 border border-slate-300 rounded-lg" />
                    <input name="clave" type="password" placeholder="Contraseña" required onChange={handleChange} className="sm:col-span-2 px-3 py-2 border border-slate-300 rounded-lg" />

                    <button type="submit" className="sm:col-span-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 cursor-pointer">
                        <UserPlus size={18} />
                        Crear Cuenta
                    </button>
                </form>

                <p className="text-center text-sm text-slate-600 mt-5">
                    ¿Ya tienes cuenta?{' '}
                    <Link to="/login" className="text-orange-600 font-semibold hover:underline">Inicia sesión</Link>
                </p>
            </div>
        </div>
    );
}