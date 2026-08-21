"use client";

import { useState } from "react";
import { Shield, Plus, MoreHorizontal, CheckCircle2, XCircle, Mail, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createRol, updateRol, deleteRol, createUsuario, updateUsuario, deleteUsuario } from "./actions";

export default function RolesView({ initialRoles, initialUsuarios }: { initialRoles: any[], initialUsuarios: any[] }) {
  const [activeTab, setActiveTab] = useState("roles");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  // State for forms
  const [formData, setFormData] = useState<any>({});

  const handleOpenModal = (item: any = null) => {
    setEditingItem(item);
    if (activeTab === "roles") {
      let parsedPermisos = {};
      if (item?.permisos) {
        parsedPermisos = typeof item.permisos === 'string' ? JSON.parse(item.permisos) : item.permisos;
      }
      setFormData(item ? { ...item, permisos: parsedPermisos } : { nombre: "", descripcion: "", activo: true, permisos: {} });
    } else {
      setFormData(item || { nombre: "", email: "", password: "", rolId: initialRoles[0]?.id });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "roles") {
      if (editingItem) {
        await updateRol(editingItem.id, formData);
      } else {
        await createRol(formData);
      }
    } else {
      if (editingItem) {
        await updateUsuario(editingItem.id, formData);
      } else {
        await createUsuario(formData);
      }
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este registro?")) return;
    
    if (activeTab === "roles") {
      const res = await deleteRol(id);
      if (res.error) alert(res.error);
    } else {
      await deleteUsuario(id);
    }
  };

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
        <Button onClick={() => handleOpenModal()} className="bg-[#2E3192] hover:bg-[#2E3192]/90 flex items-center gap-2">
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
                {initialRoles.map((role) => (
                  <tr key={role.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-[#0F172A]">{role.nombre}</td>
                    <td className="px-6 py-4 text-slate-500 max-w-md">{role.descripcion}</td>
                    <td className="px-6 py-4">
                      {role.esCustom ? (
                        <Badge variant="outline" className="text-slate-600 bg-slate-100 border-slate-200">Personalizado</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[#0EA5E9] bg-[#0EA5E9]/10 border-[#0EA5E9]/20">Por Defecto</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {role.activo ? (
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
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenModal(role)} className="text-slate-400 hover:text-[#0EA5E9] transition-colors p-2 rounded-lg hover:bg-[#0EA5E9]/10">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(role.id)} className="text-slate-400 hover:text-rose-500 transition-colors p-2 rounded-lg hover:bg-rose-50">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {initialUsuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-[#0F172A] flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0EA5E9]/10 text-[#0EA5E9] flex items-center justify-center font-bold">
                        {usuario.nombre.charAt(0).toUpperCase()}
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
                      <Badge variant="outline" className="text-[#2E3192] bg-[#2E3192]/10 border-[#2E3192]/20">{usuario.rol?.nombre}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenModal(usuario)} className="text-slate-400 hover:text-[#0EA5E9] transition-colors p-2 rounded-lg hover:bg-[#0EA5E9]/10">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(usuario.id)} className="text-slate-400 hover:text-rose-500 transition-colors p-2 rounded-lg hover:bg-rose-50">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0">
          <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
            <DialogHeader className="p-6 pb-2">
              <DialogTitle>{editingItem ? 'Editar' : 'Crear'} {activeTab === 'roles' ? 'Rol' : 'Usuario'}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto p-6 pt-2 grid gap-4">
              {activeTab === 'roles' ? (
                <>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Nombre del Rol</label>
                    <Input required value={formData.nombre || ''} onChange={e => setFormData({...formData, nombre: e.target.value})} disabled={editingItem && !editingItem.esCustom} />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Descripción</label>
                    <Input required value={formData.descripcion || ''} onChange={e => setFormData({...formData, descripcion: e.target.value})} />
                  </div>
                  
                  <div className="mt-4 border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase">
                        <tr>
                          <th className="px-4 py-3">Módulo</th>
                          <th className="px-4 py-3 text-center">Ver</th>
                          <th className="px-4 py-3 text-center">Editar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {[
                          { key: 'tablero', label: 'Tablero', isSub: false },
                          { key: 'gestion_proveedores', label: 'Gestión de Proveedores', isSub: false },
                          { key: 'directorio', label: 'Directorio', isSub: true },
                          { key: 'seleccion', label: 'Selección', isSub: true },
                          { key: 'evaluaciones', label: 'Evaluaciones', isSub: true },
                          { key: 'medicamentos', label: 'Medicamentos', isSub: false },
                          { key: 'ordenes_compra', label: 'Órdenes de Compra', isSub: false },
                          { key: 'recepcion_tecnica', label: 'Recepción Técnica', isSub: false },
                          { key: 'control_calidad', label: 'Control de Calidad', isSub: false },
                          { key: 'capa', label: 'CAPA', isSub: true },
                          { key: 'calculadora_aql', label: 'Calculadora AQL', isSub: true },
                          { key: 'reportes', label: 'Reportes', isSub: false },
                          { key: 'configuracion', label: 'Configuración', isSub: false },
                          { key: 'clasificacion', label: 'Clasificación', isSub: true },
                          { key: 'criterios', label: 'Criterios', isSub: true },
                          { key: 'roles_permisos', label: 'Roles y Permisos', isSub: true },
                        ].map(modulo => {
                          const perms = formData.permisos || {};
                          return (
                            <tr key={modulo.key} className="hover:bg-slate-50/50">
                              <td className={`px-4 py-1.5 text-xs font-medium ${modulo.isSub ? 'pl-8 text-slate-500' : 'text-[#0F172A]'}`}>
                                {modulo.isSub && <span className="mr-2 text-slate-300">└</span>}
                                {modulo.label}
                              </td>
                              <td className="px-4 py-1.5 text-center">
                                <input type="checkbox" checked={perms[modulo.key]?.ver || false} 
                                  onChange={e => setFormData({
                                    ...formData, 
                                    permisos: { ...perms, [modulo.key]: { ...perms[modulo.key], ver: e.target.checked } }
                                  })}
                                />
                              </td>
                              <td className="px-4 py-1.5 text-center">
                                <input type="checkbox" checked={perms[modulo.key]?.editar || false} 
                                  onChange={e => setFormData({
                                    ...formData, 
                                    permisos: { ...perms, [modulo.key]: { ...perms[modulo.key], editar: e.target.checked } }
                                  })}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <input type="checkbox" checked={formData.activo} onChange={e => setFormData({...formData, activo: e.target.checked})} id="activo" />
                    <label htmlFor="activo" className="text-sm font-medium">Rol Activo</label>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Nombre Completo</label>
                    <Input required value={formData.nombre || ''} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input type="email" required value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Contraseña {editingItem && '(dejar en blanco para no cambiar)'}</label>
                    <Input type="password" required={!editingItem} value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Rol Asignado</label>
                    <select required value={formData.rolId || ''} onChange={e => setFormData({...formData, rolId: e.target.value})} className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5E9] focus-visible:ring-offset-2">
                      {initialRoles.map(r => (
                        <option key={r.id} value={r.id}>{r.nombre}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
            <DialogFooter className="p-6 pt-4 border-t border-slate-100 bg-white">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit" className="bg-[#2E3192] hover:bg-[#2E3192]/90">Guardar Cambios</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
