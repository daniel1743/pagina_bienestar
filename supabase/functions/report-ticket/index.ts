const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const jsonResponse = (status: number, payload: Record<string, unknown>) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  try {
    const body = await req.json();
    const ticketCode = String(body?.ticketCode || '').trim();
    const title = String(body?.title || '').trim();
    const detail = String(body?.detail || '').trim();
    const reporterName = String(body?.reporterName || '').trim();
    const reporterEmail = String(body?.reporterEmail || '').trim();
    const sourcePath = String(body?.sourcePath || '').trim();

    if (!ticketCode || !title || !detail || !reporterName || !reporterEmail) {
      return jsonResponse(400, { error: 'Faltan campos obligatorios.' });
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      return jsonResponse(503, { error: 'Servicio de email no configurado (RESEND_API_KEY).' });
    }

    const fromEmail = Deno.env.get('REPORT_TICKET_FROM_EMAIL') || 'Bienestar en Claro <no-reply@bienestarenclaro.com>';
    const replyTo = Deno.env.get('REPORT_TICKET_REPLY_TO') || 'contacto@bienestarenclaro.com';

    const html = `
      <h2>Ticket generado: ${ticketCode}</h2>
      <p>Hola ${reporterName},</p>
      <p>Recibimos tu reporte y ya fue registrado en el panel editorial.</p>
      <ul>
        <li><strong>Título:</strong> ${title}</li>
        <li><strong>Detalle:</strong> ${detail}</li>
        <li><strong>Origen:</strong> ${sourcePath || 'No informado'}</li>
      </ul>
      <p>Conserva este código para seguimiento: <strong>${ticketCode}</strong>.</p>
      <p>Equipo editorial de Bienestar en Claro</p>
    `;

    const sendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [reporterEmail],
        reply_to: replyTo,
        subject: `Ticket ${ticketCode} recibido - Bienestar en Claro`,
        html,
      }),
    });

    if (!sendResponse.ok) {
      const message = await sendResponse.text();
      return jsonResponse(502, { error: 'No se pudo enviar correo.', details: message });
    }

    const data = await sendResponse.json();
    return jsonResponse(200, { ok: true, sent: true, provider: 'resend', data });
  } catch (error) {
    return jsonResponse(500, {
      error: 'Error interno al enviar correo de ticket.',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

