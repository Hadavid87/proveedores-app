"use client";
import { useState } from "react";
import { login } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, KeyRound, Mail, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const result = await login(formData);
    
    if (result?.error) {
      setError(result.error);
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/50 blur-3xl opacity-50 -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-100/50 blur-3xl opacity-50 -z-10" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden mb-6">
            <img src="/logo.png" alt="OncoCenter Logo" className="w-12 h-12 object-contain" />
          </div>
          <h2 className="text-center text-3xl font-heading font-bold text-[#0F172A] tracking-tight">
            OncoManage
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500 font-medium">
            Portal Seguro de Proveedores y Calidad
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[400px]">
          <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/40 sm:rounded-2xl border border-slate-100 sm:px-10 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-400 rounded-t-2xl" />
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="email" className="block text-sm font-bold text-slate-700">
                  Correo Electrónico
                </Label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="pl-10 h-11 bg-slate-50 border-slate-200 focus-visible:ring-[#0EA5E9]"
                    placeholder="usuario@oncocenter.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="block text-sm font-bold text-slate-700">
                  Contraseña
                </Label>
                <div className="mt-2 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-slate-400" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="pl-10 h-11 bg-slate-50 border-slate-200 focus-visible:ring-[#0EA5E9]"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-100 rounded-lg p-3 flex items-center gap-3 animate-in shake">
                  <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                  <p className="text-sm font-medium text-rose-800">{error}</p>
                </div>
              )}

              <div>
                <Button 
                  type="submit" 
                  disabled={isPending}
                  className="w-full h-11 bg-[#0F172A] hover:bg-[#0F172A]/90 text-white font-bold text-sm shadow-md"
                >
                  {isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Iniciar Sesión Segura
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center text-xs font-medium text-slate-400 border-t border-slate-100 pt-6">
              © {new Date().getFullYear()} OncoCenter. Uso exclusivo de personal autorizado.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
