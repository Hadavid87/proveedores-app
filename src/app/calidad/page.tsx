import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Activity, Clock, FileText, AlertTriangle, Search, Plus } from 'lucide-react';

export default async function AdminCapa() {
  const session = await getSession();
  if (!session || session.user?.rol === 'PROVEEDOR') {
    redirect('/portal');
  }

  const tickets = await prisma.capaTicket.findMany({
    include: { proveedor: true },
    orderBy: { fechaGeneracion: 'desc' }
  });

  const formatearFecha = (fecha: Date) => {
    return new Intl.DateTimeFormat('es-CO', { 
      day: '2-digit', month: 'short', year: 'numeric' 
    }).format(fecha);
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight text-[#0F172A]">Control de Calidad (CAPA)</h1>
          <p className="text-sm text-slate-500 mt-1.5 font-medium">
            Acciones Correctivas y Preventivas por no conformidades de proveedores.
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <button className="bg-[#0F172A] hover:bg-[#0F172A]/90 text-white font-semibold shadow-sm rounded-lg h-10 px-5 flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Nueva No Conformidad
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar ticket, proveedor..." 
              className="pl-9 h-10 w-full bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]"
            />
          </div>
        </div>
        
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-100 font-bold">
            <tr>
              <th className="px-6 py-4">Ticket</th>
              <th className="px-6 py-4">Proveedor</th>
              <th className="px-6 py-4">Fecha Hallazgo</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tickets.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">No hay tickets CAPA registrados.</td>
              </tr>
            ) : (
              tickets.map(ticket => (
                <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800">
                    CAPA-{ticket.id.toString().padStart(4, '0')}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">
                    {ticket.proveedor.razonSocial}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {formatearFecha(ticket.fechaGeneracion)}
                  </td>
                  <td className="px-6 py-4">
                    {ticket.estado === 'ABIERTO' && <span className="bg-rose-50 text-rose-700 text-xs font-bold px-2.5 py-1 rounded-md border border-rose-100">Esperando Acción</span>}
                    {ticket.estado === 'EN_REVISION' && <span className="bg-amber-50 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-md border border-amber-100">Plan Recibido</span>}
                    {ticket.estado === 'CERRADO' && <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-md border border-emerald-100">Cerrado</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-[#0EA5E9] hover:text-[#0284c7] font-bold text-xs bg-[#0EA5E9]/10 px-3 py-1.5 rounded-md transition-colors">
                      Revisar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
