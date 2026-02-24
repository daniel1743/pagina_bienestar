import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { setTwoFactorVerified } from '@/lib/adminConfig';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Users,
  CalendarDays,
  Settings,
  ShieldCheck,
  AlertTriangle,
  LogOut,
  Home,
} from 'lucide-react';
import DashboardOverviewModule from '@/components/admin/DashboardOverviewModule';
import ArticleManagementModule from '@/components/admin/ArticleManagementModule';
import CommentManagementModule from '@/components/admin/CommentManagementModule';
import UserManagementModule from '@/components/admin/UserManagementModule';
import CommunityManagementModule from '@/components/admin/CommunityManagementModule';
import GlobalSettingsModule from '@/components/admin/GlobalSettingsModule';
import SecurityModule from '@/components/admin/SecurityModule';
import EditorialCalendarModule from '@/components/admin/EditorialCalendarModule';
import ReportsModule from '@/components/admin/ReportsModule';

const TAB_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'editorial', label: 'Calendario Editorial', icon: CalendarDays },
  { id: 'articles', label: 'CMS Artículos', icon: FileText },
  { id: 'comments', label: 'Comentarios', icon: MessageSquare },
  { id: 'reports', label: 'Errores / Reportes', icon: AlertTriangle },
  { id: 'users', label: 'Usuarios', icon: Users },
  { id: 'community', label: 'Comunidad', icon: Users },
  { id: 'settings', label: 'Configuración', icon: Settings },
  { id: 'security', label: 'Seguridad', icon: ShieldCheck },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { signOut } = useAuth();

  const content = useMemo(() => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverviewModule />;
      case 'articles':
        return <ArticleManagementModule />;
      case 'editorial':
        return <EditorialCalendarModule />;
      case 'comments':
        return <CommentManagementModule />;
      case 'reports':
        return <ReportsModule />;
      case 'users':
        return <UserManagementModule />;
      case 'community':
        return <CommunityManagementModule />;
      case 'settings':
        return <GlobalSettingsModule />;
      case 'security':
        return <SecurityModule />;
      default:
        return null;
    }
  }, [activeTab]);

  const handleSignOut = async () => {
    setTwoFactorVerified(false);
    await signOut();
  };

  return (
    <div className="dark min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
      <Helmet>
        <title>Admin SaaS CMS - Bienestar en Claro</title>
      </Helmet>

      <div className="flex min-h-screen">
        <aside className="hidden lg:flex lg:w-72 border-r border-slate-800 bg-slate-900/80 flex-col">
          <div className="p-6 border-b border-slate-800 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-xl font-bold">Bienestar CMS</h1>
              <Button variant="ghost" size="icon" className="shrink-0 text-slate-400 hover:text-slate-100" asChild title="Ir al inicio">
                <Link to="/"><Home className="w-5 h-5" /></Link>
              </Button>
            </div>
            <p className="text-xs text-slate-400">Panel profesional 2025</p>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {TAB_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                    activeTab === item.id
                      ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40'
                      : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <Button variant="outline" className="w-full" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col">
          <header className="lg:hidden border-b border-slate-800 bg-slate-900/95 p-3 space-y-3 sticky top-0 z-20">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-100">Bienestar CMS</p>
                <p className="text-[11px] text-slate-400">Panel editorial móvil</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="shrink-0" asChild title="Ir al inicio">
                  <Link to="/"><Home className="w-4 h-4" /></Link>
                </Button>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-1" />
                  Salir
                </Button>
              </div>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-left text-sm text-slate-100"
              >
                Sección: {TAB_ITEMS.find((item) => item.id === activeTab)?.label || 'Dashboard'}
              </button>
              {mobileMenuOpen ? (
                <div className="absolute left-0 right-0 mt-2 rounded-lg border border-slate-700 bg-slate-950 shadow-xl overflow-hidden">
                  {TAB_ITEMS.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-sm ${
                        activeTab === item.id
                          ? 'bg-emerald-500/20 text-emerald-200'
                          : 'text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </header>

          <main className="p-3 sm:p-4 md:p-6">{content}</main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
