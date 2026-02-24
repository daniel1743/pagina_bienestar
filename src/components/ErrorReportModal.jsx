import React, { useMemo, useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { createErrorReportTicket } from '@/lib/errorReports';
import { useToast } from '@/components/ui/use-toast';

const MAX_DETAIL_CHARS = 500;

const ErrorReportModal = ({ open, onClose, sourcePath = '' }) => {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const detailRemaining = useMemo(() => MAX_DETAIL_CHARS - detail.length, [detail.length]);

  if (!open) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title.trim() || !detail.trim() || !name.trim() || !email.trim()) return;

    setLoading(true);
    try {
      const response = await createErrorReportTicket({
        title,
        detail,
        reporterName: name,
        reporterEmail: email,
        sourcePath,
      });
      setResult(response);

      if (response.storageWarning) {
        toast({
          title: 'Ticket guardado con advertencia',
          description: response.storageWarning,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Ticket generado',
          description: `Código: ${response.ticketCode}`,
        });
      }
    } catch (error) {
      toast({
        title: 'No se pudo crear el ticket',
        description: error?.message || 'Inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-border dark:bg-card">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-border">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-[#0B1F3B] dark:text-foreground">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            Reportar un error
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-muted"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {result ? (
          <div className="space-y-4 px-6 py-6">
            <p className="text-sm text-slate-700 dark:text-muted-foreground">
              Ticket generado correctamente. Guárdalo para seguimiento.
            </p>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-200">
              <p className="font-semibold">Código de ticket: {result.ticketCode}</p>
              <p className="mt-1">{result.emailMessage}</p>
            </div>
            <div className="flex justify-end">
              <Button type="button" onClick={onClose}>
                Cerrar
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
            <div className="space-y-2">
              <Label htmlFor="report-title">Título</Label>
              <Input
                id="report-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
                placeholder="Ej: Enlace roto en guía de metabolismo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-detail">Describe el error (máx. 500 caracteres)</Label>
              <textarea
                id="report-detail"
                value={detail}
                onChange={(e) => setDetail(e.target.value.slice(0, MAX_DETAIL_CHARS))}
                rows={6}
                maxLength={MAX_DETAIL_CHARS}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#1E6F5C] focus:ring-2 focus:ring-[#1E6F5C]/20 dark:border-border dark:bg-background dark:text-foreground"
                placeholder="Indica página, sección y qué comportamiento observas."
              />
              <p className="text-xs text-slate-500 dark:text-muted-foreground">
                Caracteres restantes: {detailRemaining}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="report-name">Nombre</Label>
                <Input
                  id="report-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={80}
                  placeholder="Tu nombre"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="report-email">Correo</Label>
                <Input
                  id="report-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={120}
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Generando ticket...' : 'Enviar'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ErrorReportModal;

