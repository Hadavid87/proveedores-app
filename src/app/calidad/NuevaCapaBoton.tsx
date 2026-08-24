'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

export function NuevaCapaBoton({ proveedores, createAction }: { proveedores: any[], createAction: (provId: number, desc: string) => Promise<void> }) {
  const [isOpen, setIsOpen] = useState(false);
  const [proveedorId, setProveedorId] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proveedorId || !descripcion) return;
    
    setIsSubmitting(true);
    try {
      await createAction(Number(proveedorId), descripcion);
      setIsOpen(false);
      setProveedorId('');
      setDescripcion('');
    } catch(err) {
      alert('Error al crear ticket');
    }
    setIsSubmitting(false);
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="bg-[#0F172A] hover:bg-[#0F172A]/90 text-white font-semibold shadow-sm rounded-lg h-10 px-5 flex items-center">
        <Plus className="w-4 h-4 mr-2" />
        Nueva No Conformidad
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold text-[#0F172A]">Generar Ticket CAPA</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500">Proveedor</label>
              <select 
                value={proveedorId}
                onChange={e => setProveedorId(e.target.value)}
                className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]"
                required
              >
                <option value="">Selecciona un proveedor...</option>
                {proveedores.map(p => (
                  <option key={p.id} value={p.id}>{p.razonSocial}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500">Descripcin del Hallazgo</label>
              <textarea 
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]"
                rows={4}
                required
                placeholder="Detalla la no conformidad encontrada..."
              />
            </div>
            
            <DialogFooter className="pt-4">
              <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-bold text-sm">
                Cancelar
              </button>
              <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-[#0EA5E9] hover:bg-[#0284c7] text-white rounded-md font-bold text-sm">
                {isSubmitting ? 'Guardando...' : 'Generar CAPA'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
