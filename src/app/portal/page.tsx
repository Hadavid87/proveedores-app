import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { Activity, ShoppingCart, FileText } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function PortalDashboard() {
  const session = await getSession();
  if (!session || session.user?.rol !== 'PROVEEDOR') {
    redirect('/');
  }

  const proveedorId = session.user.proveedorId;
  const prov = await prisma.proveedor.findUnique({
    where: { id: proveedorId }
  });

  if (!prov) {
    return <div className="p-8 text-center text-rose-500">Error: Proveedor no encontrado en la base de datos.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bienvenido, {prov.razonSocial}</h1>
          <p className="text-slate-500 mt-1">Este es tu portal de gestión de proveedores.</p>
        </div>
        <div className="bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100 text-center">
          <p className="text-xs text-emerald-600 font-bold uppercase">Puntaje de Calidad</p>
          <p className="text-2xl font-bold text-emerald-700">{prov.puntajeActual.toString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/portal/documentos" className="block p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-[#0EA5E9] hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-100">
            <FileText className="w-6 h-6 text-blue-500" />
          </div>
          <h2 className="font-bold text-lg text-slate-800">Documentos Técnicos</h2>
          <p className="text-slate-500 text-sm mt-1">Sube y actualiza tus certificados y fichas técnicas requeridas.</p>
        </Link>
        
        <Link href="/portal/ordenes" className="block p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-100">
            <ShoppingCart className="w-6 h-6 text-indigo-500" />
          </div>
          <h2 className="font-bold text-lg text-slate-800">Órdenes de Compra</h2>
          <p className="text-slate-500 text-sm mt-1">Revisa el estado de tus órdenes y notifica entregas.</p>
        </Link>

        <Link href="/portal/capa" className="block p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-rose-400 hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-rose-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-rose-100">
            <Activity className="w-6 h-6 text-rose-500" />
          </div>
          <h2 className="font-bold text-lg text-slate-800">Tickets de Calidad</h2>
          <p className="text-slate-500 text-sm mt-1">Responde a planes de acción (CAPA) por no conformidades.</p>
        </Link>
      </div>
    </div>
  );
}
