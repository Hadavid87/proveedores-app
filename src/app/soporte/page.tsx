"use client";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HelpCircle, Bot, Send, User, ChevronDown, ChevronRight, BookOpen, Search, Info } from "lucide-react";

const documentation = [
  {
    id: "proveedores",
    title: "1. Gestión de Proveedores",
    content: (
      <div className="space-y-2 text-sm text-slate-600">
        <p><strong>Directorio:</strong> Permite registrar, editar y visualizar el listado de proveedores aprobados. Puedes ver detalles de contacto, RIT, e historial.</p>
        <p><strong>Selección:</strong> Utiliza una matriz multicriterio (Experiencia, Calidad, Precio, Tiempos). Asigna pesos a cada criterio y el sistema calculará un puntaje final para decidir si el proveedor es idóneo.</p>
        <p><strong>Evaluaciones:</strong> Registra evaluaciones periódicas (anuales). Los proveedores con calificación menor a 3.5 requieren un Plan de Mejora. Usa indicadores visuales para alertas de vencimiento.</p>
      </div>
    )
  },
  {
    id: "ordenes",
    title: "2. Órdenes de Compra",
    content: (
      <div className="space-y-2 text-sm text-slate-600">
        <p>El tablero muestra órdenes divididas en tres estados lógicos:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Emitidas:</strong> Recién creadas y enviadas al proveedor.</li>
          <li><strong>En Tránsito:</strong> Confirmadas por el proveedor y en camino.</li>
          <li><strong>Recibidas:</strong> Órdenes que completaron el proceso de Recepción Técnica.</li>
        </ul>
        <p>Desde aquí puedes emitir nuevas OC seleccionando un proveedor y agregando ítems del maestro de medicamentos.</p>
      </div>
    )
  },
  {
    id: "recepcion",
    title: "3. Recepción Técnica (Asistente)",
    content: (
      <div className="space-y-2 text-sm text-slate-600">
        <p>Proceso de 3 pasos (Wizard) para validar la mercancía recibida:</p>
        <ol className="list-decimal pl-5 space-y-1">
          <li><strong>Recepción Administrativa (7.2):</strong> Lista de chequeo (checklist) de la factura, entrega y cantidad. Si falla, va a Cuarentena.</li>
          <li><strong>Recepción Técnica AQL (7.3):</strong> El sistema calcula automáticamente el tamaño de muestra (Nivel II) y los límites de aceptación de defectos críticos (0), mayores (1.5) y menores (4.0). Debes registrar los datos técnicos (lote, vencimiento, T°).</li>
          <li><strong>Evaluación Técnica FSF-024 (7.13):</strong> Se evalúa Empaque, Etiqueta y Características físicas. El sistema asigna un puntaje del 1 al 4 dependiendo del porcentaje de cumplimiento.</li>
        </ol>
        <p>El sistema genera alertas visuales automáticas para medicamentos <strong>LASA</strong>.</p>
      </div>
    )
  },
  {
    id: "medicamentos",
    title: "4. Maestro de Medicamentos",
    content: (
      <div className="space-y-2 text-sm text-slate-600">
        <p>Catálogo centralizado. Permite gestionar nombres comerciales, principios activos, concentraciones, laboratorios y registros INVIMA. Configura las alertas LASA desde este módulo para que la recepción técnica esté informada.</p>
      </div>
    )
  }
];

export default function SoportePage() {
  const [activeDoc, setActiveDoc] = useState<string | null>("recepcion");
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: '¡Hola! Soy tu asistente de Inteligencia Artificial para OncoManage. Puedo ayudarte a resolver dudas sobre cómo usar los módulos, políticas de recepción técnica, o cualquier otra consulta del aplicativo. ¿En qué te puedo ayudar hoy?' }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = chatInput.trim();
    setMessages(prev => [...prev, { role: 'user', text: newMsg }]);
    setChatInput("");
    setIsTyping(true);

    // Simulated AI Response based on keywords
    setTimeout(() => {
      let reply = "No estoy seguro de tener la respuesta exacta. Por favor revisa el Manual de Usuario en la izquierda o contacta al administrador del sistema.";
      
      const lower = newMsg.toLowerCase();
      if (lower.includes("aql") || lower.includes("recepcion") || lower.includes("técnica")) {
        reply = "Para la recepción técnica utilizamos las tablas AQL bajo ISO 2859-1 (Nivel de Inspección II). El sistema calcula la letra y tamaño de muestra de forma automática según la cantidad recibida. Los defectos permitidos son Críticos: 0%, Mayores: 1.5%, Menores: 4.0%. Si ingresas defectos por encima de estos límites, el ítem se envía a Cuarentena.";
      } else if (lower.includes("lasa")) {
        reply = "Los medicamentos LASA (Look-Alike, Sound-Alike) son aquellos de alto riesgo por su similitud fonética o visual. En OncoManage, cuando proceses una Recepción Técnica, el sistema te alertará automáticamente en color rojo si el medicamento está catalogado como LASA para que tomes precauciones adicionales.";
      } else if (lower.includes("orden") || lower.includes("compras")) {
        reply = "Las órdenes de compra pasan por 3 estados: Emitidas, En Tránsito, y Recibidas. Una vez que apruebas la Recepción Técnica de todos los ítems de una orden, esta pasa automáticamente al estado 'Recibidas'.";
      } else if (lower.includes("evaluacion") || lower.includes("fsf-024")) {
        reply = "La Evaluación Técnica (FSF-024) es el paso final de la recepción. Se te harán preguntas de cumplimiento y el sistema asignará un puntaje de 1 a 4 según el porcentaje (ej. Mayor a 90% = 4). Puedes descargar esto como un PDF.";
      } else if (lower.includes("hola") || lower.includes("saludos")) {
        reply = "¡Hola! Estoy listo para ayudarte con OncoManage. Escribe tu pregunta sobre cualquier módulo.";
      }

      setMessages(prev => [...prev, { role: 'ai', text: reply }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 h-[calc(100vh-140px)] flex flex-col">
      <div>
        <h1 className="text-3xl font-heading font-bold tracking-tight text-[#0F172A]">Soporte y Ayuda</h1>
        <p className="text-sm text-slate-500 mt-1.5 font-medium">
          Manual de procedimientos e Inteligencia Artificial de consulta.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 flex-1 min-h-0">
        
        {/* Left Column: Documentation */}
        <Card className="flex flex-col h-full shadow-md border-slate-200">
          <CardHeader className="bg-slate-50 border-b pb-4">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-[#0EA5E9]" />
              <CardTitle className="text-lg">Manual de Usuario</CardTitle>
            </div>
            <CardDescription>Procedimientos paso a paso de los módulos principales.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {documentation.map((doc) => (
              <div key={doc.id} className="border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setActiveDoc(activeDoc === doc.id ? null : doc.id)}
                  className={`w-full flex items-center justify-between p-4 text-left font-bold transition-colors ${activeDoc === doc.id ? 'bg-[#0EA5E9]/10 text-[#0EA5E9]' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                >
                  <span>{doc.title}</span>
                  {activeDoc === doc.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                {activeDoc === doc.id && (
                  <div className="p-4 bg-white border-t border-slate-100 animate-in slide-in-from-top-2">
                    {doc.content}
                  </div>
                )}
              </div>
            ))}
            
            <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-800 text-sm">¿Necesitas soporte técnico?</h4>
                <p className="text-xs text-amber-700 mt-1">Si encuentras un error en la plataforma, por favor repórtalo enviando una captura de pantalla al departamento de TI a <strong>soporte@oncocenter.com</strong>.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: AI Assistant */}
        <Card className="flex flex-col h-full shadow-md border-slate-200">
          <CardHeader className="bg-[#0F172A] text-white border-b pb-4 rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="bg-[#0EA5E9] p-1.5 rounded-md">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Asistente IA de OncoManage</CardTitle>
                <CardDescription className="text-slate-300 text-xs mt-0.5">Respuestas automáticas sobre el uso del sistema</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden bg-slate-50/50">
            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-[#0EA5E9] text-white'}`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`p-3 rounded-2xl text-sm shadow-sm ${msg.role === 'user' ? 'bg-[#0F172A] text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-3 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-[#0EA5E9] text-white flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 rounded-tl-sm flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-200">
              <form onSubmit={handleSendMessage} className="flex gap-2 relative">
                <Input 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Pregúntale a la IA sobre la Recepción Técnica..."
                  className="flex-1 pr-12 bg-slate-50 focus-visible:ring-[#0EA5E9]"
                  disabled={isTyping}
                />
                <Button type="submit" size="icon" disabled={!chatInput.trim() || isTyping} className="absolute right-1 top-1 h-8 w-8 bg-[#0EA5E9] hover:bg-[#0284c7] rounded-md">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              <div className="text-center mt-2">
                 <span className="text-[10px] text-slate-400">La IA puede cometer errores. Verifica la información con el Manual de Usuario.</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
