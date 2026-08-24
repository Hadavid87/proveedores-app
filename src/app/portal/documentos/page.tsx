import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { FileText, CheckCircle2, Upload, AlertCircle } from 'lucide-react';

export default async function DocumentosPortal() {
  const session = await getSession();
  if (!session || session.user?.rol !== 'PROVEEDOR') {
    redirect('/');
  }

  const proveedorId = session.user.proveedorId;

  // En un caso real, leeríamos los documentos desde \prisma.documentoProveedor\
  // Para la demo, simularemos el estado
  
  // Documentos de Cumplimiento Requeridos
  const documentos = [
    { id: 1, tipo: 'Formulario de Registro', estado: 'CARGADO', fecha: '2024-01-15' },
    { id: 2, tipo: 'RUT', estado: 'CARGADO', fecha: '2024-01-15' },
    { id: 3, tipo: 'Cámara de Comercio', estado: 'CARGADO', fecha: '2024-01-15' },
    { id: 4, tipo: 'Certificación Bancaria', estado: 'CARGADO', fecha: '2024-01-15' },
    { id: 5, tipo: 'Cédula Representante Legal', estado: 'CARGADO', fecha: '2024-01-15' },
    { id: 6, tipo: 'Habilitación', estado: 'N/A', fecha: null },
    { id: 7, tipo: 'Verificación LAFT', estado: 'CARGADO', fecha: '2024-01-15' },
    { id: 8, tipo: 'Solicitud Actualización', estado: 'PENDIENTE', fecha: null },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Mis Documentos Técnicos</h1>
        <p className="text-slate-500 mt-1">Sube los documentos requeridos para mantener tu estado ACTIVO y cumplir con los requisitos de calidad.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="font-bold text-[#0F172A] flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Requisitos de Calidad
          </h2>
        </div>
        
        <div className="divide-y divide-slate-100">
          {documentos.map(doc => (
            <div key={doc.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
              <div>
                <h3 className="font-bold text-sm text-slate-800">{doc.tipo}</h3>
                {doc.fecha ? (
                  <p className="text-xs text-slate-500 mt-0.5">Última actualización: {doc.fecha}</p>
                ) : (
                  <p className="text-xs text-rose-500 mt-0.5">Documento faltante requerido</p>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                {doc.estado === 'CARGADO' && (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4" /> Cargado
                  </span>
                )}
                {doc.estado === 'VENCIDO' && (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-100">
                    <AlertCircle className="w-4 h-4" /> Vencido
                  </span>
                )}
                {doc.estado === 'PENDIENTE' && (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100">
                    <AlertCircle className="w-4 h-4" /> Pendiente
                  </span>
                )}
                {doc.estado === 'N/A' && (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                    <AlertCircle className="w-4 h-4" /> No Aplica
                  </span>
                )}
                
                <label className="cursor-pointer bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-[#0EA5E9] transition-colors px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 shadow-sm">
                  <Upload className="w-4 h-4" />
                  {doc.estado === 'CARGADO' ? 'Actualizar' : 'Subir Archivo'}
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx" />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
