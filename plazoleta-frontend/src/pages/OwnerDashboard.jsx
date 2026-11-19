import { useState } from 'react';
import { Utensils, UserPlus, BarChart3, Edit3, Power } from 'lucide-react';
import Navbar from '../components/Navbar';
import { usuariosApi, plazoletaApi } from '../api/axiosConfig';

export default function OwnerDashboard() {
    const [tab, setTab] = useState('crear-plato');
    const [msg, setMsg] = useState({ type: '', text: '' });

    // HU-03: Crear Plato
    const [platoForm, setPlatoForm] = useState({
        nombre: '', precio: '', descripcion: '', urlImagen: '', categoria: '', idRestaurante: '',
    });

    // HU-04 y HU-07: Editar / Estado de Plato
    const [editForm, setEditForm] = useState({ idPlato: '', precio: '', descripcion: '' });
    const [estadoForm, setEstadoForm] = useState({ idPlato: '', activo: true });

    // HU-06: Crear Empleado
    const [empForm, setEmpForm] = useState({
        nombre: '', apellido: '', documentoDeIdentidad: '', celular: '',
        fechaNacimiento: '', correo: '', clave: '', idRestaurante: '',
    });

    // HU-18: Eficiencia
    const [idRestauranteEficiencia, setIdRestauranteEficiencia] = useState('1');
    const [eficiencia, setEficiencia] = useState(null);

    const showMsg = (type, text) => setMsg({ type, text });

    const handleCrearPlato = async (e) => {
        e.preventDefault();
        setMsg({ type: '', text: '' });
        try {
            await plazoletaApi.post('/platos', {
                ...platoForm,
                precio: Number(platoForm.precio),
                idRestaurante: Number(platoForm.idRestaurante),
            });
            showMsg('ok', 'Plato creado correctamente.');
            setPlatoForm({ nombre: '', precio: '', descripcion: '', urlImagen: '', categoria: '', idRestaurante: '' });
        } catch (err) {
            showMsg('err', err.response?.data?.message || 'Error al crear el plato.');
        }
    };

    const handleEditarPlato = async (e) => {
        e.preventDefault();
        setMsg({ type: '', text: '' });
        try {
            await plazoletaApi.put(`/platos/${editForm.idPlato}`, {
                precio: Number(editForm.precio),
                descripcion: editForm.descripcion,
            });
            showMsg('ok', `Plato #${editForm.idPlato} actualizado.`);
        } catch (err) {
            showMsg('err', err.response?.data?.message || 'Error al modificar el plato.');
        }
    };

    const handleEstadoPlato = async (e) => {
        e.preventDefault();
        setMsg({ type: '', text: '' });
        try {
            await plazoletaApi.patch(`/platos/${estadoForm.idPlato}/estado`, { activo: estadoForm.activo });
            showMsg('ok', `Plato #${estadoForm.idPlato} marcado como ${estadoForm.activo ? 'ACTIVO' : 'INACTIVO'}.`);
        } catch (err) {
            showMsg('err', err.response?.data?.message || 'Error al cambiar estado del plato.');
        }
    };

    const handleCrearEmpleado = async (e) => {
        e.preventDefault();
        setMsg({ type: '', text: '' });
        try {
            const { data } = await usuariosApi.post('/usuarios/empleado', {
                ...empForm,
                idRestaurante: empForm.idRestaurante ? Number(empForm.idRestaurante) : undefined,
            });
            showMsg('ok', `Empleado registrado correctamente${data?.id ? ` (ID: ${data.id})` : ''}.`);
            setEmpForm({ nombre: '', apellido: '', documentoDeIdentidad: '', celular: '', fechaNacimiento: '', correo: '', clave: '', idRestaurante: '' });
        } catch (err) {
            showMsg('err', err.response?.data?.message || 'Error al crear empleado.');
        }
    };

    const cargarEficiencia = async (e) => {
        if (e) e.preventDefault();
        if (!idRestauranteEficiencia) {
            showMsg('err', 'Ingresa el ID del restaurante.');
            return;
        }
        setMsg({ type: '', text: '' });
        try {
            const { data } = await plazoletaApi.get('/pedidos/eficiencia', {
                params: { idRestaurante: Number(idRestauranteEficiencia) },
            });
            setEficiencia(data);
        } catch (err) {
            setEficiencia(null);
            showMsg('err', err.response?.data?.message || 'No se pudo cargar la eficiencia.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-100">
            <Navbar />
            <main className="max-w-4xl mx-auto p-6">
                <div className="flex flex-wrap gap-2 mb-6">
                    {[
                        { id: 'crear-plato', label: 'Crear Plato (HU-03)', icon: Utensils },
                        { id: 'gestion-plato', label: 'Editar / Estado (HU-04/07)', icon: Edit3 },
                        { id: 'empleado', label: 'Crear Empleado (HU-06)', icon: UserPlus },
                        { id: 'eficiencia', label: 'Eficiencia (HU-18)', icon: BarChart3 },
                    ].map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => { setTab(id); setMsg({ type: '', text: '' }); if (id === 'eficiencia') cargarEficiencia(); }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm cursor-pointer ${
                                tab === id ? 'bg-orange-500 text-white' : 'bg-white text-slate-700 border border-slate-200'
                            }`}
                        >
                            <Icon size={16} /> {label}
                        </button>
                    ))}
                </div>

                {msg.text && (
                    <div className={`p-3 rounded-lg mb-4 text-sm border ${
                        msg.type === 'ok' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                        {msg.text}
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow p-6">
                    {tab === 'crear-plato' && (
                        <form onSubmit={handleCrearPlato} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <h2 className="sm:col-span-2 text-lg font-bold text-slate-800">Nuevo Plato</h2>
                            <input value={platoForm.nombre} onChange={(e) => setPlatoForm({ ...platoForm, nombre: e.target.value })} placeholder="Nombre del plato" required className="px-3 py-2 border border-slate-300 rounded-lg" />
                            <input value={platoForm.precio} onChange={(e) => setPlatoForm({ ...platoForm, precio: e.target.value })} type="number" placeholder="Precio (entero > 0)" required className="px-3 py-2 border border-slate-300 rounded-lg" />
                            <input value={platoForm.categoria} onChange={(e) => setPlatoForm({ ...platoForm, categoria: e.target.value })} placeholder="Categoría (Ej: Hamburguesas)" required className="px-3 py-2 border border-slate-300 rounded-lg" />
                            <input value={platoForm.idRestaurante} onChange={(e) => setPlatoForm({ ...platoForm, idRestaurante: e.target.value })} type="number" placeholder="ID del Restaurante" required className="px-3 py-2 border border-slate-300 rounded-lg" />
                            <input value={platoForm.urlImagen} onChange={(e) => setPlatoForm({ ...platoForm, urlImagen: e.target.value })} placeholder="URL de la imagen" required className="sm:col-span-2 px-3 py-2 border border-slate-300 rounded-lg" />
                            <textarea value={platoForm.descripcion} onChange={(e) => setPlatoForm({ ...platoForm, descripcion: e.target.value })} placeholder="Descripción del plato" required className="sm:col-span-2 px-3 py-2 border border-slate-300 rounded-lg" />
                            <button type="submit" className="sm:col-span-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg cursor-pointer">Guardar Plato</button>
                        </form>
                    )}

                    {tab === 'gestion-plato' && (
                        <div className="space-y-8">
                            <form onSubmit={handleEditarPlato} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <h2 className="sm:col-span-2 text-lg font-bold text-slate-800">Modificar Precio y Descripción (HU-04)</h2>
                                <input value={editForm.idPlato} onChange={(e) => setEditForm({ ...editForm, idPlato: e.target.value })} type="number" placeholder="ID del Plato" required className="px-3 py-2 border border-slate-300 rounded-lg" />
                                <input value={editForm.precio} onChange={(e) => setEditForm({ ...editForm, precio: e.target.value })} type="number" placeholder="Nuevo Precio" required className="px-3 py-2 border border-slate-300 rounded-lg" />
                                <textarea value={editForm.descripcion} onChange={(e) => setEditForm({ ...editForm, descripcion: e.target.value })} placeholder="Nueva Descripción" required className="sm:col-span-2 px-3 py-2 border border-slate-300 rounded-lg" />
                                <button type="submit" className="sm:col-span-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg cursor-pointer">Actualizar Plato</button>
                            </form>

                            <hr className="border-slate-200" />

                            <form onSubmit={handleEstadoPlato} className="flex flex-wrap items-center gap-4">
                                <h2 className="w-full text-lg font-bold text-slate-800 flex items-center gap-2"><Power size={18} /> Habilitar / Deshabilitar Plato (HU-07)</h2>
                                <input value={estadoForm.idPlato} onChange={(e) => setEstadoForm({ ...estadoForm, idPlato: e.target.value })} type="number" placeholder="ID del Plato" required className="px-3 py-2 border border-slate-300 rounded-lg" />
                                <select value={estadoForm.activo} onChange={(e) => setEstadoForm({ ...estadoForm, activo: e.target.value === 'true' })} className="px-3 py-2 border border-slate-300 rounded-lg">
                                    <option value="true">Habilitar (Activo)</option>
                                    <option value="false">Deshabilitar (Inactivo)</option>
                                </select>
                                <button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white font-semibold px-5 py-2 rounded-lg cursor-pointer">Cambiar Estado</button>
                            </form>
                        </div>
                    )}

                    {tab === 'empleado' && (
                        <form onSubmit={handleCrearEmpleado} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <h2 className="sm:col-span-2 text-lg font-bold text-slate-800">Nuevo Empleado (HU-06)</h2>
                            <input value={empForm.nombre} onChange={(e) => setEmpForm({ ...empForm, nombre: e.target.value })} placeholder="Nombre" required className="px-3 py-2 border border-slate-300 rounded-lg" />
                            <input value={empForm.apellido} onChange={(e) => setEmpForm({ ...empForm, apellido: e.target.value })} placeholder="Apellido" required className="px-3 py-2 border border-slate-300 rounded-lg" />
                            <input value={empForm.documentoDeIdentidad} onChange={(e) => setEmpForm({ ...empForm, documentoDeIdentidad: e.target.value })} placeholder="Documento" required className="px-3 py-2 border border-slate-300 rounded-lg" />
                            <input value={empForm.celular} onChange={(e) => setEmpForm({ ...empForm, celular: e.target.value })} placeholder="Celular (+57300...)" required className="px-3 py-2 border border-slate-300 rounded-lg" />
                            <input value={empForm.fechaNacimiento} onChange={(e) => setEmpForm({ ...empForm, fechaNacimiento: e.target.value })} type="date" required className="px-3 py-2 border border-slate-300 rounded-lg" />
                            <input value={empForm.correo} onChange={(e) => setEmpForm({ ...empForm, correo: e.target.value })} type="email" placeholder="Correo" required className="px-3 py-2 border border-slate-300 rounded-lg" />
                            <input value={empForm.clave} onChange={(e) => setEmpForm({ ...empForm, clave: e.target.value })} type="password" placeholder="Contraseña" required className="px-3 py-2 border border-slate-300 rounded-lg" />
                            <input value={empForm.idRestaurante} onChange={(e) => setEmpForm({ ...empForm, idRestaurante: e.target.value })} type="number" placeholder="ID Restaurante (opcional)" className="px-3 py-2 border border-slate-300 rounded-lg" />
                            <button type="submit" className="sm:col-span-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg cursor-pointer">Registrar Empleado</button>
                        </form>
                    )}

                    {tab === 'eficiencia' && (
                        <div>
                            <form onSubmit={cargarEficiencia} className="flex flex-wrap justify-between items-center gap-3 mb-6">
                                <h2 className="text-lg font-bold text-slate-800">Métricas de Eficiencia (HU-18)</h2>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={idRestauranteEficiencia}
                                        onChange={(e) => setIdRestauranteEficiencia(e.target.value)}
                                        placeholder="ID Restaurante"
                                        required
                                        className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm w-36"
                                    />
                                    <button
                                        type="submit"
                                        className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-1.5 rounded-lg cursor-pointer"
                                    >
                                        Consultar
                                    </button>
                                </div>
                            </form>

                            {eficiencia ? (
                                <div className="space-y-6">
                                    {/* Tarjetas resumen */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                                            <p className="text-xs font-semibold text-orange-700 uppercase">Restaurante</p>
                                            <p className="text-2xl font-bold text-slate-800 mt-1">#{eficiencia.idRestaurante}</p>
                                        </div>
                                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                            <p className="text-xs font-semibold text-blue-700 uppercase">Pedidos Medidos</p>
                                            <p className="text-2xl font-bold text-slate-800 mt-1">
                                                {eficiencia.tiemposPorPedido?.length || 0}
                                            </p>
                                        </div>
                                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                            <p className="text-xs font-semibold text-green-700 uppercase">Empleados en Ranking</p>
                                            <p className="text-2xl font-bold text-slate-800 mt-1">
                                                {eficiencia.rankingEmpleados?.length || 0}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Tabla 1: Ranking de Empleados */}
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-700 mb-2">🏆 Ranking de Empleados</h3>
                                        <div className="overflow-x-auto border border-slate-200 rounded-xl">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                                                <tr>
                                                    <th className="px-4 py-3">#</th>
                                                    <th className="px-4 py-3">ID Empleado</th>
                                                    <th className="px-4 py-3">Pedidos Completados</th>
                                                    <th className="px-4 py-3">Tiempo Promedio</th>
                                                </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200">
                                                {eficiencia.rankingEmpleados?.map((emp, idx) => (
                                                    <tr key={emp.idEmpleado} className="hover:bg-slate-50">
                                                        <td className="px-4 py-3 font-bold text-orange-600">#{idx + 1}</td>
                                                        <td className="px-4 py-3 font-medium text-slate-800">Empleado #{emp.idEmpleado}</td>
                                                        <td className="px-4 py-3">{emp.pedidosCompletados}</td>
                                                        <td className="px-4 py-3 font-semibold text-slate-700">
                                                            {emp.promedioMinutos} min <span className="text-xs text-slate-400">({emp.promedioSegundos}s)</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Tabla 2: Detalle por Pedido */}
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-700 mb-2">⏱️ Tiempos por Pedido</h3>
                                        <div className="overflow-x-auto border border-slate-200 rounded-xl">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                                                <tr>
                                                    <th className="px-4 py-3">ID Pedido</th>
                                                    <th className="px-4 py-3">ID Empleado</th>
                                                    <th className="px-4 py-3">Estado Final</th>
                                                    <th className="px-4 py-3">Duración</th>
                                                </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200">
                                                {eficiencia.tiemposPorPedido?.map((ped) => (
                                                    <tr key={ped.idPedido} className="hover:bg-slate-50">
                                                        <td className="px-4 py-3 font-medium text-slate-800">Pedido #{ped.idPedido}</td>
                                                        <td className="px-4 py-3">Empleado #{ped.idEmpleado}</td>
                                                        <td className="px-4 py-3">
                                                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                                                    {ped.estadoFinal}
                                                                </span>
                                                        </td>
                                                        <td className="px-4 py-3 font-semibold text-slate-700">
                                                            {ped.duracionMinutos} min <span className="text-xs text-slate-400">({ped.duracionSegundos}s)</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500">Sin datos de eficiencia disponibles todavía.</p>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}