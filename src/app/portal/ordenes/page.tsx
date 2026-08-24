import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ShoppingCart, Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default async function OrdenesPortal() {
  const session = await getSession();
  if (!session || session.user?.rol !== 'PROVEEDOR') {
    redirect('/');
  }

  const proveedorId = session.user.proveedorId;

  const ordenes = await prisma.ordenCompra.findMany({
    where: { proveedorId },
    include: {
      items: {
        include: {
          producto: true
        }
      }
    },
    orderBy: { fechaEmision: 'desc' }
  });

  const formatearFecha = (fecha: Date) => {
    return new Intl.DateTimeFormat('es-CO', { 
      day: '2-digit', month: 'short', year: 'numeric' 
    }).format(fecha);
  };

  const calcularTotal = (items: any[]) => {
    return items.reduce((acc, item) => acc + (Number(item.precio) * item.cantidad), 0);
  };

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', currency: 'COP', minimumFractionDigits: 0 
    }).format(valor);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Mis Órdenes de Compra</h1>
        <p className="text-slate-500 mt-1">Aquí puedes revisar los pedidos emitidos por OncoCenter y reportar tus entregas.</p>
      </div>

      {ordenes.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-700">No hay órdenes asignadas</h2>
          <p className="text-slate-500">Aún no se ha emitido ninguna orden de compra para tu empresa.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {ordenes.map(oc => (
            <div key={oc.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
              {/* Resumen lateral */}
              <div className="bg-slate-50 md:w-64 p-5 md:border-r border-slate-200 border-b md:border-b-0 shrink-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-md tracking-wider">
                      OC-{oc.id.toString().padStart(4, '0')}
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-slate-800">Emisión</p>
                        <p>{formatearFecha(oc.fechaEmision)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-slate-800">Entrega Esperada</p>
                        <p>{formatearFecha(oc.fechaEsperada)}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-bold">Total Orden</p>
                  <p className="text-xl font-bold text-slate-800">{formatearMoneda(calcularTotal(oc.items))}</p>
                </div>
              </div>

              {/* Lista de Items */}
              <div className="p-5 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Productos Solicitados</h3>
                  <div className="flex items-center gap-2">
                    {oc.estado === 'EN_TIEMPO' && <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-1 rounded border border-emerald-100">En Tiempo</span>}
                    {oc.estado === 'EN_TRANSITO' && <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded border border-blue-100">En Tránsito</span>}
                    {oc.estado === 'RECIBIDA' && <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-1 rounded border border-slate-200">Recibida</span>}
                  </div>
                </div>

                <div className="space-y-3">
                  {oc.items.map((item, index) => (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                      <div className="mb-2 sm:mb-0">
                        <p className="font-bold text-sm text-slate-800">
                          <span className="text-slate-400 mr-2">{index + 1}.</span> 
                          {item.producto.nombre}
                        </p>
                        <p className="text-xs text-slate-500 ml-5 mt-0.5">Cód: {item.producto.codigo} | {item.producto.presentacion}</p>
                      </div>
                      <div className="flex items-center gap-6 ml-5 sm:ml-0 text-sm">
                        <div className="text-center">
                          <p className="text-xs text-slate-400 font-bold uppercase">Cant.</p>
                          <p className="font-bold text-slate-700">{item.cantidad}</p>
                        </div>
                        <div className="text-right w-24">
                          <p className="text-xs text-slate-400 font-bold uppercase">Subtotal</p>
                          <p className="font-bold text-slate-700">{formatearMoneda(Number(item.precio) * item.cantidad)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {oc.estado !== 'RECIBIDA' && (
                  <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                    <button className="text-sm bg-[#0EA5E9] hover:bg-[#0284c7] text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-colors">
                      Reportar Despacho
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
