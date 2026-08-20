"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, Filter, Plus, Edit2, Building2, Mail, Phone, Trash2, Download, FileText, Upload, CheckCircle2, X, RefreshCw } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { initialClassifications } from "@/lib/mockClasificaciones";
import { getProveedores, createProveedor, updateProveedor, deleteProveedor } from "../actions";

const defaultDocs = {
  docFormularioRegistro: "OK", docRut: "OK", docCamaraComercio: "OK", docCertificacionBancaria: "OK",
  docCedulaRepLegal: "OK", docHabilitacion: "N/A", docVerificacionLAFT: "OK", solicitudActualizacion: "NO",
  fechaFormulario: "2024-01-15", fechaInicioComercial: "2024-02-01"
};

const defaultForm = {
  razonSocial: "", nit: "", kamNombre: "", emailLogistica: "", clasificacionId: 1,
  docFormularioRegistro: "NO", docRut: "NO", docCamaraComercio: "NO", docCertificacionBancaria: "NO",
  docCedulaRepLegal: "NO", docHabilitacion: "NO", docVerificacionLAFT: "NO", solicitudActualizacion: "NO",
  fechaFormulario: "", fechaInicioComercial: ""
};

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [selectedProv, setSelectedProv] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"CREATE" | "EDIT">("CREATE");
  const [formData, setFormData] = useState<any>(defaultForm);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClasificacionId, setFilterClasificacionId] = useState<number | "">("");
  const [isLoading, setIsLoading] = useState(true);

  const loadProveedores = async () => {
    setIsLoading(true);
    try {
      const data = await getProveedores();
      // Inject default docs for visual completeness in the demo
      const enriched = data.map((p: any) => ({ ...p, clasificacionId: 1, ...defaultDocs }));
      setProveedores(enriched);
      if (enriched.length > 0 && !selectedProv) setSelectedProv(enriched[0]);
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadProveedores();
  }, []);

  const handleOpenCreate = () => {
    setModalMode("CREATE");
    setFormData({ ...defaultForm });
    setIsModalOpen(true);
  };

  const handleOpenEdit = () => {
    if (!selectedProv) return;
    setModalMode("EDIT");
    setFormData({ 
      ...defaultForm,
      ...selectedProv
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (modalMode === "CREATE") {
        await createProveedor(formData);
      } else {
        await updateProveedor(selectedProv.id, formData);
      }
      setIsModalOpen(false);
      await loadProveedores();
    } catch (e) {
      console.error("Error saving proveedor:", e);
      alert("Hubo un error al guardar el proveedor. Revisa si el NIT ya existe.");
    }
  };

  const handleDelete = async () => {
    if (!selectedProv) return;
    if (confirm("¿Estás seguro de eliminar este proveedor? Toda su información y órdenes asociadas podrían verse afectadas.")) {
      try {
        await deleteProveedor(selectedProv.id);
        setSelectedProv(null);
        await loadProveedores();
      } catch(e) {
         console.error(e);
         alert("No se puede eliminar el proveedor porque tiene órdenes asociadas.");
      }
    }
  };

  const filteredProveedores = proveedores.filter(p => {
    const matchSearch = p.razonSocial.toLowerCase().includes(searchTerm.toLowerCase()) || p.nit.includes(searchTerm);
    const matchClasif = filterClasificacionId === "" ? true : p.clasificacionId === filterClasificacionId;
    return matchSearch && matchClasif;
  });

  const handleDownloadPDF = async () => {
    const doc = new jsPDF();
    
    // Convert logo to base64
    const logoUrl = "/logo.png";
    const imgData = await new Promise<string>((resolve) => {
      const img = new Image();
      img.src = logoUrl;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => resolve(""); // Fallback
    });

    if (imgData) {
      doc.addImage(imgData, 'PNG', 14, 15, 12, 12);
    }
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // #0F172A
    doc.setFont("helvetica", "bold");
    doc.text("Directorio de Proveedores", imgData ? 30 : 14, 23);
    
    // Subtitle
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.setFont("helvetica", "normal");
    doc.text(`OncoCenter - Gestión Oncológica | Generado: ${new Date().toLocaleDateString()}`, imgData ? 30 : 14, 29);

    // Separator line
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.5);
    doc.line(14, 35, 196, 35);
    
    // Table data
    const tableData = filteredProveedores.map(p => [
      p.razonSocial,
      p.nit,
      p.kamNombre,
      p.emailLogistica,
      p.puntajeActual.toString(),
      p.estado
    ]);

    autoTable(doc, {
      startY: 42,
      head: [["Razón Social", "NIT", "KAM", "Email", "Puntaje", "Estado"]],
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: [15, 23, 42], // #0F172A
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: { 
        fontSize: 9,
        cellPadding: 4,
        textColor: [51, 65, 85], // slate-700
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252] // slate-50
      },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: [15, 23, 42] },
        4: { halign: 'center', fontStyle: 'bold', textColor: [14, 165, 233] }, // #0EA5E9
        5: { halign: 'center', fontStyle: 'bold' }
      }
    });

    doc.save("Listado_Proveedores_OncoCenter.pdf");
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight text-[#0F172A]">Maestro de Proveedores</h1>
          <p className="text-sm text-slate-500 mt-1.5 font-medium">
            Directorio consolidado y métricas de desempeño (Stotal).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleDownloadPDF} variant="outline" className="bg-white border-slate-200 text-slate-700 hover:bg-[#F8FAFC] font-semibold shadow-sm rounded-lg h-10">
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
          <select 
            className="h-10 px-3 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]"
            value={filterClasificacionId}
            onChange={(e) => setFilterClasificacionId(e.target.value === "" ? "" : Number(e.target.value))}
          >
            <option value="">Todas las clasificaciones</option>
            {initialClassifications.map(c => (
              <option key={c.id} value={c.id}>{c.nombreCorto}</option>
            ))}
          </select>
          <Button onClick={handleOpenCreate} className="bg-[#0F172A] hover:bg-[#0F172A]/90 text-white font-semibold shadow-sm rounded-lg h-10 px-5">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Proveedor
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Panel - Table */}
        <div className={`${selectedProv ? 'xl:col-span-2' : 'xl:col-span-3'} bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all duration-300`}>
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Buscar por Razón Social o NIT..." 
                className="pl-9 h-10 border-slate-200 rounded-lg text-sm bg-[#F8FAFC] focus-visible:ring-1 focus-visible:ring-[#0EA5E9]/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <span className="text-xs text-slate-500 font-semibold tracking-wide">{filteredProveedores.length} Registros</span>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#0F172A]">
                <TableRow className="hover:bg-[#0F172A] border-none">
                  <TableHead className="text-white font-heading font-semibold py-3.5 text-[13px]">Razón Social</TableHead>
                  <TableHead className="text-white font-heading font-semibold py-3.5 text-[13px]">Clasificación</TableHead>
                  <TableHead className="text-white font-heading font-semibold py-3.5 text-[13px]">NIT</TableHead>
                  <TableHead className="text-white font-heading font-semibold py-3.5 text-[13px]">KAM</TableHead>
                  <TableHead className="text-white font-heading font-semibold py-3.5 text-[13px] w-48">Calificación</TableHead>
                  <TableHead className="text-white font-heading font-semibold py-3.5 text-[13px] text-right pr-6">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProveedores.length > 0 ? filteredProveedores.map((prov) => (
                  <TableRow 
                    key={prov.id} 
                    className={`cursor-pointer transition-colors border-b border-slate-100 ${selectedProv?.id === prov.id ? 'bg-[#0EA5E9]/10' : 'hover:bg-[#F8FAFC]'}`}
                    onClick={() => setSelectedProv(prov)}
                  >
                    <TableCell className="font-semibold text-[#0F172A] py-4">{prov.razonSocial}</TableCell>
                    <TableCell className="text-slate-600 text-[12px] font-medium py-4">
                      {initialClassifications.find(c => c.id === prov.clasificacionId)?.nombreCorto || "General"}
                    </TableCell>
                    <TableCell className="text-slate-600 text-[13px] font-mono py-4">{prov.nit}</TableCell>
                    <TableCell className="text-slate-600 text-[13px] py-4">
                      {prov.kamNombre ? prov.kamNombre.split(' ').map((n: string, i: number) => (
                        <div key={i}>{n}</div>
                      )) : <div>-</div>}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${prov.puntajeActual >= 4 ? 'bg-[#0EA5E9]' : prov.puntajeActual >= 3.5 ? 'bg-amber-400' : 'bg-rose-600'}`} 
                            style={{ width: `${(prov.puntajeActual / 5) * 100}%` }}
                          />
                        </div>
                        <span className="text-[13px] font-bold text-[#0F172A]">{prov.puntajeActual}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6 py-4">
                      <Badge variant="outline" className={`border-none px-3 py-1 font-bold tracking-wide text-[10px] ${prov.estado === 'ACTIVO' ? 'bg-emerald-100/80 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                        {prov.estado}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                      No se encontraron proveedores
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Right Panel - Details */}
        {selectedProv ? (
          <div className="xl:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col animate-in slide-in-from-right-4 duration-300">
            <div className="h-1.5 w-full bg-[#8B5CF6]" />
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-5">
                <div className="w-12 h-12 bg-[#F8FAFC] rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleOpenEdit} className="p-1.5 text-slate-400 hover:text-[#0EA5E9] hover:bg-[#0EA5E9]/10 rounded-md transition-colors" title="Editar">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={handleDelete} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors" title="Eliminar">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setSelectedProv(null as any)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors" title="Cerrar panel">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h2 className="text-xl font-heading font-bold text-[#0F172A] mb-1">{selectedProv.razonSocial}</h2>
              <p className="text-[13px] text-slate-500 font-mono mb-6">NIT: {selectedProv.nit}</p>

              {/* Score Card */}
              <div className="bg-[#F8FAFC] rounded-xl p-5 mb-8 border border-slate-100 flex items-center gap-6">
                <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-slate-200" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" />
                    <path className={selectedProv.puntajeActual >= 4 ? "text-[#0EA5E9]" : selectedProv.puntajeActual >= 3.5 ? "text-amber-400" : "text-rose-600"} strokeDasharray={`${(selectedProv.puntajeActual / 5) * 100}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[#0F172A]">
                    {selectedProv.puntajeActual}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-heading font-bold text-[#0EA5E9] uppercase tracking-wide mb-1">Puntaje Stotal</h3>
                  <p className="text-[11px] text-slate-500 leading-snug font-mono bg-white p-1.5 rounded border border-slate-100">
                    Calculado: (0.35 * S_lead) + (0.45 * S_tech) + (0.20 * S_doc)
                  </p>
                </div>
              </div>



              {/* Fields */}
              <div className="space-y-5">
                <div>
                  <label className="text-[11px] font-heading font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">Razón Social</label>
                  <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-[#0F172A] font-medium shadow-sm">
                    {selectedProv.razonSocial}
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-heading font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">Clasificación</label>
                  <div className="p-2.5 bg-[#0EA5E9]/5 border border-[#0EA5E9]/20 rounded-lg text-sm text-[#0EA5E9] font-bold shadow-sm">
                    {initialClassifications.find(c => c.id === selectedProv.clasificacionId)?.nombreLargo || "General"}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-heading font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">NIT</label>
                    <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-[13px] text-[#0F172A] font-mono font-medium shadow-sm">
                      {selectedProv.nit}
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-heading font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">Estado</label>
                    <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-[#0F172A] shadow-sm">
                      {selectedProv.estado}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-5">
                <h3 className="text-[13px] font-heading font-bold text-[#0F172A] mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" /> Documentos y Fechas
                </h3>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                  {[
                    { key: "docFormularioRegistro", label: "Formulario Registro" },
                    { key: "docRut", label: "RUT" },
                    { key: "docCamaraComercio", label: "Cámara de Comercio" },
                    { key: "docCertificacionBancaria", label: "Cert. Bancaria" },
                    { key: "docCedulaRepLegal", label: "Cédula Rep. Legal" },
                    { key: "docHabilitacion", label: "Habilitación" },
                    { key: "docVerificacionLAFT", label: "Verificación LAFT" },
                    { key: "solicitudActualizacion", label: "Solicitud Act." },
                  ].map(doc => (
                    <div key={doc.key} className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium truncate pr-2">{doc.label}</span>
                      <Badge variant="outline" className={`h-5 text-[9px] px-1.5 border-none font-bold ${selectedProv[doc.key as keyof typeof selectedProv] === 'OK' || selectedProv[doc.key as keyof typeof selectedProv] === 'SI' ? 'bg-emerald-100 text-emerald-700' : selectedProv[doc.key as keyof typeof selectedProv] === 'N/A' ? 'bg-slate-100 text-slate-500' : 'bg-rose-100 text-rose-700'}`}>
                        {selectedProv[doc.key as keyof typeof selectedProv] as string}
                      </Badge>
                    </div>
                  ))}
                  <div className="col-span-2 grid grid-cols-2 gap-4 mt-2">
                    <div className="p-2 bg-slate-50 rounded-md border border-slate-100">
                      <span className="text-[10px] text-slate-500 block mb-0.5 font-bold">Fecha Formulario</span>
                      <span className="text-xs font-mono text-[#0F172A]">{selectedProv.fechaFormulario || 'N/A'}</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-md border border-slate-100">
                      <span className="text-[10px] text-slate-500 block mb-0.5 font-bold">Inicio Relaciones</span>
                      <span className="text-xs font-mono text-[#0F172A]">{selectedProv.fechaInicioComercial || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-slate-100 pt-6">
                <h3 className="text-[13px] font-heading font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-400" /> Contactos Principales
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-[#F8FAFC] border border-slate-100 rounded-lg">
                    <p className="text-sm font-semibold text-[#0F172A] mb-2">{selectedProv.kamNombre} <span className="text-slate-500 font-medium">(KAM)</span></p>
                    <div className="flex items-center gap-2 text-[13px] text-slate-600 mb-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {selectedProv.emailLogistica}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="xl:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center p-6 text-slate-400">
            Selecciona un proveedor para ver los detalles.
          </div>
        )}
      </div>

      {/* CRUD Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[850px]">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold text-[#0F172A]">
              {modalMode === "CREATE" ? "Nuevo Proveedor" : "Editar Proveedor"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 overflow-y-auto max-h-[70vh] pr-2">
            {/* Col 1: Info General */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-[#0F172A] border-b pb-2">Información General</h3>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">Razón Social</label>
                <Input value={formData.razonSocial} onChange={e => setFormData({...formData, razonSocial: e.target.value})} placeholder="Nombre de la empresa" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">Clasificación</label>
                <select className="w-full h-10 px-3 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]" value={formData.clasificacionId} onChange={(e) => setFormData({...formData, clasificacionId: Number(e.target.value)})}>
                  {initialClassifications.map(c => (
                    <option key={c.id} value={c.id}>{c.nombreLargo}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500">NIT</label>
                  <Input value={formData.nit} onChange={e => setFormData({...formData, nit: e.target.value})} placeholder="000.000.000-0" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500">Email de Logística</label>
                  <Input type="email" value={formData.emailLogistica} onChange={e => setFormData({...formData, emailLogistica: e.target.value})} placeholder="correo@empresa.com" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">Nombre del KAM</label>
                <Input value={formData.kamNombre} onChange={e => setFormData({...formData, kamNombre: e.target.value})} placeholder="Nombre del KAM" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500">Fecha Formulario</label>
                  <Input type="date" value={formData.fechaFormulario} onChange={e => setFormData({...formData, fechaFormulario: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500">Inicio de Relaciones</label>
                  <Input type="date" value={formData.fechaInicioComercial} onChange={e => setFormData({...formData, fechaInicioComercial: e.target.value})} />
                </div>
              </div>
            </div>

            {/* Col 2: Documentos */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-[#0F172A] border-b pb-2">Documentos de Cumplimiento</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "docFormularioRegistro", label: "Form. Registro" },
                  { key: "docRut", label: "RUT" },
                  { key: "docCamaraComercio", label: "Cámara Comercio" },
                  { key: "docCertificacionBancaria", label: "Cert. Bancaria" },
                  { key: "docCedulaRepLegal", label: "Cédula Rep. Legal" },
                  { key: "docHabilitacion", label: "Habilitación" },
                  { key: "docVerificacionLAFT", label: "Verif. LAFT" },
                  { key: "solicitudActualizacion", label: "Sol. Actualización" },
                ].map(doc => {
                  const isOk = formData[doc.key] === "OK" || formData[doc.key] === "SI";
                  return (
                    <div key={doc.key} className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide truncate block" title={doc.label}>{doc.label}</label>
                      <div className="flex items-center gap-1.5">
                        <label className={`flex-1 flex items-center justify-center h-8 rounded border text-xs font-semibold cursor-pointer transition-colors ${isOk ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                          <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              setFormData({...formData, [doc.key]: "OK"});
                            }
                          }} />
                          {isOk ? (
                            <><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Cargado</>
                          ) : (
                            <><Upload className="w-3.5 h-3.5 mr-1" /> Subir PDF</>
                          )}
                        </label>
                        {isOk && (
                          <button onClick={() => setFormData({...formData, [doc.key]: "NO"})} className="p-1.5 text-slate-400 hover:text-rose-500 rounded hover:bg-rose-50" title="Eliminar archivo">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {!isOk && (
                          <button onClick={() => setFormData({...formData, [doc.key]: "N/A"})} className={`p-1.5 h-8 rounded border text-[9px] font-bold transition-colors ${formData[doc.key] === "N/A" ? "bg-slate-200 border-slate-300 text-slate-700" : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50"}`} title="Marcar como No Aplica">
                            N/A
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button className="bg-[#0F172A] text-white hover:bg-[#0F172A]/90" onClick={handleSave}>
              {modalMode === "CREATE" ? "Crear Proveedor" : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
