import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, AlertTriangle, FileText, ChevronRight, Calculator, CheckSquare, XSquare } from "lucide-react";
import { calculateAQL } from "@/lib/aql";
import { jsPDF } from "jspdf";

export function RecepcionWizard({ item, onSave, onCancel }: any) {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState("PENDIENTE"); // PENDIENTE, CUARENTENA, ACEPTADO
  
  // Step 1: Administrativa
  const [adminChecks, setAdminChecks] = useState({
    nombre: false,
    forma: false,
    cantidad: false,
    factura: false
  });

  // Step 2: Tecnica
  const [techData, setTechData] = useState({
    lote: "",
    vencimiento: "",
    cantRecibida: "",
    tRecepcion: "15-25°C",
    defectosCriticos: 0,
    defectosMayores: 0,
    defectosMenores: 0,
    regSanitarioVerificado: false
  });

  const aql = calculateAQL(parseInt(techData.cantRecibida) || 0);

  // Step 3: Evaluacion Tecnica
  const [evalData, setEvalData] = useState({
    empaque: 1, // 1: Cumple, 0: No cumple
    etiqueta: 1,
    caracteristicas: 1
  });

  const handleAdminCheck = (field: string) => {
    setAdminChecks(prev => ({ ...prev, [field]: !(prev as any)[field] }));
  };

  const nextStep = () => {
    if (step === 1) {
      const passed = adminChecks.nombre && adminChecks.forma && adminChecks.cantidad && adminChecks.factura;
      if (!passed) {
        setStatus("CUARENTENA");
        // No allowed to continue if admin fails
        if (!confirm("Fallo en la recepción administrativa. El ítem pasará a Cuarentena para devolución. ¿Continuar?")) {
          return;
        }
        onSave({ estado: "CUARENTENA", adminChecks });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!techData.lote || !techData.vencimiento || !techData.cantRecibida) {
        alert("Faltan datos de lote, vencimiento o cantidad.");
        return;
      }
      const passedAql = techData.defectosCriticos <= aql.criticos.ac &&
                        techData.defectosMayores <= aql.mayores.ac &&
                        techData.defectosMenores <= aql.menores.ac;
      
      if (!passedAql) {
        setStatus("CUARENTENA");
        if (!confirm("El ítem superó los límites de AQL y pasará a Cuarentena. ¿Continuar?")) {
          return;
        }
        onSave({ estado: "CUARENTENA", techData, aqlResult: "RECHAZADO" });
        return;
      }
      setStep(3);
    } else if (step === 3) {
      const score = ((evalData.empaque + evalData.etiqueta + evalData.caracteristicas) / 3) * 100;
      let finalScore = 1;
      if (score > 90) finalScore = 4;
      else if (score >= 81) finalScore = 3;
      else if (score >= 61) finalScore = 2;
      else finalScore = 1;

      onSave({ estado: "ACEPTADO", techData, evalData, finalScore, porcentaje: score.toFixed(1) });
    }
  };

  const generatePDF = () => {
    const doc = new (jsPDF as any)();
    
    // Titulo
    doc.setFontSize(16);
    doc.text("ACTA DE RECEPCIÓN TÉCNICA", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.text(`Producto: ${item.nombre}`, 14, 40);
    doc.text(`Forma Farmacéutica: ${item.formaFarma}`, 14, 47);
    doc.text(`Lote: ${techData.lote}`, 120, 40);
    doc.text(`Vencimiento: ${techData.vencimiento}`, 120, 47);
    
    // Resultados
    doc.text(`Cantidad Recibida: ${techData.cantRecibida}`, 14, 60);
    doc.text(`Temperatura: ${techData.tRecepcion}`, 120, 60);
    
    doc.text(`Defectos Críticos: ${techData.defectosCriticos}`, 14, 75);
    doc.text(`Defectos Mayores: ${techData.defectosMayores}`, 14, 82);
    doc.text(`Defectos Menores: ${techData.defectosMenores}`, 14, 89);
    
    const score = ((evalData.empaque + evalData.etiqueta + evalData.caracteristicas) / 3) * 100;
    doc.text(`Evaluación Técnica: ${score.toFixed(1)}%`, 14, 105);
    
    doc.save(`acta_recepcion_${item.prodId}.pdf`);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Procesar: {item.nombre}</h2>
          <p className="text-sm text-slate-500">Paso {step} de 3</p>
        </div>
        <div className="flex gap-2">
           <div className={`w-8 h-2 rounded-full ${step >= 1 ? 'bg-[#0EA5E9]' : 'bg-slate-200'}`}></div>
           <div className={`w-8 h-2 rounded-full ${step >= 2 ? 'bg-[#0EA5E9]' : 'bg-slate-200'}`}></div>
           <div className={`w-8 h-2 rounded-full ${step >= 3 ? 'bg-[#0EA5E9]' : 'bg-slate-200'}`}></div>
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-4 animate-in slide-in-from-right-4">
          <h3 className="font-bold text-lg text-slate-700">7.2 Recepción Administrativa</h3>
          <div className="grid gap-3">
            {[
              { id: 'nombre', label: 'Nombre del producto coincide' },
              { id: 'forma', label: 'Forma de entrega correcta' },
              { id: 'cantidad', label: 'Cantidad registrada vs factura correcta' },
              { id: 'factura', label: 'Diligenciamiento de factura correcto' },
            ].map(chk => (
              <label key={chk.id} className="flex items-center gap-3 p-3 border rounded-md hover:bg-slate-50 cursor-pointer">
                <input type="checkbox" checked={(adminChecks as any)[chk.id]} onChange={() => handleAdminCheck(chk.id)} className="w-5 h-5 accent-[#0EA5E9]" />
                <span className="font-medium text-slate-700">{chk.label}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-slate-500 italic mt-2">* Si alguno no cumple, el ítem se enviará a Cuarentena.</p>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 animate-in slide-in-from-right-4">
          <h3 className="font-bold text-lg text-slate-700">7.3 Recepción Técnica</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500">Cantidad Recibida</label>
              <Input type="number" value={techData.cantRecibida} onChange={e => setTechData({...techData, cantRecibida: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500">Temperatura Recepción</label>
              <Input value={techData.tRecepcion} onChange={e => setTechData({...techData, tRecepcion: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500">Lote</label>
              <Input value={techData.lote} onChange={e => setTechData({...techData, lote: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500">Vencimiento</label>
              <Input type="date" value={techData.vencimiento} onChange={e => setTechData({...techData, vencimiento: e.target.value})} />
            </div>
          </div>

          <div className="bg-slate-100 p-4 rounded-lg mt-4 border border-slate-200">
             <div className="flex justify-between items-center mb-2">
               <span className="font-bold text-sm">Control AQL Nivel II</span>
               <span className="text-xs font-mono bg-[#0EA5E9] text-white px-2 py-1 rounded">Letra: {aql.letter} | Muestra: {aql.n}</span>
             </div>
             <div className="grid grid-cols-3 gap-2">
               <div className="bg-white p-2 rounded border border-rose-200">
                 <label className="text-[10px] font-bold text-rose-600 block mb-1">Críticos (Ac:{aql.criticos.ac} Re:{aql.criticos.re})</label>
                 <Input type="number" min="0" value={techData.defectosCriticos} onChange={e => setTechData({...techData, defectosCriticos: Number(e.target.value)})} className="h-7 text-xs" />
               </div>
               <div className="bg-white p-2 rounded border border-amber-200">
                 <label className="text-[10px] font-bold text-amber-600 block mb-1">Mayores (Ac:{aql.mayores.ac} Re:{aql.mayores.re})</label>
                 <Input type="number" min="0" value={techData.defectosMayores} onChange={e => setTechData({...techData, defectosMayores: Number(e.target.value)})} className="h-7 text-xs" />
               </div>
               <div className="bg-white p-2 rounded border border-blue-200">
                 <label className="text-[10px] font-bold text-blue-600 block mb-1">Menores (Ac:{aql.menores.ac} Re:{aql.menores.re})</label>
                 <Input type="number" min="0" value={techData.defectosMenores} onChange={e => setTechData({...techData, defectosMenores: Number(e.target.value)})} className="h-7 text-xs" />
               </div>
             </div>
             
             <label className="flex items-center gap-2 mt-4 text-xs font-bold text-slate-600 cursor-pointer">
                <input type="checkbox" checked={techData.regSanitarioVerificado} onChange={e => setTechData({...techData, regSanitarioVerificado: e.target.checked})} className="accent-slate-600" />
                Reg. Sanitario verificado en INVIMA
             </label>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 animate-in slide-in-from-right-4">
          <h3 className="font-bold text-lg text-slate-700">7.13 Evaluación Técnica</h3>
          <p className="text-xs text-slate-500 mb-4">FSF-024: Verificación de cumplimiento (1=Cumple, 0=No Cumple)</p>

          <div className="space-y-3">
             <div className="flex justify-between items-center p-3 border rounded-md">
                <span className="text-sm font-medium">Condiciones de Empaque (Cumple?)</span>
                <select value={evalData.empaque} onChange={e => setEvalData({...evalData, empaque: Number(e.target.value)})} className="border rounded p-1 text-sm">
                   <option value={1}>Sí (1)</option>
                   <option value={0}>No (0)</option>
                </select>
             </div>
             <div className="flex justify-between items-center p-3 border rounded-md">
                <span className="text-sm font-medium">Etiquetado Claro (Cumple?)</span>
                <select value={evalData.etiqueta} onChange={e => setEvalData({...evalData, etiqueta: Number(e.target.value)})} className="border rounded p-1 text-sm">
                   <option value={1}>Sí (1)</option>
                   <option value={0}>No (0)</option>
                </select>
             </div>
             <div className="flex justify-between items-center p-3 border rounded-md">
                <span className="text-sm font-medium">Características Físicas (Cumple?)</span>
                <select value={evalData.caracteristicas} onChange={e => setEvalData({...evalData, caracteristicas: Number(e.target.value)})} className="border rounded p-1 text-sm">
                   <option value={1}>Sí (1)</option>
                   <option value={0}>No (0)</option>
                </select>
             </div>
          </div>
          
          <div className="mt-4 p-4 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-200">
             <div>
                <span className="block text-xs font-bold text-slate-500 uppercase">Porcentaje</span>
                <span className="text-2xl font-bold text-[#0F172A]">{(((evalData.empaque + evalData.etiqueta + evalData.caracteristicas)/3)*100).toFixed(0)}%</span>
             </div>
             <Button variant="outline" size="sm" onClick={generatePDF} className="bg-white">
                <FileText className="w-4 h-4 mr-2 text-rose-500" />
                Descargar Acta (PDF)
             </Button>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
        <Button variant="ghost" onClick={onCancel} className="text-slate-500">Cancelar</Button>
        <Button onClick={nextStep} className="bg-[#0F172A] hover:bg-[#0F172A]/90 text-white min-w-[120px]">
          {step === 3 ? "Finalizar Recepción" : "Siguiente"}
          {step < 3 && <ChevronRight className="w-4 h-4 ml-1" />}
        </Button>
      </div>
    </div>
  );
}
