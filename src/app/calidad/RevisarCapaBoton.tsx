'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { CheckCircle2, Clock } from 'lucide-react';

export function RevisarCapaBoton({ ticket, updateAction }: { ticket: any, updateAction: (id: number, estado: string) => Promise<void> }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCerrar = async () => {
    setIsSubmitting(true);
    try {
      await updateAction(ticket.id, 'CERRADO');
      setIsOpen(false);
    } catch(err) {
      alert('Error al actualizar ticket');
    }
    setIsSubmitting(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="text-[#0EA5E9] hover:text-[#0284c7] font-bold text-xs bg-[#0EA5E9]/10 px-3 py-1.5 rounded-md transition-colors"
      >
        Revisar
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold text-[#0F172A] flex items-center justify-between">
              <span>Ticket CAPA-{ticket.id.toString().padStart(4, '0')}</span>
              {ticket.estado === 'ABIERTO' && <span className="bg-rose-50 text-rose-700 text-xs font-bold px-2.5 py-1 rounded-md border border-rose-100">Esperando Acción</span>}
              {ticket.estado === 'EN_REVISION' && <span className="bg-amber-50 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-md border border-amber-100">Plan Recibido</span>}
              {ticket.estado === 'CERRADO' && <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-md border border-emerald-100">Cerrado</span>}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Proveedor Involucrado</label>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md font-semibold text-slate-800">
                {ticket.proveedor.razonSocial} (NIT: {ticket.proveedor.nit})
              </div>
            </div>
            
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Descripcin de la No Conformidad</label>
              <div className="p-3 bg-white border border-rose-100 rounded-md text-sm text-slate-700 whitespace-pre-wrap">
                {ticket.descripcion}
              </div>
            </div>

            {ticket.estado === 'EN_REVISION' && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm font-bold text-amber-800 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Respuesta del Proveedor recibida
                </p>
                <p className="text-xs text-amber-700">
                  El proveedor ha enviado su plan de acción correctiva. Revisa la documentación anexa (Simulada).
                </p>
                <button className="mt-3 text-xs bg-white border border-amber-300 text-amber-700 font-bold px-4 py-2 rounded-md hover:bg-amber-100 transition-colors">
                  Ver Plan de Acción (PDF)
                </button>
              </div>
            )}
            
            <DialogFooter className="pt-4 mt-6 border-t border-slate-100">
              <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-bold text-sm">
                Cerrar Panel
              </button>
              {ticket.estado !== 'CERRADO' && (
                <button 
                  onClick={handleCerrar} 
                  disabled={isSubmitting} 
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-bold text-sm flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isSubmitting ? 'Procesando...' : 'Aprobar y Cerrar Ticket'}
                </button>
              )}
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
