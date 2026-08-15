export type Clasificacion = {
  id: number;
  nombreLargo: string;
  nombreCorto: string;
};

export const initialClassifications: Clasificacion[] = [
  { id: 1, nombreLargo: "Proveedores de medicamentos", nombreCorto: "Medicamentos" },
  { id: 2, nombreLargo: "Proveedores de Servicios médicos", nombreCorto: "Servicios Médicos" },
  { id: 3, nombreLargo: "Proveedores de Equipos biomédicos", nombreCorto: "Equipos Biomédicos" },
  { id: 4, nombreLargo: "Proveedores de Equipos de Infraestructura para el soporte asistencial", nombreCorto: "Equipos" },
  { id: 5, nombreLargo: "Proveedores de Insumos y Dispositivos médicos", nombreCorto: "Insumos" },
  { id: 6, nombreLargo: "Proveedores de insumos de limpieza y desinfección de área criticas", nombreCorto: "Limpieza y Desinfección" },
  { id: 7, nombreLargo: "Proveedores de Servicio de manejo de residuos peligrosos", nombreCorto: "Residuos y Peligrosos" },
  { id: 8, nombreLargo: "Proveedores de Esterilización", nombreCorto: "Servicios de Esterilización" },
  { id: 9, nombreLargo: "Proveedores de Servicio de Microbiología", nombreCorto: "Servicios de Microbiología" },
  { id: 10, nombreLargo: "Proveedores de Servicios de Mantenimiento asociados a la prestación del servicio", nombreCorto: "Servicios de Mantenimientos" },
  { id: 11, nombreLargo: "Proveedores de Validación, Calificación y/o Calibraciones", nombreCorto: "Servicios de Validación, Calificación y/o Calibraciones" },
  { id: 12, nombreLargo: "Proveedores de Elementos de Protección Personal", nombreCorto: "Elementos de Protección personal – EPP’S" },
  { id: 13, nombreLargo: "Proveedores de Sistema de Información para el soporte asistencial", nombreCorto: "Servicio de soporte técnico y de mantenimiento" },
  { id: 14, nombreLargo: "Proveedores de Verificación de Riesgos LAFT", nombreCorto: "Servicios de Verificación de Riesgos LAFT" },
  { id: 15, nombreLargo: "Proveedores de Exámenes médicos ocupacionales", nombreCorto: "Servicios de exámenes médicos ocupacionales" },
  { id: 16, nombreLargo: "Proveedores de Servicios Tercerizados", nombreCorto: "Servicios Tercerizados" }
];
