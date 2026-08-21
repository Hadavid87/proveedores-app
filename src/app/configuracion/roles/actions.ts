"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

// ROLES CRUD
export async function createRol(data: any) {
  try {
    await prisma.rol.create({
      data: {
        nombre: data.nombre.toUpperCase(),
        descripcion: data.descripcion,
        esCustom: true,
        activo: data.activo,
      }
    });
    revalidatePath("/configuracion/roles");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateRol(id: number, data: any) {
  try {
    await prisma.rol.update({
      where: { id },
      data: {
        nombre: data.nombre.toUpperCase(),
        descripcion: data.descripcion,
        activo: data.activo,
      }
    });
    revalidatePath("/configuracion/roles");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteRol(id: number) {
  try {
    const rol = await prisma.rol.findUnique({ where: { id }, include: { usuarios: true }});
    if (rol?.usuarios.length) {
      return { error: "No se puede eliminar el rol porque tiene usuarios asignados." };
    }
    await prisma.rol.delete({ where: { id } });
    revalidatePath("/configuracion/roles");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

// USUARIOS CRUD
export async function createUsuario(data: any) {
  try {
    const passwordHash = await bcrypt.hash(data.password, 10);
    await prisma.usuario.create({
      data: {
        nombre: data.nombre,
        email: data.email,
        passwordHash,
        rolId: Number(data.rolId),
      }
    });
    revalidatePath("/configuracion/roles");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateUsuario(id: number, data: any) {
  try {
    const updateData: any = {
      nombre: data.nombre,
      email: data.email,
      rolId: Number(data.rolId),
    };
    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }
    
    await prisma.usuario.update({
      where: { id },
      data: updateData,
    });
    revalidatePath("/configuracion/roles");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteUsuario(id: number) {
  try {
    await prisma.usuario.delete({ where: { id } });
    revalidatePath("/configuracion/roles");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
