export type OpcionCriterio = {
  nombre: string;
  valorizacion: number;
};

export type TipoCriterio = {
  id: string;
  nombre: string;
  porcentaje: number;
  opciones: OpcionCriterio[];
};

export type MatrizClasificacion = {
  clasificacionId: number;
  nombre: string;
  criteriosAceptacion: TipoCriterio[];
  criteriosEvaluacion: TipoCriterio[];
};

export const matricesCriterios: MatrizClasificacion[] = [
  {
    clasificacionId: 1, // Medicamentos
    nombre: "Medicamentos",
    criteriosAceptacion: [
      {
        id: "med-ac-1",
        nombre: "FORMA DE PAGO",
        porcentaje: 30,
        opciones: [
          { nombre: "CONTADO", valorizacion: 1 },
          { nombre: "30 DÍAS", valorizacion: 2 },
          { nombre: "60 DÍAS", valorizacion: 3 },
          { nombre: "MAYOR DE 60 DÍAS", valorizacion: 4 },
        ]
      },
      {
        id: "med-ac-2",
        nombre: "DESCUENTO FINANCIERO",
        porcentaje: 25,
        opciones: [
          { nombre: "NO OFRECE", valorizacion: 1 },
          { nombre: "% A 30 DÍAS", valorizacion: 2 },
          { nombre: "% A 60 DÍAS", valorizacion: 3 },
          { nombre: "% A MAYOR DE 60 DÍAS", valorizacion: 4 },
        ]
      },
      {
        id: "med-ac-3",
        nombre: "HABILITACION DISTRIBUCIÓN / BPE",
        porcentaje: 25,
        opciones: [
          { nombre: "NO", valorizacion: 1 },
          { nombre: "SI", valorizacion: 4 },
        ]
      },
      {
        id: "med-ac-4",
        nombre: "SISTEMAS DE GESTIÓN",
        porcentaje: 10,
        opciones: [
          { nombre: "NO", valorizacion: 1 },
          { nombre: "EN PROCESO", valorizacion: 2 },
          { nombre: "SIN CERTIFICAR", valorizacion: 3 },
          { nombre: "SI", valorizacion: 4 },
        ]
      },
      {
        id: "med-ac-5",
        nombre: "LISTAS RESTRICTIVAS",
        porcentaje: 10,
        opciones: [
          { nombre: "SI", valorizacion: 1 },
          { nombre: "NO", valorizacion: 4 },
        ]
      }
    ],
    criteriosEvaluacion: [
      {
        id: "med-ev-1",
        nombre: "TIEMPO DE VENCIMIENTO DEL PRODUCTO",
        porcentaje: 20,
        opciones: [
          { nombre: "A 6 MESES", valorizacion: 1 },
          { nombre: "A 1 AÑO", valorizacion: 2 },
          { nombre: "A 2 AÑOS", valorizacion: 3 },
          { nombre: "A 3 AÑOS", valorizacion: 4 },
        ]
      },
      {
        id: "med-ev-2",
        nombre: "CUMPLIMIENTO EN TIEMPO DE ENTREGA",
        porcentaje: 30,
        opciones: [
          { nombre: "NUNCA", valorizacion: 1 },
          { nombre: "OCASIONAL", valorizacion: 2 },
          { nombre: "FRECUENTE", valorizacion: 3 },
          { nombre: "SIEMPRE", valorizacion: 4 },
        ]
      },
      {
        id: "med-ev-3",
        nombre: "CUMPLIMIENTO EN ESPECIFICACIONES",
        porcentaje: 30,
        opciones: [
          { nombre: "NUNCA", valorizacion: 1 },
          { nombre: "OCASIONAL", valorizacion: 2 },
          { nombre: "FRECUENTE", valorizacion: 3 },
          { nombre: "SIEMPRE", valorizacion: 4 },
        ]
      },
      {
        id: "med-ev-4",
        nombre: "SERVICIO POSTVENTA",
        porcentaje: 10,
        opciones: [
          { nombre: "MALA", valorizacion: 1 },
          { nombre: "REGULAR", valorizacion: 2 },
          { nombre: "BUENA", valorizacion: 3 },
          { nombre: "EXCELENTE", valorizacion: 4 },
        ]
      },
      {
        id: "med-ev-5",
        nombre: "CUMPLIMIENTO REQUISITOS LEGALES",
        porcentaje: 10,
        opciones: [
          { nombre: "NO", valorizacion: 1 },
          { nombre: "SI", valorizacion: 4 },
        ]
      }
    ]
  },
  {
    clasificacionId: 9, // Servicios Microbiológicos
    nombre: "Laboratorios Microbiológicos",
    criteriosAceptacion: [
      {
        id: "mic-ac-1",
        nombre: "FORMA DE PAGO",
        porcentaje: 10,
        opciones: [
          { nombre: "CONTADO", valorizacion: 1 },
          { nombre: "30 DÍAS", valorizacion: 2 },
          { nombre: "60 DÍAS", valorizacion: 3 },
          { nombre: "MÁS DE 60 DÍAS", valorizacion: 4 },
        ]
      },
      {
        id: "mic-ac-2",
        nombre: "SISTEMA DE GESTIÓN",
        porcentaje: 10,
        opciones: [
          { nombre: "NO", valorizacion: 1 },
          { nombre: "EN PROCESO", valorizacion: 2 },
          { nombre: "SIN CERTIFICAR", valorizacion: 3 },
          { nombre: "SI", valorizacion: 4 },
        ]
      },
      {
        id: "mic-ac-3",
        nombre: "GARANTÍA",
        porcentaje: 5,
        opciones: [
          { nombre: "6 MESES", valorizacion: 1 },
          { nombre: "1 AÑO", valorizacion: 2 },
          { nombre: "2 AÑOS", valorizacion: 3 },
          { nombre: "MÁS DE 2 AÑOS", valorizacion: 4 },
        ]
      },
      {
        id: "mic-ac-4",
        nombre: "PRECIO",
        porcentaje: 15,
        opciones: [
          { nombre: "MUY MALO", valorizacion: 1 },
          { nombre: "MALO", valorizacion: 2 },
          { nombre: "BUENO", valorizacion: 3 },
          { nombre: "MUY BUENO", valorizacion: 4 },
        ]
      },
      {
        id: "mic-ac-5",
        nombre: "DISPONIBILIDAD",
        porcentaje: 10,
        opciones: [
          { nombre: "PRESENTA DEMORA", valorizacion: 1 },
          { nombre: "NO SIEMPRE", valorizacion: 2 },
          { nombre: "PARCIALMENTE", valorizacion: 3 },
          { nombre: "SIEMPRE", valorizacion: 4 },
        ]
      },
      {
        id: "mic-ac-6",
        nombre: "EXPERIENCIA",
        porcentaje: 15,
        opciones: [
          { nombre: "MENOR A 6 MESES", valorizacion: 1 },
          { nombre: "1 A 2 AÑOS", valorizacion: 2 },
          { nombre: "3 A 5 AÑOS", valorizacion: 3 },
          { nombre: "MAYOR A 5 AÑOS", valorizacion: 4 },
        ]
      },
      {
        id: "mic-ac-7",
        nombre: "RELACIONES COMERCIALES",
        porcentaje: 5,
        opciones: [
          { nombre: "1", valorizacion: 1 },
          { nombre: "2", valorizacion: 2 },
          { nombre: "ENTRE 3 Y 5", valorizacion: 3 },
          { nombre: "MÁS DE 5", valorizacion: 4 },
        ]
      },
      {
        id: "mic-ac-8",
        nombre: "CERTIFICACIÓN BPL",
        porcentaje: 10,
        opciones: [
          { nombre: "NO", valorizacion: 1 },
          { nombre: "SI", valorizacion: 4 },
        ]
      },
      {
        id: "mic-ac-9",
        nombre: "LISTAS RESTRICTIVAS",
        porcentaje: 20,
        opciones: [
          { nombre: "SI", valorizacion: 1 },
          { nombre: "NO", valorizacion: 4 },
        ]
      }
    ],
    criteriosEvaluacion: [
      {
        id: "mic-ev-1",
        nombre: "CUMPLIMIENTO EN TIEMPOS DE ENTREGA",
        porcentaje: 30,
        opciones: [
          { nombre: "NUNCA", valorizacion: 1 },
          { nombre: "OCASIONAL", valorizacion: 2 },
          { nombre: "FRECUENTE", valorizacion: 3 },
          { nombre: "SIEMPRE", valorizacion: 4 },
        ]
      },
      {
        id: "mic-ev-2",
        nombre: "CUMPLIMIENTO ESPECIFICACIONES SERVICIO",
        porcentaje: 30,
        opciones: [
          { nombre: "NUNCA", valorizacion: 1 },
          { nombre: "OCASIONAL", valorizacion: 2 },
          { nombre: "FRECUENTE", valorizacion: 3 },
          { nombre: "SIEMPRE", valorizacion: 4 },
        ]
      },
      {
        id: "mic-ev-3",
        nombre: "SERVICIO POST VENTA",
        porcentaje: 20,
        opciones: [
          { nombre: "MALO", valorizacion: 1 },
          { nombre: "REGULAR", valorizacion: 2 },
          { nombre: "BUENO", valorizacion: 3 },
          { nombre: "EXCELENTE", valorizacion: 4 },
        ]
      },
      {
        id: "mic-ev-4",
        nombre: "CUMPLIMIENTO REQUISITOS LEGALES",
        porcentaje: 20,
        opciones: [
          { nombre: "NO", valorizacion: 1 },
          { nombre: "SI", valorizacion: 4 },
        ]
      }
    ]
  },
  {
    clasificacionId: 16, // Tercerizados
    nombre: "Servicios Tercerizados",
    criteriosAceptacion: [
      {
        id: "ter-ac-1",
        nombre: "TARIFAS",
        porcentaje: 15,
        opciones: [
          { nombre: "MALAS", valorizacion: 1 },
          { nombre: "REGULARES", valorizacion: 2 },
          { nombre: "BUENAS", valorizacion: 3 },
          { nombre: "EXCELENTES", valorizacion: 4 },
        ]
      },
      {
        id: "ter-ac-2",
        nombre: "FORMAS DE PAGO",
        porcentaje: 15,
        opciones: [
          { nombre: "CONTADO", valorizacion: 1 },
          { nombre: "30 DÍAS", valorizacion: 2 },
          { nombre: "60 DÍAS", valorizacion: 3 },
          { nombre: "MAS DE 60 DÍAS", valorizacion: 4 },
        ]
      },
      {
        id: "ter-ac-3",
        nombre: "CANALES DE COMUNICACIÓN",
        porcentaje: 25,
        opciones: [
          { nombre: "<2", valorizacion: 1 },
          { nombre: ">1", valorizacion: 2 },
          { nombre: ">2", valorizacion: 3 },
          { nombre: ">3", valorizacion: 4 },
        ]
      },
      {
        id: "ter-ac-4",
        nombre: "EXPERIENCIA",
        porcentaje: 20,
        opciones: [
          { nombre: "< 1 AÑO", valorizacion: 1 },
          { nombre: "ENTRE 1 Y 2 AÑOS", valorizacion: 2 },
          { nombre: "ENTRE 2 Y 3 AÑOS", valorizacion: 3 },
          { nombre: "MAS DE 3 AÑOS", valorizacion: 4 },
        ]
      },
      {
        id: "ter-ac-5",
        nombre: "SERVICIOS OFRECIDOS",
        porcentaje: 25,
        opciones: [
          { nombre: "SERVICIOS ÚNICOS", valorizacion: 1 },
          { nombre: "POCOS SERVICIOS", valorizacion: 2 },
          { nombre: "MULTISERVICIOS", valorizacion: 3 },
          { nombre: "SERVICIOS DIVERSIFICADOS", valorizacion: 4 },
        ]
      }
    ],
    criteriosEvaluacion: [
      {
        id: "ter-ev-1",
        nombre: "SATISFACCIÓN DE USUARIOS",
        porcentaje: 45,
        opciones: [
          { nombre: "DEFICIENTE", valorizacion: 1 },
          { nombre: "ACEPTABLE", valorizacion: 2 },
          { nombre: "SATISFACTORIO", valorizacion: 3 },
        ]
      },
      {
        id: "ter-ev-2",
        nombre: "OPORTUNIDAD DE ATENCIÓN",
        porcentaje: 35,
        opciones: [
          { nombre: "REGULAR", valorizacion: 1 },
          { nombre: "BUENA", valorizacion: 2 },
          { nombre: "EXCELENTE", valorizacion: 3 },
        ]
      },
      {
        id: "ter-ev-3",
        nombre: "RESPUESTA A SOLICITUDES",
        porcentaje: 20,
        opciones: [
          { nombre: "TARDÍA", valorizacion: 1 },
          { nombre: "OPORTUNA", valorizacion: 2 },
          { nombre: "INMEDIATA", valorizacion: 3 },
        ]
      }
    ]
  }
];
