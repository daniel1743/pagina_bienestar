import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { readLocalErrorReports, updateLocalErrorReportStatus } from '@/lib/errorReports';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const STATUS_OPTIONS = ['nuevo', 'en_revision', 'resuelto'];

const formatDate = (value) => {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin fecha';
  return date.toLocaleString();
};

const ReportsModule = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [errorReports, setErrorReports] = useState([]);
  const [userReports, setUserReports] = useState([]);
  const [warning, setWarning] = useState('');

  const loadReports = async () => {
    setLoading(true);
    setWarning('');

    const [errorResponse, userResponse] = await Promise.all([
      supabase.from('error_reports').select('*').order('created_at', { ascending: false }).limit(300),
      supabase.from('reported_users').select('*').order('created_at', { ascending: false }).limit(300),
    ]);

    const local = readLocalErrorReports();

    if (errorResponse.error) {
      setWarning(
        'No se pudo leer error_reports en Supabase. Se muestran tickets locales guardados en este navegador.',
      );
      setErrorReports(local);
    } else {
      const merged = [...(errorResponse.data || [])];
      local.forEach((item) => {
        if (!merged.find((remote) => remote.ticket_code === item.ticket_code)) {
          merged.push(item);
        }
      });
      merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setErrorReports(merged);
    }

    if (userResponse.error) {
      toast({
        title: 'No se pudieron cargar reportes de usuarios',
        description: userResponse.error.message,
        variant: 'destructive',
      });
      setUserReports([]);
    } else {
      setUserReports(userResponse.data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadReports();
  }, []);

  const filteredErrorReports = useMemo(() => {
    return errorReports.filter((item) => {
      const haystack =
        `${item.ticket_code || ''} ${item.title || ''} ${item.detail || ''} ${item.reporter_name || ''} ${item.reporter_email || ''}`
          .toLowerCase();
      return haystack.includes(search.toLowerCase());
    });
  }, [errorReports, search]);

  const filteredUserReports = useMemo(() => {
    return userReports.filter((item) => {
      const haystack = `${item.reason || ''} ${item.reporter_id || ''} ${item.reported_user_id || ''}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    });
  }, [userReports, search]);

  const updateStatus = async (reportId, status) => {
    if (String(reportId).startsWith('local-')) {
      updateLocalErrorReportStatus(reportId, status);
      setErrorReports((prev) => prev.map((item) => (item.id === reportId ? { ...item, status } : item)));
      toast({ title: 'Estado actualizado (local)' });
      return;
    }

    const { error } = await supabase.from('error_reports').update({ status }).eq('id', reportId);
    if (error) {
      toast({
        title: 'No se pudo actualizar estado',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }
    setErrorReports((prev) => prev.map((item) => (item.id === reportId ? { ...item, status } : item)));
    toast({ title: 'Estado actualizado' });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-100">Errores y reportes</h2>
          <p className="text-sm text-slate-400">
            Tickets enviados desde “Reportar un error” y reportes de usuarios de la comunidad.
          </p>
        </div>
        <Button variant="outline" onClick={loadReports} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      <Card className="border-slate-700/70 bg-slate-900/70">
        <CardHeader>
          <div className="space-y-2">
            <CardTitle className="text-slate-100">Buscar reportes</CardTitle>
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por ticket, título, correo o motivo..."
            />
            {warning ? (
              <p className="text-xs text-amber-300 flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5" />
                {warning}
              </p>
            ) : null}
          </div>
        </CardHeader>
      </Card>

      <Card className="border-slate-700/70 bg-slate-900/70">
        <CardHeader>
          <CardTitle className="text-slate-100">Tickets de errores editoriales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 max-h-[60vh] overflow-y-auto">
          {!loading && filteredErrorReports.length === 0 ? (
            <p className="text-sm text-slate-400">No hay tickets registrados.</p>
          ) : null}
          {filteredErrorReports.map((item) => (
            <div key={item.id || item.ticket_code} className="rounded-xl border border-slate-700 bg-slate-950/50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Ticket</p>
                  <p className="text-sm font-semibold text-emerald-300">{item.ticket_code || 'Sin código'}</p>
                </div>
                <p className="text-xs text-slate-500">{formatDate(item.created_at)}</p>
              </div>
              <h3 className="mt-2 text-base font-semibold text-slate-100">{item.title || 'Sin título'}</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-200">{item.detail || 'Sin detalle'}</p>
              <div className="mt-3 grid gap-2 text-xs text-slate-400 sm:grid-cols-2">
                <p>Nombre: {item.reporter_name || 'No informado'}</p>
                <p>Correo: {item.reporter_email || 'No informado'}</p>
                <p>Estado de correo: {item.email_status || 'pendiente'}</p>
                <p>Origen: {item.source_path || 'No informado'}</p>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => updateStatus(item.id, status)}
                    className={`rounded-full border px-3 py-1 text-xs ${
                      String(item.status || 'nuevo') === status
                        ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                        : 'border-slate-600 bg-slate-800 text-slate-300'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-slate-700/70 bg-slate-900/70">
        <CardHeader>
          <CardTitle className="text-slate-100">Reportes de usuarios (comunidad)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 max-h-[45vh] overflow-y-auto">
          {!loading && filteredUserReports.length === 0 ? (
            <p className="text-sm text-slate-400">No hay reportes de usuarios.</p>
          ) : null}
          {filteredUserReports.map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-700 bg-slate-950/50 p-4">
              <p className="text-xs text-slate-500">{formatDate(item.created_at)}</p>
              <p className="mt-2 text-sm text-slate-300">Reporter ID: {item.reporter_id}</p>
              <p className="text-sm text-slate-300">Reported ID: {item.reported_user_id}</p>
              <p className="mt-2 text-sm text-slate-100">{item.reason || 'Sin motivo'}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsModule;

