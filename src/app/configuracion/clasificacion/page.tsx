"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Settings2, Plus, Edit2, Trash2, Search } from "lucide-react";
import { initialClassifications, Clasificacion } from "@/lib/mockClasificaciones";

export default function ClasificacionPage() {
  const [clasificaciones, setClasificaciones] = useState<Clasificacion[]>(initialClassifications);
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = clasificaciones.filter(c => 
    c.nombreLargo.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.nombreCorto.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta clasificación?")) {
      setClasificaciones(clasificaciones.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight text-[#0F172A] flex items-center gap-3">
            <Settings2 className="w-8 h-8 text-[#0EA5E9]" />
            Clasificación de Proveedores
          </h1>
          <p className="text-sm text-slate-500 mt-1.5 font-medium">
            Administra las categorías principales bajo las cuales se agrupan los proveedores en el directorio.
          </p>
        </div>
        <Button className="bg-[#0F172A] hover:bg-[#0EA5E9] text-white shadow-sm font-bold">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Clasificación
        </Button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Buscar clasificación..." 
              className="pl-9 h-9 border-slate-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
            {filtered.length} Registros
          </span>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-white hover:bg-white">
                <TableHead className="w-16 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">ID</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre Largo (Oficial)</TableHead>
                <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre Corto (Categoría)</TableHead>
                <TableHead className="w-24 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id} className="hover:bg-slate-50 transition-colors group">
                  <TableCell className="text-center font-mono text-xs text-slate-400">{item.id}</TableCell>
                  <TableCell className="font-medium text-[#0F172A] text-sm">{item.nombreLargo}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">
                      {item.nombreCorto}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-[#0EA5E9]">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-rose-500" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-slate-400">
                    No se encontraron clasificaciones.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
