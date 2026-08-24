import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Activity, Clock, CheckCircle2, FileText, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';

export default async function CapaPortal() {
  const session = await getSession();
  if (!session || session.user?.rol !== 'PROVEEDOR') {
    redirect('/');
  }

  const proveedorId = session.user.proveedorId;

  const tickets = await prisma.capaTicket.findMany({
    where: { proveedorId },
    orderBy: { fechaGeneracion: 'desc' }
  });

  const formatearFecha = (fecha: Date) => {
    return new Intl.DateTimeFormat('es-CO', { 
      day: '2-digit', month: 'short', year: 'numeric' 
    }).format(fecha);
  };

  async function actualizarEstado(formData: FormData) {
    'use server';
    const id = Number(formData.get('id'));
    const nuevoEstado = formData.get('estado') as string;
    
    await prisma.capaTicket.update({
      where: { id },
      data: { estado: nuevoEstado }
    });
    
    revalidatePath('/portal/capa');
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Acciones Correctivas (CAPA)</h1>
        <p className="text-slate-500 mt-1">Gestión de tickets por no conformidades y desvíos de calidad.</p>
      </div>

      {tickets.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-700">Sin hallazgos de calidad</h2>
          <p className="text-slate-500">Actualmente no tienes acciones correctivas ni preventivas abiertas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tickets.map(ticket => (
            <div key={ticket.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
              <div className="bg-slate-50 md:w-64 p-5 md:border-r border-slate-200 border-b md:border-b-0 shrink-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2.5 py-1 rounded-md tracking-wider flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> CAPA-{ticket.id.toString().padStart(4, '0')}
                    </span>
                  </div>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-slate-800">Fecha de Hallazgo</p>
                        <p>{formatearFecha(ticket.fechaGeneracion)}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-bold mb-1.5">Estado Actual</p>
                  {ticket.estado === 'ABIERTO' && <span className="bg-rose-50 text-rose-700 text-xs font-bold px-3 py-1.5 rounded-full border border-rose-200">Requiere Acción</span>}
                  {ticket.estado === 'EN_REVISION' && <span className="bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full border border-amber-200">En Revisión Clínica</span>}
                  {ticket.estado === 'CERRADO' && <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-200">Cerrado Exitosamente</span>}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide mb-3">Descripción de la No Conformidad</h3>
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 text-sm text-slate-700 whitespace-pre-wrap flex-1 mb-6">
                  {ticket.descripcion}
                </div>
                
                {ticket.estado === 'ABIERTO' && (
                  <div className="mt-auto border-t border-slate-100 pt-4">
                    <p className="text-xs text-slate-500 mb-3 font-semibold">Por favor, adjunta tu plan de acción y responde para revisión:</p>
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm">
                        <FileText className="w-4 h-4" />
                        Adjuntar Plan de Acción (PDF)
                        <input type="file" className="hidden" accept=".pdf" />
                      </label>
                      
                      <form action={actualizarEstado} className="inline-block">
                        <input type="hidden" name="id" value={ticket.id} />
                        <input type="hidden" name="estado" value="EN_REVISION" />
                        <button type="submit" className="text-sm bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-6 rounded-lg shadow-sm transition-colors">
                          Enviar Respuesta
                        </button>
                      </form>
                    </div>
                  </div>
                )}
                
                {ticket.estado === 'EN_REVISION' && (
                  <div className="mt-auto border-t border-slate-100 pt-4">
                    <p className="text-sm text-amber-600 font-semibold flex items-center gap-2 bg-amber-50 p-3 rounded-lg border border-amber-100">
                      <Clock className="w-5 h-5" /> Tu respuesta ha sido enviada. El equipo de Calidad de OncoCenter la está revisando.
                    </p>
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
