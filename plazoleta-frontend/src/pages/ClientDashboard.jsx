import { useEffect, useState } from 'react';
import { Store, ShoppingCart, Plus, Minus, Trash2, Search, XCircle, History } from 'lucide-react';
import Navbar from '../components/Navbar';
import { plazoletaApi } from '../api/axiosConfig';

export default function ClientDashboard() {
    const [tab, setTab] = useState('pedir');
    const [msg, setMsg] = useState({ type: '', text: '' });

    // HU-09: Restaurantes
    const [restaurantes, setRestaurantes] = useState([]);
    const [restauranteSeleccionado, setRestauranteSeleccionado] = useState(null);

    // HU-10: Menú por restaurante
    const [categoria, setCategoria] = useState('');
    const [platos, setPlatos] = useState([]);

    // HU-11: Carrito y pedido
    const [carrito, setCarrito] = useState([]);
    const [ultimoPedido, setUltimoPedido] = useState(null);
    const [loadingPedido, setLoadingPedido] = useState(false);

    // HU-16 y HU-17: Gestión de pedido por ID
    const [idPedidoConsulta, setIdPedidoConsulta] = useState('');
    const [trazabilidad, setTrazabilidad] = useState([]);

    const showMsg = (type, text) => setMsg({ type, text });

    useEffect(() => {
        plazoletaApi.get('/restaurantes', { params: { page: 0, size: 20 } })
            .then(({ data }) => setRestaurantes(data))
            .catch(() => {});
    }, []);

    const cargarMenu = async (idRest, cat = categoria) => {
        setMsg({ type: '', text: '' });
        try {
            const params = { page: 0, size: 20 };
            if (cat.trim()) params.categoria = cat.trim();
            const { data } = await plazoletaApi.get(`/platos/restaurante/${idRest}`, { params });
            setPlatos(data);
            if (data.length === 0) showMsg('err', 'No se encontraron platos activos para ese restaurante/categoría.');
        } catch (err) {
            showMsg('err', err.response?.data?.message || 'Error al cargar el menú.');
        }
    };

    const seleccionarRestaurante = (restaurante) => {
        if (restauranteSeleccionado && restauranteSeleccionado.id !== restaurante.id && carrito.length > 0) {
            setCarrito([]);
        }
        setRestauranteSeleccionado(restaurante);
        setCategoria('');
        cargarMenu(restaurante.id, '');
    };

    const handleFiltrarCategoria = (e) => {
        e.preventDefault();
        if (!restauranteSeleccionado) return;
        cargarMenu(restauranteSeleccionado.id, categoria);
    };

    const agregarAlCarrito = (plato) => {
        setCarrito((prev) => {
            const existe = prev.find((item) => item.id === plato.id);
            if (existe) {
                return prev.map((item) => item.id === plato.id ? { ...item, cantidad: item.cantidad + 1 } : item);
            }
            return [...prev, { ...plato, cantidad: 1 }];
        });
    };

    const cambiarCantidad = (idPlato, delta) => {
        setCarrito((prev) =>
            prev
                .map((item) => item.id === idPlato ? { ...item, cantidad: item.cantidad + delta } : item)
                .filter((item) => item.cantidad > 0)
        );
    };

    const realizarPedido = async () => {
        if (carrito.length === 0 || !restauranteSeleccionado) return;
        setMsg({ type: '', text: '' });
        setLoadingPedido(true);
        try {
            const payload = {
                idRestaurante: restauranteSeleccionado.id,
                platos: carrito.map((item) => ({ idPlato: item.id, cantidad: item.cantidad })),
            };
            const { data } = await plazoletaApi.post('/pedidos', payload);
            setUltimoPedido(data);
            setIdPedidoConsulta(String(data.id));
            setCarrito([]);
            showMsg('ok', `¡Pedido #${data.id} creado con éxito! Estado: ${data.estado}`);
        } catch (err) {
            showMsg('err', err.response?.data?.message || 'No se pudo crear el pedido.');
        } finally {
            setLoadingPedido(false);
        }
    };

    const consultarTrazabilidad = async (e) => {
        e.preventDefault();
        setMsg({ type: '', text: '' });
        try {
            const { data } = await plazoletaApi.get(`/pedidos/${idPedidoConsulta}/trazabilidad`);
            setTrazabilidad(data);
            if (data.length === 0) showMsg('err', 'No hay registros de trazabilidad para este pedido.');
        } catch (err) {
            showMsg('err', err.response?.data?.message || 'Error al consultar trazabilidad.');
        }
    };

    const cancelarPedido = async () => {
        if (!idPedidoConsulta) return;
        setMsg({ type: '', text: '' });
        try {
            const { data } = await plazoletaApi.patch(`/pedidos/${idPedidoConsulta}/cancelar`);
            showMsg('ok', `Pedido #${data.id} cancelado correctamente (Estado: ${data.estado}).`);
        } catch (err) {
            showMsg('err', err.response?.data?.message || 'Solo puedes cancelar pedidos en estado PENDIENTE.');
        }
    };

    const totalCarrito = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

    return (
        <div className="min-h-screen bg-slate-100">
            <Navbar />
            <main className="max-w-5xl mx-auto p-6">
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => { setTab('pedir'); setMsg({ type: '', text: '' }); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm cursor-pointer ${
                            tab === 'pedir' ? 'bg-orange-500 text-white' : 'bg-white text-slate-700 border border-slate-200'
                        }`}
                    >
                        <Store size={16} /> Restaurantes y Menú (HU-09/10/11)
                    </button>
                    <button
                        onClick={() => { setTab('mis-pedidos'); setMsg({ type: '', text: '' }); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm cursor-pointer ${
                            tab === 'mis-pedidos' ? 'bg-orange-500 text-white' : 'bg-white text-slate-700 border border-slate-200'
                        }`}
                    >
                        <History size={16} /> Trazabilidad / Cancelar (HU-16/17)
                    </button>
                </div>

                {msg.text && (
                    <div className={`p-3 rounded-lg mb-4 text-sm border ${
                        msg.type === 'ok' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                        {msg.text}
                    </div>
                )}

                {tab === 'pedir' ? (
                    <div className="space-y-6">
                        {/* Lista de Restaurantes interactiva (HU-09) */}
                        <div className="bg-white rounded-2xl shadow p-5">
                            <h2 className="text-lg font-bold text-slate-800 mb-1">Restaurantes disponibles</h2>
                            <p className="text-xs text-slate-500 mb-4">Haz clic en un restaurante para ver su menú.</p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {restaurantes.map((r) => {
                                    const activo = restauranteSeleccionado?.id === r.id;
                                    return (
                                        <button
                                            key={r.id}
                                            onClick={() => seleccionarRestaurante(r)}
                                            className={`border rounded-xl p-3 flex flex-col items-center text-center transition cursor-pointer ${
                                                activo
                                                    ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200'
                                                    : 'border-slate-200 hover:border-orange-300 hover:bg-slate-50'
                                            }`}
                                        >
                                            <img src={r.urlLogo} alt={r.nombre} className="w-16 h-16 object-cover rounded-full mb-2 bg-slate-100" />
                                            <span className="text-sm font-semibold text-slate-800">{r.nombre}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Menú del restaurante seleccionado (HU-10) */}
                        {restauranteSeleccionado && (
                            <div className="bg-white rounded-2xl shadow p-5">
                                <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
                                    <h2 className="text-lg font-bold text-slate-800">
                                        Menú de <span className="text-orange-600">{restauranteSeleccionado.nombre}</span>
                                    </h2>
                                    <form onSubmit={handleFiltrarCategoria} className="flex gap-2">
                                        <input
                                            value={categoria}
                                            onChange={(e) => setCategoria(e.target.value)}
                                            placeholder="Filtrar por categoría..."
                                            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm w-48"
                                        />
                                        <button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 cursor-pointer">
                                            <Search size={15} /> Filtrar
                                        </button>
                                    </form>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {platos.map((plato) => (
                                        <div key={plato.id} className="border border-slate-200 rounded-xl p-4 flex gap-4 items-center">
                                            <img src={plato.urlImagen} alt={plato.nombre} className="w-20 h-20 object-cover rounded-lg bg-slate-100" />
                                            <div className="flex-1">
                                                <span className="text-xs font-semibold text-orange-600">{plato.categoria}</span>
                                                <h3 className="font-bold text-slate-800">{plato.nombre}</h3>
                                                <p className="text-xs text-slate-500 line-clamp-2">{plato.descripcion}</p>
                                                <div className="flex justify-between items-center mt-2">
                                                    <span className="font-bold text-slate-900">${plato.precio.toLocaleString()}</span>
                                                    <button
                                                        onClick={() => agregarAlCarrito(plato)}
                                                        className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer"
                                                    >
                                                        + Agregar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Carrito (HU-11) */}
                        {carrito.length > 0 && restauranteSeleccionado && (
                            <div className="bg-white rounded-2xl shadow p-5 border-2 border-orange-200">
                                <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                                    <ShoppingCart size={18} /> Tu Pedido ({restauranteSeleccionado.nombre})
                                </h2>
                                <div className="space-y-2 mb-4">
                                    {carrito.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between border-b border-slate-100 pb-2">
                                            <div>
                                                <p className="font-medium text-slate-800">{item.nombre}</p>
                                                <p className="text-xs text-slate-500">${item.precio.toLocaleString()} c/u</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => cambiarCantidad(item.id, -1)} className="p-1 bg-slate-100 rounded hover:bg-slate-200 cursor-pointer"><Minus size={14} /></button>
                                                <span className="font-bold text-sm w-6 text-center">{item.cantidad}</span>
                                                <button onClick={() => cambiarCantidad(item.id, 1)} className="p-1 bg-slate-100 rounded hover:bg-slate-200 cursor-pointer"><Plus size={14} /></button>
                                                <button onClick={() => cambiarCantidad(item.id, -item.cantidad)} className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer"><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-slate-800">Total: ${totalCarrito.toLocaleString()}</span>
                                    <button
                                        onClick={realizarPedido}
                                        disabled={loadingPedido}
                                        className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold px-6 py-2.5 rounded-lg cursor-pointer"
                                    >
                                        {loadingPedido ? 'Enviando...' : 'Confirmar Pedido'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {ultimoPedido && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                                Último pedido creado: <strong>#{ultimoPedido.id}</strong> — Estado: <strong>{ultimoPedido.estado}</strong>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow p-6 space-y-5">
                        <h2 className="text-lg font-bold text-slate-800">Consultar o Cancelar Pedido</h2>
                        <form onSubmit={consultarTrazabilidad} className="flex flex-wrap gap-3">
                            <input
                                type="number"
                                value={idPedidoConsulta}
                                onChange={(e) => setIdPedidoConsulta(e.target.value)}
                                placeholder="ID del Pedido"
                                required
                                className="px-3 py-2 border border-slate-300 rounded-lg w-48"
                            />
                            <button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer">
                                Ver Trazabilidad (HU-17)
                            </button>
                            <button type="button" onClick={cancelarPedido} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 cursor-pointer">
                                <XCircle size={16} /> Cancelar Pedido (HU-16)
                            </button>
                        </form>

                        {trazabilidad.length > 0 && (
                            <div className="space-y-2 mt-4">
                                <h3 className="font-semibold text-slate-700 text-sm">Historial de estados:</h3>
                                {trazabilidad.map((t, i) => (
                                    <div key={i} className="border border-slate-200 rounded-lg p-3 text-sm flex justify-between">
                                        <span><strong>{t.estadoAnterior || 'INICIO'}</strong> → <strong className="text-orange-600">{t.estadoNuevo}</strong></span>
                                        <span className="text-slate-500 text-xs">{t.fecha}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}