import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { getActionLogs } from '@/lib/adminConfig';
import {
  Activity,
  AlertTriangle,
  FileCheck,
  FileText,
  MessageSquare,
  RefreshCw,
  ShieldAlert,
  UserRoundPlus,
  Users,
} from 'lucide-react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const monthFormatter = new Intl.DateTimeFormat('es', { month: 'short' });

const isDraftStatus = (status) => ['draft', 'borrador'].includes((status || '').toLowerCase());
const isPublishedStatus = (status) =>
  ['published', 'publicado', 'active'].includes((status || '').toLowerCase());
const isPendingStatus = (status) => ['pending', 'pendiente'].includes((status || '').toLowerCase());

const getRecentMonths = (count = 6) => {
  const items = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    items.push({ key, label: monthFormatter.format(date) });
  }
  return items;
};

const toDate = (value) => (value ? new Date(value) : null);
const withinDays = (value, days) => {
  const date = toDate(value);
  if (!date) return false;
  const diff = Date.now() - date.getTime();
  return diff <= days * 24 * 60 * 60 * 1000;
};

const formatDateTime = (value) => {
  if (!value) return 'Sin registro';
  const date = new Date(value);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
};

const metricCardsFrom = (metrics) => [
  {
    key: 'totalArticles',
    label: 'Total artículos',
    value: metrics.totalArticles,
    icon: <FileText className="w-5 h-5 text-cyan-300" />,
  },
  {
    key: 'draftArticles',
    label: 'Borradores',
    value: metrics.draftArticles,
    icon: <FileCheck className="w-5 h-5 text-amber-300" />,
  },
  {
    key: 'publishedArticles',
    label: 'Publicados',
    value: metrics.publishedArticles,
    icon: <FileCheck className="w-5 h-5 text-emerald-300" />,
  },
  {
    key: 'pendingComments',
    label: 'Comentarios pendientes',
    value: metrics.pendingComments,
    icon: <MessageSquare className="w-5 h-5 text-fuchsia-300" />,
  },
  {
    key: 'totalUsers',
    label: 'Total usuarios',
    value: metrics.totalUsers,
    icon: <Users className="w-5 h-5 text-sky-300" />,
  },
  {
    key: 'newUsers7Days',
    label: 'Usuarios nuevos (7 días)',
    value: metrics.newUsers7Days,
    icon: <UserRoundPlus className="w-5 h-5 text-indigo-300" />,
  },
  {
    key: 'activeTopics',
    label: 'Temas activos comunidad',
    value: metrics.activeTopics,
    icon: <Activity className="w-5 h-5 text-violet-300" />,
  },
  {
    key: 'reports',
    label: 'Reportes',
    value: metrics.reports,
    icon: <ShieldAlert className="w-5 h-5 text-rose-300" />,
  },
];

const DashboardOverviewModule = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalArticles: 0,
    draftArticles: 0,
    publishedArticles: 0,
    pendingComments: 0,
    totalUsers: 0,
    newUsers7Days: 0,
    activeTopics: 0,
    reports: 0,
  });
  const [growthData, setGrowthData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  const loadDashboard = async () => {
    setLoading(true);
    const [
      { data: articles, error: articlesError },
      { data: comments, error: commentsError },
      { data: users, error: usersError },
      { data: topics, error: topicsError },
      userReportsResponse,
      errorReportsResponse,
    ] = await Promise.all([
      supabase
        .from('articles')
        .select('id,title,status,created_at,published_at')
        .order('created_at', { ascending: false })
        .limit(2000),
      supabase
        .from('comments')
        .select('id,content,status,created_at')
        .order('created_at', { ascending: false })
        .limit(2000),
      supabase
        .from('user_profiles')
        .select('user_id,name,created_at')
        .order('created_at', { ascending: false })
        .limit(2000),
      supabase
        .from('community_topics')
        .select('id,title,created_at')
        .order('created_at', { ascending: false })
        .limit(2000),
      supabase.from('reported_users').select('id', { count: 'exact', head: true }),
      supabase.from('error_reports').select('id', { count: 'exact', head: true }),
    ]);

    if (articlesError || commentsError || usersError || topicsError) {
      toast({
        title: 'Datos parciales',
        description: 'Algunas métricas no pudieron cargarse completamente.',
        variant: 'destructive',
      });
    }

    const safeArticles = articles || [];
    const safeComments = comments || [];
    const safeUsers = users || [];
    const safeTopics = topics || [];
    const reportsCount = (userReportsResponse?.count || 0) + (errorReportsResponse?.count || 0);

    const nextMetrics = {
      totalArticles: safeArticles.length,
      draftArticles: safeArticles.filter((item) => isDraftStatus(item.status)).length,
      publishedArticles: safeArticles.filter((item) => isPublishedStatus(item.status)).length,
      pendingComments: safeComments.filter((item) => isPendingStatus(item.status)).length,
      totalUsers: safeUsers.length,
      newUsers7Days: safeUsers.filter((item) => withinDays(item.created_at, 7)).length,
      activeTopics: safeTopics.filter((item) => withinDays(item.created_at, 30)).length,
      reports: reportsCount,
    };
    setMetrics(nextMetrics);

    const months = getRecentMonths();
    const growthMap = months.reduce((acc, month) => {
      acc[month.key] = { month: month.label, usuarios: 0, articulos: 0 };
      return acc;
    }, {});

    safeUsers.forEach((item) => {
      const date = toDate(item.created_at);
      if (!date) return;
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      if (growthMap[key]) growthMap[key].usuarios += 1;
    });

    safeArticles.forEach((item) => {
      const date = toDate(item.created_at);
      if (!date) return;
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      if (growthMap[key]) growthMap[key].articulos += 1;
    });

    const chart = months.map((item) => growthMap[item.key]);
    setGrowthData(chart);

    const latestItems = [
      safeArticles[0]
        ? {
            type: 'Artículo',
            title: safeArticles[0].title || 'Actualización de artículo',
            at: safeArticles[0].created_at,
          }
        : null,
      safeComments[0]
        ? {
            type: 'Comentario',
            title: (safeComments[0].content || 'Nuevo comentario').slice(0, 60),
            at: safeComments[0].created_at,
          }
        : null,
      safeTopics[0]
        ? {
            type: 'Comunidad',
            title: safeTopics[0].title || 'Nuevo tema',
            at: safeTopics[0].created_at,
          }
        : null,
      safeUsers[0]
        ? {
            type: 'Usuario',
            title: safeUsers[0].name || 'Nuevo registro',
            at: safeUsers[0].created_at,
          }
        : null,
      getActionLogs()[0]
        ? {
            type: 'Admin',
            title: getActionLogs()[0].action,
            at: getActionLogs()[0].created_at,
          }
        : null,
    ]
      .filter(Boolean)
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, 8);

    setRecentActivity(latestItems);
    setLoading(false);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const cards = useMemo(() => metricCardsFrom(metrics), [metrics]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-100">Dashboard profesional</h2>
          <p className="text-sm text-slate-400">
            Estado operacional del CMS y la comunidad en tiempo real.
          </p>
        </div>
        <Button variant="outline" onClick={loadDashboard} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar métricas
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.key} className="border-slate-700/70 bg-slate-900/70">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">{card.label}</p>
                  <p className="text-3xl font-bold text-slate-100 mt-2">
                    {loading ? '...' : card.value}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-slate-800">{card.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Card className="xl:col-span-2 border-slate-700/70 bg-slate-900/70">
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-100 text-lg">Crecimiento (últimos 6 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: 12,
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="usuarios" stroke="#38bdf8" strokeWidth={3} />
                  <Line type="monotone" dataKey="articulos" stroke="#34d399" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700/70 bg-slate-900/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-100 text-lg">Última actividad del sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.length === 0 && !loading ? (
              <p className="text-sm text-slate-400">No hay actividad reciente.</p>
            ) : null}
            {recentActivity.map((item, idx) => (
              <div
                key={`${item.type}-${idx}-${item.at}`}
                className="rounded-xl border border-slate-700 bg-slate-950/50 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-300">{item.type}</span>
                  <span className="text-[11px] text-slate-500">{formatDateTime(item.at)}</span>
                </div>
                <p className="text-sm text-slate-100 mt-1 line-clamp-2">{item.title}</p>
              </div>
            ))}
            {loading ? (
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Cargando actividad...
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverviewModule;
