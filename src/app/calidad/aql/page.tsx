"use client";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calculator, Info, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { calculateAQL } from "@/lib/aql";

export default function AQLCalculatorPage() {
  const [loteSize, setLoteSize] = useState<string>("1000");

  const results = useMemo(() => {
    const size = parseInt(loteSize) || 0;
    if (size <= 0) return null;
    return calculateAQL(size);
  }, [loteSize]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-heading font-bold tracking-tight text-[#0F172A]">Calculadora AQL</h1>
        <p className="text-sm text-slate-500 mt-1.5 font-medium">
          Calculadora de muestreo basada en la norma ISO 2859-1 (Nivel de Inspección General II).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Card */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calculator className="w-5 h-5 text-[#0EA5E9]" />
              Parámetros del Lote
            </CardTitle>
            <CardDescription>
              Ingresa el tamaño total del lote recibido para determinar el tamaño de la muestra y los límites de aceptación.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Cantidad Total (Tamaño del Lote)</label>
              <Input 
                type="number"
                min="1"
                value={loteSize}
                onChange={(e) => setLoteSize(e.target.value)}
                className="h-12 text-lg font-mono focus-visible:ring-[#0EA5E9]"
                placeholder="Ej. 1500"
              />
            </div>
            
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3">
              <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Configuración Estándar</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Nivel de Inspección: <strong>Nivel II</strong></li>
                  <li>Defectos Críticos: <strong>AQL 0.0</strong></li>
                  <li>Defectos Mayores: <strong>AQL 1.5</strong></li>
                  <li>Defectos Menores: <strong>AQL 4.0</strong></li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Card */}
        <Card className="border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="h-1.5 w-full bg-[#0EA5E9]" />
          <CardHeader className="pb-4 border-b border-slate-100">
            <CardTitle className="text-lg text-[#0F172A]">Resultados del Muestreo</CardTitle>
            <CardDescription>Plan de muestreo simple para inspección normal.</CardDescription>
          </CardHeader>
          
          <CardContent className="p-0 flex-1 flex flex-col">
            {results ? (
              <div className="flex-1">
                {/* Header info */}
                <div className="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-100">
                  <div className="p-4 text-center">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Letra Código</p>
                    <p className="text-3xl font-heading font-bold text-[#0F172A]">{results.letter}</p>
                  </div>
                  <div className="p-4 text-center bg-slate-50">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Muestra a Inspeccionar</p>
                    <p className="text-3xl font-heading font-bold text-[#0EA5E9]">{results.n}</p>
                  </div>
                </div>

                {/* Defect Limits */}
                <div className="p-6 space-y-4">
                  <h3 className="text-sm font-bold text-slate-700 mb-2">Límites de Aceptación (Ac) y Rechazo (Re)</h3>
                  
                  {/* Criticos */}
                  <div className="flex items-center justify-between p-3 rounded-lg border border-rose-100 bg-rose-50/50">
                    <div className="flex items-center gap-3">
                      <XCircle className="w-5 h-5 text-rose-500" />
                      <div>
                        <p className="font-bold text-rose-900 text-sm">Críticos (AQL 0.0)</p>
                        <p className="text-xs text-rose-700">Empaque dañado, pérdida de cadena de frío</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 font-mono font-bold">
                      <div className="text-center"><span className="text-xs text-slate-500 block">Ac</span><span className="text-emerald-600">{results.criticos.ac}</span></div>
                      <div className="text-center"><span className="text-xs text-slate-500 block">Re</span><span className="text-rose-600">{results.criticos.re}</span></div>
                    </div>
                  </div>

                  {/* Mayores */}
                  <div className="flex items-center justify-between p-3 rounded-lg border border-amber-100 bg-amber-50/50">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      <div>
                        <p className="font-bold text-amber-900 text-sm">Mayores (AQL 1.5)</p>
                        <p className="text-xs text-amber-700">Falta inserto, texto borroso en etiqueta</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 font-mono font-bold">
                      <div className="text-center"><span className="text-xs text-slate-500 block">Ac</span><span className="text-emerald-600">{results.mayores.ac}</span></div>
                      <div className="text-center"><span className="text-xs text-slate-500 block">Re</span><span className="text-rose-600">{results.mayores.re}</span></div>
                    </div>
                  </div>

                  {/* Menores */}
                  <div className="flex items-center justify-between p-3 rounded-lg border border-blue-100 bg-blue-50/50">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-bold text-blue-900 text-sm">Menores (AQL 4.0)</p>
                        <p className="text-xs text-blue-700">Mancha leve en empaque secundario</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 font-mono font-bold">
                      <div className="text-center"><span className="text-xs text-slate-500 block">Ac</span><span className="text-emerald-600">{results.menores.ac}</span></div>
                      <div className="text-center"><span className="text-xs text-slate-500 block">Re</span><span className="text-rose-600">{results.menores.re}</span></div>
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
                <Calculator className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">Ingresa un tamaño de lote mayor a 0 para ver los resultados.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
