# Categoria: Autenticacion y seguridad

## Implementado

- Login usuario y admin con:
  - icono ojo para mostrar/ocultar contrasena,
  - checkbox `Mantener sesion iniciada`.
- Persistencia real de sesion:
  - si checkbox activo: sesion persiste entre reinicios,
  - si checkbox inactivo: sesion temporal.
- 2FA en admin configurable desde panel.
- Proteccion anti-spam configurable:
  - limite de links por comentario,
  - limite por minuto,
  - lista de palabras bloqueadas.
- Log de acciones administrativas.

## Archivos relevantes

- `src/pages/LoginPage.jsx`
- `src/pages/AdminLoginPage.jsx`
- `src/contexts/SupabaseAuthContext.jsx`
- `src/lib/customSupabaseClient.js`
- `src/components/admin/SecurityModule.jsx`
