"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, Plus, Edit2, Pill, Trash2, Download, Filter, Calendar, FileText, Loader2, Upload } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getProveedores } from "../actions";

export default function ProductosPage() {
  const [allProveedores, setAllProveedores] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [selectedProd, setSelectedProd] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"CREATE" | "EDIT">("CREATE");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProvId, setFilterProvId] = useState<number | "ALL">("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({ 
    id: 0, 
    codigo: "", 
    nombre: "", 
    presentacion: "", 
    precioBase: 0, 
    proveedores: [] as number[], 
    fechaVencimiento: "", 
    fichaTecnicaUrl: null as string | null 
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleCsvUpload = async () => {
    if (!csvFile) return;
    setIsUploading(true);
    try {
      let text = await csvFile.text();
      // Excel saves CSVs in Windows-1252 (ANSI) by default in LATAM.
      // file.text() assumes UTF-8. If it fails, it inserts the replacement character .
      if (text.includes('')) {
        const buffer = await csvFile.arrayBuffer();
        const decoder = new TextDecoder('windows-1252');
        text = decoder.decode(buffer);
      }
      
      const res = await fetch('/api/productos/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvText: text })
      });
      if (res.ok) {
        const data = await res.json();
        alert(`Importación completada:\n- ${data.creados} procesados correctamente\n- ${data.omitidos} omitidos por error`);
        setIsCsvModalOpen(false);
        setCsvFile(null);
        await fetchProductos();
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error desconocido al importar.");
      }
    } catch (e: any) {
      alert("Error al importar CSV: " + e.message);
    }
    setIsUploading(false);
  };

  const fetchProductos = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/productos');
      const provData = await getProveedores();
      setAllProveedores(provData);
      
      if (res.ok) {
        const data = await res.json();
        // Transform DB data to frontend format
        const formatted = data.map((d: any) => ({
          ...d,
          precioBase: Number(d.precioBase),
          proveedores: d.proveedores.map((p: any) => p.proveedorId),
          fechaVencimiento: d.fechaVencimiento ? d.fechaVencimiento.split('T')[0] : ""
        }));
        setProductos(formatted);
        if (formatted.length > 0 && !selectedProd) {
          setSelectedProd(formatted[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const handleOpenCreate = () => {
    setModalMode("CREATE");
    setFormData({ id: 0, codigo: `MED-${String(productos.length + 1).padStart(3, '0')}`, nombre: "", presentacion: "", precioBase: 0, proveedores: [], fechaVencimiento: "", fichaTecnicaUrl: null });
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = () => {
    if (!selectedProd) return;
    setModalMode("EDIT");
    setFormData({ ...selectedProd });
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleProviderToggle = (provId: number) => {
    setFormData(prev => {
      const isSelected = prev.proveedores.includes(provId);
      return {
        ...prev,
        proveedores: isSelected 
          ? prev.proveedores.filter(id => id !== provId)
          : [...prev.proveedores, provId]
      };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const fd = new FormData();
      fd.append('codigo', formData.codigo);
      fd.append('nombre', formData.nombre);
      fd.append('presentacion', formData.presentacion);
      fd.append('precioBase', formData.precioBase.toString());
      if (formData.fechaVencimiento) fd.append('fechaVencimiento', formData.fechaVencimiento);
      fd.append('proveedores', JSON.stringify(formData.proveedores));
      
      if (selectedFile) {
        fd.append('fichaTecnica', selectedFile);
      }
      
      if (modalMode === "EDIT") {
        // If file not changed, but we want to keep it
        fd.append('keepExistingFile', 'true');
      }

      const url = modalMode === "CREATE" ? '/api/productos' : `/api/productos/${formData.id}`;
      const method = modalMode === "CREATE" ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        body: fd
      });

      if (res.ok) {
        await fetchProductos();
        setIsModalOpen(false);
      } else {
        alert("Error al guardar el medicamento.");
      }
    } catch (e) {
      console.error(e);
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!selectedProd) return;
    if (confirm("¿Estás seguro de eliminar este medicamento permanentemente?")) {
      try {
        const res = await fetch(`/api/productos/${selectedProd.id}`, { method: 'DELETE' });
        if (res.ok) {
          setSelectedProd(null);
          fetchProductos();
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const filteredProductos = productos.filter(p => {
    const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || p.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProv = filterProvId === "ALL" ? true : p.proveedores.includes(filterProvId);
    return matchesSearch && matchesProv;
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
      img.onerror = () => resolve("");
    });

    if (imgData) doc.addImage(imgData, 'PNG', 14, 15, 12, 12);
    
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text("Catálogo de Medicamentos", imgData ? 30 : 23, 23);
    
    const provName = filterProvId === "ALL" ? "General" : allProveedores.find(p => p.id === filterProvId)?.razonSocial;

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.text(`OncoCenter | Filtro: ${provName} | Generado: ${new Date().toLocaleDateString()}`, imgData ? 30 : 14, 29);

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(14, 35, 196, 35);
    
    const tableData = filteredProductos.map(p => {
      const provs = p.proveedores.map((id: number) => allProveedores.find(pr => pr.id === id)?.razonSocial).filter(Boolean).join(", ");
      return [
        p.codigo,
        p.nombre,
        p.presentacion,
        `$${p.precioBase.toLocaleString()}`,
        p.fechaVencimiento || "N/A",
        provs
      ];
    });

    autoTable(doc, {
      startY: 42,
      head: [["Código", "Medicamento", "Presentación", "Precio Ref.", "Vencimiento", "Proveedores Autorizados"]],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
      styles: { fontSize: 8, cellPadding: 4, textColor: [51, 65, 85] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: [15, 23, 42] },
        3: { halign: 'right', fontStyle: 'bold', textColor: [14, 165, 233] },
      }
    });

    doc.save(`Medicamentos_${provName?.replace(/\s+/g, '_')}_OncoCenter.pdf`);
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight text-[#0F172A]">Catálogo de Medicamentos</h1>
          <p className="text-sm text-slate-500 mt-1.5 font-medium">
            Gestión de productos y asociación (Muchos a Muchos) con Proveedores autorizados.
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <Button onClick={handleDownloadPDF} variant="outline" className="bg-white border-slate-200 text-slate-700 hover:bg-[#F8FAFC] font-semibold shadow-sm rounded-lg h-10">
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
          <Button onClick={() => setIsCsvModalOpen(true)} variant="outline" className="bg-white border-slate-200 text-[#0EA5E9] hover:bg-[#0EA5E9]/10 font-semibold shadow-sm rounded-lg h-10">
            <Upload className="w-4 h-4 mr-2" />
            Importar CSV
          </Button>
          <Button onClick={handleOpenCreate} className="bg-[#0F172A] hover:bg-[#0F172A]/90 text-white font-semibold shadow-sm rounded-lg h-10 px-5">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Medicamento
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Panel - Table */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white gap-4">
            <div className="flex gap-3 flex-1 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Buscar por Nombre o Código..." 
                  className="pl-9 h-10 border-slate-200 rounded-lg text-sm bg-[#F8FAFC] focus-visible:ring-1 focus-visible:ring-[#0EA5E9]/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative w-64">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <select 
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 text-sm bg-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-[#0EA5E9]/50 text-slate-700"
                  value={filterProvId}
                  onChange={(e) => setFilterProvId(e.target.value === "ALL" ? "ALL" : Number(e.target.value))}
                >
                  <option value="ALL">Todos los proveedores</option>
                  {allProveedores.map(p => <option key={p.id} value={p.id}>{p.razonSocial}</option>)}
                </select>
              </div>
            </div>
            <span className="text-xs text-slate-500 font-semibold tracking-wide shrink-0">{filteredProductos.length} Registros</span>
          </div>
          <div className="overflow-x-auto flex-1 relative">
            {isLoading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                <Loader2 className="w-8 h-8 text-[#0EA5E9] animate-spin" />
              </div>
            )}
            <Table>
              <TableHeader className="bg-[#0F172A]">
                <TableRow className="hover:bg-[#0F172A] border-none">
                  <TableHead className="text-white font-heading font-semibold py-3.5 text-[13px]">Código</TableHead>
                  <TableHead className="text-white font-heading font-semibold py-3.5 text-[13px]">Medicamento</TableHead>
                  <TableHead className="text-white font-heading font-semibold py-3.5 text-[13px]">Presentación</TableHead>
                  <TableHead className="text-white font-heading font-semibold py-3.5 text-[13px]">Vencimiento</TableHead>
                  <TableHead className="text-white font-heading font-semibold py-3.5 text-[13px] text-center">Ficha Téc.</TableHead>
                  <TableHead className="text-white font-heading font-semibold py-3.5 text-[13px] text-right">Precio Ref.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProductos.length > 0 ? filteredProductos.map((prod) => (
                  <TableRow 
                    key={prod.id} 
                    className={`cursor-pointer transition-colors border-b border-slate-100 ${selectedProd?.id === prod.id ? 'bg-[#0EA5E9]/10' : 'hover:bg-[#F8FAFC]'}`}
                    onClick={() => setSelectedProd(prod)}
                  >
                    <TableCell className="text-slate-600 font-mono text-[13px] py-4">{prod.codigo}</TableCell>
                    <TableCell className="font-semibold text-[#0F172A] py-4">{prod.nombre}</TableCell>
                    <TableCell className="text-slate-600 text-[13px] py-4">{prod.presentacion}</TableCell>
                    <TableCell className="text-slate-600 text-[13px] py-4">
                      {prod.fechaVencimiento ? new Date(prod.fechaVencimiento + 'T00:00:00').toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell className="text-center py-4">
                      {prod.fichaTecnicaUrl ? <FileText className="w-4 h-4 text-[#0EA5E9] mx-auto" /> : <span className="text-slate-300">-</span>}
                    </TableCell>
                    <TableCell className="text-right text-[#0F172A] font-bold text-[13px] py-4">
                      ${prod.precioBase.toLocaleString()}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                      {!isLoading && "No se encontraron medicamentos"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Right Panel - Details */}
        {selectedProd ? (
          <div className="xl:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col">
            <div className="h-1.5 w-full bg-[#0EA5E9]" />
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-5">
                <div className="w-12 h-12 bg-[#F8FAFC] rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                  <Pill className="w-5 h-5 text-[#0EA5E9]" />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleOpenEdit} className="p-1.5 text-slate-400 hover:text-[#0EA5E9] hover:bg-[#0EA5E9]/10 rounded-md transition-colors" title="Editar">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={handleDelete} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors" title="Eliminar">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h2 className="text-xl font-heading font-bold text-[#0F172A] mb-1">{selectedProd.nombre}</h2>
              <p className="text-[13px] text-slate-500 font-mono mb-6">Cód: {selectedProd.codigo}</p>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-heading font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">Presentación Comercial</label>
                    <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-[#0F172A] font-medium shadow-sm">
                      {selectedProd.presentacion || "-"}
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-heading font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">Precio Unitario Ref.</label>
                    <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-[#0EA5E9] font-bold shadow-sm">
                      ${selectedProd.precioBase.toLocaleString()} COP
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-heading font-bold text-slate-500 mb-1.5 block uppercase tracking-wider flex items-center gap-1"><Calendar className="w-3.5 h-3.5"/> Vencimiento</label>
                    <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-[#0F172A] font-medium shadow-sm">
                      {selectedProd.fechaVencimiento ? new Date(selectedProd.fechaVencimiento + 'T00:00:00').toLocaleDateString() : "No registrado"}
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-heading font-bold text-slate-500 mb-1.5 block uppercase tracking-wider flex items-center gap-1"><FileText className="w-3.5 h-3.5"/> Ficha Técnica</label>
                    {selectedProd.fichaTecnicaUrl ? (
                      <Button variant="outline" onClick={() => window.open(selectedProd.fichaTecnicaUrl, '_blank')} className="w-full justify-start h-[42px] text-sm text-[#0EA5E9] border-[#0EA5E9]/30 hover:bg-[#0EA5E9]/10">
                        <Download className="w-4 h-4 mr-2" /> Descargar PDF
                      </Button>
                    ) : (
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-400 italic shadow-sm">
                        Sin documento
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-slate-100 pt-6">
                <h3 className="text-[13px] font-heading font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                  Proveedores Asociados ({selectedProd.proveedores.length})
                </h3>
                <div className="space-y-2">
                  {selectedProd.proveedores.map((provId: number) => {
                    const prov = allProveedores.find(p => p.id === provId);
                    return prov ? (
                      <div key={provId} className="p-3 bg-[#F8FAFC] border border-slate-100 rounded-lg flex items-center justify-between">
                        <span className="text-sm font-semibold text-[#0F172A]">{prov.razonSocial}</span>
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">Activo</Badge>
                      </div>
                    ) : null;
                  })}
                  {selectedProd.proveedores.length === 0 && (
                    <p className="text-sm text-slate-500 italic">No hay proveedores asociados.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="xl:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center p-6 text-slate-400">
            {!isLoading && "Selecciona un medicamento para ver los detalles."}
          </div>
        )}
      </div>

      {/* CRUD Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold text-[#0F172A]">
              {modalMode === "CREATE" ? "Nuevo Medicamento" : "Editar Medicamento"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">Código</label>
                <Input 
                  value={formData.codigo} 
                  onChange={e => setFormData({...formData, codigo: e.target.value})}
                  placeholder="MED-000" 
                  disabled={modalMode === "EDIT"}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">Precio Ref.</label>
                <Input 
                  type="number"
                  value={formData.precioBase || ""} 
                  onChange={e => setFormData({...formData, precioBase: Number(e.target.value)})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500">Nombre del Medicamento</label>
              <Input 
                value={formData.nombre} 
                onChange={e => setFormData({...formData, nombre: e.target.value})}
                placeholder="Ej. Dopamina" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500">Presentación</label>
              <Input 
                value={formData.presentacion} 
                onChange={e => setFormData({...formData, presentacion: e.target.value})}
                placeholder="Ej. Ampolla 200mg/5ml" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">Fecha de Vencimiento</label>
                <Input 
                  type="date"
                  value={formData.fechaVencimiento || ""} 
                  onChange={e => setFormData({...formData, fechaVencimiento: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">Ficha Técnica (PDF)</label>
                <div className="flex flex-col gap-1">
                  <Input 
                    type="file"
                    accept=".pdf"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) setSelectedFile(file);
                    }}
                    className="text-xs"
                  />
                  {modalMode === "EDIT" && formData.fichaTecnicaUrl && !selectedFile && (
                    <span className="text-[10px] text-emerald-600 font-medium">Documento actual cargado</span>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-[#0EA5E9]">Proveedores Autorizados (Requisitos Cumplidos)</label>
              <div className="p-3 border border-slate-200 rounded-lg max-h-32 overflow-y-auto space-y-2 bg-[#F8FAFC]">
                {allProveedores.filter(p => p.estado === 'ACTIVO' && p.puntajeActual >= 3.5).map(prov => (
                  <label key={prov.id} className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-[#0EA5E9] focus:ring-[#0EA5E9]"
                      checked={formData.proveedores.includes(prov.id)}
                      onChange={() => handleProviderToggle(prov.id)}
                    />
                    <span className="text-sm text-slate-700 font-medium">{prov.razonSocial}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button disabled={isSaving || !formData.codigo || !formData.nombre} className="bg-[#0F172A] text-white hover:bg-[#0F172A]/90 min-w-[120px]" onClick={handleSave}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : modalMode === "CREATE" ? "Crear Medicamento" : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CSV Import Modal */}
      <Dialog open={isCsvModalOpen} onOpenChange={setIsCsvModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold text-[#0F172A]">Importación Masiva (CSV)</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-600 border border-slate-100">
              <p className="font-bold mb-2 text-slate-700">Instrucciones:</p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Descarga la plantilla CSV y ábrela en Excel.</li>
                <li>Llena las filas con los datos de los medicamentos.</li>
                <li>Asegúrate de guardarlo como formato <strong>Valores separados por comas (.csv)</strong>.</li>
                <li>Si un código ya existe, su información será actualizada.</li>
              </ol>
              <div className="mt-4">
                <a href="/plantilla_medicamentos.csv" download className="inline-flex items-center text-[#0EA5E9] font-bold hover:underline">
                  <Download className="w-4 h-4 mr-1" /> Descargar Plantilla
                </a>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#0F172A]">Subir archivo lleno (.csv)</label>
              <div className="flex items-center gap-2">
                <Input type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files?.[0] || null)} className="cursor-pointer" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsCsvModalOpen(false); setCsvFile(null); }}>Cancelar</Button>
            <Button onClick={handleCsvUpload} disabled={!csvFile || isUploading} className="bg-[#0EA5E9] hover:bg-[#0284c7] text-white">
              {isUploading ? "Importando..." : "Importar Datos"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
