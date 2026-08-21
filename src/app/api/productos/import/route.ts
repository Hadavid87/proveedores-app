import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { csvText } = await req.json();
    if (!csvText) {
      return NextResponse.json({ error: "No se proporcion archivo CSV." }, { status: 400 });
    }

    let lines = csvText.split(/\r?\n/).map((l: string) => l.trim()).filter((l: string) => l);
    if (lines.length > 0 && lines[0].toLowerCase().startsWith("sep=")) {
      lines.shift(); // Ignore Excel's sep directive
    }
    
    if (lines.length <= 1) {
      return NextResponse.json({ error: "El archivo no tiene datos válidos." }, { status: 400 });
    }

    const delimiter = lines[0].includes(';') ? ';' : ',';
    let creados = 0;
    let omitidos = 0;

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(delimiter).map((v: string) => v.trim());
      if (values.length < 2) continue;

      const codigo = values[0];
      const nombre = values[1];
      const presentacion = values[2] || null;
      const precioBase = parseFloat(values[3] || '0') || 0;
      const fechaVencimientoRaw = values[4];
      
      let fechaVencimiento = null;
      if (fechaVencimientoRaw) {
        // Try parsing DD/MM/YYYY
        const parts = fechaVencimientoRaw.split('/');
        if (parts.length === 3) {
          // Assuming DD/MM/YYYY if first part is > 12, or just force DD/MM/YYYY
          // Excel might save as DD/MM/YYYY
          fechaVencimiento = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00`);
        } else {
          // Fallback to standard parsing
          fechaVencimiento = new Date(fechaVencimientoRaw);
        }
        if (isNaN(fechaVencimiento.getTime())) {
          fechaVencimiento = null;
        }
      }

      if (!codigo || !nombre) {
        omitidos++;
        continue;
      }

      try {
        await prisma.producto.upsert({
          where: { codigo },
          update: {
            nombre,
            presentacion,
            precioBase,
            fechaVencimiento,
          },
          create: {
            codigo,
            nombre,
            presentacion,
            precioBase,
            fechaVencimiento,
          }
        });
        creados++;
      } catch (error) {
        console.error(`Error importando medicamento ${codigo}:`, error);
        omitidos++;
      }
    }

    return NextResponse.json({ creados, omitidos });
  } catch (error: any) {
    console.error("POST /api/productos/import ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
