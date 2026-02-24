import { supabase } from '@/lib/customSupabaseClient';

const LOCAL_ERROR_REPORTS_KEY = 'bec_error_reports_local_v1';

const isMissingTableError = (error, tableName) => {
  const message = String(error?.message || '').toLowerCase();
  return message.includes(`relation "${String(tableName || '').toLowerCase()}" does not exist`);
};

const getLocalReports = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_ERROR_REPORTS_KEY);
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveLocalReports = (items) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCAL_ERROR_REPORTS_KEY, JSON.stringify(items));
};

export const readLocalErrorReports = () => getLocalReports();

export const updateLocalErrorReportStatus = (id, status) => {
  const next = getLocalReports().map((item) => (item.id === id ? { ...item, status } : item));
  saveLocalReports(next);
  return next;
};

export const generateErrorTicketCode = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `BEC-${y}${m}${d}-${random}`;
};

const trySendTicketEmail = async (payload) => {
  const functionName = import.meta.env.VITE_REPORT_TICKET_FUNCTION_NAME;
  const endpoint = import.meta.env.VITE_REPORT_TICKET_ENDPOINT || '/api/report-ticket';

  if (functionName) {
    const { error, data } = await supabase.functions.invoke(functionName, {
      body: payload,
    });
    if (error) throw error;
    return data || { sent: true };
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error('No se pudo enviar correo de confirmación');
  }
  return { sent: true };
};

export const createErrorReportTicket = async ({
  title,
  detail,
  reporterName,
  reporterEmail,
  sourcePath = '',
}) => {
  const ticketCode = generateErrorTicketCode();
  const now = new Date().toISOString();
  const payload = {
    ticket_code: ticketCode,
    title: String(title || '').trim(),
    detail: String(detail || '').trim(),
    reporter_name: String(reporterName || '').trim(),
    reporter_email: String(reporterEmail || '').trim().toLowerCase(),
    source_path: sourcePath,
    status: 'nuevo',
    email_status: 'pendiente',
    created_at: now,
  };

  let remoteRecord = null;
  let storedRemote = false;
  let storageWarning = '';

  const insertResponse = await supabase.from('error_reports').insert(payload).select('*').single();
  if (!insertResponse.error && insertResponse.data) {
    remoteRecord = insertResponse.data;
    storedRemote = true;
  } else {
    const localId = `local-${Date.now()}`;
    const localPayload = { ...payload, id: localId };
    const next = [localPayload, ...getLocalReports()].slice(0, 500);
    saveLocalReports(next);
    remoteRecord = localPayload;
    storageWarning = isMissingTableError(insertResponse.error, 'error_reports')
      ? 'La tabla error_reports no existe aún en Supabase. Ticket guardado en modo local.'
      : insertResponse.error?.message || 'No se pudo guardar en Supabase. Ticket guardado en modo local.';
  }

  let emailSent = false;
  let emailMessage = '';

  try {
    await trySendTicketEmail({
      ticketCode,
      title: payload.title,
      detail: payload.detail,
      reporterName: payload.reporter_name,
      reporterEmail: payload.reporter_email,
      sourcePath: payload.source_path,
    });
    emailSent = true;
    emailMessage = 'Correo de confirmación enviado.';

    if (storedRemote && remoteRecord?.id) {
      await supabase
        .from('error_reports')
        .update({ email_status: 'enviado', email_sent_at: new Date().toISOString() })
        .eq('id', remoteRecord.id);
    } else {
      const next = getLocalReports().map((item) =>
        item.id === remoteRecord.id
          ? { ...item, email_status: 'enviado', email_sent_at: new Date().toISOString() }
          : item,
      );
      saveLocalReports(next);
    }
  } catch {
    emailMessage =
      'Ticket generado. El correo de confirmación quedó pendiente porque no hay servicio de email configurado.';
    if (storedRemote && remoteRecord?.id) {
      await supabase.from('error_reports').update({ email_status: 'pendiente' }).eq('id', remoteRecord.id);
    }
  }

  return {
    ticketCode,
    record: remoteRecord,
    storedRemote,
    emailSent,
    emailMessage,
    storageWarning,
  };
};

