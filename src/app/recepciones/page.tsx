"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, CheckCircle2, ShieldAlert, AlertTriangle, Printer } from "lucide-react";
import { calculateAQL } from "@/lib/aql";

const mockProductosTechInfo: Record<string, any> = {
  "MED-001": { formaFarma: "Solución Inyectable", concentracion: "200mg/5ml", laboratorio: "PharmaCore Inc.", presentacion: "Caja x 10 Ampollas", regSanitario: "INVIMA 2019M-0012345" },
  "MED-002": { formaFarma: "Tableta Recubierta", concentracion: "150mg", laboratorio: "Genéricos del Valle", presentacion: "Caja x 30 Tabletas", regSanitario: "INVIMA 2020M-0087654" },
  "MED-003": { formaFarma: "Tableta", concentracion: "500mg", laboratorio: "BioTech", presentacion: "Caja x 100 Tabletas", regSanitario: "INVIMA 2018M-0001122" }
};

// Estado para cada fila de recepción
type RowState = {
  lote: string;
  vencimiento: string;
  cantRecibida: string;
  tRecepcion: string;
  isReceived: boolean;
};

export default function RecepcionesPage() {
  const [selectedOrderId, setSelectedOrderId] = useState<number | "">("");
  const [rowsState, setRowsState] = useState<Record<string, RowState>>({});
  const [fechaActual, setFechaActual] = useState("");
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);

  useEffect(() => {
    setFechaActual(new Date().toLocaleDateString());
    const saved = localStorage.getItem('mockOrders');
    if (saved) {
      const allOrders = JSON.parse(saved);
      // Filtramos órdenes que no han sido recibidas
      setPendingOrders(allOrders.filter((o: any) => o.estado !== "RECIBIDA" && o.estado !== "VENCIDA"));
    }
  }, []);

  const currentOrderRaw = pendingOrders.find(o => o.id === selectedOrderId);
  
  // Enriquecemos la orden actual con los datos técnicos
  const currentOrder = currentOrderRaw ? {
    ...currentOrderRaw,
    items: currentOrderRaw.items.map((it: any) => ({
      ...it,
      cantidadEsperada: it.cantidad,
      ...(mockProductosTechInfo[it.prodId] || {
        formaFarma: "N/A", concentracion: "N/A", laboratorio: "N/A", presentacion: "N/A", regSanitario: "N/A"
      })
    }))
  } : null;

  // Inicializar estado de las filas cuando cambia la orden
  const handleOrderSelect = (orderId: number) => {
    setSelectedOrderId(orderId);
    const order = pendingOrders.find(o => o.id === orderId);
    if (order) {
      const initialRowStates: Record<string, RowState> = {};
      order.items.forEach((item: any) => {
        initialRowStates[item.prodId] = {
          lote: "",
          vencimiento: "",
          cantRecibida: "",
          tRecepcion: "15-25°C", // Temperatura ambiente por defecto
          isReceived: false
        };
      });
      setRowsState(initialRowStates);
    }
  };

  const handleRowChange = (prodId: string, field: keyof RowState, value: any) => {
    setRowsState(prev => ({
      ...prev,
      [prodId]: {
        ...(prev[prodId] || {
          lote: "",
          vencimiento: "",
          cantRecibida: "",
          tRecepcion: "15-25°C",
          isReceived: false
        }),
        [field]: value
      }
    }));
  };

  const handleReceiveRow = (prodId: string) => {
    const row = rowsState[prodId];
    if (!row.lote || !row.vencimiento || !row.cantRecibida) {
      alert("Por favor diligencie Lote, Vencimiento y Cantidad antes de recibir.");
      return;
    }
    handleRowChange(prodId, 'isReceived', true);
  };

  const handleFinishOrder = () => {
    const saved = localStorage.getItem('mockOrders');
    if (saved) {
      let allOrders = JSON.parse(saved);
      const orderIndex = allOrders.findIndex((o: any) => o.id === selectedOrderId);
      if (orderIndex >= 0) {
        allOrders[orderIndex].estado = "RECIBIDA";
        localStorage.setItem('mockOrders', JSON.stringify(allOrders));
        setPendingOrders(allOrders.filter((o: any) => o.estado !== "RECIBIDA" && o.estado !== "VENCIDA"));
        setSelectedOrderId("");
        setRowsState({});
        alert(`¡Recepción de la Orden OC-${selectedOrderId} finalizada correctamente! El estado ha cambiado a RECIBIDA.`);
      }
    }
  };

  const isOrderFullyReceived = currentOrder ? currentOrder.items.every((it: any) => rowsState[it.prodId]?.isReceived) : false;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight text-[#0F172A]">Recepción Técnica</h1>
          <p className="text-sm text-slate-500 mt-1.5 font-medium">
            Planilla de control técnico y regulatorio para el ingreso de medicamentos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-white border-slate-200 text-slate-600 shadow-sm h-10 px-4">
            <Printer className="w-4 h-4 mr-2" />
            Imprimir Acta
          </Button>
          <div className="w-[300px]">
            <select 
              className="w-full h-10 px-3 rounded-lg border border-slate-300 shadow-sm text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
              value={selectedOrderId}
              onChange={(e) => handleOrderSelect(Number(e.target.value))}
            >
              <option value="" disabled>1. Seleccione Orden de Compra...</option>
              {pendingOrders.map(o => (
                <option key={o.id} value={o.id}>OC-{o.id} - {o.proveedor}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {currentOrder ? (
        <Card className="shadow-md border-slate-200 overflow-hidden">
          <div className="p-4 bg-[#0F172A] flex justify-between items-center text-white">
            <div className="flex items-center gap-4">
              <FileText className="w-5 h-5 text-[#0EA5E9]" />
              <h2 className="font-heading font-bold tracking-wide">ACTA DE RECEPCIÓN: OC-{currentOrder.id}</h2>
              <Badge className="bg-white/10 hover:bg-white/20 text-white border-none">{currentOrder.proveedor}</Badge>
            </div>
            <span className="text-xs font-medium text-slate-300 uppercase tracking-wider">Fecha: {fechaActual}</span>
          </div>
          
          <div className="overflow-x-auto">
            <Table className="min-w-[1400px]">
              <TableHeader className="bg-slate-100">
                <TableRow className="border-b border-slate-200">
                  <TableHead className="text-[11px] font-bold text-slate-700 uppercase p-2 border-r border-slate-200">Nombre Genérico/Comercial</TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-700 uppercase p-2 border-r border-slate-200">Forma Fceútica</TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-700 uppercase p-2 border-r border-slate-200">Concentración</TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-700 uppercase p-2 border-r border-slate-200">Lab. Fabricante</TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-700 uppercase p-2 border-r border-slate-200">Presentación Com.</TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-700 uppercase p-2 border-r border-slate-200">Reg. Sanitario</TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-700 uppercase p-2 border-r border-slate-200 w-24 text-center bg-[#0EA5E9]/10">Muestra (AQL)</TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-700 uppercase p-2 border-r border-slate-200 w-32">Nº Lote</TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-700 uppercase p-2 border-r border-slate-200 w-36">Vencimiento</TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-700 uppercase p-2 border-r border-slate-200 w-28">Cant. Recibida</TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-700 uppercase p-2 border-r border-slate-200 w-28">T de Recepción</TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-700 uppercase p-2 w-28 text-center">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentOrder.items.map((item: any) => {
                  const state = rowsState[item.prodId] || {};
                  const isReceived = state.isReceived;
                  
                  // Calculo de muestra dinámica basado en la cantidad que el usuario está escribiendo
                  const cantNumerica = parseInt(state.cantRecibida) || 0;
                  const muestra = cantNumerica > 0 ? calculateAQL(cantNumerica).n : 0;
                  
                  // Alertas dinámicas
                  const isRanitidina = item.nombre.toLowerCase().includes("ranitidina");
                  
                  return (
                    <TableRow key={item.prodId} className={`border-b border-slate-100 transition-colors ${isReceived ? 'bg-emerald-50/50' : 'hover:bg-slate-50'}`}>
                      <TableCell className="p-2 border-r border-slate-100">
                        <div className="font-bold text-[12px] text-[#0F172A]">{item.nombre}</div>
                        {isRanitidina && !isReceived && (
                          <div className="text-[9px] font-bold text-rose-600 mt-1 flex items-center gap-1"><ShieldAlert className="w-3 h-3"/> Alerta INVIMA</div>
                        )}
                      </TableCell>
                      <TableCell className="p-2 border-r border-slate-100 text-[11px] text-slate-600">{item.formaFarma}</TableCell>
                      <TableCell className="p-2 border-r border-slate-100 text-[11px] font-mono text-slate-600">{item.concentracion}</TableCell>
                      <TableCell className="p-2 border-r border-slate-100 text-[11px] text-slate-600">{item.laboratorio}</TableCell>
                      <TableCell className="p-2 border-r border-slate-100 text-[11px] text-slate-600">{item.presentacion}</TableCell>
                      <TableCell className="p-2 border-r border-slate-100 text-[11px] text-slate-600 font-mono">{item.regSanitario}</TableCell>
                      
                      <TableCell className="p-2 border-r border-slate-100 text-center bg-[#0EA5E9]/5">
                        <span className="text-[14px] font-bold text-[#0EA5E9]">{muestra > 0 ? muestra : '-'}</span>
                      </TableCell>
                      
                      <TableCell className="p-2 border-r border-slate-100">
                        <Input 
                          disabled={isReceived}
                          value={state?.lote ?? ""}
                          onChange={(e) => handleRowChange(item.prodId, "lote", e.target.value)}
                          className="h-8 text-[11px] px-2 uppercase font-mono shadow-inner border-slate-300 focus-visible:ring-1 focus-visible:ring-[#0EA5E9]" 
                          placeholder="Ej: L123" 
                        />
                      </TableCell>
                      
                      <TableCell className="p-2 border-r border-slate-100">
                        <Input 
                          disabled={isReceived}
                          type="date"
                          value={state?.vencimiento ?? ""}
                          onChange={(e) => handleRowChange(item.prodId, "vencimiento", e.target.value)}
                          className="h-8 text-[11px] px-2 shadow-inner border-slate-300 focus-visible:ring-1 focus-visible:ring-[#0EA5E9]" 
                        />
                      </TableCell>
                      
                      <TableCell className="p-2 border-r border-slate-100 relative">
                        <Input 
                          disabled={isReceived}
                          type="number"
                          min="0"
                          value={state?.cantRecibida ?? ""}
                          onChange={(e) => handleRowChange(item.prodId, "cantRecibida", e.target.value)}
                          className="h-8 text-[12px] px-2 font-bold shadow-inner border-slate-300 focus-visible:ring-1 focus-visible:ring-[#0EA5E9]" 
                          placeholder={`Esp: ${item.cantidadEsperada}`}
                        />
                        {!isReceived && state?.cantRecibida && parseInt(state.cantRecibida) !== item.cantidadEsperada && parseInt(state.cantRecibida) > 0 && (
                           <div className="absolute top-1 right-3 text-[9px] text-amber-500 font-bold" title="No coincide con la Orden">
                             <AlertTriangle className="w-3 h-3" />
                           </div>
                        )}
                      </TableCell>
                      
                      <TableCell className="p-2 border-r border-slate-100">
                        <Input 
                          disabled={isReceived}
                          value={state?.tRecepcion ?? ""}
                          onChange={(e) => handleRowChange(item.prodId, "tRecepcion", e.target.value)}
                          className="h-8 text-[11px] px-2 shadow-inner border-slate-300 focus-visible:ring-1 focus-visible:ring-[#0EA5E9]" 
                        />
                      </TableCell>
                      
                      <TableCell className="p-2 text-center">
                        {isReceived ? (
                          <div className="flex items-center justify-center gap-1 text-emerald-600 bg-emerald-100 rounded px-2 py-1">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">OK</span>
                          </div>
                        ) : (
                          <Button 
                            size="sm"
                            className="h-8 w-full bg-[#0F172A] hover:bg-[#0EA5E9] text-white text-[11px] font-bold"
                            onClick={() => handleReceiveRow(item.prodId)}
                          >
                            Recibir
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-between items-center">
            <span className="text-xs text-slate-500">
              La tabla se autoguarda localmente por sesión. Verifique el semáforo de Alertas INVIMA antes de recibir.
            </span>
            {isOrderFullyReceived && (
              <Button 
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold animate-in zoom-in duration-300"
                onClick={handleFinishOrder}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Finalizar y Cerrar Acta
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 flex flex-col items-center justify-center min-h-[400px] text-slate-400">
          <FileText className="w-12 h-12 mb-3 opacity-20" />
          <p className="text-sm font-medium">Selecciona una Orden de Compra en la parte superior para visualizar la planilla.</p>
        </div>
      )}
    </div>
  );
}
