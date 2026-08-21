import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const hash = await bcrypt.hash("admin123", 10);
    const user = await prisma.usuario.upsert({
      where: { email: "admin@oncocenter.com" },
      update: {},
      create: {
        email: "admin@oncocenter.com",
        passwordHash: hash,
        nombre: "Administrador Global",
        rol: "ADMIN",
      },
    });
    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
