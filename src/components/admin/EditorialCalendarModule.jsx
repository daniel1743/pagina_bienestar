import React, { useMemo, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import {
  getEditorialCalendarEntries,
  logAdminAction,
  saveEditorialCalendarEntries,
} from '@/lib/adminConfig';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CopyPlus,
  RefreshCw,
  Save,
  Search,
  Trash2,
} from 'lucide-react';

const TOPIC_PRESETS = [
  'Hígado graso',
  'Digestión',
  'Metabolismo',
  'Inflamación',
  'Microbiota',
  'Nutrición',
  'Comunidad',
];

const STATUS_OPTIONS = [
  { value: 'idea', label: 'Idea', badge: 'bg-slate-700 text-slate-100' },
  { value: 'brief', label: 'Brief', badge: 'bg-cyan-900/60 text-cyan-200' },
  { value: 'draft', label: 'Borrador', badge: 'bg-indigo-900/60 text-indigo-200' },
  { value: 'review', label: 'Revisión', badge: 'bg-amber-900/60 text-amber-200' },
  { value: 'scheduled', label: 'Programado', badge: 'bg-violet-900/60 text-violet-200' },
  { value: 'published', label: 'Publicado', badge: 'bg-emerald-900/60 text-emerald-200' },
];

const dateFormatter = new Intl.DateTimeFormat('es', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});
const monthFormatter = new Intl.DateTimeFormat('es', { month: 'long', year: 'numeric' });

const pad2 = (n) => String(n).padStart(2, '0');
const toDateKey = (date) => `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
const fromDateKey = (dateKey) => {
  const [y, m, d] = String(dateKey).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};
const sameDay = (a, b) => toDateKey(a) === toDateKey(b);
const addDays = (date, n) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);
const combineDateTime = (dateKey, hhmm) => new Date(`${dateKey}T${hhmm || '09:00'}:00`).toISOString();
const parseTime = (iso) => {
  const d = new Date(iso);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};
const startOfWeek = (date) => {
  const day = (date.getDay() + 6) % 7;
  return addDays(date, -day);
};

const getMonthGrid = (date) => {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstGridDay = startOfWeek(first);
  return Array.from({ length: 42 }, (_, i) => addDays(firstGridDay, i));
};

const initialForm = (date) => ({
  title: '',
  topic: TOPIC_PRESETS[0],
  status: 'idea',
  pillar: '',
  scheduledDate: toDateKey(date),
  scheduledTime: '09:00',
  objective: '',
  audience: '',
  primaryKeyword: '',
  secondaryKeyword: '',
  cta: '',
  owner: 'Equipo editorial',
  notes: '',
});

const statusBadge = (status) =>
  STATUS_OPTIONS.find((opt) => opt.value === status)?.badge || 'bg-slate-700 text-slate-100';

const EditorialCalendarModule = () => {
  const { toast } = useToast();
  const [entries, setEntries] = useState(() => getEditorialCalendarEntries());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  const [search, setSearch] = useState('');
  const [topicFilter, setTopicFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [form, setForm] = useState(() => initialForm(new Date()));

  const persistEntries = (nextEntries) => {
    setEntries(nextEntries);
    saveEditorialCalendarEntries(nextEntries);
  };

  const filteredEntries = useMemo(() => {
    const byDate = [...entries].sort(
      (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );
    return byDate.filter((item) => {
      const text = `${item.title} ${item.topic} ${item.pillar} ${item.primaryKeyword} ${item.owner}`.toLowerCase();
      const searchOk = text.includes(search.toLowerCase());
      const topicOk = topicFilter === 'all' ? true : item.topic === topicFilter;
      const statusOk = statusFilter === 'all' ? true : item.status === statusFilter;
      return searchOk && topicOk && statusOk;
    });
  }, [entries, search, topicFilter, statusFilter]);

  const entriesByDate = useMemo(() => {
    return filteredEntries.reduce((acc, item) => {
      const key = toDateKey(new Date(item.scheduledAt));
      acc[key] = [...(acc[key] || []), item];
      return acc;
    }, {});
  }, [filteredEntries]);

  const monthEntries = useMemo(
    () =>
      entries.filter((item) => {
        const d = new Date(item.scheduledAt);
        return d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear();
      }),
    [entries, selectedDate],
  );

  const upcomingEntry = useMemo(() => {
    const now = Date.now();
    return entries
      .filter((item) => ['brief', 'draft', 'review', 'scheduled'].includes(item.status))
      .filter((item) => new Date(item.scheduledAt).getTime() >= now)
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];
  }, [entries]);

  const cadenceScore = useMemo(() => {
    const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
    const weeksOfMonth = new Set();
    for (let d = 1; d <= daysInMonth; d += 1) {
      weeksOfMonth.add(toDateKey(startOfWeek(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), d))));
    }
    const activeWeeks = new Set(
      monthEntries
        .filter((item) => item.status !== 'idea')
        .map((item) => toDateKey(startOfWeek(new Date(item.scheduledAt)))),
    );
    const total = weeksOfMonth.size || 1;
    return Math.round((activeWeeks.size / total) * 100);
  }, [monthEntries, selectedDate]);

  const topicBreakdown = useMemo(() => {
    return TOPIC_PRESETS.map((topic) => ({
      topic,
      count: monthEntries.filter((item) => item.topic === topic).length,
    }))
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [monthEntries]);

  const startEdit = (entry) => {
    const scheduledDate = toDateKey(new Date(entry.scheduledAt));
    setEditingId(entry.id);
    setSelectedDate(fromDateKey(scheduledDate));
    setForm({
      title: entry.title,
      topic: entry.topic,
      status: entry.status,
      pillar: entry.pillar || '',
      scheduledDate,
      scheduledTime: parseTime(entry.scheduledAt),
      objective: entry.objective || '',
      audience: entry.audience || '',
      primaryKeyword: entry.primaryKeyword || '',
      secondaryKeyword: entry.secondaryKeyword || '',
      cta: entry.cta || '',
      owner: entry.owner || 'Equipo editorial',
      notes: entry.notes || '',
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(initialForm(selectedDate));
  };

  const saveEntry = () => {
    if (!form.title.trim()) {
      toast({ title: 'Título requerido', variant: 'destructive' });
      return;
    }
    const payload = {
      id: editingId || `cal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: form.title.trim(),
      topic: form.topic,
      status: form.status,
      pillar: form.pillar.trim(),
      scheduledAt: combineDateTime(form.scheduledDate, form.scheduledTime),
      objective: form.objective.trim(),
      audience: form.audience.trim(),
      primaryKeyword: form.primaryKeyword.trim(),
      secondaryKeyword: form.secondaryKeyword.trim(),
      cta: form.cta.trim(),
      owner: form.owner.trim() || 'Equipo editorial',
      notes: form.notes.trim(),
      updatedAt: new Date().toISOString(),
    };

    const next = editingId
      ? entries.map((item) => (item.id === editingId ? payload : item))
      : [...entries, { ...payload, createdAt: new Date().toISOString() }];
    persistEntries(next);
    logAdminAction(editingId ? 'Entrada editorial actualizada' : 'Entrada editorial creada', {
      id: payload.id,
      title: payload.title,
      topic: payload.topic,
      status: payload.status,
    });
    toast({ title: editingId ? 'Entrada actualizada' : 'Entrada creada' });
    resetForm();
  };

  const deleteEntry = (id) => {
    const next = entries.filter((item) => item.id !== id);
    persistEntries(next);
    logAdminAction('Entrada editorial eliminada', { id });
    if (editingId === id) resetForm();
  };

  const syncPublishedArticles = async () => {
    setSyncing(true);
    const { data, error } = await supabase
      .from('articles')
      .select('id,title,slug,category,author,published_at,status')
      .not('published_at', 'is', null)
      .limit(1000);
    if (error) {
      toast({ title: 'No se pudieron sincronizar publicados', description: error.message, variant: 'destructive' });
      setSyncing(false);
      return;
    }

    const next = [...entries];
    let inserted = 0;
    (data || []).forEach((article) => {
      const externalId = `article-${article.id}`;
      const idx = next.findIndex((item) => item.externalId === externalId);
      const mapped = {
        id: idx >= 0 ? next[idx].id : `cal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        externalId,
        title: article.title || 'Artículo publicado',
        topic: article.category || 'General',
        status: 'published',
        pillar: 'Artículo publicado',
        scheduledAt: article.published_at || new Date().toISOString(),
        objective: 'Mantener consistencia editorial',
        audience: 'Audiencia general',
        primaryKeyword: article.slug || '',
        secondaryKeyword: '',
        cta: 'Leer artículo completo',
        owner: article.author || 'Equipo editorial',
        notes: 'Sincronizado automáticamente desde artículos publicados.',
        updatedAt: new Date().toISOString(),
      };
      if (idx >= 0) {
        next[idx] = mapped;
      } else {
        inserted += 1;
        next.push({ ...mapped, createdAt: new Date().toISOString() });
      }
    });

    persistEntries(next);
    logAdminAction('Calendario editorial sincronizado con artículos publicados', {
      total_sync: data?.length || 0,
      inserted,
    });
    toast({ title: 'Sincronización completa', description: `Nuevas entradas importadas: ${inserted}` });
    setSyncing(false);
  };

  const navigatePeriod = (direction) => {
    const step = viewMode === 'month' ? 30 : viewMode === 'week' ? 7 : 1;
    setSelectedDate((prev) => addDays(prev, direction * step));
  };

  const renderDayEntries = (day) => {
    const key = toDateKey(day);
    const dayItems = (entriesByDate[key] || []).slice(0, 3);
    return dayItems.map((item) => (
      <button
        key={item.id}
        className={`w-full text-left text-xs px-2 py-1 rounded-md ${statusBadge(item.status)} truncate`}
        onClick={() => startEdit(item)}
      >
        {parseTime(item.scheduledAt)} · {item.title}
      </button>
    ));
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(selectedDate), i));
  const monthGrid = getMonthGrid(selectedDate);
  const selectedDateItems = entriesByDate[toDateKey(selectedDate)] || [];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-100">Calendario editorial</h2>
          <p className="text-sm text-slate-400">
            Planifica por meses, semanas y días para sostener consistencia de publicaciones.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={syncPublishedArticles} disabled={syncing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            Sincronizar publicados
          </Button>
          <Button onClick={saveEntry}>
            <Save className="w-4 h-4 mr-2" />
            {editingId ? 'Actualizar entrada' : 'Guardar entrada'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-slate-700/70 bg-slate-900/70"><CardContent className="p-4"><p className="text-xs text-slate-400">Piezas del mes</p><p className="text-2xl font-bold">{monthEntries.length}</p></CardContent></Card>
        <Card className="border-slate-700/70 bg-slate-900/70"><CardContent className="p-4"><p className="text-xs text-slate-400">Publicadas</p><p className="text-2xl font-bold">{monthEntries.filter((i) => i.status === 'published').length}</p></CardContent></Card>
        <Card className="border-slate-700/70 bg-slate-900/70"><CardContent className="p-4"><p className="text-xs text-slate-400">Cadencia semanal</p><p className="text-2xl font-bold">{cadenceScore}%</p></CardContent></Card>
        <Card className="border-slate-700/70 bg-slate-900/70"><CardContent className="p-4"><p className="text-xs text-slate-400">Próximo deadline</p><p className="text-sm font-semibold">{upcomingEntry ? `${dateFormatter.format(new Date(upcomingEntry.scheduledAt))} · ${upcomingEntry.title}` : 'Sin pendiente'}</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <Card className="xl:col-span-4 border-slate-700/70 bg-slate-900/70">
          <CardHeader><CardTitle>Ficha editorial</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Título editorial" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
            <div className="grid grid-cols-2 gap-2">
              <select value={form.topic} onChange={(e) => setForm((p) => ({ ...p, topic: e.target.value }))} className="h-10 rounded-lg border border-slate-600 bg-slate-700/50 px-3 text-sm text-slate-100">
                {TOPIC_PRESETS.map((topic) => <option key={topic} value={topic}>{topic}</option>)}
              </select>
              <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} className="h-10 rounded-lg border border-slate-600 bg-slate-700/50 px-3 text-sm text-slate-100">
                {STATUS_OPTIONS.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
              </select>
            </div>
            <Input placeholder="Pilar / ángulo" value={form.pillar} onChange={(e) => setForm((p) => ({ ...p, pillar: e.target.value }))} />
            <div className="grid grid-cols-2 gap-2">
              <Input type="date" value={form.scheduledDate} onChange={(e) => setForm((p) => ({ ...p, scheduledDate: e.target.value }))} />
              <Input type="time" value={form.scheduledTime} onChange={(e) => setForm((p) => ({ ...p, scheduledTime: e.target.value }))} />
            </div>
            <Input placeholder="Objetivo editorial" value={form.objective} onChange={(e) => setForm((p) => ({ ...p, objective: e.target.value }))} />
            <Input placeholder="Audiencia objetivo" value={form.audience} onChange={(e) => setForm((p) => ({ ...p, audience: e.target.value }))} />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Keyword principal" value={form.primaryKeyword} onChange={(e) => setForm((p) => ({ ...p, primaryKeyword: e.target.value }))} />
              <Input placeholder="Keyword secundaria" value={form.secondaryKeyword} onChange={(e) => setForm((p) => ({ ...p, secondaryKeyword: e.target.value }))} />
            </div>
            <Input placeholder="CTA sugerido" value={form.cta} onChange={(e) => setForm((p) => ({ ...p, cta: e.target.value }))} />
            <Input placeholder="Responsable" value={form.owner} onChange={(e) => setForm((p) => ({ ...p, owner: e.target.value }))} />
            <textarea rows={3} placeholder="Notas editoriales..." value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-slate-100" />
            <div className="flex gap-2">
              <Button onClick={saveEntry} className="flex-1"><CopyPlus className="w-4 h-4 mr-2" />{editingId ? 'Actualizar' : 'Crear entrada'}</Button>
              <Button variant="outline" onClick={resetForm}>Limpiar</Button>
            </div>
          </CardContent>
        </Card>

        <div className="xl:col-span-8 space-y-4">
          <Card className="border-slate-700/70 bg-slate-900/70">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => navigatePeriod(-1)}><ChevronLeft className="w-4 h-4" /></Button>
                  <Button variant="outline" size="icon" onClick={() => navigatePeriod(1)}><ChevronRight className="w-4 h-4" /></Button>
                  <Button variant="outline" onClick={() => setSelectedDate(new Date())}>Hoy</Button>
                  <span className="text-sm font-semibold text-slate-200">{monthFormatter.format(selectedDate)}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <Input className="pl-8 w-44" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} />
                  </div>
                  <select value={topicFilter} onChange={(e) => setTopicFilter(e.target.value)} className="h-10 rounded-lg border border-slate-600 bg-slate-700/50 px-3 text-sm text-slate-100">
                    <option value="all">Todos los temas</option>
                    {TOPIC_PRESETS.map((topic) => <option key={topic} value={topic}>{topic}</option>)}
                  </select>
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 rounded-lg border border-slate-600 bg-slate-700/50 px-3 text-sm text-slate-100">
                    <option value="all">Todos los estados</option>
                    {STATUS_OPTIONS.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                  </select>
                  <div className="flex rounded-lg border border-slate-700 overflow-hidden">
                    {['month', 'week', 'day'].map((mode) => (
                      <button key={mode} onClick={() => setViewMode(mode)} className={`px-3 py-2 text-xs ${viewMode === mode ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-300'}`}>{mode}</button>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === 'month' ? (
                <div className="grid grid-cols-7 gap-2">
                  {['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'].map((d) => (
                    <div key={d} className="text-xs text-slate-400 font-semibold px-2 py-1">{d}</div>
                  ))}
                  {monthGrid.map((day) => {
                    const inMonth = day.getMonth() === selectedDate.getMonth();
                    const active = sameDay(day, selectedDate);
                    return (
                      <button key={toDateKey(day)} onClick={() => { setSelectedDate(day); setForm((p) => ({ ...p, scheduledDate: toDateKey(day) })); }} className={`min-h-[112px] rounded-xl border p-2 text-left space-y-1 ${active ? 'border-emerald-400 bg-emerald-500/10' : 'border-slate-700 bg-slate-950/40'} ${inMonth ? 'text-slate-100' : 'text-slate-500'}`}>
                        <div className="text-xs font-semibold">{day.getDate()}</div>
                        {renderDayEntries(day)}
                      </button>
                    );
                  })}
                </div>
              ) : null}

              {viewMode === 'week' ? (
                <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
                  {weekDays.map((day) => (
                    <div key={toDateKey(day)} className={`rounded-xl border p-2 min-h-[240px] ${sameDay(day, selectedDate) ? 'border-emerald-400 bg-emerald-500/10' : 'border-slate-700 bg-slate-950/40'}`}>
                      <p className="text-xs font-semibold mb-2">{dateFormatter.format(day)}</p>
                      <div className="space-y-1">{renderDayEntries(day)}</div>
                    </div>
                  ))}
                </div>
              ) : null}

              {viewMode === 'day' ? (
                <div className="space-y-2">
                  {selectedDateItems.length === 0 ? <p className="text-sm text-slate-400">No hay entradas para este día.</p> : null}
                  {selectedDateItems.map((item) => (
                    <div key={item.id} className="rounded-xl border border-slate-700 bg-slate-950/50 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold">{parseTime(item.scheduledAt)} · {item.title}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${statusBadge(item.status)}`}>{item.status}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{item.topic} · {item.owner}</p>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline" onClick={() => startEdit(item)}>Editar</Button>
                        <Button size="sm" variant="outline" onClick={() => deleteEntry(item.id)}><Trash2 className="w-4 h-4 mr-1" />Eliminar</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-slate-700/70 bg-slate-900/70">
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><CalendarDays className="w-4 h-4" />Balance por tema (mes actual)</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {topicBreakdown.length === 0 ? <p className="text-sm text-slate-400">Sin planificación temática para este mes.</p> : null}
              {topicBreakdown.map((item) => (
                <div key={item.topic} className="rounded-lg border border-slate-700 bg-slate-950/40 px-3 py-2 flex items-center justify-between">
                  <span className="text-sm text-slate-200">{item.topic}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-700">{item.count}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditorialCalendarModule;
