"use client";

import { useState } from "react";
import { Plus, Save, ChevronLeft, Calendar, User, Search, FileText, CheckCircle2, XCircle } from "lucide-react";
import { initialClassifications } from "@/lib/mockClasificaciones";
import { matricesCriterios } from "@/lib/mockCriterios";

// Mock data para proveedores disponibles para seleccionar
const mockProveedores = [
  { id: 1, razonSocial: "PharmaCore Andina S.A.", clasificacionId: 1 },
  { id: 2, razonSocial: "OncoMeds Distribución SAS", clasificacionId: 1 },
  { id: 3, razonSocial: "BioTech Solutions Ltd.", clasificacionId: 3 },
  { id: 4, razonSocial: "MicroLab Caribe", clasificacionId: 9 },
  { id: 5, razonSocial: "Suministros Médicos Integrales", clasificacionId: 1 },
  { id: 6, razonSocial: "PharmaVida SAS", clasificacionId: 1 },
  { id: 7, razonSocial: "Esterilización Avanzada", clasificacionId: 8 },
  { id: 8, razonSocial: "Tercerizados Costa", clasificacionId: 16 },
  { id: 9, razonSocial: "Servicios Generales XYZ", clasificacionId: 16 },
];

export default function SeleccionPage() {
  const [view, setView] = useState<"HISTORY" | "NEW">("HISTORY");
  const [history, setHistory] = useState<any[]>([]);

  // Form State
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [responsable, setResponsable] = useState("");
  const [clasificacionId, setClasificacionId] = useState<number | "">("");
  
  // Selected Providers (Max 5)
  const [selectedProveedores, setSelectedProveedores] = useState<any[]>([]);
  
  // Matrix Selections State: { providerId: { criterioId: opcionIndex } }
  const [matrixState, setMatrixState] = useState<Record<number, Record<string, number>>>({});
  // Observations State: { providerId: string }
  const [observaciones, setObservaciones] = useState<Record<number, string>>({});

  const activeMatrix = clasificacionId ? matricesCriterios.find(m => m.clasificacionId === clasificacionId) : null;
  const availableProveedores = clasificacionId ? mockProveedores.filter(p => p.clasificacionId === clasificacionId) : [];

  const handleAddProveedor = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pId = Number(e.target.value);
    if (!pId || selectedProveedores.length >= 5 || selectedProveedores.find(p => p.id === pId)) return;
    const prov = mockProveedores.find(p => p.id === pId);
    if (prov) {
      setSelectedProveedores([...selectedProveedores, prov]);
      setMatrixState({ ...matrixState, [prov.id]: {} });
      setObservaciones({ ...observaciones, [prov.id]: "" });
    }
  };

  const handleRemoveProveedor = (pId: number) => {
    setSelectedProveedores(selectedProveedores.filter(p => p.id !== pId));
    const newMatrix = { ...matrixState };
    delete newMatrix[pId];
    setMatrixState(newMatrix);
  };

  const handleSelectOption = (provId: number, critId: string, optionIndex: number) => {
    setMatrixState(prev => ({
      ...prev,
      [provId]: {
        ...prev[provId],
        [critId]: optionIndex
      }
    }));
  };

  const calculateTotal = (provId: number) => {
    if (!activeMatrix) return 0;
    let total = 0;
    activeMatrix.criteriosAceptacion.forEach(crit => {
      const selectedOptIdx = matrixState[provId]?.[crit.id];
      if (selectedOptIdx !== undefined) {
        const option = crit.opciones[selectedOptIdx];
        total += option.valorizacion * (crit.porcentaje / 100);
      }
    });
    return Number(total.toFixed(2));
  };

  const handleSave = () => {
    if (!clasificacionId || !fechaInicio || !responsable || selectedProveedores.length === 0) {
      alert("Por favor complete los campos obligatorios y seleccione al menos un proveedor.");
      return;
    }
    
    const results = selectedProveedores.map(p => {
      const total = calculateTotal(p.id);
      return {
        id: p.id,
        razonSocial: p.razonSocial,
        total,
        condicion: total >= 3.0 ? "APROBADO" : "NO APROBADO",
        observaciones: observaciones[p.id] || ""
      };
    });

    const newRecord = {
      id: Date.now(),
      fechaInicio,
      fechaFin,
      responsable,
      tipoProveedor: initialClassifications.find(c => c.id === clasificacionId)?.nombreLargo || "N/A",
      resultados: results
    };

    setHistory([newRecord, ...history]);
    setView("HISTORY");
    
    // Reset Form
    setFechaInicio(""); setFechaFin(""); setResponsable(""); setClasificacionId("");
    setSelectedProveedores([]); setMatrixState({}); setObservaciones({});
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-[#0F172A] tracking-tight">Selección de Proveedores</h1>
            <p className="text-sm text-slate-500 mt-1">Matriz de comparación y selección inicial.</p>
          </div>
          {view === "HISTORY" ? (
            <button 
              onClick={() => setView("NEW")}
              className="flex items-center gap-2 px-4 py-2 bg-[#0EA5E9] text-white text-sm font-semibold rounded-md shadow-sm hover:bg-[#0284c7] transition-colors"
            >
              <Plus className="w-4 h-4" /> Nueva Selección
            </button>
          ) : (
            <button 
              onClick={() => setView("HISTORY")}
              className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 border border-slate-200 text-sm font-semibold rounded-md shadow-sm hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Volver al Historial
            </button>
          )}
        </div>
      </header>

      {view === "HISTORY" && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex-1">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-700">No hay selecciones registradas</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-md">Realiza tu primer proceso de selección y calificación comparativa de proveedores.</p>
              <button 
                onClick={() => setView("NEW")}
                className="mt-6 flex items-center gap-2 px-4 py-2 bg-[#0F172A] text-white text-sm font-semibold rounded-md shadow-sm hover:bg-slate-800 transition-colors"
              >
                <Plus className="w-4 h-4" /> Empezar Proceso
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-xs text-slate-500 font-bold uppercase border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Fecha</th>
                    <th className="px-6 py-4">Responsable</th>
                    <th className="px-6 py-4">Tipo Proveedor</th>
                    <th className="px-6 py-4">Proveedores Evaluados</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map(record => (
                    <tr key={record.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                      <td className="px-6 py-4 font-mono text-slate-600">{record.fechaInicio}</td>
                      <td className="px-6 py-4 font-bold text-slate-700">{record.responsable}</td>
                      <td className="px-6 py-4 text-slate-600">{record.tipoProveedor}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {record.resultados.map((res: any, idx: number) => (
                            <span key={idx} className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold border ${res.condicion === 'APROBADO' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                              {res.condicion === 'APROBADO' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                              {res.razonSocial} ({res.total})
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {view === "NEW" && (
        <div className="flex-1 flex flex-col gap-6">
          {/* Metadata Form */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wide mb-4 pb-2 border-b border-slate-100">Datos de la Selección</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/> Fecha Inicio</label>
                <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="w-full h-9 px-3 rounded-md border border-slate-200 text-sm focus:ring-1 focus:ring-[#0EA5E9]" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/> Fecha Fin</label>
                <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className="w-full h-9 px-3 rounded-md border border-slate-200 text-sm focus:ring-1 focus:ring-[#0EA5E9]" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><User className="w-3.5 h-3.5"/> Responsable</label>
                <input type="text" placeholder="Nombre completo" value={responsable} onChange={e => setResponsable(e.target.value)} className="w-full h-9 px-3 rounded-md border border-slate-200 text-sm focus:ring-1 focus:ring-[#0EA5E9]" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Tipo de Proveedor</label>
                <select value={clasificacionId} onChange={e => { setClasificacionId(Number(e.target.value)); setSelectedProveedores([]); setMatrixState({}); }} className="w-full h-9 px-3 rounded-md border border-slate-200 text-sm focus:ring-1 focus:ring-[#0EA5E9]">
                  <option value="">Seleccione tipo...</option>
                  {initialClassifications.map(c => <option key={c.id} value={c.id}>{c.nombreLargo}</option>)}
                </select>
              </div>
            </div>
          </div>

          {activeMatrix && (
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wide">Matriz Comparativa - {activeMatrix.nombre}</h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Añadir Proveedor a comparar ({selectedProveedores.length}/5):</span>
                  <select 
                    onChange={handleAddProveedor} 
                    value="" 
                    disabled={selectedProveedores.length >= 5}
                    className="w-64 h-8 px-2 rounded-md border border-slate-200 text-xs font-semibold focus:ring-1 focus:ring-[#0EA5E9]"
                  >
                    <option value="">+ Seleccionar Proveedor...</option>
                    {availableProveedores.filter(p => !selectedProveedores.find(sp => sp.id === p.id)).map(p => (
                      <option key={p.id} value={p.id}>{p.razonSocial}</option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedProveedores.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded border border-dashed border-slate-200">
                  <Search className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-sm font-bold text-slate-600">Ningún proveedor seleccionado</p>
                  <p className="text-xs text-slate-500 mt-1">Selecciona hasta 5 proveedores en el menú desplegable superior para iniciar la comparación.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-xs text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 w-64 border-r border-slate-200 bg-slate-100 sticky left-0 z-10 shadow-[1px_0_0_0_#e2e8f0]">CRITERIO / PROVEEDOR</th>
                        {selectedProveedores.map((p, i) => (
                          <th key={p.id} className="px-4 py-3 min-w-[200px] border-r border-slate-200 text-center relative group">
                            <div className="truncate font-bold text-[#0F172A]">{p.razonSocial}</div>
                            <button onClick={() => handleRemoveProveedor(p.id)} className="absolute top-1 right-1 p-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              <XCircle className="w-4 h-4" />
                            </button>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeMatrix.criteriosAceptacion.map(crit => (
                        <tr key={crit.id} className="hover:bg-slate-50/30">
                          <td className="px-4 py-3 border-r border-slate-200 bg-white sticky left-0 z-10 shadow-[1px_0_0_0_#e2e8f0]">
                            <div className="font-bold text-slate-700 text-xs">{crit.nombre}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Peso: {crit.porcentaje}%</div>
                          </td>
                          {selectedProveedores.map(p => (
                            <td key={p.id} className="px-4 py-2 border-r border-slate-200 bg-white text-center align-top">
                              <select 
                                className="w-full h-8 px-1.5 rounded border border-slate-200 text-xs focus:ring-1 focus:ring-[#0EA5E9]"
                                value={matrixState[p.id]?.[crit.id] ?? ""}
                                onChange={(e) => handleSelectOption(p.id, crit.id, Number(e.target.value))}
                              >
                                <option value="" disabled>Seleccione...</option>
                                {crit.opciones.map((op, idx) => (
                                  <option key={idx} value={idx}>{op.nombre} (Val: {op.valorizacion})</option>
                                ))}
                              </select>
                            </td>
                          ))}
                        </tr>
                      ))}
                      
                      {/* Cálculos Totales */}
                      <tr className="bg-slate-100/50">
                        <td className="px-4 py-4 border-r border-slate-200 font-bold text-slate-800 text-right sticky left-0 z-10 shadow-[1px_0_0_0_#e2e8f0]">
                          GRAN TOTAL
                        </td>
                        {selectedProveedores.map(p => {
                          const t = calculateTotal(p.id);
                          return (
                            <td key={p.id} className="px-4 py-4 border-r border-slate-200 text-center font-mono font-bold text-lg text-[#0F172A]">
                              {t.toFixed(2)}
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td className="px-4 py-4 border-r border-slate-200 font-bold text-slate-800 text-right sticky left-0 z-10 shadow-[1px_0_0_0_#e2e8f0]">
                          CONDICIÓN DEL PROVEEDOR
                        </td>
                        {selectedProveedores.map(p => {
                          const t = calculateTotal(p.id);
                          const isAprobado = t >= 3.0;
                          return (
                            <td key={p.id} className="px-4 py-4 border-r border-slate-200 text-center">
                              <div className={`inline-flex px-3 py-1.5 rounded-md text-xs font-bold ${isAprobado ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                {isAprobado ? 'APROBADO' : 'NO APROBADO'}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td className="px-4 py-4 border-r border-slate-200 font-bold text-slate-800 text-right sticky left-0 z-10 shadow-[1px_0_0_0_#e2e8f0]">
                          OBSERVACIONES
                        </td>
                        {selectedProveedores.map(p => (
                          <td key={p.id} className="p-2 border-r border-slate-200 align-top">
                            <textarea 
                              placeholder="Observaciones..."
                              value={observaciones[p.id]}
                              onChange={(e) => setObservaciones({...observaciones, [p.id]: e.target.value})}
                              className="w-full h-16 p-2 rounded border border-slate-200 text-xs resize-none focus:ring-1 focus:ring-[#0EA5E9]"
                            />
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={handleSave}
                  disabled={selectedProveedores.length === 0}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#0F172A] text-white text-sm font-semibold rounded-md shadow-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="w-4 h-4" /> Guardar Selección
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
