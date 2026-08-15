"use client";

import { useState } from "react";
import { Plus, Settings2, ShieldCheck, ActivitySquare, Percent } from "lucide-react";
import { matricesCriterios, MatrizClasificacion, TipoCriterio } from "@/lib/mockCriterios";

export default function CriteriosPage() {
  const [selectedClasificacion, setSelectedClasificacion] = useState<MatrizClasificacion>(matricesCriterios[0]);

  const CriteriosTable = ({ title, icon: Icon, criterios, colorClass }: { title: string, icon: any, criterios: TipoCriterio[], colorClass: string }) => (
    <div className="mb-8 bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
      <div className={`flex items-center justify-between px-5 py-4 border-b border-slate-100 ${colorClass}`}>
        <h2 className="font-heading font-bold text-slate-800 flex items-center gap-2">
          <Icon className="w-5 h-5 opacity-70" /> {title}
        </h2>
        <div className="text-xs font-bold bg-white/50 px-2 py-1 rounded text-slate-700">
          Peso Total: {criterios.reduce((acc, c) => acc + c.porcentaje, 0)}%
        </div>
      </div>
      <div className="p-0">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50/50 text-xs text-slate-500 font-bold uppercase border-b border-slate-100">
            <tr>
              <th className="px-5 py-3 w-1/3">Tipo de Criterio</th>
              <th className="px-5 py-3 w-1/6 text-center">Peso (%)</th>
              <th className="px-5 py-3 w-1/2">Escala de Valoración (1 a 4)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {criterios.map((criterio) => (
              <tr key={criterio.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-4 font-bold text-slate-700 align-top">
                  {criterio.nombre}
                </td>
                <td className="px-5 py-4 text-center align-top">
                  <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-md font-mono text-sm text-slate-600 font-bold border border-slate-200">
                    {criterio.porcentaje} <Percent className="w-3 h-3 text-slate-400" />
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="space-y-2">
                    {criterio.opciones.map((op, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white border border-slate-100 rounded px-3 py-1.5 shadow-sm">
                        <span className="text-xs font-medium text-slate-600">{op.nombre}</span>
                        <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold ${
                          op.valorizacion === 4 ? 'bg-emerald-100 text-emerald-700' :
                          op.valorizacion === 3 ? 'bg-emerald-50 text-emerald-600' :
                          op.valorizacion === 2 ? 'bg-amber-100 text-amber-700' :
                          'bg-rose-100 text-rose-700'
                        }`}>
                          {op.valorizacion}
                        </span>
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      <header className="px-8 py-6 bg-white border-b border-slate-200">
        <h1 className="text-2xl font-heading font-bold text-[#0F172A] tracking-tight">Criterios de Aceptación y Evaluación</h1>
        <p className="text-sm text-slate-500 mt-1">Configura las matrices de ponderación y escalas de calificación por grupo de proveedores.</p>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Clasificaciones */}
        <div className="w-64 bg-white border-r border-slate-200 flex flex-col overflow-y-auto">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Grupos de Proveedores</h3>
          </div>
          <div className="p-3 flex flex-col gap-1">
            {matricesCriterios.map((matriz) => (
              <button
                key={matriz.clasificacionId}
                onClick={() => setSelectedClasificacion(matriz)}
                className={`text-left px-3 py-2.5 rounded-md text-sm font-semibold transition-all ${
                  selectedClasificacion.clasificacionId === matriz.clasificacionId
                    ? "bg-[#0EA5E9]/10 text-[#0EA5E9]"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {matriz.nombre}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido Matriz */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-heading font-bold text-[#0F172A]">{selectedClasificacion.nombre}</h2>
                <p className="text-sm text-slate-500 mt-1">Matriz de criterios específica para este grupo.</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#0F172A] text-white text-sm font-semibold rounded-md hover:bg-slate-800 transition-colors">
                <Settings2 className="w-4 h-4" />
                Editar Matriz
              </button>
            </div>

            <CriteriosTable 
              title="Criterios de Aceptación (Selección)" 
              icon={ShieldCheck} 
              criterios={selectedClasificacion.criteriosAceptacion} 
              colorClass="bg-blue-50/50"
            />

            <CriteriosTable 
              title="Criterios de Evaluación y Reevaluación" 
              icon={ActivitySquare} 
              criterios={selectedClasificacion.criteriosEvaluacion} 
              colorClass="bg-indigo-50/50"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
