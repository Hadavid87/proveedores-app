import { Shield } from "lucide-react";

export default function RolesPage() {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
            <Shield className="w-8 h-8 text-[#0EA5E9]" />
            Roles y Permisos
          </h1>
          <p className="text-slate-500 mt-1 text-sm md:text-base">
            Administra los roles, accesos y privilegios de los usuarios del sistema.
          </p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
        <p>El módulo de gestión de roles estará disponible en la próxima actualización.</p>
      </div>
    </div>
  );
}
