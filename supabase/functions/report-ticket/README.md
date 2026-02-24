# report-ticket

Envía correo de confirmación al usuario cuando crea un ticket de error desde `/reportar-error`.

## Deploy

```bash
supabase functions deploy report-ticket
```

## Variables requeridas

- `RESEND_API_KEY`

## Variables opcionales

- `REPORT_TICKET_FROM_EMAIL` (ej: `Bienestar en Claro <no-reply@tudominio.com>`)
- `REPORT_TICKET_REPLY_TO` (default: `contacto@bienestarenclaro.com`)

## Frontend

Configurar en `.env`:

```env
VITE_REPORT_TICKET_FUNCTION_NAME=report-ticket
```

Si no se configura, el frontend intenta `/api/report-ticket`.

