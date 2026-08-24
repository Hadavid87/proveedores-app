"use server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSession, deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Por favor, ingresa correo y contraseña." };
  }

  try {
    const user = await prisma.usuario.findUnique({
      where: { email },
      include: { rol: true },
    });

    if (!user) {
      console.log("User not found:", email);
      return { error: "Credenciales inválidas." };
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    console.log("Is valid password?", isValidPassword, "for hash:", user.passwordHash);

    if (!isValidPassword) {
      return { error: "Credenciales inválidas." };
    }

    await createSession({
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol.nombre,
      proveedorId: user.proveedorId,
    });
    
    if (user.rol.nombre === 'PROVEEDOR') {
      redirect("/portal");
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }
    console.error("Login error:", error);
    return { error: "Hubo un problema al iniciar sesión. Intenta nuevamente." };
  }
  
  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
