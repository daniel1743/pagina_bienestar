import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import {
  clearActionLogs,
  createCode6Digits,
  getActionLogs,
  getSecuritySettings,
  logAdminAction,
  saveSecuritySettings,
} from '@/lib/adminConfig';
import { ShieldAlert, Trash2 } from 'lucide-react';

const SecurityModule = () => {
  const { toast } = useToast();
  const [security, setSecurity] = useState(getSecuritySettings());
  const [logs, setLogs] = useState(getActionLogs());
  const [search, setSearch] = useState('');

  const updateField = (field, value) => {
    setSecurity((prev) => ({ ...prev, [field]: value }));
  };

  const saveSecurity = () => {
    const next = saveSecuritySettings({
      ...security,
      maxLinksPerComment: Number(security.maxLinksPerComment) || 2,
      maxCommentsPerMinute: Number(security.maxCommentsPerMinute) || 3,
      bannedWords:
        typeof security.bannedWords === 'string'
          ? security.bannedWords
              .split(',')
              .map((w) => w.trim())
              .filter(Boolean)
          : security.bannedWords,
    });
    setSecurity(next);
    logAdminAction('Configuración de seguridad actualizada', next);
    setLogs(getActionLogs());
    toast({ title: 'Seguridad actualizada' });
  };

  const regenerateCode = () => {
    updateField('twoFactorCode', createCode6Digits());
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((item) =>
      `${item.action || ''} ${JSON.stringify(item.details || {})}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    );
  }, [logs, search]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-3xl font-bold text-slate-100">Seguridad y auditoría</h2>
        <p className="text-sm text-slate-400">2FA admin, anti-spam y registro de acciones.</p>
      </div>

      <Card className="border-slate-700/70 bg-slate-900/70">
        <CardHeader>
          <CardTitle className="text-slate-100">2FA y anti-spam</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-slate-700 p-3 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-200">Activar 2FA admin</p>
              <p className="text-xs text-slate-400">Requerirá código adicional al iniciar sesión.</p>
            </div>
            <input
              type="checkbox"
              checked={security.twoFactorEnabled}
              onChange={(e) => updateField('twoFactorEnabled', e.target.checked)}
              className="h-4 w-4 accent-emerald-500"
            />
          </div>
          <div>
            <label className="text-sm text-slate-200">Código 2FA (6 dígitos)</label>
            <div className="flex gap-2">
              <Input
                maxLength={6}
                value={security.twoFactorCode}
                onChange={(e) => updateField('twoFactorCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
              />
              <Button variant="outline" onClick={regenerateCode}>Generar</Button>
            </div>
          </div>
          <div className="rounded-lg border border-slate-700 p-3 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-200">Protección anti-spam</p>
              <p className="text-xs text-slate-400">Aplica filtros al publicar comentarios.</p>
            </div>
            <input
              type="checkbox"
              checked={security.spamProtectionEnabled}
              onChange={(e) => updateField('spamProtectionEnabled', e.target.checked)}
              className="h-4 w-4 accent-emerald-500"
            />
          </div>
          <div>
            <label className="text-sm text-slate-200">Máximo enlaces por comentario</label>
            <Input type="number" value={security.maxLinksPerComment} onChange={(e) => updateField('maxLinksPerComment', e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-slate-200">Máximo comentarios por minuto</label>
            <Input type="number" value={security.maxCommentsPerMinute} onChange={(e) => updateField('maxCommentsPerMinute', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-slate-200">Palabras bloqueadas (coma)</label>
            <textarea
              rows={3}
              value={Array.isArray(security.bannedWords) ? security.bannedWords.join(', ') : security.bannedWords}
              onChange={(e) => updateField('bannedWords', e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-slate-100"
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={saveSecurity}>
        <ShieldAlert className="w-4 h-4 mr-2" />
        Guardar seguridad
      </Button>

      <Card className="border-slate-700/70 bg-slate-900/70">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-slate-100">Log de acciones</CardTitle>
            <Button
              variant="outline"
              onClick={() => {
                clearActionLogs();
                setLogs([]);
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpiar log
            </Button>
          </div>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar en acciones..." />
        </CardHeader>
        <CardContent className="space-y-2 max-h-[70vh] overflow-y-auto">
          {filteredLogs.length === 0 ? <p className="text-sm text-slate-400">Sin acciones registradas.</p> : null}
          {filteredLogs.map((entry) => (
            <div key={entry.id} className="rounded-lg border border-slate-700 bg-slate-950/50 p-3">
              <p className="text-sm font-semibold text-slate-100">{entry.action}</p>
              <p className="text-xs text-slate-400 mt-1">{new Date(entry.created_at).toLocaleString()}</p>
              <pre className="mt-2 text-[11px] text-slate-400 overflow-auto">{JSON.stringify(entry.details || {}, null, 2)}</pre>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityModule;
