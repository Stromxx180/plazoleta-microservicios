import { useState } from 'react';
import { UserPlus, Store } from 'lucide-react';
import Navbar from '../components/Navbar';
import { usuariosApi, plazoletaApi } from '../api/axiosConfig';

export default function AdminDashboard() {
    const [tab, setTab] = useState('propietario');
    const [msg, setMsg] = useState({ type: '', text: '' });

    const [propForm, setPropForm] = useState({
        nombre: '', apellido: '', documentoDeIdentidad: '',
        celular: '', fechaNacimiento: '', correo: '', clave: '',
    });

    const [restForm, setRestForm] = useState({
        nombre: '', nit: '', direccion: '', telefono: '', urlLogo: '', idPropietario: '',
    });

    const showMsg = (type, text) => setMsg({ type, text });

    const handleCrearPropietario = async (e) => {
        e.preventDefault();
        setMsg({ type: '', text: '' });
        try {
            const { data } = await usuariosApi.post('/usuarios/propietario', propForm);
            showMsg('ok', `Propietario creado con éxito${data?.id ? ` (ID: ${data.id})` : ''}.`);
            setPropForm({ nombre: '', apellido: '', documentoDeIdentidad: '', celular: '', fechaNacimiento: '', correo: '', clave: '' });
        } catch (err) {
            showMsg('err', err.response?.data?.message || 'Error al crear propietario.');
        }
    };

    const handleCrearRestaurante = async (e) => {
        e.preventDefault();
        setMsg({ type: '', text: '' });
        try {
            await plazoletaApi.post('/restaurantes', {
                ...restForm,
                idPropietario: Number(restForm.idPropietario),
            });
            showMsg('ok', 'Restaurante creado con éxito.');
            setRestForm({ nombre: '', nit: '', direccion: '', telefono: '', urlLogo: '', idPropietario: '' });
        } catch (err) {
            showMsg('err', err.response?.data?.message || 'Error al crear restaurante.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-100">
            <Navbar />
            <main className="max-w-3xl mx-auto p-6">
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => { setTab('propietario'); setMsg({ type: '', text: '' }); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm cursor-pointer ${
                            tab === 'propietario' ? 'bg-orange-500 text-white' : 'bg-white text-slate-700 border border-slate-200'
                        }`}
                    >
                        <UserPlus size={18} /> Crear Propietario (HU-01)
                    </button>
                    <button
                        onClick={() => { setTab('restaurante'); setMsg({ type: '', text: '' }); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm cursor-pointer ${
                            tab === 'restaurante' ? 'bg-orange-500 text-white' : 'bg-white text-slate-700 border border-slate-200'
                        }`}
                    >
                        <Store size={18} /> Crear Restaurante (HU-02)
                    </button>
                </div>

                {msg.text && (
                    <div className={`p-3 rounded-lg mb-4 text-sm border ${
                        msg.type === 'ok' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                        {msg.text}
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow p-6">
                    {tab === 'propietario' ? (
                        <form onSubmit={handleCrearPropietario} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <h2 className="sm:col-span-2 text-lg font-bold text-slate-800">Nuevo Propietario</h2>
                            <input value={propForm.nombre} onChange={(e) => setPropForm({ ...propForm, nombre: e.target.value })} placeholder="Nombre" required className="px-3 py-2 border border-slate-300 rounded-lg" />
                            <input value={propForm.apellido} onChange={(e) => setPropForm({ ...propForm, apellido: e.target.value })} placeholder="Apellido" required className="px-3 py-2 border border-slate-300 rounded-lg" />
                            <input value={propForm.documentoDeIdentidad} onChange={(e) => setPropForm({ ...propForm, documentoDeIdentidad: e.target.value })} placeholder="Documento (solo números)" required className="px-3 py-2 border border-slate-300 rounded-lg" />
                            <input value={propForm.celular} onChange={(e) => setPropForm({ ...propForm, celular: e.target.value })} placeholder="Celular (+573001234567)" required className="px-3 py-2 border border-slate-300 rounded-lg" />
                            <input value={propForm.fechaNacimiento} onChange={(e) => setPropForm({ ...propForm, fechaNacimiento: e.target.value })} type="date" required className="px-3 py-2 border border-slate-300 rounded-lg" />
                            <input value={propForm.correo} onChange={(e) => setPropForm({ ...propForm, correo: e.target.value })} type="email" placeholder="Correo electrónico" required className="px-3 py-2 border border-slate-300 rounded-lg" />
                            <input value={propForm.clave} onChange={(e) => setPropForm({ ...propForm, clave: e.target.value })} type="password" placeholder="Contraseña" required className="sm:col-span-2 px-3 py-2 border border-slate-300 rounded-lg" />
                            <button type="submit" className="sm:col-span-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg cursor-pointer">
                                Registrar Propietario
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleCrearRestaurante} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <h2 className="sm:col-span-2 text-lg font-bold text-slate-800">Nuevo Restaurante</h2>
                            <input value={restForm.nombre} onChange={(e) => setRestForm({ ...restForm, nombre: e.target.value })} placeholder="Nombre del restaurante" required className="px-3 py-2 border border-slate-300 rounded-lg" />
                            <input value={restForm.nit} onChange={(e) => setRestForm({ ...restForm, nit: e.target.value })} placeholder="NIT (solo números)" required className="px-3 py-2 border border-slate-300 rounded-lg" />
                            <input value={restForm.direccion} onChange={(e) => setRestForm({ ...restForm, direccion: e.target.value })} placeholder="Dirección" required className="px-3 py-2 border border-slate-300 rounded-lg" />
                            <input value={restForm.telefono} onChange={(e) => setRestForm({ ...restForm, telefono: e.target.value })} placeholder="Teléfono (+573001234567)" required className="px-3 py-2 border border-slate-300 rounded-lg" />
                            <input value={restForm.urlLogo} onChange={(e) => setRestForm({ ...restForm, urlLogo: e.target.value })} placeholder="URL del Logo (https://...)" required className="px-3 py-2 border border-slate-300 rounded-lg" />
                            <input value={restForm.idPropietario} onChange={(e) => setRestForm({ ...restForm, idPropietario: e.target.value })} type="number" placeholder="ID del Propietario" required className="px-3 py-2 border border-slate-300 rounded-lg" />
                            <button type="submit" className="sm:col-span-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg cursor-pointer">
                                Crear Restaurante
                            </button>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
}