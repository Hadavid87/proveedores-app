"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, Plus, Filter, FileSignature, Calendar, Star, FileText, Edit2, Trash2 } from "lucide-react";

// Mock Data
const initialEvaluations = [
  {
    id: 1,
    proveedorId: 1,
    proveedorName: "PharmaCore Andina S.A.",
    fechaEvaluacion: "2026-07-10",
    puntuacion: 4.8,
    estado: "Aprobado",
    vencimiento: "2027-07-10",
    comentarios: "Excelente cumplimiento en tiempos de entrega y documentación."
  },
  {
    id: 2,
    proveedorId: 2,
    proveedorName: "OncoMeds Distribución SAS",
    fechaEvaluacion: "2026-06-15",
    puntuacion: 3.8,
    estado: "Aprobado con Observaciones",
    vencimiento: "2026-12-15",
    comentarios: "Se reportó un ligero retraso en la última orden. Requiere seguimiento semestral."
  },
  {
    id: 3,
    proveedorId: 3,
    proveedorName: "BioTech Solutions Ltd.",
    fechaEvaluacion: "2026-08-01",
    puntuacion: 2.5,
    estado: "Requiere Plan de Mejora",
    vencimiento: "2026-09-01",
    comentarios: "Falla en documentación INVIMA. Puntuación menor a 3.5.",
    planMejora: "El proveedor debe enviar la certificación INVIMA actualizada en un plazo de 15 días calendario."
  }
];

export default function EvaluacionesPage() {
  const [evaluaciones, setEvaluaciones] = useState(initialEvaluations);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"CREATE" | "EDIT">("CREATE");
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({ proveedorName: "", puntuacion: 0, comentarios: "", planMejora: "" });

  const filteredEvaluaciones = evaluaciones.filter(e => 
    e.proveedorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (estado: string) => {
    switch(estado) {
      case 'Aprobado': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Aprobado con Observaciones': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Requiere Plan de Mejora': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const handleOpenCreate = () => {
    setModalMode("CREATE");
    setEditingId(null);
    setFormData({ proveedorName: "", puntuacion: 0, comentarios: "", planMejora: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (evaluacion: any) => {
    setModalMode("EDIT");
    setEditingId(evaluacion.id);
    setFormData({ 
      proveedorName: evaluacion.proveedorName, 
      puntuacion: evaluacion.puntuacion, 
      comentarios: evaluacion.comentarios,
      planMejora: evaluacion.planMejora || ""
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Estás seguro de eliminar esta evaluación?")) {
      setEvaluaciones(evaluaciones.filter(e => e.id !== id));
    }
  };

  const handleSave = () => {
    const estadoCalc = formData.puntuacion >= 4.0 ? "Aprobado" : formData.puntuacion >= 3.5 ? "Aprobado con Observaciones" : "Requiere Plan de Mejora";
    
    if (modalMode === "CREATE") {
      const nuevaEvaluacion = {
        id: evaluaciones.length > 0 ? Math.max(...evaluaciones.map(e => e.id)) + 1 : 1,
        proveedorId: 99,
        proveedorName: formData.proveedorName,
        fechaEvaluacion: new Date().toISOString().split('T')[0],
        puntuacion: formData.puntuacion,
        estado: estadoCalc,
        vencimiento: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        comentarios: formData.comentarios,
        planMejora: formData.puntuacion < 3.5 ? formData.planMejora : ""
      };
      setEvaluaciones([nuevaEvaluacion, ...evaluaciones]);
    } else {
      // EDIT MODE
      setEvaluaciones(evaluaciones.map(e => {
        if (e.id === editingId) {
          return {
            ...e,
            proveedorName: formData.proveedorName,
            puntuacion: formData.puntuacion,
            estado: estadoCalc,
            comentarios: formData.comentarios,
            planMejora: formData.puntuacion < 3.5 ? formData.planMejora : ""
          };
        }
        return e;
      }));
    }
    
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight text-[#0F172A]">Evaluación de Proveedores</h1>
          <p className="text-sm text-slate-500 mt-1.5 font-medium">
            Gestión y seguimiento de evaluaciones de desempeño e idoneidad.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-[#0F172A] hover:bg-[#0F172A]/90 text-white font-semibold shadow-sm rounded-lg h-10 px-5">
          <FileSignature className="w-4 h-4 mr-2" />
          Nueva Evaluación
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white gap-4">
          <div className="flex gap-3 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Buscar por Proveedor..." 
                className="pl-9 h-10 border-slate-200 rounded-lg text-sm bg-[#F8FAFC] focus-visible:ring-1 focus-visible:ring-[#0EA5E9]/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="h-10 px-3 bg-white border-slate-200 text-slate-600 rounded-lg shrink-0 hover:bg-slate-50">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
          <span className="text-xs text-slate-500 font-semibold tracking-wide shrink-0">{filteredEvaluaciones.length} Registros</span>
        </div>
        
        <div className="overflow-x-auto flex-1">
          <Table className="table-fixed w-full [&_td]:whitespace-normal [&_th]:whitespace-normal break-words">
            <TableHeader className="bg-[#0F172A]">
              <TableRow className="hover:bg-[#0F172A] border-none">
                <TableHead className="text-white font-heading font-semibold py-3.5 text-[13px] w-[18%]">Proveedor</TableHead>
                <TableHead className="text-white font-heading font-semibold py-3.5 text-[13px] w-[11%]">Fecha Eval.</TableHead>
                <TableHead className="text-white font-heading font-semibold py-3.5 text-[13px] text-center w-[8%]">Puntaje</TableHead>
                <TableHead className="text-white font-heading font-semibold py-3.5 text-[13px] w-[17%]">Estado</TableHead>
                <TableHead className="text-white font-heading font-semibold py-3.5 text-[13px] w-[18%]">Plan de Mejora</TableHead>
                <TableHead className="text-white font-heading font-semibold py-3.5 text-[13px] w-[12%]">Vencimiento</TableHead>
                <TableHead className="text-white font-heading font-semibold py-3.5 text-[13px] text-right w-[16%]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvaluaciones.length > 0 ? filteredEvaluaciones.map((evaluacion) => (
                <TableRow key={evaluacion.id} className="hover:bg-[#F8FAFC] transition-colors border-b border-slate-100 group">
                  <TableCell className="font-semibold text-[#0F172A] py-4">{evaluacion.proveedorName}</TableCell>
                  <TableCell className="text-slate-600 text-[13px] py-4 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {evaluacion.fechaEvaluacion}
                  </TableCell>
                  <TableCell className="text-center py-4">
                    <span className={`inline-flex items-center justify-center font-bold text-[13px] px-2 py-0.5 rounded-md ${evaluacion.puntuacion >= 4.0 ? 'bg-emerald-100 text-emerald-700' : evaluacion.puntuacion >= 3.5 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                      {evaluacion.puntuacion.toFixed(1)}/5.0
                    </span>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge variant="outline" className={`${getStatusColor(evaluacion.estado)} px-2.5 py-1 text-[11px] font-bold border rounded-md shadow-sm whitespace-normal h-auto text-center leading-tight`}>
                      {evaluacion.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600 text-[12px] py-4">
                    {evaluacion.puntuacion < 3.5 ? (
                      <span className="text-rose-600 font-medium" title={evaluacion.planMejora}>
                        {evaluacion.planMejora || "Requiere acciones"}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">No Aplica</span>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-600 text-[13px] py-4 font-mono">{evaluacion.vencimiento}</TableCell>
                  <TableCell className="text-right py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-[#0EA5E9] hover:bg-[#0EA5E9]/10" onClick={() => handleOpenEdit(evaluacion)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50" onClick={() => handleDelete(evaluacion.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-[#0EA5E9] hover:bg-[#0EA5E9]/10 font-semibold text-xs ml-1">
                        Informe
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                    No se encontraron evaluaciones registradas
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold text-[#0F172A]">
              {modalMode === "CREATE" ? "Registrar Evaluación" : "Editar Evaluación"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500">Proveedor</label>
              <select 
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]/50 text-slate-700"
                value={formData.proveedorName}
                onChange={e => setFormData({...formData, proveedorName: e.target.value})}
              >
                <option value="" disabled>Selecciona un proveedor activo</option>
                <option value="PharmaCore Andina S.A.">PharmaCore Andina S.A.</option>
                <option value="OncoMeds Distribución SAS">OncoMeds Distribución SAS</option>
                <option value="BioTech Solutions Ltd.">BioTech Solutions Ltd.</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 flex items-center justify-between">
                <span>Puntuación Global (0-5)</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full text-white font-bold ${formData.puntuacion >= 4.0 ? 'bg-emerald-500' : formData.puntuacion >= 3.5 ? 'bg-amber-500' : 'bg-rose-500'}`}>
                  {formData.puntuacion} pts
                </span>
              </label>
              <Input 
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.puntuacion || ""} 
                onChange={e => setFormData({...formData, puntuacion: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500">Comentarios Generales</label>
              <textarea 
                className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0EA5E9]/50 min-h-[80px] resize-none"
                placeholder="Observaciones de la evaluación..."
                value={formData.comentarios}
                onChange={e => setFormData({...formData, comentarios: e.target.value})}
              ></textarea>
            </div>
            
            {formData.puntuacion < 3.5 && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-xs font-bold text-rose-600 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-rose-600" />
                  Plan de Mejora Requerido
                </label>
                <textarea 
                  className="flex w-full rounded-md border border-rose-200 bg-rose-50/50 px-3 py-2 text-sm shadow-sm placeholder:text-rose-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500/50 min-h-[80px] resize-none"
                  placeholder="Detalla las acciones de mejora necesarias..."
                  value={formData.planMejora}
                  onChange={e => setFormData({...formData, planMejora: e.target.value})}
                  required
                ></textarea>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button className="bg-[#0F172A] text-white hover:bg-[#0F172A]/90" onClick={handleSave}>
              {modalMode === "CREATE" ? "Guardar Evaluación" : "Actualizar Cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
