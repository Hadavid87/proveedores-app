"use server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSession, deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Por favor, ingresa correo y contraseña." };
  }

  try {
    const user = await prisma.usuario.findUnique({
      where: { email }
    });

    if (!user) {
      return { error: "Credenciales inválidas." };
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return { error: "Credenciales inválidas." };
    }

    await createSession(user);
    
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Hubo un problema al iniciar sesión. Intenta nuevamente." };
  }
  
  redirect("/");
}

export async function logout() {
  deleteSession();
  redirect("/login");
}
