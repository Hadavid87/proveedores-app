"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FileText, AlertTriangle, CheckCircle, Search, Edit2 } from "lucide-react";

const mockCapa = [
  { id: "CP-2026-001", proveedor: "PharmaCorp S.A.S", fecha: "2026-08-10", tipo: "Mayor", estado: "EN_PROGRESO", descripcion: "Inconsistencia en certificados de calidad (COA)" },
  { id: "CP-2026-002", proveedor: "BioTech Solutions", fecha: "2026-08-12", tipo: "Menor", estado: "ABIERTO", descripcion: "Embalaje secundario deteriorado" },
  { id: "CP-2026-003", proveedor: "OncoMeds", fecha: "2026-08-01", tipo: "Crítica", estado: "CERRADO", descripcion: "Falla de temperatura en cadena de frío" },
];

export default function CalidadPage() {
  const [selectedCapa, setSelectedCapa] = useState(mockCapa[0]);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight text-[#0F172A]">Control de Calidad (CAPA)</h1>
          <p className="text-sm text-slate-500 mt-1.5 font-medium">
            Gestión de No Conformidades y Planes de Acción Correctiva/Preventiva.
          </p>
        </div>
        <Button className="bg-[#0F172A] hover:bg-[#0F172A]/90 text-white font-semibold shadow-sm rounded-lg h-10 px-5">
          <FileText className="w-4 h-4 mr-2" />
          Nueva No Conformidad
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Buscar por ID o Proveedor..." className="pl-9 h-10 border-slate-200 rounded-lg text-sm bg-[#F8FAFC] focus-visible:ring-1 focus-visible:ring-[#0EA5E9]/50" />
            </div>
            <span className="text-xs text-slate-500 font-semibold tracking-wide">3 Registros</span>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#0F172A]">
                <TableRow className="hover:bg-[#0F172A] border-none">
                  <TableHead className="text-white font-heading font-semibold py-3.5 text-[13px]">ID CAPA</TableHead>
                  <TableHead className="text-white font-heading font-semibold py-3.5 text-[13px]">Proveedor</TableHead>
                  <TableHead className="text-white font-heading font-semibold py-3.5 text-[13px]">Criticidad</TableHead>
                  <TableHead className="text-white font-heading font-semibold py-3.5 text-[13px] text-right pr-6">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockCapa.map((capa) => (
                  <TableRow 
                    key={capa.id} 
                    className={`cursor-pointer transition-colors border-b border-slate-100 ${selectedCapa.id === capa.id ? 'bg-[#0EA5E9]/10' : 'hover:bg-[#F8FAFC]'}`}
                    onClick={() => setSelectedCapa(capa)}
                  >
                    <TableCell className="font-semibold text-[#0F172A] py-4">{capa.id}</TableCell>
                    <TableCell className="text-slate-600 text-[13px] py-4">{capa.proveedor}</TableCell>
                    <TableCell className="py-4">
                      <Badge variant="outline" className={`border-none px-2 py-0.5 font-bold tracking-wide text-[10px] ${
                        capa.tipo === 'Crítica' ? 'bg-rose-100 text-rose-700' : 
                        capa.tipo === 'Mayor' ? 'bg-amber-100 text-amber-700' : 
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {capa.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6 py-4">
                      <Badge variant="outline" className={`border-none px-3 py-1 font-bold tracking-wide text-[10px] ${
                        capa.estado === 'CERRADO' ? 'bg-emerald-100/80 text-emerald-700' : 
                        capa.estado === 'EN_PROGRESO' ? 'bg-amber-100/80 text-amber-700' : 
                        'bg-slate-200 text-slate-600'
                      }`}>
                        {capa.estado}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="xl:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col">
          <div className="h-1.5 w-full bg-[#0EA5E9]" />
          <div className="p-6 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-5">
              <div className="w-12 h-12 bg-[#F8FAFC] rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <button className="text-slate-400 hover:text-[#0F172A] transition-colors">
                <Edit2 className="w-[18px] h-[18px]" />
              </button>
            </div>

            <h2 className="text-xl font-heading font-bold text-[#0F172A] mb-1">{selectedCapa.id}</h2>
            <p className="text-[13px] text-slate-500 font-mono mb-6">{selectedCapa.proveedor}</p>

            <div className="bg-[#F8FAFC] rounded-xl p-5 mb-6 border border-slate-100">
              <h3 className="text-[11px] font-heading font-bold text-slate-500 uppercase tracking-wider mb-2">Descripción de la Falla</h3>
              <p className="text-sm text-[#0F172A] font-medium leading-relaxed">{selectedCapa.descripcion}</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-[11px] font-heading font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">Plan de Acción (Proveedor)</label>
                <textarea 
                  className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm text-[#0F172A] shadow-sm min-h-[100px] resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0EA5E9]/50" 
                  placeholder="Describir análisis de causa raíz y acciones..."
                  defaultValue={selectedCapa.estado !== 'ABIERTO' ? "Se reentrenó al personal de despacho y se ajustó el formato de impresión de COA." : ""}
                ></textarea>
              </div>
              <div>
                <label className="text-[11px] font-heading font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">Fecha Compromiso</label>
                <Input type="date" className="h-10 text-sm shadow-sm" defaultValue="2026-08-30" />
              </div>
            </div>

            <div className="mt-auto pt-8">
              <Button className="w-full h-12 bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white font-semibold shadow-md rounded-lg" disabled={selectedCapa.estado === 'CERRADO'}>
                <CheckCircle className="w-4 h-4 mr-2" />
                {selectedCapa.estado === 'CERRADO' ? 'CAPA Cerrado' : 'Evaluar y Cerrar CAPA'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
