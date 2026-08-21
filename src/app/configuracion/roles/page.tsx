import { prisma } from "@/lib/prisma";
import RolesView from "./RolesView";

export default async function RolesPage() {
  const roles = await prisma.rol.findMany({
    orderBy: { id: 'asc' }
  });
  
  const usuarios = await prisma.usuario.findMany({
    include: { rol: true },
    orderBy: { id: 'asc' }
  });

  return <RolesView initialRoles={roles} initialUsuarios={usuarios} />;
}
