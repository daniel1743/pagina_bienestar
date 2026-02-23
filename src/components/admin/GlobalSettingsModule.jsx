import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import {
  applyGlobalVisualSettings,
  getGlobalSettings,
  logAdminAction,
  saveGlobalSettings,
} from '@/lib/adminConfig';

const GlobalSettingsModule = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState(getGlobalSettings());

  useEffect(() => {
    applyGlobalVisualSettings(settings);
  }, []);

  const updateField = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const saveSettings = () => {
    const saved = saveGlobalSettings(settings);
    applyGlobalVisualSettings(saved);
    logAdminAction('Configuración global actualizada', saved);
    toast({ title: 'Configuración guardada' });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-3xl font-bold text-slate-100">Configuración global</h2>
        <p className="text-sm text-slate-400">Control central de contenido, apariencia y módulos públicos.</p>
      </div>

      <Card className="border-slate-700/70 bg-slate-900/70">
        <CardHeader>
          <CardTitle className="text-slate-100">Contenido institucional</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-slate-200">Bio fundador</label>
            <textarea
              rows={4}
              value={settings.founderBio}
              onChange={(e) => updateField('founderBio', e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-slate-100"
            />
          </div>
          <div>
            <label className="text-sm text-slate-200">Descargo médico global</label>
            <textarea
              rows={3}
              value={settings.medicalDisclaimer}
              onChange={(e) => updateField('medicalDisclaimer', e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-slate-100"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-700/70 bg-slate-900/70">
        <CardHeader>
          <CardTitle className="text-slate-100">Módulos y branding</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-slate-700 p-3 flex items-center justify-between">
            <span className="text-sm text-slate-200">Activar comentarios</span>
            <input
              type="checkbox"
              checked={settings.commentsEnabled}
              onChange={(e) => updateField('commentsEnabled', e.target.checked)}
              className="h-4 w-4 accent-emerald-500"
            />
          </div>
          <div className="rounded-lg border border-slate-700 p-3 flex items-center justify-between">
            <span className="text-sm text-slate-200">Activar comunidad</span>
            <input
              type="checkbox"
              checked={settings.communityEnabled}
              onChange={(e) => updateField('communityEnabled', e.target.checked)}
              className="h-4 w-4 accent-emerald-500"
            />
          </div>
          <div>
            <label className="text-sm text-slate-200">Color primario</label>
            <Input type="color" value={settings.primaryColor} onChange={(e) => updateField('primaryColor', e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-slate-200">Modo por defecto</label>
            <select
              value={settings.defaultTheme}
              onChange={(e) => updateField('defaultTheme', e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 text-sm text-slate-100"
            >
              <option value="light">Claro</option>
              <option value="dark">Oscuro</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-slate-200">Título hero</label>
            <Input value={settings.heroTitle} onChange={(e) => updateField('heroTitle', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-slate-200">Texto hero</label>
            <textarea
              rows={3}
              value={settings.heroSubtitle}
              onChange={(e) => updateField('heroSubtitle', e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-slate-100"
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={saveSettings}>Guardar configuración global</Button>
    </div>
  );
};

export default GlobalSettingsModule;
