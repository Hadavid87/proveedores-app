"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, ShoppingCart, Package, Settings, HelpCircle, Menu, X, Bell, Search, Activity, BarChart, Pill, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { logout } from "@/app/auth/actions";

type NavItem = {
  href?: string;
  icon: any;
  label: string;
  subItems?: { href: string; label: string }[];
};

const navItems: NavItem[] = [
  { href: "/", icon: LayoutDashboard, label: "Tablero" },
  { 
    icon: Users, 
    label: "Gestión de Proveedores",
    subItems: [
      { href: "/proveedores", label: "Directorio" },
      { href: "/seleccion", label: "Selección" },
      { href: "/evaluaciones", label: "Evaluaciones" }
    ]
  },
  { href: "/productos", icon: Pill, label: "Medicamentos" },
  { href: "/ordenes", icon: ShoppingCart, label: "Órdenes de Compra" },
  { href: "/recepciones", icon: Package, label: "Recepción Técnica" },
  { 
    icon: Activity, 
    label: "Control de Calidad",
    subItems: [
      { href: "/calidad", label: "CAPA" },
      { href: "/calidad/aql", label: "Calculadora AQL" }
    ]
  },
  { href: "/reportes", icon: BarChart, label: "Reportes" },
  { 
    icon: Settings, 
    label: "Configuración",
    subItems: [
      { href: "/configuracion/clasificacion", label: "Clasificación" },
      { href: "/configuracion/criterios", label: "Criterios" },
      { href: "/configuracion/roles", label: "Roles y Permisos" }
    ]
  },
];

export function AppLayout({ children, user }: { children: React.ReactNode, user?: any }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const pathname = usePathname() || "/";
  
  // By default, open the group if we are inside one of its subItems
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Auto-open groups based on current path
    navItems.forEach(item => {
      if (item.subItems) {
        const isActiveGroup = item.subItems.some(sub => pathname.startsWith(sub.href));
        if (isActiveGroup) {
          setOpenGroups(prev => ({ ...prev, [item.label]: true }));
        }
      }
    });
  }, [pathname]);

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const renderNavItems = (isMobile = false) => (
    <nav className="flex-1 px-3 space-y-1 mt-4">
      {navItems.map((item) => {
        if (item.subItems) {
          const isOpen = openGroups[item.label];
          const isGroupActive = item.subItems.some(sub => pathname.startsWith(sub.href));
          
          return (
            <div key={item.label} className="space-y-1">
              <button 
                onClick={() => toggleGroup(item.label)}
                className={`w-full flex items-center justify-between text-left px-4 py-3 rounded-lg transition-colors text-[13px] font-bold tracking-wide ${
                  isGroupActive && !isOpen ? "bg-slate-200 text-[#0F172A]" : "text-slate-600 hover:bg-slate-200"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className={`w-[18px] h-[18px] ${isGroupActive ? "text-[#0F172A]" : "text-slate-500"}`} />
                  <span className="text-left">{item.label}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="pl-11 pr-2 py-1 space-y-1">
                  {item.subItems.map(sub => {
                    const isSubActive = pathname === sub.href || (pathname.startsWith(sub.href) && sub.href !== '/');
                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={() => isMobile && setIsMobileMenuOpen(false)}
                        className={`block px-3 py-2 rounded-md text-[13px] font-bold transition-colors ${
                          isSubActive 
                            ? "bg-[#0EA5E9] text-white shadow-sm" 
                            : "text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                        }`}
                      >
                        {sub.label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          );
        }

        const isActive = pathname === item.href || (pathname.startsWith(item.href!) && item.href !== '/');
        return (
          <Link 
            key={item.href} 
            href={item.href!} 
            onClick={() => isMobile && setIsMobileMenuOpen(false)}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-[13px] font-bold tracking-wide ${
              isActive 
                ? "bg-[#0EA5E9] text-white shadow-md" 
                : "text-slate-600 hover:bg-slate-200"
            }`}
          >
            <item.icon className={`w-[18px] h-[18px] ${isActive ? "text-white" : "text-slate-500"}`} />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  );

  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-neutral text-slate-900 font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[260px] flex-col bg-[#f3f4f6] border-r border-slate-200 min-h-screen fixed h-full z-40">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-md flex items-center justify-center overflow-hidden shrink-0">
            <img src="/logo.png" alt="OncoCenter Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-lg font-heading font-bold leading-tight text-[#0F172A]">OncoCenter</h1>
            <p className="text-[10px] text-slate-500 font-medium tracking-wide">Gestión de Proveedores</p>
          </div>
        </div>
        
        {renderNavItems()}

        <div className="p-4 space-y-1 mb-2">
          <Link href="/soporte" className="flex items-center space-x-3 px-4 py-2.5 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors text-[13px] font-bold tracking-wide">
            <HelpCircle className="w-[18px] h-[18px] text-slate-500" />
            <span>Soporte</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-[260px] relative min-h-screen bg-neutral min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4 lg:gap-8">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md">
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative hidden sm:block w-64 md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Buscar proveedores, órdenes..." className="pl-9 h-9 bg-neutral border-slate-200 rounded-full text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-secondary/50" />
            </div>
          </div>
          
          <div className="flex items-center gap-4 lg:gap-6 text-slate-500">
            <div className="relative">
              <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="w-8 h-8 rounded-full bg-[#0EA5E9] border-2 border-white shadow-sm overflow-hidden ml-2 ring-1 ring-slate-100 hover:ring-[#0EA5E9] transition-all group flex items-center justify-center text-white font-bold text-sm" 
                title="Menú de Usuario"
              >
                {user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
              </button>
              
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 origin-top-right animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <p className="font-heading font-bold text-sm text-[#0F172A] truncate">{user?.nombre || 'Usuario'}</p>
                    <p className="text-xs text-slate-500 font-medium truncate">{user?.email || 'admin@oncocenter.com'}</p>
                    <div className="mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#0EA5E9]/10 text-[#0EA5E9]">
                      {user?.rol || 'ADMIN'}
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <form action={logout}>
                      <button type="submit" className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-600 font-semibold rounded-lg hover:bg-rose-50 transition-colors">
                        Cerrar Sesión
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Navigation Dropdown */}
        <nav className={`lg:hidden fixed top-0 left-0 w-64 h-full bg-[#f3f4f6] border-r border-slate-200 p-4 space-y-2 z-50 transform transition-transform duration-200 ease-in-out shadow-2xl ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between mb-8 px-2 mt-2">
            <h1 className="text-xl font-heading font-bold text-[#0F172A]">OncoCenter</h1>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-500 hover:bg-slate-200 rounded-md">
              <X className="w-5 h-5" />
            </button>
          </div>
          {renderNavItems(true)}
        </nav>

        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
