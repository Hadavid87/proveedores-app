import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const hash = "$2b$10$0mbDZ87suUYbIW6KK/eMb.miALMPuzGmlSoKN0zQa34U1vEx0pkaq";
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
