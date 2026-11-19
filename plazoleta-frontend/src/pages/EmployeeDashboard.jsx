import { useState } from 'react';
import { ClipboardList, ChefHat, CheckCircle2, PackageCheck } from 'lucide-react';
import Navbar from '../components/Navbar';
import { plazoletaApi } from '../api/axiosConfig';

export default function EmployeeDashboard() {
    const [idRestaurante, setIdRestaurante] = useState('3');
    const [estado, setEstado] = useState('PENDIENTE');
    const [pedidos, setPedidos] = useState([]);
    const [pins, setPins] = useState({});
    const [msg, setMsg] = useState({ type: '', text: '' });

    const showMsg = (type, text) => setMsg({ type, text });

    const cargarPedidos = async (e) => {
        if (e) e.preventDefault();
        setMsg({ type: '', text: '' });
        try {
            const params = { idRestaurante: Number(idRestaurante), page: 0, size: 20 };
            if (estado) params.estado = estado;
            const { data } = await plazoletaApi.get('/pedidos', { params });
            setPedidos(data);
            if (data.length === 0) showMsg('err', `No hay pedidos en estado ${estado || 'TODOS'}.`);
        } catch (err) {
            showMsg('err', err.response?.data?.message || 'Error al listar pedidos.');
        }
    };

    const asignarPedido = async (id) => {
        try {
            await plazoletaApi.patch(`/pedidos/${id}/asignar`);
            showMsg('ok', `Te asignaste al pedido #${id} (EN_PREPARACION).`);
            cargarPedidos();
        } catch (err) {
            showMsg('err', err.response?.data?.message || 'Error al asignar el pedido.');
        }
    };

    const marcarListo = async (id) => {
        try {
            const { data } = await plazoletaApi.patch(`/pedidos/${id}/listo`);
            showMsg('ok', `Pedido #${id} marcado como LISTO.${data?.pin ? ` PIN generado: ${data.pin}` : ''}`);
            cargarPedidos();
        } catch (err) {
            showMsg('err', err.response?.data?.message || 'Error al marcar como listo.');
        }
    };

    const entregarPedido = async (id) => {
        const pin = pins[id];
        if (!pin) {
            showMsg('err', 'Ingresa el PIN de seguridad para entregar el pedido.');
            return;
        }
        try {
            await plazoletaApi.patch(`/pedidos/${id}/entregar`, null, { params: { pin } });
            showMsg('ok', `Pedido #${id} ENTREGADO con éxito.`);
            cargarPedidos();
        } catch (err) {
            showMsg('err', err.response?.data?.message || 'PIN incorrecto o error al entregar.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-100">
            <Navbar />
            <main className="max-w-4xl mx-auto p-6 space-y-6">
                <div className="bg-white rounded-2xl shadow p-5">
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <ClipboardList size={20} /> Gestión de Pedidos (HU-12 a HU-15)
                    </h2>

                    <form onSubmit={cargarPedidos} className="flex flex-wrap gap-3">
                        <input
                            type="number"
                            value={idRestaurante}
                            onChange={(e) => setIdRestaurante(e.target.value)}
                            placeholder="ID Restaurante"
                            required
                            className="px-3 py-2 border border-slate-300 rounded-lg w-40"
                        />
                        <select
                            value={estado}
                            onChange={(e) => setEstado(e.target.value)}
                            className="px-3 py-2 border border-slate-300 rounded-lg"
                        >
                            <option value="PENDIENTE">PENDIENTE</option>
                            <option value="EN_PREPARACION">EN_PREPARACION</option>
                            <option value="LISTO">LISTO</option>
                            <option value="ENTREGADO">ENTREGADO</option>
                            <option value="CANCELADO">CANCELADO</option>
                        </select>
                        <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2 rounded-lg cursor-pointer">
                            Buscar Pedidos
                        </button>
                    </form>
                </div>

                {msg.text && (
                    <div className={`p-3 rounded-lg text-sm border ${
                        msg.type === 'ok' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                        {msg.text}
                    </div>
                )}

                <div className="space-y-4">
                    {pedidos.map((p) => (
                        <div key={p.id} className="bg-white rounded-2xl shadow p-5 flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-800 text-lg">Pedido #{p.id}</span>
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700">{p.estado}</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    Cliente ID: {p.idCliente} {p.idChef ? `| Chef ID: ${p.idChef}` : ''} {p.pin ? `| PIN: ${p.pin}` : ''}
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                {p.estado === 'PENDIENTE' && (
                                    <button onClick={() => asignarPedido(p.id)} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer">
                                        <ChefHat size={15} /> Asignarme (HU-13)
                                    </button>
                                )}

                                {p.estado === 'EN_PREPARACION' && (
                                    <button onClick={() => marcarListo(p.id)} className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer">
                                        <CheckCircle2 size={15} /> Marcar LISTO (HU-14)
                                    </button>
                                )}

                                {p.estado === 'LISTO' && (
                                    <div className="flex items-center gap-2">
                                        <input
                                            value={pins[p.id] || ''}
                                            onChange={(e) => setPins({ ...pins, [p.id]: e.target.value })}
                                            placeholder="PIN"
                                            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs w-24"
                                        />
                                        <button onClick={() => entregarPedido(p.id)} className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer">
                                            <PackageCheck size={15} /> Entregar (HU-15)
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}