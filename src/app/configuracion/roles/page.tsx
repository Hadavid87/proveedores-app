"use client";
import { useState } from "react";
import { Shield, Plus, MoreHorizontal, CheckCircle2, XCircle, Users, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const mockRoles = [
  { id: 1, name: "Administrador", description: "Acceso total a todos los módulos y configuraciones del sistema.", isCustom: false, active: true },
  { id: 2, name: "Director", description: "Acceso a reportes gerenciales, aprobaciones de CAPA y calidad.", isCustom: false, active: true },
  { id: 3, name: "Gerencia", description: "Visualización de tableros estratégicos y evaluación de proveedores.", isCustom: false, active: true },
  { id: 4, name: "Compras", description: "Gestión de órdenes de compra y directorio de proveedores.", isCustom: false, active: true },
  { id: 5, name: "Auxiliar", description: "Recepción técnica y registro de datos en bodega.", isCustom: false, active: true },
  { id: 6, name: "Proveedor", description: "Acceso externo restringido (solo puede ver y responder sus propias evaluaciones/CAPA).", isCustom: false, active: true },
];

const mockUsuarios = [
  { id: 1, nombre: "Administrador Global", email: "admin@oncocenter.com", rol: "Administrador", estado: "Activo" },
];

export default function RolesPage() {
  const [activeTab, setActiveTab] = useState("roles");

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
            <Shield className="w-8 h-8 text-[#0EA5E9]" />
            Roles y Usuarios
          </h1>
          <p className="text-slate-500 mt-1 text-sm md:text-base">
            Administra los roles, accesos y usuarios del sistema.
          </p>
        </div>
        <Button className="bg-[#2E3192] hover:bg-[#2E3192]/90 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {activeTab === "roles" ? "Crear Nuevo Rol" : "Crear Nuevo Usuario"}
        </Button>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("roles")}
          className={`pb-3 text-sm font-bold transition-colors relative ${
            activeTab === "roles" ? "text-[#2E3192]" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Roles de Sistema
          {activeTab === "roles" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2E3192] rounded-t-full" />}
        </button>
        <button
          onClick={() => setActiveTab("usuarios")}
          className={`pb-3 text-sm font-bold transition-colors relative ${
            activeTab === "usuarios" ? "text-[#2E3192]" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Usuarios
          {activeTab === "usuarios" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2E3192] rounded-t-full" />}
        </button>
      </div>
      
      {activeTab === "roles" ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Rol de Sistema</th>
                  <th className="px-6 py-4">Descripción</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockRoles.map((role) => (
                  <tr key={role.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-[#0F172A]">{role.name}</td>
                    <td className="px-6 py-4 text-slate-500 max-w-md">{role.description}</td>
                    <td className="px-6 py-4">
                      {role.isCustom ? (
                        <Badge variant="outline" className="text-slate-600 bg-slate-100 border-slate-200">Personalizado</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[#0EA5E9] bg-[#0EA5E9]/10 border-[#0EA5E9]/20">Por Defecto</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {role.active ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4" /> Activo
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-rose-600 text-xs font-bold">
                          <XCircle className="w-4 h-4" /> Inactivo
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-[#0EA5E9] transition-colors p-2 rounded-lg hover:bg-[#0EA5E9]/10">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Nombre</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Rol Asignado</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockUsuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-[#0F172A] flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0EA5E9]/10 text-[#0EA5E9] flex items-center justify-center font-bold">
                        {usuario.nombre.charAt(0)}
                      </div>
                      {usuario.nombre}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400" />
                        {usuario.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="text-[#2E3192] bg-[#2E3192]/10 border-[#2E3192]/20">{usuario.rol}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4" /> {usuario.estado}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-[#0EA5E9] transition-colors p-2 rounded-lg hover:bg-[#0EA5E9]/10">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
